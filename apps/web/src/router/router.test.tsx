import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUser, loginUser } from "../features/auth/auth.service";
import { getContratosDisponiveis } from "../features/contratos/contratos.service";
import { createObra } from "../features/obras/obras.service";
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
  getUsers: vi.fn(),
  getUsersCount: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../features/contratos/contratos.service", () => ({
  getContratosDisponiveis: vi.fn(),
}));

vi.mock("../features/obras/obras.service", () => ({
  createObra: vi.fn(),
}));

const getAuthenticatedUserMock = vi.mocked(getAuthenticatedUser);
const loginUserMock = vi.mocked(loginUser);
const createUserMock = vi.mocked(createUser);
const getUsersMock = vi.mocked(getUsers);
const getUsersCountMock = vi.mocked(getUsersCount);
const getContratosDisponiveisMock = vi.mocked(getContratosDisponiveis);
const createObraMock = vi.mocked(createObra);

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
    getContratosDisponiveisMock.mockResolvedValue([]);
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
    ["/admin/obras/cadastro", "Cadastrar Obra"],
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

  it("abre a edição com os dados fornecidos pelo loader da lista", async () => {
    const user = userEvent.setup();
    getUsersMock.mockResolvedValue([usuario]);
    montarRota("/admin/usuarios");

    await user.click(await screen.findByRole("button", { name: "Editar" }));

    expect(screen.getByRole("dialog", { name: "Editar usuário" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Maria");
    expect(screen.getByLabelText("E-mail")).toHaveValue("maria@constructo.dev");
    expect(getUsersMock).toHaveBeenCalledTimes(1);
  });

  it("abre o formulário de cadastro de obra com contratos disponíveis", async () => {
    getContratosDisponiveisMock.mockResolvedValue([
      { id: 1, numero: "CTR-001", descricao: "Contrato Alpha", obraVinculadaId: null },
      { id: 2, numero: "CTR-002", descricao: "Contrato Beta", obraVinculadaId: null },
    ]);
    montarRota("/admin/obras/cadastro");

    expect(
      await screen.findByText("Preencha os dados para vincular uma obra a um contrato."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da obra")).toBeInTheDocument();
    expect(screen.getByLabelText("Contrato vinculado")).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço")).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
    expect(screen.getByText("CTR-001 — Contrato Alpha")).toBeInTheDocument();
    expect(screen.getByText("CTR-002 — Contrato Beta")).toBeInTheDocument();
    expect(getContratosDisponiveisMock).toHaveBeenCalledTimes(1);
  });

  it("cadastra uma obra e redireciona para a lista", async () => {
    const user = userEvent.setup();
    getContratosDisponiveisMock.mockResolvedValue([
      { id: 1, numero: "CTR-001", descricao: "Contrato Alpha", obraVinculadaId: null },
    ]);
    createObraMock.mockResolvedValue({ id: 1, nome: "Edifício Central", descricao: null, endereco: "Rua das Flores, 123", latitude: -15.79, longitude: -47.88, status: "PLANEJAMENTO", dataInicio: "2026-01-15", dataFimPrevista: "2027-06-30", contratoId: 1 });
    const router = montarRota("/admin/obras/cadastro");

    await user.type(await screen.findByLabelText("Nome da obra"), "Edifício Central");
    await user.type(screen.getByLabelText("Endereço"), "Rua das Flores, 123");

    const latInput = screen.getByLabelText("Latitude");
    await user.type(latInput, "-15.79");

    const lonInput = screen.getByLabelText("Longitude");
    await user.type(lonInput, "-47.88");

    await user.type(screen.getByLabelText("Data de início"), "2026-01-15");
    await user.type(screen.getByLabelText("Data de fim prevista"), "2027-06-30");

    const select = screen.getByLabelText("Contrato vinculado");
    await user.selectOptions(select, select.querySelector("option[value='1']") as HTMLOptionElement);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/admin/obras"));
    expect(createObraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Edifício Central",
        latitude: -15.79,
        longitude: -47.88,
        contratoId: 1,
      }),
      expect.anything(),
    );
  });
});
