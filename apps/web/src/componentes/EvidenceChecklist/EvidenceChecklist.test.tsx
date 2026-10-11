import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
    ProtocoloEvidencia,
    ProtocoloEvidenciaStatus,
} from "../../features/evidencias/evidencias.service";
import EvidenceChecklist from "./EvidenceChecklist";

const protocolo: ProtocoloEvidencia = {
    id: 1,
    marco_id: 7,
    nome: "Impermeabilização",
    descricao: null,
    quantidade_minima: 5,
    criado_em: "2026-10-10T00:00:00Z",
    atualizado_em: "2026-10-10T00:00:00Z",
    itens: [
        { id: 1, protocolo_id: 1, nome: "Visão geral", descricao: null, obrigatorio: true, ordem: 0, criado_em: "", atualizado_em: "" },
        { id: 2, protocolo_id: 1, nome: "Ralo", descricao: null, obrigatorio: true, ordem: 1, criado_em: "", atualizado_em: "" },
        { id: 3, protocolo_id: 1, nome: "Detalhe lateral", descricao: null, obrigatorio: false, ordem: 2, criado_em: "", atualizado_em: "" },
    ],
};

const status: ProtocoloEvidenciaStatus = {
    protocolo_id: 1,
    quantidade_minima: 5,
    evidencias_registradas: 3,
    quantidade_atendida: false,
    itens_pendentes: [{ id: 2, nome: "Ralo", ordem: 1 }],
    itens_obrigatorios_atendidos: false,
};

describe("EvidenceChecklist", () => {
    it("identifica itens atendidos, pendentes e opcionais", () => {
        render(<EvidenceChecklist protocolo={protocolo} status={status} />);

        expect(screen.getByRole("heading", { name: "Impermeabilização" })).toBeInTheDocument();
        expect(screen.getByText("3 / 5")).toBeInTheDocument();
        expect(screen.getByText("Visão geral")).toHaveTextContent("Visão geralObrigatório");
        expect(screen.getByText("Ralo")).toBeInTheDocument();
        expect(screen.getByText("Detalhe lateral")).toBeInTheDocument();
        expect(screen.getAllByText("Obrigatório")).toHaveLength(2);
    });

    it("permite selecionar um item", () => {
        const onSelecionarItem = vi.fn();
        render(
            <EvidenceChecklist
                protocolo={protocolo}
                status={status}
                onSelecionarItem={onSelecionarItem}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /Ralo/ }));
        expect(onSelecionarItem).toHaveBeenCalledWith(2);
    });
});
