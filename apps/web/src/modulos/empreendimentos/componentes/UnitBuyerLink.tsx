import type { UserResponse } from "@constructo/shared";
import { useEffect, useMemo, useState } from "react";

import {
    listarCompradoresDaUnidade,
    vincularCompradorAUnidade,
} from "../../../features/empreendimentos/empreendimentos.service";
import { getUsers } from "../../../features/usuarios/usuarios.service";

export type CompradorVinculado = {
    id: number;
    nome: string;
    email: string;
};

type UnitBuyerLinkProps = {
    empreendimentoId: number;
    unidadeId: number;
    compradoresVinculados: CompradorVinculado[];
    onVinculado: (unidadeId: number, comprador: CompradorVinculado) => void;
    onCompradoresCarregados: (unidadeId: number, compradores: CompradorVinculado[]) => void;
};

const estilos = {
    secao: "grid min-w-0 gap-4 border-t border-border-muted pt-4",
    bloco: "grid min-w-0 gap-2",
    cabecalho: "flex min-w-0 items-center justify-between gap-2",
    titulo: "m-0 font-label-sm text-label-sm uppercase tracking-wide text-foreground-muted",
    quantidade: "font-body-sm text-body-sm text-foreground-muted",
    carregando: "flex items-center gap-2 rounded-md border border-border-muted bg-surface-muted px-3 py-2 font-body-sm text-body-sm text-foreground-muted",
    vazio: "m-0 rounded-md border border-dashed border-border-muted px-3 py-3 text-center font-body-sm text-body-sm text-foreground-muted",
    listaVinculados: "m-0 grid list-none gap-2 p-0",
    compradorVinculado: "flex min-w-0 items-start gap-2 rounded-md border border-border-muted bg-surface-muted px-3 py-2",
    avatar: "grid h-7 w-7 flex-none place-items-center rounded-full bg-action-primary/15 font-label-sm text-label-sm font-semibold text-accent",
    dadosComprador: "min-w-0 flex-1",
    nomeComprador: "m-0 truncate font-label-sm text-label-sm font-medium text-foreground-strong",
    emailComprador: "m-0 truncate font-body-sm text-body-sm text-foreground-muted",
    formulario: "grid min-w-0 gap-3 border-t border-border-muted pt-4",
    descricao: "m-0 font-body-sm text-body-sm text-foreground-muted",
    campo: "grid min-w-0 gap-1.5",
    rotulo: "font-label-sm text-label-sm text-foreground",
    entradaContainer: "relative min-w-0",
    iconeBusca: "pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-body-sm text-foreground-muted",
    entrada: "ds-dark-field w-full bg-surface-muted! pl-9! text-foreground! placeholder:text-foreground-muted disabled:cursor-not-allowed disabled:opacity-60",
    resultados: "m-0 grid max-h-48 list-none gap-1 overflow-y-auto rounded-md border border-border-muted bg-surface p-1",
    resultado: "ds-focus-ring flex min-w-0 items-center gap-2 rounded-sm border-0 bg-transparent px-2 py-2 text-left hover:bg-surface-hover",
    selecionado: "flex min-w-0 items-center justify-between gap-2 rounded-md border border-accent/40 bg-action-primary/10 px-3 py-2",
    limpar: "ds-icon-button h-7 w-7 flex-none border-0 bg-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong",
    feedbackErro: "m-0 rounded-md border border-error/40 bg-[#93000a]/20 px-3 py-2 font-body-sm text-body-sm text-error",
    feedbackAviso: "m-0 rounded-md border border-warning-700/40 bg-[rgb(210_153_34_/_15%)] px-3 py-2 font-body-sm text-body-sm text-[#e3b341]",
    feedbackSucesso: "m-0 rounded-md border border-success-700/40 bg-[rgb(35_134_54_/_15%)] px-3 py-2 font-body-sm text-body-sm text-success-700",
    enviar: "ds-focus-ring-offset inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-action-primary bg-action-primary px-3 font-label-sm text-label-sm text-white hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
} as const;

function obterNomeCompleto(usuario: Pick<UserResponse, "nome" | "sobrenome">): string {
    return `${usuario.nome} ${usuario.sobrenome}`.trim();
}

function obterIniciais(nome: string): string {
    return nome
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toLocaleUpperCase();
}

function mensagemDeErro(erro: unknown, fallback: string): string {
    return erro instanceof Error && erro.message ? erro.message : fallback;
}

export default function UnitBuyerLink({
    empreendimentoId,
    unidadeId,
    compradoresVinculados,
    onVinculado,
    onCompradoresCarregados,
}: UnitBuyerLinkProps) {
    const [compradores, setCompradores] = useState<UserResponse[]>([]);
    const [busca, setBusca] = useState("");
    const [compradorSelecionado, setCompradorSelecionado] = useState<UserResponse | null>(null);
    const [carregandoCompradores, setCarregandoCompradores] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [vinculando, setVinculando] = useState(false);
    const [erroVinculo, setErroVinculo] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        let montado = true;

        void Promise.all([
            getUsers(),
            listarCompradoresDaUnidade(empreendimentoId, unidadeId),
        ])
            .then(([usuarios, vinculos]) => {
                if (!montado) return;
                const compradoresAtivos = usuarios.filter(
                    (usuario) => usuario.ativo && usuario.papel === "COMPRADOR",
                );
                const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));
                setCompradores(compradoresAtivos);
                onCompradoresCarregados(unidadeId, vinculos.map((vinculo) => {
                    const comprador = usuariosPorId.get(vinculo.usuario_id);
                    return {
                        id: vinculo.usuario_id,
                        nome: comprador ? obterNomeCompleto(comprador) : `Comprador #${vinculo.usuario_id}`,
                        email: comprador?.email ?? "",
                    };
                }));
            })
            .catch((erro: unknown) => {
                if (montado) {
                    setErroCarregamento(mensagemDeErro(
                        erro,
                        "Não foi possível carregar os compradores vinculados.",
                    ));
                }
            })
            .finally(() => {
                if (montado) setCarregandoCompradores(false);
            });

        return () => {
            montado = false;
        };
    }, [empreendimentoId, onCompradoresCarregados, unidadeId]);

    const compradoresFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase();
        if (!termo) return [];

        const idsVinculados = new Set(compradoresVinculados.map((comprador) => comprador.id));
        return compradores.filter((comprador) => (
            !idsVinculados.has(comprador.id)
            && `${obterNomeCompleto(comprador)} ${comprador.email}`.toLocaleLowerCase().includes(termo)
        ));
    }, [busca, compradores, compradoresVinculados]);

    function selecionarComprador(comprador: UserResponse) {
        setCompradorSelecionado(comprador);
        setBusca("");
        setErroVinculo("");
        setSucesso("");
    }

    function atualizarBusca(valor: string) {
        setBusca(valor);
        setCompradorSelecionado(null);
        setErroVinculo("");
        setSucesso("");
    }

    async function enviarVinculo(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!compradorSelecionado) {
            setSucesso("");
            setErroVinculo("Selecione um comprador nos resultados da busca.");
            return;
        }

        setVinculando(true);
        setErroVinculo("");
        setSucesso("");

        try {
            const vinculo = await vincularCompradorAUnidade(
                empreendimentoId,
                unidadeId,
                compradorSelecionado.id,
            );
            const comprador = compradores.find((item) => item.id === vinculo.usuario_id);
            onVinculado(unidadeId, {
                id: vinculo.usuario_id,
                nome: comprador ? obterNomeCompleto(comprador) : `Comprador #${vinculo.usuario_id}`,
                email: comprador?.email ?? "",
            });
            setSucesso("Comprador vinculado à unidade.");
            setCompradorSelecionado(null);
            setBusca("");
        } catch (erro) {
            setErroVinculo(mensagemDeErro(erro, "Não foi possível vincular o comprador."));
        } finally {
            setVinculando(false);
        }
    }

    return (
        <section className={estilos.secao} aria-labelledby="compradores-unidade-titulo">
            <div className={estilos.bloco}>
                <header className={estilos.cabecalho}>
                    <h4 className={estilos.titulo} id="compradores-unidade-titulo">Compradores vinculados</h4>
                    {!carregandoCompradores && (
                        <span className={estilos.quantidade}>{compradoresVinculados.length}</span>
                    )}
                </header>

                {carregandoCompradores && (
                    <p className={estilos.carregando} role="status">
                        <i className="bi bi-arrow-repeat animate-spin" aria-hidden="true" />
                        Carregando compradores...
                    </p>
                )}
                {!carregandoCompradores && !erroCarregamento && compradoresVinculados.length === 0 && (
                    <p className={estilos.vazio}>Nenhum comprador vinculado a esta unidade.</p>
                )}
                {!carregandoCompradores && compradoresVinculados.length > 0 && (
                    <ul className={estilos.listaVinculados}>
                        {compradoresVinculados.map((comprador) => (
                            <li className={estilos.compradorVinculado} key={comprador.id}>
                                <span className={estilos.avatar} aria-hidden="true">{obterIniciais(comprador.nome)}</span>
                                <div className={estilos.dadosComprador}>
                                    <p className={estilos.nomeComprador}>{comprador.nome}</p>
                                    {comprador.email && <p className={estilos.emailComprador}>{comprador.email}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {erroCarregamento && (
                    <p className={estilos.feedbackAviso} role="alert">{erroCarregamento}</p>
                )}
            </div>

            <form className={estilos.formulario} noValidate onSubmit={enviarVinculo}>
                <div className={estilos.bloco}>
                    <h4 className={estilos.titulo}>Vincular comprador</h4>
                    <p className={estilos.descricao}>Busque um comprador ativo por nome ou e-mail.</p>
                </div>

                <div className={estilos.campo}>
                    <label className={estilos.rotulo} htmlFor={`buscar-comprador-${unidadeId}`}>Comprador</label>
                    <div className={estilos.entradaContainer}>
                        <i className={`bi bi-search ${estilos.iconeBusca}`} aria-hidden="true" />
                        <input
                            className={estilos.entrada}
                            id={`buscar-comprador-${unidadeId}`}
                            type="search"
                            value={busca}
                            placeholder="Nome ou e-mail"
                            autoComplete="off"
                            disabled={carregandoCompradores || Boolean(erroCarregamento)}
                            onChange={(evento) => atualizarBusca(evento.target.value)}
                            aria-controls={`resultados-compradores-${unidadeId}`}
                        />
                    </div>
                </div>

                {busca.trim() && compradoresFiltrados.length > 0 ? (
                    <ul
                        className={estilos.resultados}
                        id={`resultados-compradores-${unidadeId}`}
                        aria-label="Resultados da busca de compradores"
                    >
                        {compradoresFiltrados.map((comprador) => (
                            <li key={comprador.id}>
                                <button
                                    className={estilos.resultado}
                                    type="button"
                                    onClick={() => selecionarComprador(comprador)}
                                >
                                    <span className={estilos.avatar} aria-hidden="true">
                                        {obterIniciais(obterNomeCompleto(comprador))}
                                    </span>
                                    <span className={estilos.dadosComprador}>
                                        <span className={estilos.nomeComprador}>{obterNomeCompleto(comprador)}</span>
                                        <span className={estilos.emailComprador}>{comprador.email}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : busca.trim() && !carregandoCompradores ? (
                    <p className={estilos.vazio} role="status">Nenhum comprador disponível corresponde à busca.</p>
                ) : null}

                {compradorSelecionado && (
                    <div className={estilos.selecionado} aria-label="Comprador selecionado">
                        <div className={estilos.dadosComprador}>
                            <p className={estilos.nomeComprador}>{obterNomeCompleto(compradorSelecionado)}</p>
                            <p className={estilos.emailComprador}>{compradorSelecionado.email}</p>
                        </div>
                        <button
                            className={estilos.limpar}
                            type="button"
                            aria-label="Remover comprador selecionado"
                            title="Remover seleção"
                            onClick={() => setCompradorSelecionado(null)}
                        >
                            <i className="bi bi-x-lg" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {erroVinculo && <p className={estilos.feedbackErro} role="alert">{erroVinculo}</p>}
                {sucesso && <p className={estilos.feedbackSucesso} role="status">{sucesso}</p>}

                <button
                    className={estilos.enviar}
                    type="submit"
                    disabled={vinculando || carregandoCompradores || Boolean(erroCarregamento)}
                >
                    <i className="bi bi-person-plus" aria-hidden="true" />
                    {vinculando ? "Vinculando..." : "Vincular comprador"}
                </button>
            </form>
        </section>
    );
}
