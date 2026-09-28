import type { ActionFunctionArgs } from "react-router-dom";
import { mensagemDeErro } from "../shared/actionUtils";
import {
    atualizarEtapaTaxonomia, atualizarMarcoTaxonomia, criarEtapaTaxonomia, criarMarcoTaxonomia,
} from "./empreendimentos.service";

export async function alterarTaxonomia({ request, params }: ActionFunctionArgs) {
    const empreendimentoId = Number(params.empreendimentoId);
    const form = await request.formData();
    const intencao = String(form.get("intencao") ?? "");
    const texto = (campo: string) => String(form.get(campo) ?? "").trim() || null;
    try {
        if (intencao === "criar-etapa") {
            return { ok: true, item: await criarEtapaTaxonomia(empreendimentoId, {
                parent_id: form.get("parent_id") ? Number(form.get("parent_id")) : null,
                nome: String(form.get("nome") ?? ""), ordem: Number(form.get("ordem") ?? 0),
                descricao_tecnica: texto("descricao_tecnica"), descricao_cliente: texto("descricao_cliente"),
            }, { signal: request.signal }) };
        }
        if (intencao === "editar-etapa") {
            return { ok: true, item: await atualizarEtapaTaxonomia(empreendimentoId, Number(form.get("id")), {
                nome: String(form.get("nome") ?? ""), ordem: Number(form.get("ordem") ?? 0),
                descricao_tecnica: texto("descricao_tecnica"), descricao_cliente: texto("descricao_cliente"),
            }, { signal: request.signal }) };
        }
        if (intencao === "criar-marco") {
            return { ok: true, item: await criarMarcoTaxonomia(empreendimentoId, Number(form.get("etapa_id")), {
                nome: String(form.get("nome") ?? ""), ordem: Number(form.get("ordem") ?? 0),
                descricao_tecnica: texto("descricao_tecnica"), descricao_cliente: texto("descricao_cliente"),
            }, { signal: request.signal }) };
        }
        if (intencao === "editar-marco") {
            return { ok: true, item: await atualizarMarcoTaxonomia(empreendimentoId, Number(form.get("id")), {
                nome: String(form.get("nome") ?? ""), ordem: Number(form.get("ordem") ?? 0),
                descricao_tecnica: texto("descricao_tecnica"), descricao_cliente: texto("descricao_cliente"),
            }, { signal: request.signal }) };
        }
        return { ok: false, erro: "Ação de taxonomia inválida." };
    } catch (error) {
        return { ok: false, erro: mensagemDeErro(error, "Não foi possível salvar a taxonomia.") };
    }
}
