import { beforeEach, describe, expect, it, vi } from "vitest";

import { loaderArgs } from "../../test/testUtils";
import { carregarEmpreendimentos } from "./empreendimentos.loader";
import { listarEmpreendimentos } from "./empreendimentos.service";

vi.mock("./empreendimentos.service", () => ({
    listarEmpreendimentos: vi.fn(),
    obterEmpreendimento: vi.fn(),
}));

const listarEmpreendimentosMock = vi.mocked(listarEmpreendimentos);

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
});
