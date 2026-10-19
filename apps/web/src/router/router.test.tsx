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
  listarCompradoresDaUnidade,
  listarEmpreendimentos,
  obterEstruturaFisica,
  obterEmpreendimento,
  obterTaxonomia,
  vincularCompradorAUnidade,
} from "../features/empreendimentos/empreendimentos.service";
import { listarProtocolosRecentes } from "../features/evidencias/evidencias.service";
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
  listarCompradoresDaUnidade: vi.fn(),
  listarEmpreendimentos: vi.fn(),
  obterEstruturaFisica: vi.fn(),
  obterEmpreendimento: vi.fn(),
  obterTaxonomia: vi.fn(),
  vincularCompradorAUnidade: vi.fn(),
}));

vi.mock("../features/evidencias/evidencias.service", () => ({
  listarProtocolosRecentes: vi.fn(),
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
const listarCompradoresDaUnidadeMock = vi.mocked(listarCompradoresDaUnidade);
const listarEmpreendimentosMock = vi.mocked(listarEmpreendimentos);
const obterEstruturaFisicaMock = vi.mocked(obterEstruturaFisica);
const obterEmpreendimentoMock = vi.mocked(obterEmpreendimento);
const obterTaxonomiaMock = vi.mocked(obterTaxonomia);
const vincularCompradorAUnidadeMock = vi.mocked(vincularCompradorAUnidade);
const listarProtocolosRecentesMock = vi.mocked(listarProtocolosRecentes);
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
    listarCompradoresDaUnidadeMock.mockResolvedValue([]);
    obterEstruturaFisicaMock.mockResolvedValue([]);
    obterEmpreendimentoMock.mockResolvedValue(empreendimento);
    obterTaxonomiaMock.mockResolvedValue({
      id: 3,
      empreendimento_id: empreendimento.id,
      origem_taxonomia_id: 1,
      nome: "Residencial",
      descricao: "Taxonomia do empreendimento",
      is_padrao: false,
    });
    listarProtocolosRecentesMock.mockResolvedValue([]);
    vincularCompradorAUnidadeMock.mockResolvedValue({
      usuario_id: 1,
      local_obra_id: 1,
    });
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
    montarRota("/admin/empreendimentos/novo");

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

    const linha = await screen.findByRole("row", { name: /Residencial Aurora/ });
    expect(within(linha).getByText("Planejado")).toBeInTheDocument();
    expect(within(linha).getByText("Avenida Central, 100")).toBeInTheDocument();
    expect(within(linha).getByText(/25.*2026/)).toBeInTheDocument();
    expect(within(linha).getByRole("link", { name: "Abrir" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12",
    );
    expect(screen.getByRole("link", { name: "Residencial Aurora" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12",
    );
    expect(screen.getByRole("button", { name: /Criar empreendimento/ })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/novo",
    );
  });

  it("renderiza cada empreendimento uma vez e mantém destinos acessíveis por teclado", async () => {
    const itens = ([
      [12, "Residencial Aurora", "PLANEJADO"],
      [13, "Parque das Águas", "EM_ANDAMENTO"],
      [14, "Vila Cerrado", "CONCLUIDO"],
      [15, "Estação Norte", "INATIVO"],
    ] as const).map(([id, nome, status]) => ({
      ...empreendimento,
      id,
      nome,
      status,
    }));
    listarEmpreendimentosMock.mockResolvedValue(itens);
    montarRota("/admin/obras");
    const rotulosStatus = {
      PLANEJADO: "Planejado",
      EM_ANDAMENTO: "Em andamento",
      CONCLUIDO: "Concluído",
      INATIVO: "Inativo",
    } as const;

    const linhas = await screen.findAllByRole("row");
    expect(linhas).toHaveLength(5);
    expect(screen.getByRole("columnheader", { name: "Empreendimento" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Descrição" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Localização" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Atualizado em" })).toBeInTheDocument();

    for (const item of itens) {
      expect(screen.getAllByRole("link", { name: item.nome })).toHaveLength(1);
      expect(screen.getByRole("row", { name: new RegExp(item.nome) })).toHaveTextContent(
        rotulosStatus[item.status],
      );
    }

    const linha = screen.getByRole("row", { name: /Residencial Aurora/ });
    expect(linha).not.toHaveAttribute("tabindex");
    expect(within(linha).getByRole("link", { name: "Abrir" })).toHaveAttribute(
      "href",
      "/admin/empreendimentos/12",
    );
  });

  it("atualiza a pré-visualização ao clicar no card de um empreendimento", async () => {
    const segundoEmpreendimento = {
      ...empreendimento,
      id: 13,
      nome: "Parque das Águas",
      descricao: "Conjunto habitacional",
      endereco: "Rua das Águas, 20",
      status: "CONCLUIDO" as const,
      atualizado_em: "2026-08-20T12:00:00Z",
    };
    listarEmpreendimentosMock.mockResolvedValue([empreendimento, segundoEmpreendimento]);
    const user = userEvent.setup();
    montarRota("/admin/obras");

    const previa = await screen.findByRole("complementary", {
      name: "Pré-visualização do Empreendimento",
    });
    expect(within(previa).getByRole("heading", { name: "Residencial Aurora" })).toBeInTheDocument();

    await user.click(screen.getByRole("article", {
      name: "Selecionar Parque das Águas para pré-visualização",
    }));

    expect(within(previa).getByRole("heading", { name: "Parque das Águas" })).toBeInTheDocument();
    expect(within(previa).getByText("Conjunto habitacional")).toBeInTheDocument();
    expect(within(previa).getByText("Rua das Águas, 20")).toBeInTheDocument();
  });

  it("filtra e ordena a listagem localmente", async () => {
    const segundoEmpreendimento = {
      ...empreendimento,
      id: 13,
      nome: "Parque das Águas",
      descricao: "Conjunto habitacional",
      endereco: "Rua das Águas, 20",
      status: "CONCLUIDO" as const,
      atualizado_em: "2026-09-26T12:00:00Z",
    };
    listarEmpreendimentosMock.mockResolvedValue([empreendimento, segundoEmpreendimento]);
    const user = userEvent.setup();
    montarRota("/admin/obras");

    expect(await screen.findByRole("link", { name: "Parque das Águas" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Buscar empreendimento"), "Parque");
    expect(screen.getByRole("link", { name: "Parque das Águas" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Residencial Aurora" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "PLANEJADO");
    expect(screen.getByRole("link", { name: "Residencial Aurora" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Parque das Águas" })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "TODOS");
    await user.selectOptions(screen.getByLabelText("Ordenar empreendimentos"), "nome-asc");
    const linhas = screen.getAllByRole("row").slice(1);
    expect(within(linhas[0]).getByRole("link", { name: "Parque das Águas" })).toBeInTheDocument();
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

    await user.click(await screen.findByRole("link", { name: "Abrir" }));

    expect(
      await screen.findByRole("heading", { name: "Residencial Aurora" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Duas torres")).toBeInTheDocument();
    expect(screen.getAllByText("Avenida Central, 100")).toHaveLength(2);
    expect(screen.getByText("Planejado")).toBeInTheDocument();
    expect(screen.getByText("Data de criação")).toBeInTheDocument();
    expect(screen.getByText("Atualizado em")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar empreendimento" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Gerenciar estrutura física" })).not.toBeInTheDocument();
    expect(obterEmpreendimentoMock).toHaveBeenCalledWith(12, expect.anything());
  });

  it("exibe a visão geral com estrutura, macroetapas e atividade reais", async () => {
    const baseLocal = {
      empreendimento_id: empreendimento.id,
      ordem: 1,
      criado_em: "2026-10-10T12:00:00Z",
      atualizado_em: "2026-10-11T12:00:00Z",
    };
    obterEstruturaFisicaMock.mockResolvedValue([{
      ...baseLocal,
      id: 31,
      parent_id: null,
      nome: "Torre A",
      tipo: "TORRE" as const,
      filhos: [{
        ...baseLocal,
        id: 41,
        parent_id: 31,
        nome: "1º Pavimento",
        tipo: "PAVIMENTO" as const,
        filhos: [{
          ...baseLocal,
          id: 51,
          parent_id: 41,
          nome: "Unidade 101",
          tipo: "UNIDADE" as const,
          filhos: [],
        }],
      }],
    }]);
    obterTaxonomiaMock.mockResolvedValue({
      id: 3,
      empreendimento_id: empreendimento.id,
      origem_taxonomia_id: 1,
      nome: "Residencial",
      descricao: "Taxonomia do empreendimento",
      is_padrao: false,
      etapas: [{
        id: 10,
        taxonomia_id: 3,
        parent_id: null,
        nome: "Fundações",
        ordem: 1,
        marcos: [{ id: 20, etapa_id: 10, nome: "Estacas", ordem: 1 }],
        subetapas: [],
      }],
    });
    listarProtocolosRecentesMock.mockResolvedValue([{
      id: 50,
      marco_id: 20,
      nome: "Conferência das estacas",
      descricao: "Registro fotográfico das fundações.",
      quantidade_minima: 2,
      criado_em: "2026-10-11T14:32:00Z",
      atualizado_em: "2026-10-11T14:32:00Z",
    }]);

    montarRota("/admin/empreendimentos/12");

    expect(await screen.findByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Informações gerais" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Resumo da obra" })).toBeInTheDocument();
    expect(screen.getByText("Torres").previousElementSibling).toHaveTextContent("1");
    expect(screen.getByText("Pavimentos").previousElementSibling).toHaveTextContent("1");
    expect(screen.getByText("Unidades").previousElementSibling).toHaveTextContent("1");
    expect(screen.getByRole("heading", { name: "Avanço físico global" })).toBeInTheDocument();
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
    expect(await screen.findByText("Fundações")).toBeInTheDocument();
    expect(screen.getByText("1 marco configurado")).toBeInTheDocument();
    expect(await screen.findByText("Protocolo Conferência das estacas criado")).toBeInTheDocument();
    expect(screen.getByText("Registro fotográfico das fundações.")).toBeInTheDocument();
  });

  it("isola falhas parciais dos módulos da visão geral", async () => {
    obterTaxonomiaMock.mockRejectedValue(new ApiError("não encontrada", 404, "Not Found"));
    obterEstruturaFisicaMock.mockRejectedValue(new Error("estrutura indisponível"));
    listarProtocolosRecentesMock.mockRejectedValue(new Error("atividade indisponível"));

    montarRota("/admin/empreendimentos/12");

    expect(await screen.findByText("Nenhuma taxonomia configurada para este empreendimento.")).toBeInTheDocument();
    expect(await screen.findByText("Não foi possível carregar o resumo da estrutura.")).toBeInTheDocument();
    expect(await screen.findByText("Não foi possível carregar os protocolos recentes.")).toBeInTheDocument();
    expect(screen.getAllByText("Avenida Central, 100")).toHaveLength(2);
  });

  it("exibe os estados vazios sem inventar conteúdo", async () => {
    montarRota("/admin/empreendimentos/12");

    expect(await screen.findByText("Nenhuma macroetapa configurada na taxonomia.")).toBeInTheDocument();
    expect(await screen.findByText("Nenhum protocolo criado recentemente.")).toBeInTheDocument();
    const resumoObra = screen.getByRole("region", { name: "Resumo da obra" });
    expect(within(resumoObra).getByText("Torres").previousElementSibling).toHaveTextContent("0");
    expect(within(resumoObra).getByText("Pavimentos").previousElementSibling).toHaveTextContent("0");
    expect(within(resumoObra).getByText("Unidades").previousElementSibling).toHaveTextContent("0");
    expect(screen.queryByText(/responsável/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/auditoria/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^ART$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/habite-se/i)).not.toBeInTheDocument();
  });

  it("não simula ações ou contadores sem integração no shell do empreendimento", async () => {
    montarRota("/admin/empreendimentos/12");

    await screen.findByRole("heading", { name: "Residencial Aurora" });
    const areas = screen.getByRole("navigation", { name: "Áreas do empreendimento" });
    const destinos = {
      Visualizar: "/admin/empreendimentos/12",
      Editar: "/admin/empreendimentos/12/editar",
      Estrutura: "/admin/empreendimentos/12/estrutura",
      Taxonomia: "/admin/empreendimentos/12/taxonomia",
      Contratos: "/admin/empreendimentos/12/contratos",
      Medições: "/admin/empreendimentos/12/medicoes",
      Documentos: "/admin/empreendimentos/12/documentos",
    } as const;

    for (const [rotulo, destino] of Object.entries(destinos)) {
      const link = within(areas).getByRole("link", { name: rotulo });
      expect(link).toHaveAttribute("href", destino);
      expect(link).toHaveTextContent(new RegExp(`^${rotulo}$`));
    }

    expect(screen.queryByText("Exportar")).not.toBeInTheDocument();
    expect(screen.queryByText("Nova medição")).not.toBeInTheDocument();
  });

  it("acessa a gestão da estrutura física pelo detalhe", async () => {
    const user = userEvent.setup();
    montarRota("/admin/empreendimentos/12");

    await user.click(await screen.findByRole("link", { name: "Estrutura" }));

    expect(
      await screen.findByRole("heading", { name: "Estrutura do empreendimento" }),
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
    await user.click(screen.getByRole("button", { name: "Unidade 704" }));

    await waitFor(() => {
      expect(router.state.location.search).toBe("?localId=51");
    });
    const unidadeSelecionada = screen.getByRole("button", { name: "Unidade 704" });
    expect(unidadeSelecionada).toHaveAttribute("aria-current", "true");

    const painel = screen.getByRole("complementary", { name: "Unidade 704" });
    expect(within(painel).queryByText("51")).not.toBeInTheDocument();
    expect(within(painel).getAllByText("Unidade")).toHaveLength(2);
    expect(within(painel).getByText("Local superior").parentElement).toHaveTextContent("7º Pavimento");
    expect(within(painel).getByText("Ordem").parentElement).toHaveTextContent("3");
    expect(within(painel).getByText("Locais filhos").parentElement).toHaveTextContent("0 locais");
    expect(within(painel).getByText("Residencial Aurora")).toBeInTheDocument();
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
      await screen.findByRole("button", { name: "Unidade 704" }),
    ).toHaveAttribute("aria-current", "true");
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

    expect(await screen.findByRole("button", { name: "Bloco Norte" }))
      .toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("complementary", { name: "Bloco Norte" }))
      .toHaveTextContent("Bloco");
    expect(screen.queryByRole("heading", { name: "Compradores vinculados" })).not.toBeInTheDocument();
  });

  it("lista, busca e vincula um comprador real somente no detalhe da unidade", async () => {
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
    const comprador = {
      ...usuario,
      id: 22,
      nome: "Bruno",
      sobrenome: "Lima",
      email: "bruno@constructo.dev",
      papel: "COMPRADOR" as const,
    };
    obterEstruturaFisicaMock.mockResolvedValue([{
      ...torre,
      filhos: [{
        ...pavimento,
        filhos: [{ ...unidade, filhos: [] }],
      }],
    }]);
    getUsersMock.mockResolvedValue([usuario, comprador]);
    listarCompradoresDaUnidadeMock.mockResolvedValue([]);
    vincularCompradorAUnidadeMock.mockResolvedValue({
      usuario_id: comprador.id,
      local_obra_id: unidade.id,
    });

    montarRota("/admin/empreendimentos/12/estrutura?localId=51");

    await screen.findByRole("complementary", { name: "Unidade 704" });
    expect(await screen.findByText("Nenhum comprador vinculado a esta unidade.")).toBeInTheDocument();
    const compradoresUnidade = screen.getByRole("region", { name: "Compradores vinculados" });

    await user.type(screen.getByLabelText("Comprador"), "bruno");
    const resultados = screen.getByRole("list", { name: "Resultados da busca de compradores" });
    await user.click(within(resultados).getByRole("button", { name: /Bruno Lima/ }));
    expect(screen.getByLabelText("Comprador selecionado")).toHaveTextContent("bruno@constructo.dev");
    await user.click(screen.getByRole("button", { name: "Vincular comprador" }));

    expect(vincularCompradorAUnidadeMock).toHaveBeenCalledWith(12, unidade.id, comprador.id);
    expect(await screen.findByText("Comprador vinculado à unidade.")).toBeInTheDocument();
    expect(within(compradoresUnidade).getByText("Bruno Lima")).toBeInTheDocument();
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
    const arvore = screen.getByRole("tree", { name: "Estrutura física" });
    const itemCriado = (await within(arvore).findByRole("button", { name: nome })).closest("li");
    expect(itemCriado).not.toBeNull();
    expect(within(itemCriado!).getByRole("img", { name: rotulo })).toBeInTheDocument();
    expect(await screen.findByText(`${rotulo} “${nome}” adicionada com sucesso.`)).toBeInTheDocument();
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
    expect(await screen.findByText("Pavimento “1º pavimento” adicionado com sucesso.")).toBeInTheDocument();
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
    expect(within(unidadeCriada!).getByRole("img", { name: "Unidade" })).toBeInTheDocument();
    expect(within(unidadeCriada!).getByRole("button", { name: "101" })).toBeInTheDocument();
    expect(await screen.findByText("Unidade “101” adicionada com sucesso.")).toBeInTheDocument();
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

    await user.click(await screen.findByRole("link", { name: "Abrir" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Carregando página...");
    concluirCarregamento(empreendimento);
    expect(
      await screen.findByRole("heading", { name: "Residencial Aurora" }),
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
      .mockResolvedValueOnce([{ ...local, filhos: [] }])
      .mockResolvedValue([{ ...localAtualizado, filhos: [] }]);
    atualizarLocalMock.mockResolvedValue(localAtualizado);
    montarRota("/admin/empreendimentos/12/estrutura?localId=32");

    const painel = await screen.findByRole("complementary", { name: "Bloco Norte" });
    expect(within(painel).getByText("Local superior").parentElement).toHaveTextContent("Residencial Aurora");
    expect(within(painel).getByText("Ordem").parentElement).toHaveTextContent("1");
    expect(within(painel).getByText("Locais filhos").parentElement).toHaveTextContent("0 locais");

    await user.click(within(painel).getByRole("button", { name: "Editar local" }));
    let formulario = screen.getByRole("form", { name: "Editar Bloco Norte" });
    await user.clear(within(formulario).getByLabelText(/^Nome/));
    await user.click(within(formulario).getByRole("button", { name: "Salvar alterações" }));
    expect(await within(formulario).findByRole("alert")).toHaveTextContent("Nome é obrigatório");
    expect(atualizarLocalMock).not.toHaveBeenCalled();

    await user.click(within(formulario).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("form", { name: "Editar Bloco Norte" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar local" }));
    formulario = screen.getByRole("form", { name: "Editar Bloco Norte" });
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
    expect(screen.getByRole("button", { name: "Bloco Sul" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
