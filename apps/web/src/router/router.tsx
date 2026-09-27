import { createBrowserRouter, type RouteObject } from "react-router-dom";

import FeedbackNavegacao from "../componentes/FeedbackNavegacao/FeedbackNavegacao";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import PublicLayout from "../layouts/PublicLayout/PublicLayout";
import Formulario from "../modulos/usuarios/componentes/Formulario";
import ListaUsuarios from "../modulos/usuarios/componentes/ListaUsuarios";
import FormularioObra from "../modulos/obras/componentes/FormularioObra";
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
import { cadastrarObra } from "../features/obras/obras.action";
import { carregarContratosDisponiveis } from "../features/contratos/contratos.loader";
import ListaMarcos from "../modulos/marcos/componentes/ListaMarcos";
import PaginaMarco from "../modulos/marcos/componentes/PaginaMarco";
import ChecklistCaptura from "../modulos/marcos/componentes/ChecklistCaptura";
import { carregarListaMarcos, carregarMarcoDetalhe } from "../features/marcos/marcos.loader";


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
            children: [
              {
                index: true,
                element: <PaginaPainel titulo="Obras" subtitulo="Gerencie as obras cadastradas." />,
              },
              {
                path: "cadastro",
                loader: carregarContratosDisponiveis,
                action: cadastrarObra,
                element: (
                  <PaginaPainel
                    titulo="Cadastrar Obra"
                    subtitulo="Preencha os dados para vincular uma obra a um contrato."
                  >
                    <FormularioObra />
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
            path: "marcos",
            children: [
              {
                index: true,
                loader: carregarListaMarcos,
                element: (
                  <PaginaPainel
                    titulo="Marcos da Obra"
                    subtitulo="Acompanhe o protocolo de evidências e pendências de cada marco."
                  >
                    <ListaMarcos />
                  </PaginaPainel>
                ),
              },
              {
                path: ":id",
                loader: carregarMarcoDetalhe,
                element: (
                  <PaginaPainel
                    titulo="Detalhes do Marco"
                    subtitulo="Status do protocolo de evidências e requisitos do marco."
                  >
                    <PaginaMarco />
                  </PaginaPainel>
                ),
              },
              {
                path: ":id/checklist",
                loader: carregarMarcoDetalhe,
                element: (
                  <PaginaPainel
                    titulo="Checklist de Captura"
                    subtitulo="Capture e envie fotos das evidências requeridas pelo protocolo."
                  >
                    <ChecklistCaptura />
                  </PaginaPainel>
                ),
              },
            ],
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
