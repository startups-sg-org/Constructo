import { useCallback, useState } from "react";

import type { LocalSelecionado } from "../../../features/empreendimentos/localSelecionado";
import LocationForm from "./LocationForm";
import "./LocationDetails.css";

const rotulosTipo = {
    TORRE: "Torre",
    BLOCO: "Bloco",
    PAVIMENTO: "Pavimento",
    UNIDADE: "Unidade",
} as const;

type LocationDetailsProps = {
    selecao: LocalSelecionado | null;
    empreendimentoNome: string;
};

export default function LocationDetails({ selecao, empreendimentoNome }: LocationDetailsProps) {
    const [editando, setEditando] = useState(false);
    const concluirEdicao = useCallback(() => setEditando(false), []);

    if (!selecao) {
        return (
            <aside className="estrutura-fisica__detalhes-vazios">
                <h3>Selecione um local</h3>
                <p>Escolha uma torre, bloco, pavimento ou unidade para consultar os detalhes.</p>
            </aside>
        );
    }

    return (
        <aside
            className="estrutura-fisica__detalhes-local"
            aria-labelledby="detalhes-local-titulo"
        >
            <span className="subtitulo">Local selecionado</span>
            <h3 id="detalhes-local-titulo">{selecao.local.nome}</h3>
            {editando ? (
                <LocationForm
                    key={selecao.local.id}
                    local={selecao.local}
                    onCancel={() => setEditando(false)}
                    onSaved={concluirEdicao}
                />
            ) : (
                <>
                    <dl>
                        <div>
                            <dt>ID</dt>
                            <dd>{selecao.local.id}</dd>
                        </div>
                        <div>
                            <dt>Nome</dt>
                            <dd>{selecao.local.nome}</dd>
                        </div>
                        <div>
                            <dt>Tipo</dt>
                            <dd>{rotulosTipo[selecao.local.tipo]}</dd>
                        </div>
                        <div>
                            <dt>Empreendimento</dt>
                            <dd>{empreendimentoNome}</dd>
                        </div>
                    </dl>
                    <div className="estrutura-fisica__caminho">
                        <h4>Caminho hierárquico</h4>
                        <ol aria-label="Caminho hierárquico">
                            <li>{empreendimentoNome}</li>
                            {selecao.caminho.map((local) => (
                                <li key={local.id}>{local.nome}</li>
                            ))}
                        </ol>
                    </div>
                    <button
                        className="botao secundario estrutura-fisica__editar-local"
                        type="button"
                        onClick={() => setEditando(true)}
                    >
                        Editar local
                    </button>
                </>
            )}
        </aside>
    );
}
