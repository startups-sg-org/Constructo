import { beforeEach, describe, expect, it, vi } from "vitest";

import { actionArgs } from "../../test/testUtils";
import { autenticarUsuario } from "../auth/auth.action";
import { executarAcaoAdministrativa } from "../auth/logout.action";
import { loginUser, logoutUser } from "../auth/auth.service";
import { cadastrarUsuario } from "./cadastro.action";
import { alterarUsuario } from "./usuarios.action";
import { createUser, deleteUser, updateUser } from "./usuarios.service";

vi.mock("../auth/auth.service", () => ({
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock("./usuarios.service", () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUser: vi.fn(),
}));

const loginUserMock = vi.mocked(loginUser);
const logoutUserMock = vi.mocked(logoutUser);
const createUserMock = vi.mocked(createUser);
const deleteUserMock = vi.mocked(deleteUser);
const updateUserMock = vi.mocked(updateUser);

const cadastroValido = {
  nome: "Maria",
  sobrenome: "Silva",
  email: "MARIA@EXEMPLO.COM",
  cpf: "123.456.789-00",
  telefone: "63999999999",
  empreendimento: "Residencial Sol",
  unidade: "101",
  canal_preferido: "email",
  receber_atualizacoes: "on",
  senha: "segura123",
  confirmarSenha: "segura123",
};

const edicaoValida = {
  intent: "update",
  usuarioId: "7",
  nome: "Maria",
  sobrenome: "Silva",
  email: "MARIA@EXEMPLO.COM",
  cpf: "123.456.789-00",
  telefone: "63999999999",
  empreendimento: "Residencial Sol",
  unidade: "101",
  canal_preferido: "email",
  receber_atualizacoes: "on",
  ativo: "on",
};

describe("actions de autenticação e usuários", () => {
  beforeEach(() => vi.clearAllMocks());

  it("autentica e redireciona para a origem protegida", async () => {
    loginUserMock.mockResolvedValue({} as never);
    const args = actionArgs(
      "http://localhost/login?redirectTo=%2Fadmin%2Fusuarios",
      { email: "ADMIN@EXEMPLO.COM", senha: "segredo" },
    );

    const resposta = await autenticarUsuario(args);

    expect(loginUserMock).toHaveBeenCalledWith("admin@exemplo.com", "segredo", {
      signal: args.request.signal,
    });
    expect(resposta).toBeInstanceOf(Response);
    expect((resposta as Response).headers.get("Location")).toBe("/admin/usuarios");
  });

  it("retorna erros de validação do login sem chamar o serviço", async () => {
    const resultado = await autenticarUsuario(
      actionArgs("http://localhost/login", { email: "invalido", senha: "" }),
    );

    expect(resultado).toMatchObject({ erro: expect.any(String) });
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it("transforma uma falha de login em dado da action", async () => {
    loginUserMock.mockRejectedValue(new Error("Credenciais inválidas"));

    await expect(
      autenticarUsuario(
        actionArgs("http://localhost/login", {
          email: "admin@exemplo.com",
          senha: "errada",
        }),
      ),
    ).resolves.toEqual({ erro: "Credenciais inválidas" });
  });

  it("cadastra o usuário sem enviar a confirmação de senha", async () => {
    createUserMock.mockResolvedValue({} as never);
    const args = actionArgs("http://localhost/cadastro", cadastroValido);

    const resposta = await cadastrarUsuario(args);

    expect(createUserMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ confirmarSenha: expect.anything() }),
      { signal: args.request.signal },
    );
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "maria@exemplo.com",
        sobrenome: "silva",
        receber_atualizacoes: true,
      }),
      expect.anything(),
    );
    expect((resposta as Response).headers.get("Location")).toBe("/login");
    expect((resposta as Response).headers.get("X-Remix-Replace")).toBe("true");
  });

  it("valida o cadastro antes de chamar o serviço", async () => {
    const resultado = await cadastrarUsuario(
      actionArgs("http://localhost/cadastro", {
        ...cadastroValido,
        confirmarSenha: "diferente",
      }),
    );

    expect(resultado).toMatchObject({
      erro: "As senhas não coincidem",
      campos: { confirmarSenha: "As senhas não coincidem" },
    });
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("encerra a sessão somente para a intent de logout", async () => {
    logoutUserMock.mockResolvedValue();
    const args = actionArgs("http://localhost/admin", { intent: "logout" });

    const resposta = await executarAcaoAdministrativa(args);

    expect(logoutUserMock).toHaveBeenCalledWith({ signal: args.request.signal });
    expect((resposta as Response).headers.get("Location")).toBe("/login");

    await expect(
      executarAcaoAdministrativa(
        actionArgs("http://localhost/admin", { intent: "desconhecida" }),
      ),
    ).resolves.toEqual({ erro: "Operação administrativa inválida." });
  });

  it("atualiza e exclui usuários conforme a intent", async () => {
    updateUserMock.mockResolvedValue({} as never);
    deleteUserMock.mockResolvedValue();

    await expect(
      alterarUsuario(actionArgs("http://localhost/admin/usuarios", edicaoValida)),
    ).resolves.toEqual({ ok: true, intent: "update", usuarioId: 7 });
    expect(updateUserMock).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ ativo: true, email: "maria@exemplo.com" }),
      expect.anything(),
    );

    await expect(
      alterarUsuario(
        actionArgs("http://localhost/admin/usuarios", {
          intent: "delete",
          usuarioId: "7",
        }),
      ),
    ).resolves.toEqual({ ok: true, intent: "delete", usuarioId: 7 });
    expect(deleteUserMock).toHaveBeenCalledWith(7, expect.anything());
  });
});
