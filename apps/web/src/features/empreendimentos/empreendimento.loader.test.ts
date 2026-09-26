import { beforeEach, describe, expect, it, vi } from "vitest";

import { loaderArgs } from "../../test/testUtils";
import { carregarEmpreendimento } from "./empreendimento.loader";
import { getEmpreendimentoPorId } from "./empreendimentos.service";

vi.mock("./empreendimentos.service", () => ({
  getEmpreendimentoPorId: vi.fn(),
}));

const getEmpreendimentoPorIdMock = vi.mocked(getEmpreendimentoPorId);

describe("loader de detalhes do empreendimento", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carrega o empreendimento pelo ID da rota", async () => {
    const empreendimento = { id: "empreendimento-1", nome: "Residencial Ipê" };
    getEmpreendimentoPorIdMock.mockResolvedValue(empreendimento as never);
    const args = {
      ...loaderArgs("http://localhost/admin/empreendimentos/empreendimento-1"),
      params: { empreendimentoId: "empreendimento-1" },
    };

    await expect(carregarEmpreendimento(args)).resolves.toEqual(empreendimento);
    expect(getEmpreendimentoPorIdMock).toHaveBeenCalledWith("empreendimento-1", {
      signal: args.request.signal,
    });
  });

  it("propaga o erro da API para o errorElement", async () => {
    const erro = new Error("Empreendimento não encontrado");
    getEmpreendimentoPorIdMock.mockRejectedValue(erro);

    await expect(
      carregarEmpreendimento({
        ...loaderArgs("http://localhost/admin/empreendimentos/inexistente"),
        params: { empreendimentoId: "inexistente" },
      }),
    ).rejects.toBe(erro);
  });
});
