import { StrictMode } from "react"; 
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import './index.css'

import Home from "./pages/Home/Home";
import Formulario from "./modulos/usuarios/componentes/Formulario";
import Usuarios from "./pages/Usuarios/Usuarios";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  
  <StrictMode>

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/formulario" element={<Formulario />} />

        <Route path="/usuarios" element={<Usuarios />} />

      </Routes>

    </BrowserRouter>

  </StrictMode>

);
