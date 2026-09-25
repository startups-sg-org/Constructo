import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUser, loginUser } from "../features/auth/auth.service";
import {
  createUser,
  getUsers,
  getUsersCount,
} from "../features/usuarios/usuarios.service";
import { rotasAplicacao } from "./router";

vi.mock("../features/auth/auth.service", () => ({
  getAuthenticatedUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock("../features/usuarios/usuarios.service", () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  getUser: vi.fn(),
  getUsers: vi.fn(),
  getUsersCount: vi.fn(),
  updateUser: vi.fn(),
}));

const getAuthenticatedUserMock = vi.mocked(getAuthenticatedUser);
const loginUserMock = vi.mocked(loginUser);
const createUserMock = vi.mocked(createUser);
const getUsersMock = vi.mocked(getUsers);
const getUsersCountMock = vi.mocked(getUsersCount);

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

function montarRota(entrada: string) {
  const router = createMemoryRouter(rotasAplicacao, {
    initialEntries: [entrada],
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("novo sistema de rotas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUserMock.mockResolvedValue(usuario);
    getUsersCountMock.mockResolvedValue(8);
    getUsersMock.mockResolvedValue([]);
  });

  it("renderiza a rota pública principal", async () => {
    montarRota("/");

    expect(
      await screen.findByRole("heading", {
        name: /gestão de obras simples e transparente/i,
      }),
    ).toBeInTheDocument();
  });

  it("renderiza Login e Cadastro como rotas públicas", async () => {
    getAuthenticatedUserMock.mockRejectedValue(new Error("sem sessão"));
    const loginRouter = montarRota("/login");
    expect(
      await screen.findByRole("heading", { name: "Entre na sua conta" }),
    ).toBeInTheDocument();

    loginRouter.dispose();
    montarRota("/cadastro");
    expect(
      await screen.findByRole("heading", { name: "Crie sua conta" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["/admin", "Painel Administrativo"],
    ["/admin/usuarios", "Usuários"],
    ["/admin/obras", "Obras"],
    ["/admin/contratos", "Contratos"],
    ["/admin/medicoes", "Medições"],
    ["/admin/perfil", "Perfil"],
  ])("renderiza a rota protegida %s", async (entrada, titulo) => {
    montarRota(entrada);

    expect(
      await screen.findByRole("heading", { name: titulo }),
    ).toBeInTheDocument();
  });

  it("bloqueia rota administrativa e preserva o destino no login", async () => {
    getAuthenticatedUserMock.mockRejectedValue(new Error("sem sessão"));
    const router = montarRota("/admin/usuarios?pagina=2");

    expect(
      await screen.findByRole("heading", { name: "Entre na sua conta" }),
    ).toBeInTheDocument();
    expect(`${router.state.location.pathname}${router.state.location.search}`).toBe(
      "/login?redirectTo=%2Fadmin%2Fusuarios%3Fpagina%3D2",
    );
  });

  it("exibe a página de rota não encontrada", async () => {
    montarRota("/rota-inexistente");

    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" }),
    ).toBeInTheDocument();
  });

  it("renderiza o errorElement quando um loader falha", async () => {
    getUsersCountMock.mockRejectedValue(new TypeError("Failed to fetch"));
    montarRota("/admin");

    expect(
      await screen.findByRole("heading", {
        name: "Não foi possível acessar o serviço",
      }),
    ).toBeInTheDocument();
  });

  it("realiza o fluxo de Login e redireciona para a área protegida", async () => {
    const user = userEvent.setup();
    getAuthenticatedUserMock
      .mockRejectedValueOnce(new Error("sem sessão"))
      .mockResolvedValue(usuario);
    loginUserMock.mockResolvedValue(usuario);
    montarRota("/login?redirectTo=%2Fadmin%2Fobras");

    await user.type(await screen.findByLabelText("E-mail"), "maria@constructo.dev");
    await user.type(screen.getByLabelText("Senha"), "segura123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("heading", { name: "Obras" }),
    ).toBeInTheDocument();
    expect(loginUserMock).toHaveBeenCalledWith(
      "maria@constructo.dev",
      "segura123",
      expect.anything(),
    );
  });

  it("realiza o fluxo de Cadastro e substitui a rota pelo login", async () => {
    const user = userEvent.setup();
    createUserMock.mockResolvedValue(usuario);
    getAuthenticatedUserMock.mockRejectedValue(new Error("sem sessão"));
    const router = montarRota("/cadastro");

    await user.type(await screen.findByLabelText("Nome"), "Maria");
    await user.type(screen.getByLabelText("Sobrenome"), "Silva");
    await user.type(screen.getByLabelText("E-mail"), "maria@constructo.dev");
    await user.type(screen.getByLabelText("CPF"), "123.456.789-00");
    await user.type(screen.getByLabelText("Telefone"), "63999999999");
    await user.type(screen.getByLabelText("Empreendimento"), "Residencial Sol");
    await user.type(screen.getByLabelText("Unidade"), "101");
    await user.type(screen.getByLabelText("Senha"), "segura123");
    await user.type(screen.getByLabelText("Confirmar senha"), "segura123");
    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
    expect(
      await screen.findByRole("heading", { name: "Entre na sua conta" }),
    ).toBeInTheDocument();
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "maria@constructo.dev" }),
      expect.anything(),
    );
  });
});
