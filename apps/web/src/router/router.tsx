import { createBrowserRouter } from "react-router-dom";

import RotaProtegida from "../componentes/RotaProtegida/RotaProtegida";
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

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErroRota />,
    children: [{ index: true, element: <Home /> }],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErroRota />,
    children: [
      { path: "cadastro", element: <Formulario /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    element: <RotaProtegida />,
    errorElement: <ErroRota />,
    children: [
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
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
]);
