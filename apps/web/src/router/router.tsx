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
import { exigirAutenticacao } from "../features/auth/auth.loader";
import { redirecionarUsuarioAutenticado } from "../features/auth/login.loader";
import { carregarResumoPainel } from "../features/usuarios/resumoPainel.loader";
import { carregarUsuarios } from "../features/usuarios/usuarios.loader";
import { executarAcaoAdministrativa } from "../features/auth/logout.action";
import { cadastrarUsuario } from "../features/usuarios/cadastro.action";
import { autenticarUsuario } from "../features/auth/auth.action";
import { alterarUsuario } from "../features/usuarios/usuarios.action";

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
