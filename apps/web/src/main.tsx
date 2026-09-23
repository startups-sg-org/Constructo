import { StrictMode } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './index.css'

import Formulario from "./modulos/usuarios/componentes/Formulario";
import Login from "./pages/Login/Login";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  
  <StrictMode>

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/cadastro" element={<Formulario />} />

        <Route path="/login" element={<Login />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

    </BrowserRouter>

  </StrictMode>

);
