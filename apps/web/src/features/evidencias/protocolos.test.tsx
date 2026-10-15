import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import ProtocolList from "../../modulos/evidencias/componentes/ProtocolEditor/ProtocolList";
import ProtocolEditor from "../../modulos/evidencias/componentes/ProtocolEditor/ProtocolEditor";
import { carregarProtocoloEditor } from "./protocolos.loader";
import { alterarProtocoloEditor } from "./protocolos.action";
import * as api from "./evidencias.service";

vi.mock("./evidencias.service", () => ({
    listarProtocolosEvidencia: vi.fn(), criarProtocoloEvidencia: vi.fn(),
    atualizarProtocoloEvidencia: vi.fn(), criarItemProtocolo: vi.fn(),
    atualizarItemProtocolo: vi.fn(), removerItemProtocolo: vi.fn(),
}));

const base = "/admin/empreendimentos/1/taxonomia/marcos/2/protocolos";
let protocolos: api.ProtocoloEvidencia[];
const routers: ReturnType<typeof createMemoryRouter>[] = [];

function montar(destino = base) {
    const caminho = "/admin/empreendimentos/:empreendimentoId/taxonomia/marcos/:marcoId/protocolos";
    const router = createMemoryRouter([
        { path: caminho, loader: carregarProtocoloEditor, element: <ProtocolList /> },
        ...["novo", ":protocoloId"].map((parte) => ({
            path: caminho + "/" + parte, loader: carregarProtocoloEditor,
            action: alterarProtocoloEditor, element: <ProtocolEditor />,
        })),
    ], { initialEntries: [destino] });
    routers.push(router);
    render(<RouterProvider router={router} />);
    return router;
}

beforeEach(() => {
    vi.resetAllMocks();
    protocolos = [{
        id: 3, marco_id: 2, nome: "Impermeabilização", descricao: null,
        quantidade_minima: 0, criado_em: "", atualizado_em: "", itens: [],
    }];
    vi.mocked(api.listarProtocolosEvidencia).mockImplementation(async () => structuredClone(protocolos));
});

afterEach(() => { cleanup(); routers.splice(0).forEach((router) => router.dispose()); });

describe("Protocolos no Data Router", () => {
    it("lista, cria e redireciona ao protocolo criado", async () => {
        protocolos = [];
        vi.mocked(api.criarProtocoloEvidencia).mockImplementation(async (_e, _m, dados) => {
            const novo = { ...dados, id: 4, marco_id: 2, criado_em: "", atualizado_em: "", itens: [] };
            protocolos.push(novo);
            return novo;
        });
        const user = userEvent.setup();
        const router = montar();
        expect(await screen.findByText("Nenhum protocolo cadastrado neste marco.")).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Criar protocolo" }));
        await user.type(await screen.findByLabelText("Nome"), "Fotos da laje");
        expect(within(screen.getByRole("complementary")).getByText("Fotos da laje")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Criar protocolo" }));
        await waitFor(() => expect(router.state.location.pathname).toBe(base + "/4"));
        expect(await screen.findByRole("button", { name: "Adicionar item" })).toBeEnabled();
        await user.click(screen.getByRole("link", { name: "Voltar aos protocolos" }));
        expect(await screen.findByRole("link", { name: "Editar Fotos da laje" })).toBeInTheDocument();
    });

    it("salva dados gerais e mantém a prévia sincronizada", async () => {
        vi.mocked(api.atualizarProtocoloEvidencia).mockImplementation(async (_e, _m, _p, dados) => {
            Object.assign(protocolos[0], dados);
            return protocolos[0];
        });
        const user = userEvent.setup();
        montar(base + "/3");
        await user.type(await screen.findByLabelText("Descrição"), "Registrar piso");
        await user.clear(screen.getByLabelText("Quantidade mínima de evidências"));
        await user.type(screen.getByLabelText("Quantidade mínima de evidências"), "2");
        expect(within(screen.getByRole("complementary")).getByText("Mínimo de 2 evidência(s).")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Salvar protocolo" }));
        await waitFor(() => expect(protocolos[0].quantidade_minima).toBe(2));
        expect(protocolos[0].descricao).toBe("Registrar piso");
    });

    it("adiciona, altera obrigatoriedade/ordem e remove sem ressuscitar item", async () => {
        vi.mocked(api.criarItemProtocolo).mockImplementation(async (_e, _m, _p, dados) => {
            const item = { ...dados, id: 7, protocolo_id: 3, criado_em: "", atualizado_em: "" };
            protocolos[0].itens.push(item);
            return item;
        });
        vi.mocked(api.atualizarItemProtocolo).mockImplementation(async (_e, _m, _p, _i, dados) => {
            Object.assign(protocolos[0].itens[0], dados);
            return protocolos[0].itens[0];
        });
        vi.mocked(api.removerItemProtocolo).mockImplementation(async () => { protocolos[0].itens = []; });
        const user = userEvent.setup();
        montar(base + "/3");
        await user.type(await screen.findByLabelText("Novo item"), "Foto geral");
        await user.click(screen.getByRole("button", { name: "Adicionar item" }));
        const input = await screen.findByLabelText("Item");
        const itemForm = input.closest("form")!;
        await user.click(within(itemForm).getByLabelText("Obrigatório"));
        await user.clear(within(itemForm).getByLabelText("Ordem"));
        await user.type(within(itemForm).getByLabelText("Ordem"), "5");
        await user.click(within(itemForm).getByRole("button", { name: "Salvar item" }));
        await waitFor(() => expect(protocolos[0].itens[0].ordem).toBe(5));
        expect(protocolos[0].itens[0].obrigatorio).toBe(false);
        await waitFor(() => expect(screen.getByRole("button", { name: "Salvar item" })).toBeEnabled());
        await user.click(screen.getByRole("button", { name: "Remover" }));
        await waitFor(() => expect(screen.queryByLabelText("Item")).not.toBeInTheDocument());
        expect(screen.getByText("Nenhum item configurado.")).toBeInTheDocument();
    });

    it("mostra loading e erro da API sem perder o rascunho", async () => {
        let rejeitar!: (erro: Error) => void;
        vi.mocked(api.atualizarProtocoloEvidencia).mockImplementation(() => new Promise((_resolve, reject) => { rejeitar = reject; }));
        const user = userEvent.setup();
        montar(base + "/3");
        await user.type(await screen.findByLabelText("Descrição"), "Rascunho");
        await user.click(screen.getByRole("button", { name: "Salvar protocolo" }));
        expect(await screen.findByRole("button", { name: "Salvando…" })).toBeDisabled();
        rejeitar(new Error("Falha ao salvar"));
        expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
        expect(screen.getByLabelText("Descrição")).toHaveValue("Rascunho");
    });

    it("rejeita protocolo fora do marco e IDs inválidos", async () => {
        const request = new Request("http://localhost");
        await expect(carregarProtocoloEditor({ request, params: { empreendimentoId: "1", marcoId: "2", protocoloId: "99" } })).rejects.toMatchObject({ status: 404 });
        await expect(carregarProtocoloEditor({ request, params: { empreendimentoId: "0", marcoId: "2" } })).rejects.toMatchObject({ status: 404 });
    });
});
