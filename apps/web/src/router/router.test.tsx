import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUser, loginUser } from "../features/auth/auth.service";
import {
  atualizarEmpreendimento,
  criarEmpreendimento,
  listarEmpreendimentos,
  obterEmpreendimento,
} from "../features/empreendimentos/empreendimentos.service";
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
vi.mock("../features/empreendimentos/empreendimentos.service", () => ({
  atualizarEmpreendimento: vi.fn(),
  criarEmpreendimento: vi.fn(),
  listarEmpreendimentos: vi.fn(),
  obterEmpreendimento: vi.fn(),
}));


vi.mock("../features/usuarios/usuarios.service", () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  getUsers: vi.fn(),
  getUsersCount: vi.fn(),
  updateUser: vi.fn(),
}));

const getAuthenticatedUserMock = vi.mocked(getAuthenticatedUser);
const loginUserMock = vi.mocked(loginUser);
const atualizarEmpreendimentoMock = vi.mocked(atualizarEmpreendimento);
const criarEmpreendimentoMock = vi.mocked(criarEmpreendimento);
const listarEmpreendimentosMock = vi.mocked(listarEmpreendimentos);
const obterEmpreendimentoMock = vi.mocked(obterEmpreendimento);
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

const empreendimento = {
  id: 12,
  nome: "Residencial Aurora",
  descricao: "Duas torres",
  endereco: "Avenida Central, 100",
  status: "PLANEJADO" as const,
  criado_em: "2026-09-25T12:00:00Z",
  atualizado_em: "2026-09-25T12:00:00Z",
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
    listarEmpreendimentosMock.mockResolvedValue([]);
    obterEmpreendimentoMock.mockResolvedValue(empreendimento);
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
    ["/admin/obras", "Empreendimentos"],
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
      await screen.findByRole("heading", { name: "Empreendimentos" }),
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

  it("cadastra um empreendimento e apresenta feedback de sucesso", async () => {
    const user = userEvent.setup();
    criarEmpreendimentoMock.mockResolvedValue({
      id: 12,
      nome: "Residencial Aurora",
      descricao: "Duas torres",
      endereco: "Avenida Central, 100",
      status: "EM_ANDAMENTO",
      criado_em: "2026-09-25T12:00:00Z",
      atualizado_em: "2026-09-25T12:00:00Z",
    });
    montarRota("/admin/obras");

    await user.type(await screen.findByLabelText(/^Nome/), "Residencial Aurora");
    await user.selectOptions(screen.getByLabelText(/^Status/), "EM_ANDAMENTO");
    await user.type(screen.getByLabelText("Endereço"), "Avenida Central, 100");
    await user.type(screen.getByLabelText("Descrição"), "Duas torres");
    await user.click(screen.getByRole("button", { name: "Cadastrar empreendimento" }));

    expect(
      await screen.findByText(
        "Empreendimento “Residencial Aurora” cadastrado com sucesso.",
      ),
    ).toBeInTheDocument();
    expect(criarEmpreendimentoMock).toHaveBeenCalledWith(
      {
        nome: "Residencial Aurora",
        descricao: "Duas torres",
        endereco: "Avenida Central, 100",
        status: "EM_ANDAMENTO",
      },
      expect.anything(),
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/^Nome/)).toHaveValue("");
    });
  });

  it("lista os dados dos empreendimentos e oferece as ações esperadas", async () => {
    listarEmpreendimentosMock.mockResolvedValue([empreendimento]);
    montarRota("/admin/obras");

    const titulo = await screen.findByRole("heading", { name: "Residencial Aurora" });
    const card = titulo.closest("article");
    expect(card).not.toBeNull();
    expect(within(card!).getByText("Planejado")).toBeInTheDocument();
    expect(within(card!).getByText("Avenida Central, 100")).toBeInTheDocument();
    expect(within(card!).getByText(/25.*2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visualizar" })).toHaveAttribute(
      "href",
      "/admin/obras/12",
    );
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      "/admin/obras/12/editar",
    );
  });

  it("trata a lista vazia de empreendimentos", async () => {
    montarRota("/admin/obras");

    expect(
      await screen.findByRole("heading", { name: "Nenhum empreendimento cadastrado" }),
    ).toBeInTheDocument();
  });

  it("permite visualizar um empreendimento", async () => {
    listarEmpreendimentosMock.mockResolvedValue([empreendimento]);
    const user = userEvent.setup();
    montarRota("/admin/obras");

    await user.click(await screen.findByRole("link", { name: "Visualizar" }));

    expect(
      await screen.findByRole("heading", { name: "Visualizar empreendimento" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Duas torres")).toBeInTheDocument();
    expect(obterEmpreendimentoMock).toHaveBeenCalledWith(12, expect.anything());
  });

  it("trata erro ao carregar os empreendimentos", async () => {
    listarEmpreendimentosMock.mockRejectedValue(new TypeError("Failed to fetch"));
    montarRota("/admin/obras");

    expect(
      await screen.findByRole("heading", { name: "Não foi possível acessar o serviço" }),
    ).toBeInTheDocument();
  });

  it("apresenta loading enquanto carrega os empreendimentos", async () => {
    let concluirCarregamento!: (valor: typeof empreendimento[]) => void;
    listarEmpreendimentosMock.mockImplementation(
      () => new Promise((resolve) => { concluirCarregamento = resolve; }),
    );
    const user = userEvent.setup();
    montarRota("/admin");

    await user.click(await screen.findByRole("link", { name: "Empreendimentos" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Carregando página...");
    concluirCarregamento([]);
    expect(
      await screen.findByRole("heading", { name: "Nenhum empreendimento cadastrado" }),
    ).toBeInTheDocument();
  });

  it("valida o nome e exibe erros retornados pela API", async () => {
    const user = userEvent.setup();
    montarRota("/admin/obras");

    await user.click(
      await screen.findByRole("button", { name: "Cadastrar empreendimento" }),
    );
    expect(await screen.findByText("Nome é obrigatório")).toBeInTheDocument();
    expect(criarEmpreendimentoMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/^Nome/), "Residencial Aurora");
    criarEmpreendimentoMock.mockRejectedValue(
      new Error("Não foi possível salvar o empreendimento"),
    );
    await user.click(screen.getByRole("button", { name: "Cadastrar empreendimento" }));

    expect(
      await screen.findByText("Não foi possível salvar o empreendimento"),
    ).toBeInTheDocument();
  });

  it("carrega dados atuais e envia somente campos alterados na edição", async () => {
    const user = userEvent.setup();
    atualizarEmpreendimentoMock.mockResolvedValue({
      ...empreendimento,
      nome: "Residencial Aurora Norte",
      atualizado_em: "2026-09-25T13:00:00Z",
    });
    montarRota("/admin/obras/12/editar");

    expect(await screen.findByLabelText(/^Nome/)).toHaveValue("Residencial Aurora");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Duas torres");
    expect(screen.getByLabelText("Endereço")).toHaveValue("Avenida Central, 100");
    expect(obterEmpreendimentoMock).toHaveBeenCalledWith(12, expect.anything());

    const nome = screen.getByLabelText(/^Nome/);
    await user.clear(nome);
    await user.type(nome, "Residencial Aurora Norte");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(atualizarEmpreendimentoMock).toHaveBeenCalledWith(
      12,
      { nome: "Residencial Aurora Norte" },
      expect.anything(),
    );
    expect(
      await screen.findByText(
        "Empreendimento “Residencial Aurora Norte” atualizado com sucesso.",
      ),
    ).toBeInTheDocument();
  });

  it("informa erro ao falhar a edição do empreendimento", async () => {
    const user = userEvent.setup();
    atualizarEmpreendimentoMock.mockRejectedValue(
      new Error("Não foi possível atualizar o empreendimento"),
    );
    montarRota("/admin/obras/12/editar");

    const descricao = await screen.findByLabelText("Descrição");
    await user.clear(descricao);
    await user.type(descricao, "Descrição revisada");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Não foi possível atualizar o empreendimento"),
    ).toBeInTheDocument();
  });
});
