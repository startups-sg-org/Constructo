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
import StructureManagementPage from "../modulos/empreendimentos/componentes/StructureManagementPage";
import TaxonomyEditor from "../modulos/empreendimentos/componentes/TaxonomyEditor";
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
                subtitulo="Cadastre e gerencie as raízes da estrutura física das obras."
              >
                <ListaEmpreendimentos />
                <FormularioEmpreendimento />
              </PaginaPainel>
            ),
          },
          {
            path: "empreendimentos/:empreendimentoId",
            loader: carregarEmpreendimento,
            element: (
              <PaginaPainel
                titulo="Visualizar empreendimento"
                subtitulo="Consulte os dados gerais da obra selecionada."
              >
                <DetalhesEmpreendimento />
              </PaginaPainel>
            ),
          },
          {
            path: "empreendimentos/:empreendimentoId/editar",
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
            path: "empreendimentos/:empreendimentoId/estrutura",
            loader: carregarEstruturaFisica,
            action: cadastrarLocalRaiz,
            element: (
              <PaginaPainel
                titulo="Estrutura física"
                subtitulo="Gerencie a organização física do empreendimento selecionado."
              >
                <StructureManagementPage />
              </PaginaPainel>
            ),
          },
          {
            path: "empreendimentos/:empreendimentoId/taxonomia",
            loader: carregarTaxonomia,
            action: alterarTaxonomia,
            element: (
              <PaginaPainel
                titulo="Editor de taxonomia"
                subtitulo="Personalize etapas, subetapas e marcos do empreendimento."
              >
                <TaxonomyEditor />
              </PaginaPainel>
            ),
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
