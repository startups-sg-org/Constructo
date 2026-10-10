import { Link, useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";

import BadgeStatus from "../../../componentes/BadgeStatus/BadgeStatus";
import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import UploadEvidencia from "../../../componentes/UploadEvidencia/UploadEvidencia";
import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import { obterTaxonomia, type Taxonomia } from "../../../features/empreendimentos/empreendimentos.service";
import { ApiError } from "../../../services/api";
import TaxonomyConfiguration from "./TaxonomyConfiguration";
import { formatarDataEmpreendimento, obterRotuloStatus, obterTomStatus } from "./empreendimentoFormatters";
import "./ListaEmpreendimentos.css";

export default function DetalhesEmpreendimento() {
    const empreendimento = useLoaderData<typeof carregarEmpreendimento>();
    const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(null);
    const [carregandoTaxonomia, setCarregandoTaxonomia] = useState(true);

    useEffect(() => {
        let ativo = true;
        obterTaxonomia(empreendimento.id)
            .then((dados) => ativo && setTaxonomia(dados))
            .catch((erro) => {
                if (!(erro instanceof ApiError && erro.status === 404)) throw erro;
            })
            .finally(() => ativo && setCarregandoTaxonomia(false));
        return () => { ativo = false; };
    }, [empreendimento.id]);

    return (
        <article className="detalhes-empreendimento superficie-painel">
            <CabecalhoSecao
                etiqueta="Dados da obra"
                titulo={empreendimento.nome}
                comDivisor
                complemento={(
                    <BadgeStatus tom={obterTomStatus(empreendimento.status)}>
                        {obterRotuloStatus(empreendimento.status)}
                    </BadgeStatus>
                )}
            />

            <dl className="detalhes-empreendimento__dados lista-dados">
                <div>
                    <dt>Endereço</dt>
                    <dd>{empreendimento.endereco || "Endereço não informado"}</dd>
                </div>
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
