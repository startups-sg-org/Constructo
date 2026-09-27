import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUser, loginUser } from "../features/auth/auth.service";
import {
  atualizarEmpreendimento,
  atualizarLocal,
  criarEmpreendimento,
  criarLocalRaiz,
  criarPavimento,
  criarUnidade,
  listarEmpreendimentos,
  obterEstruturaFisica,
  obterEmpreendimento,
} from "../features/empreendimentos/empreendimentos.service";
import { ApiError } from "../services/api";
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
  atualizarLocal: vi.fn(),
  criarEmpreendimento: vi.fn(),
  criarLocalRaiz: vi.fn(),
  criarPavimento: vi.fn(),
  criarUnidade: vi.fn(),
  listarEmpreendimentos: vi.fn(),
  obterEstruturaFisica: vi.fn(),
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
const atualizarLocalMock = vi.mocked(atualizarLocal);
const criarEmpreendimentoMock = vi.mocked(criarEmpreendimento);
const criarLocalRaizMock = vi.mocked(criarLocalRaiz);
const criarPavimentoMock = vi.mocked(criarPavimento);
const criarUnidadeMock = vi.mocked(criarUnidade);
const listarEmpreendimentosMock = vi.mocked(listarEmpreendimentos);
const obterEstruturaFisicaMock = vi.mocked(obterEstruturaFisica);
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
  papel: "ADMIN" as const,
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
    obterEstruturaFisicaMock.mockResolvedValue([]);
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
    getAuthenticatedUserMock.mockRejectedValue(new ApiError("sem sessão", 401, "Unauthorized"));
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
      "/admin/empreendimentos/12",
    );
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12/editar",
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
    expect(screen.getByRole("heading", { name: "Residencial Aurora" })).toBeInTheDocument();
    expect(screen.getByText("Duas torres")).toBeInTheDocument();
    expect(screen.getByText("Avenida Central, 100")).toBeInTheDocument();
    expect(screen.getByText("Planejado")).toBeInTheDocument();
    expect(screen.getByText("Data de criação")).toBeInTheDocument();
    expect(screen.getByText("Data de atualização")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar empreendimento" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12/editar",
    );
    expect(screen.getByRole("link", { name: "Gerenciar estrutura física" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12/estrutura",
    );
    expect(obterEmpreendimentoMock).toHaveBeenCalledWith(12, expect.anything());
  });

  it("acessa a gestão da estrutura física pelo detalhe", async () => {
    const user = userEvent.setup();
    montarRota("/admin/empreendimentos/12");

    await user.click(
      await screen.findByRole("link", { name: "Gerenciar estrutura física" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Estrutura física" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Residencial Aurora" })).toBeInTheDocument();
  });

  it("seleciona um local, exibe seus dados e preserva a seleção na navegação", async () => {
    const user = userEvent.setup();
    const torre = {
      id: 31,
      empreendimento_id: 12,
      parent_id: null,
      nome: "Torre A",
      tipo: "TORRE" as const,
      ordem: 1,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    const pavimento = {
      ...torre,
      id: 41,
      parent_id: torre.id,
      nome: "7º Pavimento",
      tipo: "PAVIMENTO" as const,
      ordem: 2,
    };
    const unidade = {
      ...pavimento,
      id: 51,
      parent_id: pavimento.id,
      nome: "Unidade 704",
      tipo: "UNIDADE" as const,
      ordem: 3,
    };
    obterEstruturaFisicaMock.mockResolvedValue([{
      ...torre,
      filhos: [{
        ...pavimento,
        filhos: [{ ...unidade, filhos: [] }],
      }],
    }]);
    const router = montarRota("/admin/empreendimentos/12/estrutura");

    expect(await screen.findByRole("heading", { name: "Selecione um local" })).toBeInTheDocument();
    await user.click(screen.getByRole("treeitem", { name: /Unidade 704/ }));

    await waitFor(() => {
      expect(router.state.location.search).toBe("?localId=51");
    });
    const unidadeSelecionada = screen.getByRole("treeitem", { name: /Unidade 704/ });
    expect(unidadeSelecionada).toHaveAttribute("aria-selected", "true");

    const painel = screen.getByRole("complementary", { name: "Unidade 704" });
    expect(within(painel).getByText("51")).toBeInTheDocument();
    expect(within(painel).getByText("Unidade")).toBeInTheDocument();
    expect(within(painel).getAllByText("Residencial Aurora")).toHaveLength(2);
    expect(
      within(painel)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Residencial Aurora",
      "Torre A",
      "7º Pavimento",
      "Unidade 704",
    ]);

    await router.navigate("/admin/obras");
    await screen.findByRole("heading", { name: "Empreendimentos" });
    await router.navigate(-1);

    expect(
      await screen.findByRole("treeitem", { name: /Unidade 704/ }),
    ).toHaveAttribute("aria-selected", "true");
    expect(router.state.location.search).toBe("?localId=51");
  });

  it("restaura uma seleção compartilhada diretamente pela URL", async () => {
    const local = {
      id: 32,
      empreendimento_id: 12,
      parent_id: null,
      nome: "Bloco Norte",
      tipo: "BLOCO" as const,
      ordem: 1,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
      filhos: [],
    };
    obterEstruturaFisicaMock.mockResolvedValue([local]);

    montarRota("/admin/empreendimentos/12/estrutura?localId=32");

    expect(await screen.findByRole("treeitem", { name: /Bloco Norte/ }))
      .toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("complementary", { name: "Bloco Norte" }))
      .toHaveTextContent("Bloco");
  });

  it.each([
    ["TORRE", "Torre A", "Torre"],
    ["BLOCO", "Bloco Norte", "Bloco"],
  ] as const)("cadastra um local raiz do tipo %s e atualiza a estrutura", async (tipo, nome, rotulo) => {
    const user = userEvent.setup();
    const local = {
      id: tipo === "TORRE" ? 31 : 32,
      empreendimento_id: 12,
      parent_id: null,
      nome,
      tipo,
      ordem: 2,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    obterEstruturaFisicaMock
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ ...local, filhos: [] }]);
    criarLocalRaizMock.mockResolvedValue(local);
    montarRota("/admin/empreendimentos/12/estrutura");

    await user.type(await screen.findByLabelText(/^Nome/), nome);
    await user.selectOptions(screen.getByLabelText(/^Tipo/), tipo);
    await user.clear(screen.getByLabelText(/^Ordem/));
    await user.type(screen.getByLabelText(/^Ordem/), "2");
    await user.click(screen.getByRole("button", { name: "Adicionar torre/bloco" }));

    expect(criarLocalRaizMock).toHaveBeenCalledWith(
      12,
      { nome, tipo, ordem: 2 },
      expect.anything(),
    );
    const itemCriado = (await screen.findByText(nome)).closest("li");
    expect(itemCriado).not.toBeNull();
    expect(within(itemCriado!).getByText(rotulo)).toBeInTheDocument();
    expect(screen.getByText(`${rotulo} “${nome}” adicionada com sucesso.`)).toBeInTheDocument();
  });

  it("cadastra um pavimento na torre selecionada e atualiza a árvore", async () => {
    const user = userEvent.setup();
    const torre = {
      id: 31,
      empreendimento_id: 12,
      parent_id: null,
      nome: "Torre A",
      tipo: "TORRE" as const,
      ordem: 1,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    const pavimento = {
      ...torre,
      id: 41,
      parent_id: torre.id,
      nome: "1º pavimento",
      tipo: "PAVIMENTO" as const,
      ordem: 2,
    };
    obterEstruturaFisicaMock
      .mockResolvedValueOnce([{ ...torre, filhos: [] }])
      .mockResolvedValue([{ ...torre, filhos: [{ ...pavimento, filhos: [] }] }]);
    criarPavimentoMock.mockResolvedValue(pavimento);
    montarRota("/admin/empreendimentos/12/estrutura");

    await user.click(await screen.findByRole("button", { name: "Adicionar pavimento" }));
    const formulario = screen.getByRole("form", { name: "Adicionar pavimento em Torre A" });
    await user.type(within(formulario).getByLabelText(/^Nome/), "1º pavimento");
    await user.clear(within(formulario).getByLabelText(/^Ordem/));
    await user.type(within(formulario).getByLabelText(/^Ordem/), "2");
    await user.click(within(formulario).getByRole("button", { name: "Adicionar pavimento" }));

    expect(criarPavimentoMock).toHaveBeenCalledWith(
      12,
      torre.id,
      { nome: "1º pavimento", ordem: 2 },
      expect.anything(),
    );
    expect(await screen.findByText("1º pavimento")).toBeInTheDocument();
    expect(screen.getByText("Pavimento “1º pavimento” adicionado com sucesso.")).toBeInTheDocument();
  });

  it("cadastra uma unidade no pavimento selecionado e atualiza a árvore", async () => {
    const user = userEvent.setup();
    const torre = {
      id: 31,
      empreendimento_id: 12,
      parent_id: null,
      nome: "Torre A",
      tipo: "TORRE" as const,
      ordem: 1,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    const pavimento = {
      ...torre,
      id: 41,
      parent_id: torre.id,
      nome: "1º pavimento",
      tipo: "PAVIMENTO" as const,
      ordem: 2,
    };
    const unidade = {
      ...pavimento,
      id: 51,
      parent_id: pavimento.id,
      nome: "101",
      tipo: "UNIDADE" as const,
      ordem: 3,
    };
    obterEstruturaFisicaMock
      .mockResolvedValueOnce([{
        ...torre,
        filhos: [{ ...pavimento, filhos: [] }],
      }])
      .mockResolvedValue([{
        ...torre,
        filhos: [{ ...pavimento, filhos: [{ ...unidade, filhos: [] }] }],
      }]);
    criarUnidadeMock.mockResolvedValue(unidade);
    montarRota("/admin/empreendimentos/12/estrutura");

    await user.click(await screen.findByRole("button", { name: "Adicionar unidade" }));
    const formulario = screen.getByRole("form", { name: "Adicionar unidade em 1º pavimento" });
    await user.type(within(formulario).getByLabelText(/^Nome/), "101");
    await user.clear(within(formulario).getByLabelText(/^Ordem/));
    await user.type(within(formulario).getByLabelText(/^Ordem/), "3");
    await user.click(within(formulario).getByRole("button", { name: "Adicionar unidade" }));

    expect(criarUnidadeMock).toHaveBeenCalledWith(
      12,
      pavimento.id,
      { nome: "101", ordem: 3 },
      expect.anything(),
    );
    const unidadeCriada = (await screen.findByText("101")).closest("li");
    expect(unidadeCriada).not.toBeNull();
    expect(within(unidadeCriada!).getByText("Unidade")).toBeInTheDocument();
    expect(within(unidadeCriada!).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Unidade “101” adicionada com sucesso.")).toBeInTheDocument();
  });

  it("trata empreendimento inexistente", async () => {
    obterEmpreendimentoMock.mockRejectedValue(
      new ApiError("Empreendimento não encontrado", 404, "Not Found"),
    );

    montarRota("/admin/empreendimentos/999");

    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" }),
    ).toBeInTheDocument();
  });

  it("trata erro ao carregar um empreendimento", async () => {
    obterEmpreendimentoMock.mockRejectedValue(new TypeError("Failed to fetch"));

    montarRota("/admin/empreendimentos/12");

    expect(
      await screen.findByRole("heading", { name: "Não foi possível acessar o serviço" }),
    ).toBeInTheDocument();
  });

  it("apresenta loading enquanto carrega um empreendimento", async () => {
    let concluirCarregamento!: (valor: typeof empreendimento) => void;
    obterEmpreendimentoMock.mockImplementation(
      () => new Promise((resolve) => { concluirCarregamento = resolve; }),
    );
    listarEmpreendimentosMock.mockResolvedValue([empreendimento]);
    const user = userEvent.setup();
    montarRota("/admin/obras");

    await user.click(await screen.findByRole("link", { name: "Visualizar" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Carregando página...");
    concluirCarregamento(empreendimento);
    expect(
      await screen.findByRole("heading", { name: "Visualizar empreendimento" }),
    ).toBeInTheDocument();
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
    montarRota("/admin/empreendimentos/12/editar");

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
    montarRota("/admin/empreendimentos/12/editar");

    const descricao = await screen.findByLabelText("Descrição");
    await user.clear(descricao);
    await user.type(descricao, "Descrição revisada");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Não foi possível atualizar o empreendimento"),
    ).toBeInTheDocument();
  });

  it("edita as informações básicas do local e revalida a árvore", async () => {
    const user = userEvent.setup();
    const local = {
      id: 32,
      empreendimento_id: 12,
      parent_id: null,
      nome: "Bloco Norte",
      tipo: "BLOCO" as const,
      ordem: 1,
      criado_em: "2026-09-26T12:00:00Z",
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    const localAtualizado = { ...local, nome: "Bloco Sul", ordem: 2 };
    obterEstruturaFisicaMock
      .mockResolvedValueOnce([{ ...local, filhos: [] }])
      .mockResolvedValue([{ ...localAtualizado, filhos: [] }]);
    atualizarLocalMock.mockResolvedValue(localAtualizado);
    montarRota("/admin/empreendimentos/12/estrutura?localId=32");

    await user.click(await screen.findByRole("button", { name: "Editar local" }));
    const formulario = screen.getByRole("form", { name: "Editar Bloco Norte" });
    const nome = within(formulario).getByLabelText(/^Nome/);
    await user.clear(nome);
    await user.type(nome, "Bloco Sul");
    const ordem = within(formulario).getByLabelText(/^Ordem/);
    await user.clear(ordem);
    await user.type(ordem, "2");
    await user.click(within(formulario).getByRole("button", { name: "Salvar alterações" }));

    expect(atualizarLocalMock).toHaveBeenCalledWith(
      12,
      32,
      { nome: "Bloco Sul", ordem: 2 },
      expect.anything(),
    );
    expect(await screen.findByRole("heading", { name: "Bloco Sul" })).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: /Bloco Sul/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
