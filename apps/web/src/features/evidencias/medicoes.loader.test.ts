import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { obterEmpreendimento } from "../empreendimentos/empreendimentos.service";
import { carregarTaxonomia } from "../empreendimentos/taxonomia.loader";
import {
    listarProtocolosEvidencia,
    listarProtocolosRecentes,
} from "./evidencias.service";
import { carregarMedicoesEmpreendimento } from "./medicoes.loader";

vi.mock("../empreendimentos/empreendimentos.service", () => ({
    obterEmpreendimento: vi.fn(),
}));

vi.mock("../empreendimentos/taxonomia.loader", () => ({
    carregarTaxonomia: vi.fn(),
}));

vi.mock("./evidencias.service", () => ({
    listarProtocolosEvidencia: vi.fn(),
    listarProtocolosRecentes: vi.fn(),
}));

const empreendimento = { id: 1, nome: "Obra teste" };
const args = {
    params: { empreendimentoId: "1" },
    request: new Request("http://localhost/admin/empreendimentos/1/medicoes"),
} as unknown as LoaderFunctionArgs;

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(obterEmpreendimento).mockResolvedValue(empreendimento as never);
    vi.mocked(carregarTaxonomia).mockResolvedValue({
        empreendimento: empreendimento as never,
        taxonomia: {
            id: 2,
            nome: "Taxonomia da obra",
            is_padrao: false,
            etapas: [{
                id: 3,
                taxonomia_id: 2,
                nome: "Fundação",
                ordem: 0,
                marcos: [
                    { id: 4, etapa_id: 3, nome: "Concretagem", ordem: 0 },
                    { id: 5, etapa_id: 3, nome: "Cura", ordem: 1 },
                ],
            }],
        },
    });
});

describe("loader da listagem de protocolos do empreendimento", () => {
    it("lista protocolos persistidos em todos os marcos e ordena os mais recentes primeiro", async () => {
        vi.mocked(listarProtocolosEvidencia).mockImplementation(async (_empreendimentoId, marcoId) => [{
            id: marcoId + 10,
            marco_id: marcoId,
            nome: `Protocolo ${marcoId}`,
            descricao: null,
            quantidade_minima: 1,
            itens: [],
            criado_em: marcoId === 5 ? "2026-10-19T12:00:00Z" : "2026-10-18T12:00:00Z",
            atualizado_em: "2026-10-19T12:00:00Z",
        }]);

        const resultado = await carregarMedicoesEmpreendimento(args);

        expect(listarProtocolosEvidencia).toHaveBeenCalledTimes(2);
        expect(listarProtocolosRecentes).not.toHaveBeenCalled();
        expect(resultado.protocolos.map((protocolo) => protocolo.id)).toEqual([15, 14]);
        expect(resultado.erroProtocolos).toBeNull();
    });

    it("preserva protocolos disponíveis quando a consulta de um marco falha", async () => {
        vi.mocked(listarProtocolosEvidencia).mockImplementation(async (_empreendimentoId, marcoId) => {
            if (marcoId === 5) throw new Error("Marco indisponível");
            return [{
                id: 14,
                marco_id: 4,
                nome: "Protocolo persistido",
                descricao: null,
                quantidade_minima: 1,
                itens: [],
                criado_em: "2026-10-18T12:00:00Z",
                atualizado_em: "2026-10-18T12:00:00Z",
            }];
        });
        vi.mocked(listarProtocolosRecentes).mockResolvedValue([{
            id: 15,
            marco_id: 5,
            nome: "Protocolo recente",
            descricao: null,
            quantidade_minima: 2,
            criado_em: "2026-10-19T12:00:00Z",
            atualizado_em: "2026-10-19T12:00:00Z",
        }]);

        const resultado = await carregarMedicoesEmpreendimento(args);

        expect(resultado.protocolos.map((protocolo) => protocolo.id)).toEqual([15, 14]);
        expect(resultado.erroProtocolos).toContain("1 marco(s) não puderam ser consultados");
    });
});
