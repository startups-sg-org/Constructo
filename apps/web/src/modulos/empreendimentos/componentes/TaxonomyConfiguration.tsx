import { useEffect, useState, type FormEvent } from "react";

import {
    configurarTaxonomia,
    listarTaxonomiasDisponiveis,
    type Taxonomia,
} from "../../../features/empreendimentos/empreendimentos.service";
import { ApiError } from "../../../services/api";
import "./TaxonomyConfiguration.css";

type Props = {
    empreendimentoId: number;
    taxonomia?: Taxonomia | null;
    onConfigured: (taxonomia: Taxonomia) => void;
};

export default function TaxonomyConfiguration({ empreendimentoId, taxonomia, onConfigured }: Props) {
    const [opcoes, setOpcoes] = useState<Taxonomia[]>([]);
    const [selecionada, setSelecionada] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let ativo = true;
        listarTaxonomiasDisponiveis()
            .then((dados) => {
                if (!ativo) return;
                setOpcoes(dados);
                setSelecionada(dados[0] ? String(dados[0].id) : "");
            })
            .catch((error) => {
                if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as taxonomias.");
            })
            .finally(() => ativo && setCarregando(false));
        return () => { ativo = false; };
    }, []);

    if (taxonomia) {
        return <div className="taxonomy-config taxonomy-config--linked">
            <div>
                <strong>{taxonomia.nome}</strong>
                <p>{taxonomia.origem_taxonomia_id ? "Cópia personalizada para este empreendimento." : "Taxonomia vinculada."}</p>
            </div>
        </div>;
    }

    async function enviar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selecionada) return;
        setEnviando(true);
        setErro(null);
        try {
            const criada = await configurarTaxonomia(empreendimentoId, {
                origem_taxonomia_id: Number(selecionada),
            });
            onConfigured(criada);
        } catch (error) {
            setErro(error instanceof ApiError ? error.message : "Não foi possível configurar a taxonomia.");
        } finally {
            setEnviando(false);
        }
    }

    return <section className="taxonomy-config" aria-labelledby="taxonomy-config-title">
        <h3 id="taxonomy-config-title">Configurar taxonomia</h3>
        <p>Escolha uma taxonomia padrão. Uma cópia será criada para este empreendimento.</p>
        {carregando && <p role="status">Carregando taxonomias…</p>}
        {!carregando && !opcoes.length && <p role="status">Nenhuma taxonomia padrão disponível.</p>}
        {!carregando && opcoes.length > 0 && <form onSubmit={enviar}>
            <label htmlFor="taxonomia-origem">Taxonomia padrão</label>
            <select id="taxonomia-origem" value={selecionada} onChange={(event) => setSelecionada(event.target.value)} disabled={enviando}>
                {opcoes.map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.nome}</option>)}
            </select>
            {opcoes.find((opcao) => String(opcao.id) === selecionada)?.descricao && <p className="taxonomy-config__descricao">{opcoes.find((opcao) => String(opcao.id) === selecionada)?.descricao}</p>}
            <button type="submit" disabled={enviando || !selecionada}>{enviando ? "Configurando…" : "Usar esta taxonomia"}</button>
        </form>}
        {erro && <p className="taxonomy-config__erro" role="alert">{erro}</p>}
    </section>;
}
