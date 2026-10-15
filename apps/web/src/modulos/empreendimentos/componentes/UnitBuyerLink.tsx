import type { UserResponse } from "@constructo/shared";
import { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";

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
    onVinculado: (unidadeId: number, comprador: CompradorVinculado) => void;
    onCompradoresCarregados: (unidadeId: number, compradores: CompradorVinculado[]) => void;
};

function obterNomeCompleto(usuario: Pick<UserResponse, "nome" | "sobrenome">): string {
    return `${usuario.nome} ${usuario.sobrenome}`.trim();
}

function mensagemDeErro(erro: unknown, fallback: string): string {
    return erro instanceof Error && erro.message ? erro.message : fallback;
}

export default function UnitBuyerLink({
    empreendimentoId,
    unidadeId,
    onVinculado,
    onCompradoresCarregados,
}: UnitBuyerLinkProps) {
    const [compradores, setCompradores] = useState<UserResponse[]>([]);
    const [busca, setBusca] = useState("");
    const [usuarioId, setUsuarioId] = useState("");
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
                if (montado) setErroCarregamento(mensagemDeErro(erro, "Não foi possível carregar os compradores vinculados."));
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

        return compradores.filter((comprador) => (
            `${obterNomeCompleto(comprador)} ${comprador.email}`.toLocaleLowerCase().includes(termo)
        ));
    }, [busca, compradores]);

    function selecionarComprador(comprador: UserResponse) {
        setUsuarioId(String(comprador.id));
        setBusca(obterNomeCompleto(comprador));
        setErroVinculo("");
        setSucesso("");
    }

    async function enviarVinculo(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const id = Number(usuarioId);

        if (!Number.isSafeInteger(id) || id <= 0) {
            setSucesso("");
            setErroVinculo("Informe um ID de comprador inteiro e positivo.");
            return;
        }

        setVinculando(true);
        setErroVinculo("");
        setSucesso("");

        try {
            const vinculo = await vincularCompradorAUnidade(empreendimentoId, unidadeId, id);
            const comprador = compradores.find((item) => item.id === vinculo.usuario_id);
            onVinculado(unidadeId, {
                id: vinculo.usuario_id,
                nome: comprador ? obterNomeCompleto(comprador) : `Comprador #${vinculo.usuario_id}`,
                email: comprador?.email ?? "",
            });
            setSucesso("Comprador vinculado à unidade.");
            setUsuarioId("");
            setBusca("");
        } catch (erro) {
            setErroVinculo(mensagemDeErro(erro, "Não foi possível vincular o comprador."));
        } finally {
            setVinculando(false);
        }
    }

    return (
        <section className="border-top mt-4 pt-4" aria-labelledby="vincular-comprador-titulo">
            <h4 id="vincular-comprador-titulo" className="h5">Vincular comprador</h4>
            <p className="text-body-secondary">Busque pelo nome ou e-mail, ou informe diretamente o ID do comprador.</p>

            <Form noValidate onSubmit={enviarVinculo}>
                <Form.Group className="mb-3" controlId={`buscar-comprador-${unidadeId}`}>
                    <Form.Label>Buscar comprador por nome ou e-mail</Form.Label>
                    <Form.Control
                        type="search"
                        value={busca}
                        disabled={carregandoCompradores}
                        onChange={(evento) => setBusca(evento.target.value)}
                    />
                    {carregandoCompradores && <Form.Text>Carregando compradores disponíveis.</Form.Text>}
                    {erroCarregamento && <p className="alert alert-warning mt-2 mb-0" role="alert">{erroCarregamento}</p>}
                    {compradoresFiltrados.length > 0 && (
                        <div className="list-group mt-2" aria-label="Resultados da busca de compradores">
                            {compradoresFiltrados.map((comprador) => (
                                <button
                                    key={comprador.id}
                                    type="button"
                                    className="list-group-item list-group-item-action"
                                    onClick={() => selecionarComprador(comprador)}
                                >
                                    {obterNomeCompleto(comprador)} — {comprador.email}
                                </button>
                            ))}
                        </div>
                    )}
                </Form.Group>

                <Form.Group className="mb-3" controlId={`comprador-id-${unidadeId}`}>
                    <Form.Label>ID do comprador</Form.Label>
                    <Form.Control
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={usuarioId}
                        onChange={(evento) => setUsuarioId(evento.target.value)}
                        aria-describedby={`comprador-id-ajuda-${unidadeId}`}
                    />
                    <Form.Text id={`comprador-id-ajuda-${unidadeId}`}>Informe um número inteiro positivo.</Form.Text>
                </Form.Group>

                {erroVinculo && <p className="alert alert-danger" role="alert">{erroVinculo}</p>}
                {sucesso && <p className="alert alert-success" role="status">{sucesso}</p>}

                <Button type="submit" disabled={vinculando}>
                    {vinculando ? "Vinculando..." : "Vincular comprador"}
                </Button>
            </Form>

        </section>
    );
}
