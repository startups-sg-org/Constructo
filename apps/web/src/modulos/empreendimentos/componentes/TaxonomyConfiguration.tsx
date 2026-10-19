import { useEffect, useState, type FormEvent } from "react";

import {
    configurarTaxonomia,
    listarTaxonomiasDisponiveis,
    type Taxonomia,
} from "../../../features/empreendimentos/empreendimentos.service";
import { ApiError } from "../../../services/api";
import { cn } from "../../../utils/classes";

const estilos = {
    container: "grid gap-4 text-foreground",
    vinculado: "flex items-start justify-between gap-3",
    titulo: "m-0 text-[16px] font-semibold text-foreground-strong",
    texto: "m-0 text-[13px] leading-5 text-foreground-muted",
    formulario: "ds-panel grid overflow-hidden p-0!",
    formularioCabecalho: "flex items-center justify-between gap-3 border-b border-border-muted bg-surface-muted px-5 py-3",
    formularioTitulo: "m-0 text-[12px] font-medium uppercase tracking-[0.08em] text-foreground-muted",
    formularioCodigo: "rounded border border-border-control bg-surface px-2 py-1 text-[11px] text-foreground-muted",
    campos: "grid gap-4 p-5 md:grid-cols-2",
    campo: "grid min-w-0 gap-1.5",
    campoLargo: "md:col-span-2",
    rotulo: "text-[13px] font-medium text-foreground",
    obrigatorio: "text-accent",
    controle: "ds-dark-field min-h-11! bg-canvas! px-3! py-2.5! text-[14px]! text-foreground-strong",
    textarea: "ds-dark-field min-h-28! resize-y! bg-canvas! px-3! py-2.5! text-[14px]! text-foreground-strong",
    apoio: "m-0 text-[11px] leading-4 text-foreground-muted",
    erroCampo: "m-0 text-[12px] text-error",
    descricao: "m-0 text-[13px] leading-5 text-foreground-muted",
    rodape: "flex flex-wrap items-center justify-between gap-3 border-t border-border-muted bg-surface-muted px-5 py-3",
    botao: "ds-focus-ring-offset min-h-10 rounded-md border border-action-primary bg-action-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-action-primary-hover disabled:cursor-wait disabled:opacity-60",
    erro: "m-0 rounded-md border border-[#f85149]/45 bg-[#f85149]/10 px-3 py-2 text-[13px] text-[#ff7b72]",
} as const;

type Props = {
    empreendimentoId: number;
    taxonomia?: Taxonomia | null;
    onConfigured: (taxonomia: Taxonomia) => void;
};

export default function TaxonomyConfiguration({ empreendimentoId, taxonomia, onConfigured }: Props) {
    const [opcoes, setOpcoes] = useState<Taxonomia[]>([]);
    const [selecionada, setSelecionada] = useState("");
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [erroNome, setErroNome] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;
        listarTaxonomiasDisponiveis()
            .then((dados) => {
                if (!ativo) return;
                setOpcoes(dados);
                setSelecionada(dados[0] ? String(dados[0].id) : "");
                setNome(dados[0]?.nome ?? "");
                setDescricao(dados[0]?.descricao ?? "");
            })
            .catch((error) => {
                if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as taxonomias.");
            })
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; };
    }, []);

    if (taxonomia) {
        return <div className={`${estilos.container} ${estilos.vinculado}`}>
            <div>
                <strong className={estilos.titulo}>{taxonomia.nome}</strong>
                <p className={estilos.texto}>{taxonomia.origem_taxonomia_id ? "Cópia personalizada para este empreendimento." : "Taxonomia vinculada."}</p>
            </div>
        </div>;
    }

    async function enviar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selecionada) return;
        const nomeNormalizado = nome.trim();
        if (!nomeNormalizado) {
            setErroNome("Informe o nome da taxonomia.");
            return;
        }
        setEnviando(true);
        setErro(null);
        setErroNome(null);
        try {
            const criada = await configurarTaxonomia(empreendimentoId, {
                origem_taxonomia_id: Number(selecionada),
                nome: nomeNormalizado,
                descricao: descricao.trim() || undefined,
            });
            onConfigured(criada);
        } catch (error) {
            setErro(error instanceof ApiError ? error.message : "Não foi possível configurar a taxonomia.");
        } finally {
            setEnviando(false);
        }
    }

    const opcaoSelecionada = opcoes.find((opcao) => String(opcao.id) === selecionada);

    return <section className={estilos.container} aria-labelledby="taxonomy-config-title">
        <h3 className={estilos.titulo} id="taxonomy-config-title">Cadastrar e configurar taxonomia</h3>
        <p className={estilos.texto}>Escolha um modelo padrão. Uma cópia personalizada será cadastrada e configurada para este empreendimento.</p>
        {carregando && <p className={estilos.texto} role="status">Carregando taxonomias…</p>}
        {!carregando && !opcoes.length && <p className={estilos.texto} role="status">Nenhuma taxonomia padrão disponível.</p>}
        {!carregando && opcoes.length > 0 && (
            <form className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
                <header className={estilos.formularioCabecalho}>
                    <h4 className={estilos.formularioTitulo}>Dados da taxonomia</h4>
                    <span className={estilos.formularioCodigo}>NOVA</span>
                </header>
                <div className={estilos.campos}>
                    <div className={cn(estilos.campo, estilos.campoLargo)}>
                        <label className={estilos.rotulo} htmlFor="taxonomia-origem">
                            Modelo-base <span className={estilos.obrigatorio} aria-hidden="true">*</span>
                        </label>
                        <select
                            className={estilos.controle}
                            id="taxonomia-origem"
                            value={selecionada}
                            onChange={(event) => {
                                const proximaId = event.target.value;
                                const proxima = opcoes.find((opcao) => String(opcao.id) === proximaId);
                                setSelecionada(proximaId);
                                setNome(proxima?.nome ?? "");
                                setDescricao(proxima?.descricao ?? "");
                                setErroNome(null);
                            }}
                            disabled={enviando}
                            required
                        >
                            {opcoes.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
                        </select>
                        <p className={estilos.apoio}>As etapas, subetapas e marcos do modelo serão copiados para o empreendimento.</p>
                    </div>
                    <div className={cn(estilos.campo, estilos.campoLargo)}>
                        <label className={estilos.rotulo} htmlFor="taxonomia-nome">
                            Nome <span className={estilos.obrigatorio} aria-hidden="true">*</span>
                        </label>
                        <input
                            className={estilos.controle}
                            id="taxonomia-nome"
                            type="text"
                            value={nome}
                            maxLength={200}
                            placeholder="Ex.: Taxonomia residencial"
                            disabled={enviando}
                            aria-invalid={Boolean(erroNome)}
                            aria-describedby={erroNome ? "taxonomia-nome-erro" : "taxonomia-nome-ajuda"}
                            onChange={(event) => {
                                setNome(event.target.value);
                                if (erroNome) setErroNome(null);
                            }}
                        />
                        {erroNome
                            ? <p className={estilos.erroCampo} id="taxonomia-nome-erro" role="alert">{erroNome}</p>
                            : <p className={estilos.apoio} id="taxonomia-nome-ajuda">Nome que identificará esta estrutura dentro do empreendimento.</p>}
                    </div>
                    <div className={cn(estilos.campo, estilos.campoLargo)}>
                        <label className={estilos.rotulo} htmlFor="taxonomia-descricao">Descrição</label>
                        <textarea
                            className={estilos.textarea}
                            id="taxonomia-descricao"
                            rows={4}
                            value={descricao}
                            placeholder="Descreva a finalidade e o escopo desta taxonomia"
                            disabled={enviando}
                            onChange={(event) => setDescricao(event.target.value)}
                        />
                        {opcaoSelecionada?.descricao && <p className={estilos.apoio}>Descrição original do modelo carregada para personalização.</p>}
                    </div>
                </div>
                <footer className={estilos.rodape}>
                    <span className={estilos.apoio}><span className={estilos.obrigatorio}>*</span> Campos obrigatórios</span>
                    <button className={estilos.botao} type="submit" disabled={enviando || !selecionada}>
                        <i className="bi bi-plus-lg" aria-hidden="true" /> {enviando ? "Configurando…" : "Cadastrar e configurar"}
                    </button>
                </footer>
            </form>
        )}
        {erro && <p className={estilos.erro} role="alert">{erro}</p>}
    </section>;
}
