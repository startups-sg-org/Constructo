import {
  createBrowserRouter,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from "react-router-dom";

import FeedbackNavegacao from "../componentes/FeedbackNavegacao/FeedbackNavegacao";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import PublicLayout from "../layouts/PublicLayout/PublicLayout";
import FormularioEmpreendimento from "../modulos/empreendimentos/componentes/FormularioEmpreendimento";
import FormularioEdicaoEmpreendimento from "../modulos/empreendimentos/componentes/FormularioEdicaoEmpreendimento";
import DetalhesEmpreendimento from "../modulos/empreendimentos/componentes/DetalhesEmpreendimento";
import AbaIndisponivel from "../modulos/empreendimentos/componentes/AbaIndisponivel";
import LayoutEmpreendimentos from "../modulos/empreendimentos/componentes/LayoutEmpreendimentos";
import StructureManagementPage from "../modulos/empreendimentos/componentes/StructureManagementPage";
import TaxonomyEditor from "../modulos/empreendimentos/componentes/TaxonomyEditor";
import ProtocolEditor from "../modulos/evidencias/componentes/ProtocolEditor/ProtocolEditor";
import ProtocolList from "../modulos/evidencias/componentes/ProtocolEditor/ProtocolList";
import { carregarProtocoloEditor } from "../features/evidencias/protocolos.loader";
import { alterarProtocoloEditor } from "../features/evidencias/protocolos.action";
import ListaEmpreendimentos from "../modulos/empreendimentos/componentes/ListaEmpreendimentos";
import Formulario from "../modulos/usuarios/componentes/Formulario";
import ListaUsuarios from "../modulos/usuarios/componentes/ListaUsuarios";
import ErroRota, { PaginaNaoEncontrada } from "../pages/ErroRota/ErroRota";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PaginaPainel from "../pages/Painel/PaginaPainel";
import ResumoPainel from "../pages/Painel/ResumoPainel";
import { exigirAcessoAoPainel } from "../features/auth/auth.loader";
import { cadastrarEmpreendimento, cadastrarLocalRaiz, editarEmpreendimento } from "../features/empreendimentos/empreendimentos.action";
import { carregarEmpreendimento, carregarEmpreendimentos, carregarEstruturaFisica } from "../features/empreendimentos/empreendimentos.loader";
import { carregarTaxonomia } from "../features/empreendimentos/taxonomia.loader";
import { alterarTaxonomia } from "../features/empreendimentos/taxonomia.action";
import { redirecionarUsuarioAutenticado } from "../features/auth/login.loader";
import { carregarResumoPainel } from "../features/usuarios/resumoPainel.loader";
import { carregarUsuarios } from "../features/usuarios/usuarios.loader";
import { executarAcaoAdministrativa } from "../features/auth/logout.action";
import { cadastrarUsuario } from "../features/usuarios/cadastro.action";
import { autenticarUsuario } from "../features/auth/auth.action";
import { alterarUsuario } from "../features/usuarios/usuarios.action";

async function carregarUsuariosComoAdmin(args: LoaderFunctionArgs) {
  await exigirAcessoAoPainel(args);
  return carregarUsuarios(args);
}

async function alterarUsuarioComoAdmin(args: ActionFunctionArgs) {
  await exigirAcessoAoPainel(args);
  return alterarUsuario(args);
}

async function carregarEditorProtocoloAutenticado(args: LoaderFunctionArgs) {
  await exigirAcessoAoPainel(args);
  return carregarProtocoloEditor(args);
}

async function alterarEditorProtocoloAutenticado(args: ActionFunctionArgs) {
  await exigirAcessoAoPainel(args);
  return alterarProtocoloEditor(args);
}
export const rotas: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: <ErroRota />,
    children: [{ index: true, element: <Home /> }],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErroRota />,
    children: [
      { path: "cadastro", action: cadastrarUsuario, element: <Formulario /> },
      {
        path: "login",
        loader: redirecionarUsuarioAutenticado,
        action: autenticarUsuario,
        element: <Login />,
      },
    ],
  },
  {
    id: "admin-autenticado",
    loader: exigirAcessoAoPainel,
    errorElement: <ErroRota />,
    children: [
      {
        path: "admin",
        action: executarAcaoAdministrativa,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            loader: carregarResumoPainel,
            element: (
              <PaginaPainel
                titulo="Painel Administrativo"
                subtitulo="Visão geral do seu painel Constructo."
              >
                <ResumoPainel />
              </PaginaPainel>
            ),
          },
          {
            path: "usuarios",
            loader: carregarUsuariosComoAdmin,
            action: alterarUsuarioComoAdmin,
            element: (
              <PaginaPainel
                titulo="Usuários"
                subtitulo="Gerencie os usuários cadastrados no sistema."
              >
                <ListaUsuarios />
              </PaginaPainel>
            ),
          },
          {
            path: "obras",
            loader: carregarEmpreendimentos,
            action: cadastrarEmpreendimento,
            element: (
              <PaginaPainel
                titulo="Empreendimentos"
                subtitulo="Gerencie suas obras em um só lugar."
              >
                <ListaEmpreendimentos />
                <FormularioEmpreendimento />
              </PaginaPainel>
            ),
          },
          {
            path: "empreendimentos/:empreendimentoId",
            id: "empreendimento",
            loader: carregarEmpreendimento,
            errorElement: <ErroRota />,
            element: <LayoutEmpreendimentos />,
            children: [
              {
                index: true,
                element: (
                  <PaginaPainel
                    titulo=""
                    subtitulo="Consulte os dados gerais da obra selecionada."
                  >
                    <DetalhesEmpreendimento />
                  </PaginaPainel>
                ),
              },
              {
                path: "editar",
                loader: carregarEmpreendimento,
                action: editarEmpreendimento,
                element: (
                  <PaginaPainel
                    titulo="Editar empreendimento"
                    subtitulo="Atualize os dados gerais sem alterar a estrutura física da obra."
                  >
                    <FormularioEdicaoEmpreendimento />
                  </PaginaPainel>
                ),
              },
              {
                path: "estrutura",
                loader: carregarEstruturaFisica,
                action: cadastrarLocalRaiz,
                element: (
                  <PaginaPainel
                    titulo=""
                    subtitulo=""
                  >
                    <StructureManagementPage />
                  </PaginaPainel>
                ),
              },
              {
                path: "taxonomia",
                loader: carregarTaxonomia,
                action: alterarTaxonomia,
                element: (
                  <PaginaPainel
                    titulo=""
                    subtitulo=""
                  >
                    <TaxonomyEditor />
                  </PaginaPainel>
                ),
              },
              ...["novo", ":protocoloId"].map((destino): RouteObject => ({
                path: `taxonomia/marcos/:marcoId/protocolos/${destino}`,
                loader: carregarEditorProtocoloAutenticado,
                action: alterarEditorProtocoloAutenticado,
                element: (
                  <PaginaPainel
                    titulo="Protocolo de evidências"
                    subtitulo="Configure os registros exigidos para o marco."
                  >
                    <ProtocolEditor />
                  </PaginaPainel>
                ),
              })),
              {
                path: "taxonomia/marcos/:marcoId/protocolos",
                loader: carregarEditorProtocoloAutenticado,
                element: <PaginaPainel titulo="Protocolos de evidências" subtitulo="Escolha ou crie um protocolo para o marco."><ProtocolList /></PaginaPainel>,
              },
              {
                path: "contratos",
                element: (
                  <PaginaPainel titulo="Contratos" subtitulo="Contratos vinculados a este empreendimento.">
                    <AbaIndisponivel
                      titulo="Contratos ainda não disponíveis"
                      descricao="A integração de contratos por empreendimento será disponibilizada em breve."
                    />
                  </PaginaPainel>
                ),
              },
              {
                path: "medicoes",
                element: (
                  <PaginaPainel titulo="Medições" subtitulo="Medições vinculadas a este empreendimento.">
                    <AbaIndisponivel
                      titulo="Medições ainda não disponíveis"
                      descricao="A integração de medições por empreendimento será disponibilizada em breve."
                    />
                  </PaginaPainel>
                ),
              },
              {
                path: "documentos",
                element: (
                  <PaginaPainel titulo="Documentos" subtitulo="Documentos vinculados a este empreendimento.">
                    <AbaIndisponivel
                      titulo="Documentos ainda não disponíveis"
                      descricao="O módulo de documentos será disponibilizado em breve."
                    />
                  </PaginaPainel>
                ),
              },
            ],
          },
          {
            path: "contratos",
            element: (
              <PaginaPainel titulo="Contratos" subtitulo="Consulte e administre os contratos." />
            ),
          },
          {
            path: "medicoes",
            element: (
              <PaginaPainel
                titulo="Medições"
                subtitulo="Registre e acompanhe as medições das obras."
              />
            ),
          },
          {
            path: "perfil",
            element: (
              <PaginaPainel
                titulo="Perfil"
                subtitulo="Consulte e atualize as informações da sua conta."
              />
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <PaginaNaoEncontrada /> },
];

export const rotasAplicacao: RouteObject[] = [
  {
    element: <FeedbackNavegacao />,
    children: rotas,
  },
];

export const router = createBrowserRouter(rotasAplicacao);
