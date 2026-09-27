import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IndicadorProtocolo from "./IndicadorProtocolo";
import {
  StatusProtocolo,
  type ProtocoloEvidencias,
} from "@constructo/shared";

describe("IndicadorProtocolo", () => {
  const mockProtocoloIncompleto: ProtocoloEvidencias = {
    id: 1,
    marcoId: 101,
    nome: "Protocolo de Impermeabilização",
    itens: [
      { id: "item-1", nome: "Regularização de base", atendido: true },
      { id: "item-2", nome: "Aplicação de primer", atendido: true },
      { id: "item-3", nome: "Aplicação da manta", atendido: true },
      { id: "item-4", nome: "Encontro parede/piso", atendido: false },
      { id: "item-5", nome: "Teste de estanqueidade", atendido: false },
    ],
  };

  const mockProtocoloCompleto: ProtocoloEvidencias = {
    id: 2,
    marcoId: 102,
    nome: "Protocolo de Estrutura",
    itens: [
      { id: "item-1", nome: "Forma e escoramento", atendido: true },
      { id: "item-2", nome: "Armadura", atendido: true },
      { id: "item-3", nome: "Concretagem", atendido: true },
    ],
  };

  it("identifica e renderiza corretamente marco SEM PROTOCOLO", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Marco Sem Protocolo"
        protocolo={null}
        variante="card"
      />
    );

    expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/sem protocolo/i);
    expect(screen.getByTestId("sem-protocolo-mensagem")).toBeInTheDocument();
    expect(screen.queryByTestId("indicador-quantidades")).not.toBeInTheDocument();
  });

  it("identifica e renderiza marco com status INCOMPLETO, quantidades e pendências", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Impermeabilização"
        protocolo={mockProtocoloIncompleto}
        variante="card"
      />
    );

    expect(screen.getByTestId("marco-nome")).toHaveTextContent("Impermeabilização");
    expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/incompleto/i);
    expect(screen.getByTestId("indicador-quantidades")).toHaveTextContent("3 / 5 evidências");

    // Pendências esperadas
    const itensPendencia = screen.getAllByTestId("item-pendencia");
    expect(itensPendencia).toHaveLength(2);
    expect(screen.getByText("Encontro parede/piso")).toBeInTheDocument();
    expect(screen.getByText("Teste de estanqueidade")).toBeInTheDocument();
  });

  it("identifica e renderiza marco com status COMPLETO", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Estrutura de Concreto"
        protocolo={mockProtocoloCompleto}
        variante="card"
      />
    );

    expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/completo/i);
    expect(screen.getByTestId("indicador-quantidades")).toHaveTextContent("3 / 3 evidências");
    expect(screen.queryByTestId("container-pendencias")).not.toBeInTheDocument();
  });

  it("renderiza a variante BADGE com quantidades", () => {
    render(
      <IndicadorProtocolo
        protocolo={mockProtocoloIncompleto}
        variante="badge"
      />
    );

    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent(/incompleto/i);
    expect(badge).toHaveTextContent("3 / 5");
  });

  it("renderiza a variante COMPACT para lista de marcos e permite expandir pendências", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Impermeabilização"
        protocolo={mockProtocoloIncompleto}
        variante="compact"
      />
    );

    expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/incompleto/i);
    expect(screen.getByTestId("indicador-quantidades")).toHaveTextContent("3 / 5 evidências");

    // Inicialmente fechado
    expect(screen.queryByTestId("lista-pendencias")).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId("btn-toggle-pendencias");
    expect(toggleBtn).toHaveTextContent("Ver pendências (2)");

    fireEvent.click(toggleBtn);

    expect(screen.getByTestId("lista-pendencias")).toBeInTheDocument();
    expect(screen.getByText("Encontro parede/piso")).toBeInTheDocument();
    expect(screen.getByText("Teste de estanqueidade")).toBeInTheDocument();

    // Fecha novamente
    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId("lista-pendencias")).not.toBeInTheDocument();
  });

  it("renderiza a variante CHECKLIST para checklist de captura", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Impermeabilização"
        protocolo={mockProtocoloIncompleto}
        variante="checklist"
      />
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Checklist de Captura: Impermeabilização"
    );
    expect(screen.getByTestId("checklist-item-item-1")).toHaveClass(
      "indicador-protocolo__checklist-item--atendido"
    );
    expect(screen.getByTestId("checklist-item-item-4")).toHaveClass(
      "indicador-protocolo__checklist-item--pendente"
    );
  });

  it("dispara callback de upload de evidência ao selecionar arquivo", async () => {
    const handleUpload = vi.fn().mockResolvedValue(undefined);

    render(
      <IndicadorProtocolo
        nomeMarco="Impermeabilização"
        protocolo={mockProtocoloIncompleto}
        variante="card"
        onUploadEvidencia={handleUpload}
      />
    );

    const fileInputs = screen.getAllByLabelText(/Enviar evidência para/i);
    expect(fileInputs.length).toBeGreaterThan(0);

    const fakeFile = new File(["dummy content"], "evidencia.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInputs[0], { target: { files: [fakeFile] } });

    await waitFor(() => {
      expect(handleUpload).toHaveBeenCalledTimes(1);
      expect(handleUpload).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Encontro parede/piso" }),
        fakeFile
      );
    });
  });

  it("funciona com props manuais diretas (sem objeto protocolo)", () => {
    render(
      <IndicadorProtocolo
        nomeMarco="Pintura Externa"
        status={StatusProtocolo.INCOMPLETO}
        totalRegistrado={1}
        totalNecessario={4}
        pendencias={["Demão 2", "Selador", "Acabamento"]}
        variante="card"
      />
    );

    expect(screen.getByTestId("indicador-status-badge")).toHaveTextContent(/incompleto/i);
    expect(screen.getByTestId("indicador-quantidades")).toHaveTextContent("1 / 4 evidências");
    expect(screen.getAllByTestId("item-pendencia")).toHaveLength(3);
  });
});
