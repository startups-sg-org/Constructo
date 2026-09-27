import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListaMarcos from "./ListaMarcos";
import PaginaMarco from "./PaginaMarco";
import ChecklistCaptura from "./ChecklistCaptura";
import PainelMarcosProtocolo from "./PainelMarcosProtocolo";
import type { MarcoComProtocolo } from "@constructo/shared";

const mockMarcos: MarcoComProtocolo[] = [
  {
    id: 1,
    nome: "Impermeabilização",
    descricaoTecnica: "Impermeabilização com manta asfáltica e teste de estanqueidade 72h.",
    descricaoCliente: "Proteção contra infiltrações nos banheiros e varandas.",
    statusMarco: "EM_ANDAMENTO",
    protocolo: {
      id: 101,
      marcoId: 1,
      itens: [
        { id: "imp-1", nome: "Regularização de base", atendido: true },
        { id: "imp-2", nome: "Aplicação de primer", atendido: true },
        { id: "imp-3", nome: "Aplicação da manta", atendido: true },
        { id: "imp-4", nome: "Encontro parede/piso", atendido: false },
        { id: "imp-5", nome: "Teste de estanqueidade 72h", atendido: false },
      ],
    },
  },
  {
    id: 2,
    nome: "Estrutura",
    statusMarco: "CONCLUIDO",
    protocolo: {
      id: 102,
      marcoId: 2,
      itens: [
        { id: "est-1", nome: "Armadura", atendido: true },
        { id: "est-2", nome: "Concretagem", atendido: true },
      ],
    },
  },
  {
    id: 3,
    nome: "Alvenaria",
    statusMarco: "NAO_INICIADO",
    protocolo: null,
  },
];

describe("Módulo de Marcos e Protocolos", () => {
  describe("ListaMarcos", () => {
    it("renderiza lista com filtros e indicadores de protocolo para cada marco", () => {
      render(
        <MemoryRouter>
          <ListaMarcos marcosIniciais={mockMarcos} />
        </MemoryRouter>
      );

      expect(screen.getByText("Impermeabilização")).toBeInTheDocument();
      expect(screen.getByText("Estrutura")).toBeInTheDocument();
      expect(screen.getByText("Alvenaria")).toBeInTheDocument();

      // Filtra por incompletos
      const btnIncompletos = screen.getByRole("tab", { name: /Incompletos/i });
      fireEvent.click(btnIncompletos);

      expect(screen.getByText("Impermeabilização")).toBeInTheDocument();
      expect(screen.queryByText("Estrutura")).not.toBeInTheDocument();
      expect(screen.queryByText("Alvenaria")).not.toBeInTheDocument();

      // Filtra por sem protocolo
      const btnSemProtocolo = screen.getByRole("tab", { name: /Sem Protocolo/i });
      fireEvent.click(btnSemProtocolo);

      expect(screen.getByText("Alvenaria")).toBeInTheDocument();
      expect(screen.queryByText("Impermeabilização")).not.toBeInTheDocument();
    });
  });

  describe("PaginaMarco", () => {
    it("renderiza a página do marco com o indicador detalhado e pendências visíveis", () => {
      render(
        <MemoryRouter>
          <PaginaMarco marcoInicial={mockMarcos[0]} />
        </MemoryRouter>
      );

      expect(screen.getByTestId("marco-nome")).toHaveTextContent("Impermeabilização");
      expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/incompleto/i);
      expect(screen.getByTestId("indicador-quantidades")).toHaveTextContent("3 / 5 evidências");
      expect(screen.getByText("Encontro parede/piso")).toBeInTheDocument();
      expect(screen.getByText("Teste de estanqueidade 72h")).toBeInTheDocument();
    });

    it("atualiza o indicador dinamicamente após upload de evidência", async () => {
      render(
        <MemoryRouter>
          <PaginaMarco marcoInicial={mockMarcos[0]} />
        </MemoryRouter>
      );

      const fileInputs = screen.getAllByLabelText(/Enviar evidência para/i);
      expect(fileInputs.length).toBeGreaterThan(0);

      const fakeFile = new File(["sample"], "foto.png", { type: "image/png" });
      fireEvent.change(fileInputs[0], { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(/Evidência anexada com sucesso/i);
      });
    });
  });

  describe("ChecklistCaptura", () => {
    it("renderiza checklist de captura e permite registrar evidências pendentes", async () => {
      render(
        <MemoryRouter>
          <ChecklistCaptura marcoInicial={mockMarcos[0]} />
        </MemoryRouter>
      );

      expect(screen.getByTestId("indicador-protocolo-checklist")).toBeInTheDocument();
      expect(screen.getByText("Regularização de base")).toBeInTheDocument();
      expect(screen.getByText("Encontro parede/piso")).toBeInTheDocument();

      const inputs = screen.getAllByLabelText(/Capturar evidência para/i);
      expect(inputs.length).toBe(2);

      const fakeFile = new File(["foto"], "parede_piso.jpg", { type: "image/jpeg" });
      fireEvent.change(inputs[0], { target: { files: [fakeFile] } });

      await waitFor(() => {
        expect(screen.getByTestId("notificacao-checklist")).toHaveTextContent(
          /Evidência capturada com sucesso/i
        );
      });

    });
  });

  describe("PainelMarcosProtocolo", () => {
    it("identifica e lista marcos com protocolos incompletos no painel administrativo", () => {
      render(
        <MemoryRouter>
          <PainelMarcosProtocolo marcos={mockMarcos} />
        </MemoryRouter>
      );

      expect(screen.getByTestId("painel-marcos-protocolo")).toBeInTheDocument();
      expect(screen.getByText(/1 marcos possuem protocolos com evidências pendentes/i)).toBeInTheDocument();
      expect(screen.getByText("Impermeabilização")).toBeInTheDocument();
      expect(screen.getByText("Encontro parede/piso")).toBeInTheDocument();
    });
  });
});
