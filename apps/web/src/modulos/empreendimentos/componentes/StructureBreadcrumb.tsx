import type { LocalSelecionado } from "../../../features/empreendimentos/localSelecionado";

type StructureBreadcrumbProps = {
    selecao: LocalSelecionado | null;
    onSelect: (id: number | null) => void;
};

export default function StructureBreadcrumb({ selecao, onSelect }: StructureBreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className={`breadcrumb-item${!selecao ? " active" : ""}`}>
                    {selecao ? <button type="button" onClick={() => onSelect(null)}>Raiz da estrutura</button> : "Raiz da estrutura"}
                </li>
            {selecao?.caminho.map((local, indice) => (
                <li className={`breadcrumb-item${indice === selecao.caminho.length - 1 ? " active" : ""}`} key={local.id}>
                    {indice === selecao.caminho.length - 1 ? local.nome : <button type="button" onClick={() => onSelect(local.id)}>{local.nome}</button>}
                </li>
            ))}
            </ol>
        </nav>
    );
}
