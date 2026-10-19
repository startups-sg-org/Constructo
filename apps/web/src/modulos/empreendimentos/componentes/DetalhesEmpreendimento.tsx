import { useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import type { EstruturaLocal } from "@constructo/shared";

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
import AtividadeRecenteEmpreendimento from "./AtividadeRecenteEmpreendimento";
import MacroetapasEmpreendimento from "./MacroetapasEmpreendimento";
import ResumoAvancoFisico from "./ResumoAvancoFisico";
import ResumoGeralEmpreendimento from "./ResumoGeralEmpreendimento";
import type { EstadoRecurso, ResumoEstrutura } from "./visaoGeral.types";

export default function DetalhesEmpreendimento() {
    const empreendimento = useRouteLoaderData<typeof carregarEmpreendimento>("empreendimento");
    const [taxonomia, setTaxonomia] = useState<Taxonomia | null>(null);
    const [estadoTaxonomia, setEstadoTaxonomia] = useState<EstadoRecurso>("carregando");
    const [resumoEstrutura, setResumoEstrutura] = useState<ResumoEstrutura | null>(null);
    const [estadoEstrutura, setEstadoEstrutura] = useState<EstadoRecurso>("carregando");
    const [protocolosRecentes, setProtocolosRecentes] = useState<ProtocoloEvidenciaResumo[]>([]);
    const [estadoAtividade, setEstadoAtividade] = useState<EstadoRecurso>("carregando");

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
                setEstadoEstrutura("erro");
            });

        return () => { ativo = false; };
    }, [empreendimento]);

    if (!empreendimento) return null;

    return (
        <section className="grid min-w-0 gap-4" aria-labelledby="visao-geral-titulo">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-3">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-status-progress-fg" aria-hidden="true" />
                    <h2 className="font-headline-xl-mobile text-headline-xl-mobile font-semibold text-foreground-strong md:font-headline-xl md:text-headline-xl" id="visao-geral-titulo">
                        Visão geral
                    </h2>
                </div>
                <p className="text-[12px] leading-5 text-foreground-muted max-sm:hidden">
                    Dados atualizados a partir dos módulos disponíveis
                </p>
            </header>

            <div className="grid min-w-0 items-start gap-4 min-[1100px]:grid-cols-[minmax(300px,0.38fr)_minmax(0,0.62fr)]">
                <div className="grid min-w-0 gap-4">
                    <ResumoGeralEmpreendimento empreendimento={empreendimento} />
                    <ResumoAvancoFisico estadoEstrutura={estadoEstrutura} resumoEstrutura={resumoEstrutura} />
                </div>
                <div className="grid min-w-0 gap-4">
                    <MacroetapasEmpreendimento estado={estadoTaxonomia} taxonomia={taxonomia} />
                    <AtividadeRecenteEmpreendimento estado={estadoAtividade} protocolos={protocolosRecentes} />
                </div>
            </div>
        </section>
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
