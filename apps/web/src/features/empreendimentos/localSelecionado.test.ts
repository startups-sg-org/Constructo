import type { EstruturaLocal } from "@constructo/shared";
import { describe, expect, it } from "vitest";

import { encontrarLocalSelecionado, obterLocalSelecionadoId } from "./localSelecionado";

const base = {
    empreendimento_id: 12,
    ordem: 0,
    criado_em: "2026-09-26T12:00:00Z",
    atualizado_em: "2026-09-26T12:00:00Z",
};

const estrutura: EstruturaLocal[] = [{
    ...base,
    id: 1,
    parent_id: null,
    nome: "Torre A",
    tipo: "TORRE",
    filhos: [{
        ...base,
        id: 2,
        parent_id: 1,
        nome: "7º Pavimento",
        tipo: "PAVIMENTO",
        filhos: [{
            ...base,
            id: 3,
            parent_id: 2,
            nome: "Unidade 704",
            tipo: "UNIDADE",
            filhos: [],
        }],
    }],
}];

describe("seleção de local da obra", () => {
    it("lê somente IDs válidos da URL", () => {
        expect(obterLocalSelecionadoId("http://localhost/estrutura?localId=3")).toBe(3);
        expect(obterLocalSelecionadoId("http://localhost/estrutura?localId=abc")).toBeNull();
        expect(obterLocalSelecionadoId("http://localhost/estrutura?localId=-1")).toBeNull();
        expect(obterLocalSelecionadoId("http://localhost/estrutura")).toBeNull();
    });

    it("encontra o local e todos os seus ancestrais", () => {
        const selecao = encontrarLocalSelecionado(estrutura, 3);

        expect(selecao?.local.nome).toBe("Unidade 704");
        expect(selecao?.caminho.map((local) => local.nome)).toEqual([
            "Torre A",
            "7º Pavimento",
            "Unidade 704",
        ]);
    });
});
