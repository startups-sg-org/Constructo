import { beforeEach, describe, expect, it, vi } from "vitest";

import { actionArgs, loaderArgs } from "../../test/testUtils";
import { carregarContratosDisponiveis } from "../contratos/contratos.loader";
import { cadastrarObra } from "./obras.action";
import { createObra } from "./obras.service";
import { getContratosDisponiveis } from "../contratos/contratos.service";

vi.mock("./obras.service", () => ({
  createObra: vi.fn(),
}));

vi.mock("../contratos/contratos.service", () => ({
  getContratosDisponiveis: vi.fn(),
}));

const createObraMock = vi.mocked(createObra);
const getContratosDisponiveisMock = vi.mocked(getContratosDisponiveis);

const obraValida = {
  nome: "Edifício Central",
  descricao: "Obra residencial de 10 andares",
  endereco: "Rua das Flores, 123, Centro",
  latitude: "-15.7939",
  longitude: "-47.8827",
  status: "PLANEJAMENTO",
  dataInicio: "2026-01-15",
  dataFimPrevista: "2027-06-30",
  contratoId: "1",
};

describe("loader de contratos disponíveis", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carrega contratos sem obra vinculada", async () => {
    const contratosMock = [
      { id: 1, numero: "CTR-001", descricao: "Contrato Alpha", obraVinculadaId: null },
      { id: 2, numero: "CTR-002", descricao: "Contrato Beta", obraVinculadaId: null },
    ];
    getContratosDisponiveisMock.mockResolvedValue(contratosMock);

    const resultado = await carregarContratosDisponiveis(loaderArgs("http://localhost/admin/obras/cadastro"));

    expect(getContratosDisponiveisMock).toHaveBeenCalledWith({
      signal: expect.anything(),
    });
    expect(resultado).toEqual(contratosMock);
  });
});

describe("action de cadastro de obra", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cadastra a obra e redireciona para a lista de obras", async () => {
    createObraMock.mockResolvedValue({} as never);
    const args = actionArgs("http://localhost/admin/obras/cadastro", obraValida);

    const resposta = await cadastrarObra(args);

    expect(createObraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Edifício Central",
        endereco: "Rua das Flores, 123, Centro",
        latitude: -15.7939,
        longitude: -47.8827,
        status: "PLANEJAMENTO",
        dataInicio: "2026-01-15",
        dataFimPrevista: "2027-06-30",
        contratoId: 1,
      }),
      expect.anything(),
    );
    expect(resposta).toBeInstanceOf(Response);
    expect((resposta as Response).headers.get("Location")).toBe("/admin/obras");
  });

  it("retorna erro de validação quando o nome é curto", async () => {
    const resultado = await cadastrarObra(
      actionArgs("http://localhost/admin/obras/cadastro", {
        ...obraValida,
        nome: "Ed",
      }),
    );

    expect(resultado).toMatchObject({
      erro: expect.any(String),
      campos: { nome: expect.any(String) },
    });
    expect(createObraMock).not.toHaveBeenCalled();
  });

  it("retorna erro quando a data de fim é anterior à de início", async () => {
    const resultado = await cadastrarObra(
      actionArgs("http://localhost/admin/obras/cadastro", {
        ...obraValida,
        dataInicio: "2026-12-01",
        dataFimPrevista: "2026-06-01",
      }),
    );

    expect(resultado).toMatchObject({
      erro: expect.stringContaining("maior ou igual"),
      campos: { dataFimPrevista: expect.any(String) },
    });
    expect(createObraMock).not.toHaveBeenCalled();
  });

  it("retorna erro de latitude inválida", async () => {
    const resultado = await cadastrarObra(
      actionArgs("http://localhost/admin/obras/cadastro", {
        ...obraValida,
        latitude: "999",
      }),
    );

    expect(resultado).toMatchObject({
      campos: { latitude: expect.any(String) },
    });
    expect(createObraMock).not.toHaveBeenCalled();
  });

  it("retorna erro de longitude inválido", async () => {
    const resultado = await cadastrarObra(
      actionArgs("http://localhost/admin/obras/cadastro", {
        ...obraValida,
        longitude: "9999",
      }),
    );

    expect(resultado).toMatchObject({
      campos: { longitude: expect.any(String) },
    });
    expect(createObraMock).not.toHaveBeenCalled();
  });

  it("retorna erro quando o contrato já possui uma obra", async () => {
    createObraMock.mockRejectedValue(new Error("O contrato já possui uma obra cadastrada"));
    const args = actionArgs("http://localhost/admin/obras/cadastro", obraValida);

    const resultado = await cadastrarObra(args);

    expect(resultado).toEqual({
      erro: "Este contrato já possui uma obra cadastrada.",
    });
  });

  it("retorna erro genérico para falhas de API não relacionadas à duplicidade", async () => {
    createObraMock.mockRejectedValue(new Error("Erro inesperado no servidor"));
    const args = actionArgs("http://localhost/admin/obras/cadastro", obraValida);

    const resultado = await cadastrarObra(args);

    expect(resultado).toEqual({
      erro: "Erro inesperado no servidor",
    });
  });

  it("rejeita cadastro sem contrato vinculado", async () => {
    const resultado = await cadastrarObra(
      actionArgs("http://localhost/admin/obras/cadastro", {
        ...obraValida,
        contratoId: "",
      }),
    );

    expect(resultado).toMatchObject({
      campos: { contratoId: expect.any(String) },
    });
    expect(createObraMock).not.toHaveBeenCalled();
  });

  it("aceita descrição vazia como opcional", async () => {
    createObraMock.mockResolvedValue({} as never);
    const args = actionArgs("http://localhost/admin/obras/cadastro", {
      ...obraValida,
      descricao: "",
    });

    const resposta = await cadastrarObra(args);

    expect(createObraMock).toHaveBeenCalled();
    expect(resposta).toBeInstanceOf(Response);
  });
});
