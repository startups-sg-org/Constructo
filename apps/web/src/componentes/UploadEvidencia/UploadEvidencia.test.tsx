import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { enviarEvidencia } from "../../features/evidencias/evidencias.service";
import UploadEvidencia from "./UploadEvidencia";

vi.mock("../../features/evidencias/evidencias.service", async (importOriginal) => {
    const original = await importOriginal<typeof import("../../features/evidencias/evidencias.service")>();
    return { ...original, enviarEvidencia: vi.fn() };
});

const enviarEvidenciaMock = vi.mocked(enviarEvidencia);

beforeEach(() => {
    vi.stubGlobal("URL", {
        ...URL,
        createObjectURL: vi.fn(() => "blob:preview"),
        revokeObjectURL: vi.fn(),
    });
});

describe("UploadEvidencia", () => {
    it("exibe preview e envia a imagem no contexto do empreendimento", async () => {
        const user = userEvent.setup();
        enviarEvidenciaMock.mockResolvedValue({
            empreendimento_id: 42,
            nome: "imagem.png",
            caminho: "empreendimentos/42/evidencias/imagem.png",
            url: "/uploads/empreendimentos/42/evidencias/imagem.png",
            tamanho: 12,
            tipo_mime: "image/png",
        });
        render(<UploadEvidencia empreendimentoId={42} />);
        const arquivo = new File(["imagem"], "progresso.png", { type: "image/png" });

        await user.upload(screen.getByLabelText("Selecionar imagem"), arquivo);

        expect(screen.getByAltText("Pré-visualização de progresso.png")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Enviar evidência" }));

        await waitFor(() => expect(enviarEvidenciaMock).toHaveBeenCalledWith(42, arquivo));
        expect(screen.getByText("Evidência enviada com sucesso.")).toBeInTheDocument();
        expect(screen.queryByAltText("Pré-visualização de progresso.png")).not.toBeInTheDocument();
    });

    it("rejeita formato e tamanho inválidos antes do envio", () => {
        render(<UploadEvidencia empreendimentoId={42} />);
        const input = screen.getByLabelText("Selecionar imagem");

        fireEvent.change(input, {
            target: { files: [new File(["pdf"], "laudo.pdf", { type: "application/pdf" })] },
        });
        expect(screen.getByRole("alert")).toHaveTextContent("Formato inválido");

        const grande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "obra.png", {
            type: "image/png",
        });
        fireEvent.change(input, { target: { files: [grande] } });
        expect(screen.getByRole("alert")).toHaveTextContent("no máximo 5 MB");
        expect(enviarEvidenciaMock).not.toHaveBeenCalled();
    });
});
