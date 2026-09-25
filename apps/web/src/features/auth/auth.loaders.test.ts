import { beforeEach, describe, expect, it, vi } from "vitest";

import { loaderArgs } from "../../test/testUtils";
import { exigirAutenticacao } from "./auth.loader";
import { redirecionarUsuarioAutenticado } from "./login.loader";
import { getAuthenticatedUser } from "./auth.service";

vi.mock("./auth.service", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const getAuthenticatedUserMock = vi.mocked(getAuthenticatedUser);
const usuario = {
  id: 1,
  cpf: "12345678901",
  nome: "Maria",
  sobrenome: "Silva",
  email: "maria@constructo.dev",
  telefone: "63999999999",
  canal_preferido: "email",
  receber_atualizacoes: true,
  empreendimento: "Residencial Sol",
  unidade: "101",
  ativo: true,
};

describe("loaders de autenticação", () => {
  beforeEach(() => vi.clearAllMocks());

  it("libera a rota protegida e devolve o usuário autenticado", async () => {
    getAuthenticatedUserMock.mockResolvedValue(usuario);
    const args = loaderArgs("http://localhost/admin/usuarios");

    await expect(exigirAutenticacao(args)).resolves.toEqual(usuario);
    expect(getAuthenticatedUserMock).toHaveBeenCalledWith({
      signal: args.request.signal,
    });
  });

  it("redireciona uma rota protegida preservando path, busca e hash", async () => {
    getAuthenticatedUserMock.mockRejectedValue(new Error("sem sessão"));

    const resposta = await exigirAutenticacao(
      loaderArgs("http://localhost/admin/usuarios?pagina=2#ativos"),
    ).catch((erro: unknown) => erro as Response);
    const redirecionamento = resposta as Response;

    expect(redirecionamento).toBeInstanceOf(Response);
    expect(redirecionamento.status).toBe(302);
    expect(redirecionamento.headers.get("Location")).toBe(
      "/login?redirectTo=%2Fadmin%2Fusuarios%3Fpagina%3D2%23ativos",
    );
  });

  it("mantém a página de login acessível quando não existe sessão", async () => {
    getAuthenticatedUserMock.mockRejectedValue(new Error("sem sessão"));

    await expect(
      redirecionarUsuarioAutenticado(loaderArgs("http://localhost/login")),
    ).resolves.toBeNull();
  });

  it("redireciona usuário autenticado para a origem administrativa", async () => {
    getAuthenticatedUserMock.mockResolvedValue(usuario);

    const resposta = await redirecionarUsuarioAutenticado(
      loaderArgs(
        "http://localhost/login?redirectTo=%2Fadmin%2Fusuarios%3Fpagina%3D2%23ativos",
      ),
    );

    expect(resposta).toBeInstanceOf(Response);
    expect((resposta as Response).headers.get("Location")).toBe(
      "/admin/usuarios?pagina=2#ativos",
    );
  });

  it("descarta destinos externos ao redirecionar após o login", async () => {
    getAuthenticatedUserMock.mockResolvedValue(usuario);

    const resposta = await redirecionarUsuarioAutenticado(
      loaderArgs("http://localhost/login?redirectTo=https://malicioso.test"),
    );

    expect((resposta as Response).headers.get("Location")).toBe("/admin");
  });
});
