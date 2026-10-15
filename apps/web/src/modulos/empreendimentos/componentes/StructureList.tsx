import type { EstruturaLocal } from "@constructo/shared";
import { Button, Table } from "react-bootstrap";

const rotulos = { TORRE: "Torre", BLOCO: "Bloco", PAVIMENTO: "Pavimento", UNIDADE: "Unidade" } as const;

type StructureListProps = {
    items: EstruturaLocal[];
    busca: string;
    contexto: string;
    onSelect: (item: EstruturaLocal) => void;
};

export default function StructureList({ items, busca, contexto, onSelect }: StructureListProps) {
    const filtro = busca.trim().toLocaleLowerCase();
    const visiveis = filtro ? items.filter((item) => item.nome.toLocaleLowerCase().includes(filtro)) : items;

    if (!items.length) {
        return <p className="estrutura-fisica__estado-lista" role="status">{contexto} não possui locais filhos.</p>;
    }
    if (!visiveis.length) {
        return <p className="estrutura-fisica__estado-lista" role="status">Nenhum local deste nível corresponde à busca.</p>;
    }

    return (
        <Table hover responsive className="estrutura-fisica__lista">
            <thead><tr><th>Nome</th><th>Tipo</th><th>Unidades</th><th><span className="visually-hidden">Ações</span></th></tr></thead>
            <tbody>
                {visiveis.map((item) => (
                    <tr key={item.id}>
                        <td><Button variant="link" className="estrutura-fisica__abrir-local" onClick={() => onSelect(item)}>{item.nome}</Button></td>
                        <td>{rotulos[item.tipo]}</td>
                        <td>{item.filhos.length}</td>
                        <td><Button size="sm" variant="outline-secondary" onClick={() => onSelect(item)}>Detalhes</Button></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
