import { Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import type { EstruturaLocal } from "@constructo/shared";

import CabecalhoSecao from "../../../componentes/CabecalhoSecao/CabecalhoSecao";
import { carregarEmpreendimento } from "../../../features/empreendimentos/empreendimentos.loader";
import {
    obterEstruturaFisica,
    obterTaxonomia,
    type Taxonomia,
} from "../../../features/empreendimentos/empreendimentos.service";
import {
    listarProtocolosRecentes,
    type ProtocoloEvidenciaResumo,
} from "../../../features/evidencias/evidencias.service";
import { ApiError } from "../../../services/api";
import { formatarDataEmpreendimento } from "./empreendimentoFormatters";
import "./DetalhesEmpreendimento.css";

type EstadoTaxonomia = "carregando" | "disponivel" | "ausente" | "erro";
type EstadoEstrutura = "carregando" | "disponivel" | "erro";
type EstadoAtividade = "carregando" | "disponivel" | "erro";

type ResumoEstrutura = {
    torres: number;
    pavimentos: number;
    unidades: number;
};

export default function DetalhesEmpreendimento() {
    const empreendimento = useRouteLoaderData<typeof carregarEmpreendimento>("empreendimento");
    const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(null);
    const [estadoTaxonomia, setEstadoTaxonomia] = useState<EstadoTaxonomia>("carregando");
    const [resumoEstrutura, setResumoEstrutura] = useState<ResumoEstrutura | null>(null);
    const [estadoEstrutura, setEstadoEstrutura] = useState<EstadoEstrutura>("carregando");
    const [protocolosRecentes, setProtocolosRecentes] = useState<ProtocoloEvidenciaResumo[]>([]);
    const [estadoAtividade, setEstadoAtividade] = useState<EstadoAtividade>("carregando");

    useEffect(() => {
        if (!empreendimento) return;

        let ativo = true;

        obterTaxonomia(empreendimento.id)
            .then((dados) => {
                if (!ativo) return;
                setTaxonomia(dados);
                setEstadoTaxonomia("disponivel");
            })
            .catch((erro) => {
                if (!ativo) return;
                setTaxonomia(null);
                setEstadoTaxonomia(erro instanceof ApiError && erro.status === 404 ? "ausente" : "erro");
            });

        return () => { ativo = false; };
    }, [empreendimento]);

    useEffect(() => {
        if (!empreendimento) return;

        let ativo = true;

        listarProtocolosRecentes(empreendimento.id)
            .then((protocolos) => {
                if (!ativo) return;
                setProtocolosRecentes(protocolos);
                setEstadoAtividade("disponivel");
            })
            .catch(() => {
                if (!ativo) return;
                setProtocolosRecentes([]);
                setEstadoAtividade("erro");
            });

        return () => { ativo = false; };
    }, [empreendimento]);

    useEffect(() => {
        if (!empreendimento) return;

        let ativo = true;

        obterEstruturaFisica(empreendimento.id)
            .then((estrutura) => {
                if (!ativo) return;
                setResumoEstrutura(contarResumoEstrutura(estrutura));
                setEstadoEstrutura("disponivel");
            })
            .catch(() => {
                if (!ativo) return;
                setResumoEstrutura(null);
                setEstadoEstrutura("erro");
            });

        return () => { ativo = false; };
    }, [empreendimento]);

    if (!empreendimento) return null;

    return (
        <section className="detalhes-empreendimento" aria-labelledby="visao-geral-titulo">
            <CabecalhoSecao
                titulo="Visão geral"
                tituloId="visao-geral-titulo"
            />
            <div className="detalhes-empreendimento__cards">
                <Card className="detalhes-empreendimento__card">
                    <Card.Body>
                        <Card.Title as="h3">Sobre o empreendimento</Card.Title>
                        <dl className="detalhes-empreendimento__dados">
                            <div className="detalhes-empreendimento__dado">
                                <i className="bi bi-geo-alt" aria-hidden="true" />
                                <div>
                                <dt>Endereço</dt>
                                <dd>{empreendimento.endereco || "Endereço não informado"}</dd>
                                </div>
                            </div>
                            <div className="detalhes-empreendimento__dado">
                                <i className="bi bi-card-text" aria-hidden="true" />
                                <div>
                                <dt>Descrição</dt>
                                <dd>{empreendimento.descricao || "Descrição não informada"}</dd>
                                </div>
                            </div>
                            <div className="detalhes-empreendimento__dado">
                                <i className="bi bi-calendar-plus" aria-hidden="true" />
                                <div>
                                <dt>Data de criação</dt>
                                <dd>{formatarDataEmpreendimento(empreendimento.criado_em)}</dd>
                                </div>
                            </div>
                            <div className="detalhes-empreendimento__dado">
                                <i className="bi bi-clock-history" aria-hidden="true" />
                                <div>
                                <dt>Atualizado em</dt>
                                <dd>{formatarDataEmpreendimento(empreendimento.atualizado_em)}</dd>
                                </div>
                            </div>
                        </dl>
                    </Card.Body>
                </Card>

                <Card className="detalhes-empreendimento__card" aria-live="polite">
                    <Card.Body>
                        <Card.Title as="h3">Resumo da taxonomia</Card.Title>
                        {estadoTaxonomia === "carregando" && (
                            <p className="detalhes-empreendimento__mensagem">Carregando taxonomia…</p>
                        )}
                        {estadoTaxonomia === "ausente" && (
                            <p className="detalhes-empreendimento__mensagem">
                                Nenhuma taxonomia configurada para este empreendimento.
                            </p>
                        )}
                        {estadoTaxonomia === "erro" && (
                            <p className="detalhes-empreendimento__mensagem">
                                Não foi possível carregar o resumo da taxonomia.
                            </p>
                        )}
                        {estadoTaxonomia === "disponivel" && taxonomia && (
                            <dl className="detalhes-empreendimento__dados">
                                <div className="detalhes-empreendimento__dado">
                                    <i className="bi bi-diagram-3" aria-hidden="true" />
                                    <div>
                                        <dt>Taxonomia</dt>
                                        <dd>{taxonomia.nome}</dd>
                                    </div>
                                </div>
                                <div className="detalhes-empreendimento__dado">
                                    <i className="bi bi-card-text" aria-hidden="true" />
                                    <div>
                                        <dt>Descrição</dt>
                                        <dd>{taxonomia.descricao || "Descrição não informada"}</dd>
                                    </div>
                                </div>
                            </dl>
                        )}
                    </Card.Body>
                </Card>

                <Card className="detalhes-empreendimento__card" aria-live="polite">
                    <Card.Body>
                        <Card.Title as="h3">Resumo da estrutura da obra</Card.Title>
                        {estadoEstrutura === "carregando" && (
                            <p className="detalhes-empreendimento__mensagem">Carregando estrutura…</p>
                        )}
                        {estadoEstrutura === "erro" && (
                            <p className="detalhes-empreendimento__mensagem">
                                Não foi possível carregar o resumo da estrutura.
                            </p>
                        )}
                        {estadoEstrutura === "disponivel" && resumoEstrutura && (
                            <dl className="detalhes-empreendimento__resumo-estrutura">
                                <div>
                                    <i className="bi bi-buildings" aria-hidden="true" />
                                    <dd>{resumoEstrutura.torres}</dd>
                                    <dt>Torres</dt>
                                </div>
                                <div>
                                    <i className="bi bi-layers" aria-hidden="true" />
                                    <dd>{resumoEstrutura.pavimentos}</dd>
                                    <dt>Pavimentos</dt>
                                </div>
                                <div>
                                    <i className="bi bi-door-open" aria-hidden="true" />
                                    <dd>{resumoEstrutura.unidades}</dd>
                                    <dt>Unidades</dt>
                                </div>
                            </dl>
                        )}
                    </Card.Body>
                </Card>

                <Card className="detalhes-empreendimento__card" aria-live="polite">
                    <Card.Body>
                        <Card.Title as="h3">Atividade recente</Card.Title>
                        {estadoAtividade === "carregando" && (
                            <p className="detalhes-empreendimento__mensagem">Carregando protocolos…</p>
                        )}
                        {estadoAtividade === "erro" && (
                            <p className="detalhes-empreendimento__mensagem">
                                Não foi possível carregar os protocolos recentes.
                            </p>
                        )}
                        {estadoAtividade === "disponivel" && protocolosRecentes.length === 0 && (
                            <p className="detalhes-empreendimento__mensagem">
                                Nenhum protocolo de medição criado recentemente.
                            </p>
                        )}
                        {estadoAtividade === "disponivel" && protocolosRecentes.length > 0 && (
                            <ul className="detalhes-empreendimento__atividades">
                                {protocolosRecentes.map((protocolo) => (
                                    <li key={protocolo.id}>
                                        <i className="bi bi-clipboard-check" aria-hidden="true" />
                                        <div>
                                            <strong>Protocolo {protocolo.nome} criado</strong>
                                            {protocolo.descricao && <span>{protocolo.descricao}</span>}
                                        </div>
                                        <time dateTime={protocolo.criado_em}>
                                            {formatarDataEmpreendimento(protocolo.criado_em)}
                                        </time>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card.Body>
                </Card>
            </div>

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
                <Link className="botao secundario" to="evidencias">
                    Ver evidências
                </Link>
                <Link className="botao primario" to="editar">Editar empreendimento</Link>
            </footer>
        </article>
    );
}

function contarResumoEstrutura(locais: EstruturaLocal[]): ResumoEstrutura {
    return locais.reduce<ResumoEstrutura>((resumo, local) => {
        const filhos = contarResumoEstrutura(local.filhos);

        return {
            torres: resumo.torres + filhos.torres + Number(local.tipo === "TORRE"),
            pavimentos: resumo.pavimentos + filhos.pavimentos + Number(local.tipo === "PAVIMENTO"),
            unidades: resumo.unidades + filhos.unidades + Number(local.tipo === "UNIDADE"),
        };
    }, { torres: 0, pavimentos: 0, unidades: 0 });
}
