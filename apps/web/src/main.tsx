import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/bootstrap-theme.scss";
import "./index.css";
import "./componentes/PadroesPainel/PadroesPainel.css";

import { router } from "./router/router";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
