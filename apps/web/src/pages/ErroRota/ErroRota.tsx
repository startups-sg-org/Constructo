import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ApiError } from "../../services/api";
import "./ErroRota.css";

type TipoErro = "nao-encontrado" | "carregamento" | "comunicacao" | "inesperado";

type ConteudoErro = {
    codigo: string;
    titulo: string;
    mensagem: string;
};

const CONTEUDOS: Record<TipoErro, ConteudoErro> = {
    "nao-encontrado": {
        codigo: "404",
        titulo: "Página não encontrada",
        mensagem: "O endereço informado não existe ou a página foi movida.",
    },
    carregamento: {
        codigo: "Ops!",
        titulo: "Não foi possível carregar os dados",
        mensagem: "Encontramos um problema ao buscar as informações desta página. Tente novamente.",
    },
    comunicacao: {
        codigo: "Offline?",
        titulo: "Não foi possível acessar o serviço",
        mensagem: "Verifique sua conexão. A API pode estar temporariamente indisponível.",
    },
    inesperado: {
        codigo: "Ops!",
        titulo: "Algo deu errado",
        mensagem: "Ocorreu um erro inesperado. Recarregue a página para tentar novamente.",
    },
};

const STATUS_COMUNICACAO_API = new Set([502, 503, 504]);
const MENSAGEM_ERRO_REDE = /failed to fetch|network\s?error|load failed|fetch failed/i;

function classificarErro(erro: unknown): TipoErro {
    if (erro instanceof ApiError) {
        if (erro.status === 0 || STATUS_COMUNICACAO_API.has(erro.status)) return "comunicacao";
        return "carregamento";
    }

    if (isRouteErrorResponse(erro)) {
        if (erro.status === 404) return "nao-encontrado";
        if (STATUS_COMUNICACAO_API.has(erro.status)) return "comunicacao";
        return "carregamento";
    }

    if (erro instanceof Response) {
        if (erro.status === 404) return "nao-encontrado";
        if (STATUS_COMUNICACAO_API.has(erro.status)) return "comunicacao";
        return "carregamento";
    }

    if (erro instanceof TypeError && MENSAGEM_ERRO_REDE.test(erro.message)) {
        return "comunicacao";
    }

    return "inesperado";
}

function PaginaErro({ tipo }: { tipo: TipoErro }) {
    const conteudo = CONTEUDOS[tipo];
    const permiteTentarNovamente = tipo !== "nao-encontrado";

    return (
        <main className="erro-rota">
            <section className="erro-rota__card" aria-labelledby="erro-rota-titulo">
                <p className="erro-rota__codigo" aria-hidden="true">
                    {conteudo.codigo}
                </p>
                <h1 id="erro-rota-titulo">{conteudo.titulo}</h1>
                <p className="erro-rota__mensagem">{conteudo.mensagem}</p>

                <div className="erro-rota__acoes">
                    {permiteTentarNovamente && (
                        <button
                            className="erro-rota__acao erro-rota__acao--primaria"
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Tentar novamente
                        </button>
                    )}
                    <Link
                        className={`erro-rota__acao ${
                            permiteTentarNovamente
                                ? "erro-rota__acao--secundaria"
                                : "erro-rota__acao--primaria"
                        }`}
                        to="/"
                    >
                        Voltar ao início
                    </Link>
                </div>
            </section>
        </main>
    );
}

export function PaginaNaoEncontrada() {
    return <PaginaErro tipo="nao-encontrado" />;
}

export default function ErroRota() {
    const erro = useRouteError();

    return <PaginaErro tipo={classificarErro(erro)} />;
}
