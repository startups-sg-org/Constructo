import { StrictMode } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css'

import Formulario from "./modulos/usuarios/componentes/Formulario";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import PublicLayout from "./layouts/PublicLayout/PublicLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import PaginaPainel from "./pages/Painel/PaginaPainel";
import ResumoPainel from "./pages/Painel/ResumoPainel";
import ListaUsuarios from "./modulos/usuarios/componentes/ListaUsuarios";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  
  <StrictMode>

    <BrowserRouter>

      <Routes>

        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="cadastro" element={<Formulario />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <PaginaPainel
                titulo="Painel Administrativo"
                subtitulo="Visão geral do seu painel Constructo."
              >
                <ResumoPainel />
              </PaginaPainel>
            }
          />
          <Route
            path="usuarios"
            element={
              <PaginaPainel titulo="Usuários" subtitulo="Gerencie os usuários cadastrados no sistema.">
                <ListaUsuarios />
              </PaginaPainel>
            }
          />
          <Route
            path="obras"
            element={<PaginaPainel titulo="Obras" subtitulo="Gerencie as obras cadastradas." />}
          />
          <Route
            path="contratos"
            element={<PaginaPainel titulo="Contratos" subtitulo="Consulte e administre os contratos." />}
          />
          <Route
            path="medicoes"
            element={<PaginaPainel titulo="Medições" subtitulo="Registre e acompanhe as medições das obras." />}
          />
          <Route
            path="perfil"
            element={<PaginaPainel titulo="Perfil" subtitulo="Consulte e atualize as informações da sua conta." />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

    </BrowserRouter>

  </StrictMode>

);
