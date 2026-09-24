import { StrictMode } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css'

import Formulario from "./modulos/usuarios/componentes/Formulario";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import Login from "./pages/Login/Login";
import PaginaPainel from "./pages/Painel/PaginaPainel";
import ResumoPainel from "./pages/Painel/ResumoPainel";
import ListaUsuarios from "./modulos/usuarios/componentes/ListaUsuarios";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  
  <StrictMode>

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/cadastro" element={<Formulario />} />

        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <PaginaPainel titulo="Home" descricao="Visão geral do seu painel Constructo.">
                <ResumoPainel />
              </PaginaPainel>
            }
          />
          <Route
            path="usuarios"
            element={
              <PaginaPainel titulo="Usuários" descricao="Visualize os usuários cadastrados e seus status de acesso.">
                <ListaUsuarios />
              </PaginaPainel>
            }
          />
          <Route
            path="obras"
            element={<PaginaPainel titulo="Obras" descricao="Acompanhe suas obras em um só lugar." />}
          />
          <Route
            path="contratos"
            element={<PaginaPainel titulo="Contratos" descricao="Consulte e administre os contratos." />}
          />
          <Route
            path="medicoes"
            element={<PaginaPainel titulo="Medições" descricao="Registre e acompanhe as medições das obras." />}
          />
          <Route
            path="perfil"
            element={<PaginaPainel titulo="Perfil" descricao="Consulte e atualize as informações da sua conta." />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

    </BrowserRouter>

  </StrictMode>

);
