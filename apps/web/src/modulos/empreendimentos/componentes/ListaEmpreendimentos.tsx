import { useMemo, useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import type { Empreendimento } from "@constructo/shared";

import EstadoVazio from "../../../componentes/EstadoVazio/EstadoVazio";
import BadgeStatus from "../../../componentes/BadgeStatus/BadgeStatus";
import { Button, Col, Container, FormControl, FormLabel, FormSelect, FormText, Row, Table } from "../../../componentes/ui/Ui";
import { carregarEmpreendimentos } from "../../../features/empreendimentos/empreendimentos.loader";
import { formatarDataEmpreendimento, obterRotuloStatus, obterTomStatus } from "./empreendimentoFormatters";
import "./ListaEmpreendimentos.css";

type Ordenacao = "atualizado-desc" | "atualizado-asc" | "nome-asc" | "nome-desc";

export default function ListaEmpreendimentos() {
    const empreendimentos = useLoaderData<typeof carregarEmpreendimentos>();
    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState<Empreendimento["status"] | "TODOS">("TODOS");
    const [ordenacao, setOrdenacao] = useState<Ordenacao>("atualizado-desc");

    const empreendimentosVisiveis = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        const filtrados = empreendimentos.filter((empreendimento) => {
            const correspondeStatus = status === "TODOS" || empreendimento.status === status;
            const texto = [empreendimento.nome, empreendimento.descricao, empreendimento.endereco]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("pt-BR");
            return correspondeStatus && (!termo || texto.includes(termo));
        });

        return [...filtrados].sort((a, b) => compararEmpreendimentos(a, b, ordenacao));
    }, [busca, empreendimentos, ordenacao, status]);

    const filtrosAtivos = Boolean(busca.trim()) || status !== "TODOS";
    const limparFiltros = () => {
        setBusca("");
        setStatus("TODOS");
    };

    return (
        <section className="lista-empreendimentos" aria-labelledby="lista-empreendimentos-titulo">
            <h2 id="lista-empreendimentos-titulo" className="visually-hidden">
                Lista de empreendimentos
            </h2>

            <Container fluid className="px-0">
              <div className="lista-empreendimentos__ferramentas">
                <Row className="g-3 align-items-end">
                    <Col xs={12} lg={5}>
                        <FormLabel htmlFor="busca-empreendimento" className="visually-hidden">
                            Buscar empreendimento
                        </FormLabel>
                        <FormControl
                            id="busca-empreendimento"
                            type="search"
                            value={busca}
                            placeholder="Buscar empreendimento..."
                            onChange={(evento) => setBusca(evento.target.value)}
                        />
                    </Col>
                    <Col xs={12} sm={6} lg={2}>
                        <div className="form-field">
                            <FormLabel htmlFor="filtro-status" className="visually-hidden">
                                Filtrar por status
                            </FormLabel>
                            <FormSelect
                                id="filtro-status"
                                value={status}
                                aria-describedby="filtro-status-ajuda"
                                onChange={(evento) => setStatus(evento.target.value as typeof status)}
                            >
                                <option value="TODOS">Todos os status</option>
                                <option value="PLANEJADO">Planejado</option>
                                <option value="EM_ANDAMENTO">Em andamento</option>
                                <option value="CONCLUIDO">Concluído</option>
                                <option value="INATIVO">Inativo</option>
                            </FormSelect>
                            <FormText id="filtro-status-ajuda" className="visually-hidden">
                                Filtre os empreendimentos pelo status atual.
                            </FormText>
                        </div>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <div className="form-field">
                            <FormLabel htmlFor="ordenacao-empreendimentos" className="visually-hidden">
                                Ordenar empreendimentos
                            </FormLabel>
                            <FormSelect
                                id="ordenacao-empreendimentos"
                                value={ordenacao}
                                aria-describedby="ordenacao-empreendimentos-ajuda"
                                onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}
                            >
                                <option value="atualizado-desc">Atualizado mais recentemente</option>
                                <option value="atualizado-asc">Atualizado há mais tempo</option>
                                <option value="nome-asc">Nome: A–Z</option>
                                <option value="nome-desc">Nome: Z–A</option>
                            </FormSelect>
                            <FormText id="ordenacao-empreendimentos-ajuda" className="visually-hidden">
                                Escolha como ordenar a lista de empreendimentos.
                            </FormText>
                        </div>
                    </Col>
                    <Col xs={12} lg={2} className="d-grid">
                        <Button
                    href="#novo-empreendimento"
                            variant="primary"
                            aria-controls="novo-empreendimento"
                            onClick={() => {
                                document.getElementById("novo-empreendimento")?.scrollIntoView({ behavior: "smooth" });
                                window.setTimeout(() => document.getElementById("nome")?.focus(), 0);
                            }}
                        >
                            <i className="bi bi-plus-lg" aria-hidden="true" />
                            Criar empreendimento
                        </Button>
                    </Col>
                </Row>
              </div>

              <div className="lista-empreendimentos__resumo" aria-live="polite">
                <span>
                    {empreendimentosVisiveis.length} {empreendimentosVisiveis.length === 1 ? "empreendimento" : "empreendimentos"}
                </span>
                {filtrosAtivos && (
                    <Button variant="link" className="p-0" onClick={limparFiltros}>
                        Limpar filtros
                    </Button>
                )}
              </div>

              {empreendimentos.length === 0 ? (
                <EstadoVazio
                    className="lista-empreendimentos__vazia"
                    titulo="Nenhum empreendimento cadastrado"
                    descricao="Use o botão acima ou o formulário abaixo para adicionar a primeira obra."
                />
            ) : empreendimentosVisiveis.length === 0 ? (
                <EstadoVazio
                    className="lista-empreendimentos__vazia"
                    titulo="Nenhum resultado encontrado"
                    descricao="Ajuste a busca ou os filtros para encontrar um empreendimento."
                />
            ) : (
                <div className="lista-empreendimentos__tabela-container">
                    <Table responsive hover className="lista-empreendimentos__tabela" aria-label="Lista de empreendimentos">
                        <thead className = "thead-dark">
                            <tr>
                                <th scope="col">Empreendimento</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Localização</th>
                                <th scope="col">Status</th>
                                <th scope="col">Atualizado em</th>
                                <th scope="col"><span className="visually-hidden">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {empreendimentosVisiveis.map((empreendimento) => (
                                <tr key={empreendimento.id}>
                                    <th scope="row" data-label="Empreendimento">
                                        <Link
                                            className="lista-empreendimentos__nome"
                                            to={`/admin/empreendimentos/${empreendimento.id}`}
                                        >
                                            <span className="lista-empreendimentos__icone" aria-hidden="true">
                                                <i className="bi bi-building" />
                                            </span>
                                            <span>{empreendimento.nome}</span>
                                        </Link>
                                    </th>
                                    <td data-label="Descrição">{empreendimento.descricao || "Descrição não informada"}</td>
                                    <td data-label="Localização">{empreendimento.endereco || "Localização não informada"}</td>
                                    <td data-label="Status">
                                        <BadgeStatus tom={obterTomStatus(empreendimento.status)}>
                                            {obterRotuloStatus(empreendimento.status)}
                                        </BadgeStatus>
                                    </td>
                                    <td data-label="Atualizado em">{formatarDataEmpreendimento(empreendimento.atualizado_em)}</td>
                                    <td data-label="Ação">
                                        <Link
                                            className="lista-empreendimentos__abrir"
                                            to={`/admin/empreendimentos/${empreendimento.id}`}
                                        >
                                            Abrir
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
              )}
            </Container>
        </section>
    );
}
function compararEmpreendimentos(a: Empreendimento, b: Empreendimento, ordenacao: Ordenacao): number {
    if (ordenacao === "nome-asc" || ordenacao === "nome-desc") {
        const resultado = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
        if (resultado !== 0) return ordenacao === "nome-desc" ? -resultado : resultado;
        return a.id - b.id;
    }

    const dataA = new Date(a.atualizado_em).getTime();
    const dataB = new Date(b.atualizado_em).getTime();
    const resultado = (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
    if (resultado !== 0) return ordenacao === "atualizado-desc" ? -resultado : resultado;

    const desempatePorNome = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    if (desempatePorNome !== 0) return desempatePorNome;
    return a.id - b.id;
}
