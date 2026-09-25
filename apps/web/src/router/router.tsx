import { createBrowserRouter } from "react-router-dom";

import FeedbackNavegacao from "../componentes/FeedbackNavegacao/FeedbackNavegacao";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import PublicLayout from "../layouts/PublicLayout/PublicLayout";
import Formulario from "../modulos/usuarios/componentes/Formulario";
import ListaUsuarios from "../modulos/usuarios/componentes/ListaUsuarios";
import ErroRota, { PaginaNaoEncontrada } from "../pages/ErroRota/ErroRota";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import PaginaPainel from "../pages/Painel/PaginaPainel";
import ResumoPainel from "../pages/Painel/ResumoPainel";
import { exigirAutenticacao } from "./loaders/autenticacaoLoader";
import { redirecionarUsuarioAutenticado } from "./loaders/loginLoader";
import { carregarResumoPainel } from "./loaders/resumoPainelLoader";
import { carregarUsuarios } from "./loaders/usuariosLoader";
import { executarAcaoAdministrativa } from "./actions/adminAction";
import { cadastrarUsuario } from "./actions/cadastroAction";
import { autenticarUsuario } from "./actions/loginAction";
import { alterarUsuario } from "./actions/usuariosAction";

const rotas = [
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
    loader: exigirAutenticacao,
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
            loader: carregarUsuarios,
            action: alterarUsuario,
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
            element: <PaginaPainel titulo="Obras" subtitulo="Gerencie as obras cadastradas." />,
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

export const router = createBrowserRouter([
  {
    element: <FeedbackNavegacao />,
    children: rotas,
  },
]);
