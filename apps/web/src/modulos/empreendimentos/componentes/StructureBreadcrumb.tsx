import { Breadcrumb } from "react-bootstrap";

import type { LocalSelecionado } from "../../../features/empreendimentos/localSelecionado";

type StructureBreadcrumbProps = {
    selecao: LocalSelecionado | null;
    onSelect: (id: number | null) => void;
};

export default function StructureBreadcrumb({ selecao, onSelect }: StructureBreadcrumbProps) {
    return (
        <Breadcrumb aria-label="breadcrumb" className="breadcrumb">
            <Breadcrumb.Item   className="breadcrumb-item"    active={!selecao} onClick={() => onSelect(null)}>
                Raiz da estrutura
            </Breadcrumb.Item>
            {selecao?.caminho.map((local, indice) => (
                <Breadcrumb.Item
                    className="breadcrumb-item"
                    active={indice === selecao.caminho.length - 1}
                    key={local.id}
                    onClick={() => onSelect(local.id)}
                >
                    {local.nome}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
}
