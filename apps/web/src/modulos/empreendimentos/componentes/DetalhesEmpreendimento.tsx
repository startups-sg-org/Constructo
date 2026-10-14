import { Link, useRouteLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";

import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import UploadEvidencia from "../../../componentes/UploadEvidencia/UploadEvidencia";
import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import { obterTaxonomia, type Taxonomia } from "../../../features/empreendimentos/empreendimentos.service";
import { ApiError } from "../../../services/api";
import TaxonomyConfiguration from "./TaxonomyConfiguration";
import { formatarDataEmpreendimento } from "./empreendimentoFormatters";
import "./ListaEmpreendimentos.css";

export default function DetalhesEmpreendimento() {
    const empreendimento = useRouteLoaderData<typeof carregarEmpreendimento>("empreendimento");
    const empreendimentoId = empreendimento?.id;
    const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(null);
    const [carregandoTaxonomia, setCarregandoTaxonomia] = useState(true);

    useEffect(() => {
        if (!empreendimentoId) return;
        let ativo = true;
        obterTaxonomia(empreendimentoId)
            .then((dados) => ativo && setTaxonomia(dados))
            .catch((erro) => {
                if (!(erro instanceof ApiError && erro.status === 404)) throw erro;
            })
            .finally(() => ativo && setCarregandoTaxonomia(false));
        return () => { ativo = false; };
    }, [empreendimentoId]);

    if (!empreendimento) return null;

    return (
        <article className="detalhes-empreendimento superficie-painel">
            <CabecalhoSecao
                etiqueta="Dados da obra"
                titulo="Dados gerais"
                comDivisor
            />

            <dl className="detalhes-empreendimento__dados lista-dados">
                <div>
                    <dt>Data de criação</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.criado_em)}</dd>
                </div>
                <div>
                    <dt>Data de atualização</dt>
                    <dd>{formatarDataEmpreendimento(empreendimento.atualizado_em)}</dd>
                </div>
                <div className="detalhes-empreendimento__descricao">
                    <dt>Descrição</dt>
                    <dd>{empreendimento.descricao || "Descrição não informada"}</dd>
                </div>
                <div>
                    <dt>Taxonomia</dt>
                    <dd>{carregandoTaxonomia ? "Carregando…" : taxonomia?.nome || "Nenhuma taxonomia configurada"}</dd>
                </div>
            </dl>

            {!carregandoTaxonomia && !taxonomia && (
                <TaxonomyConfiguration
                    empreendimentoId={empreendimento.id}
                    onConfigured={setTaxonomia}
                />
            )}

            <UploadEvidencia empreendimentoId={empreendimento.id} />

            <footer className="detalhes-empreendimento__acoes barra-acoes">
                <Link className="botao secundario" to="/admin/obras">Voltar à listagem</Link>
                <Link className="botao secundario" to="estrutura">
                    Gerenciar estrutura física
                </Link>
                {taxonomia && <Link className="botao secundario" to="taxonomia">
                    Editar taxonomia
                </Link>}
                <Link className="botao primario" to="editar">Editar empreendimento</Link>
            </footer>
        </article>
    );
}
