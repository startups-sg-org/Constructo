import { beforeEach, describe, expect, it, vi } from "vitest";

import { loaderArgs } from "../../test/testUtils";
import { carregarEmpreendimentos, carregarEstruturaFisica } from "./empreendimentos.loader";
import {
    listarEmpreendimentos,
    obterEmpreendimento,
    obterEstruturaFisica,
} from "./empreendimentos.service";

vi.mock("./empreendimentos.service", () => ({
    listarEmpreendimentos: vi.fn(),
    obterEmpreendimento: vi.fn(),
    obterEstruturaFisica: vi.fn(),
}));

const listarEmpreendimentosMock = vi.mocked(listarEmpreendimentos);
const obterEmpreendimentoMock = vi.mocked(obterEmpreendimento);
const obterEstruturaFisicaMock = vi.mocked(obterEstruturaFisica);

describe("loader de empreendimentos", () => {
    beforeEach(() => vi.clearAllMocks());

    it("carrega a lista e encaminha o sinal da navegação", async () => {
        const empreendimentos = [{ id: 1, nome: "Aurora" }];
        listarEmpreendimentosMock.mockResolvedValue(empreendimentos as never);
        const args = loaderArgs("http://localhost/admin/obras");

        await expect(carregarEmpreendimentos(args)).resolves.toEqual(empreendimentos);
        expect(listarEmpreendimentosMock).toHaveBeenCalledWith({
            signal: args.request.signal,
        });
    });

    it("propaga a falha para o errorElement da rota", async () => {
        const erro = new Error("API indisponível");
        listarEmpreendimentosMock.mockRejectedValue(erro);

        await expect(
            carregarEmpreendimentos(loaderArgs("http://localhost/admin/obras")),
        ).rejects.toBe(erro);
    });

    it("carrega a estrutura hierárquica em uma única chamada à API", async () => {
        const empreendimento = { id: 12, nome: "Aurora" };
        const estrutura = [{ id: 31, nome: "Torre A", filhos: [] }];
        obterEmpreendimentoMock.mockResolvedValue(empreendimento as never);
        obterEstruturaFisicaMock.mockResolvedValue(estrutura as never);
        const args = {
            ...loaderArgs("http://localhost/admin/empreendimentos/12/estrutura"),
            params: { empreendimentoId: "12" },
        };

        await expect(carregarEstruturaFisica(args)).resolves.toEqual({
            empreendimento,
            estrutura,
        });
        expect(obterEstruturaFisicaMock).toHaveBeenCalledWith(12, {
            signal: args.request.signal,
        });
    });
});
