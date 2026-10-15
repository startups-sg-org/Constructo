import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import {
    enviarEvidencia,
    TAMANHO_MAXIMO_EVIDENCIA,
    TIPOS_EVIDENCIA_PERMITIDOS,
} from "../../features/evidencias/evidencias.service";
import { ApiError } from "../../services/api";
import CabecalhoSecao from "../CabecalhoSecao/CabecalhoSecao";
import "./UploadEvidencia.css";

type UploadEvidenciaProps = {
    empreendimentoId: number;
};

function validarArquivo(arquivo: File): string | null {
    if (!(TIPOS_EVIDENCIA_PERMITIDOS as readonly string[]).includes(arquivo.type)) {
        return "Formato inválido. Selecione uma imagem JPEG, PNG ou WEBP.";
    }
    if (arquivo.size > TAMANHO_MAXIMO_EVIDENCIA) {
        return "A imagem deve ter no máximo 5 MB.";
    }
    if (arquivo.size === 0) return "O arquivo selecionado está vazio.";
    return null;
}

function mensagemDoErro(erro: unknown): string {
    if (erro instanceof ApiError) return erro.message;
    return "Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.";
}

export default function UploadEvidencia({ empreendimentoId }: UploadEvidenciaProps) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [arrastando, setArrastando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    function limparSelecao() {
        setArquivo(null);
        setPreviewUrl(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    function selecionarArquivo(novoArquivo?: File) {
        setErro(null);
        setSucesso(null);
        if (!novoArquivo) return;

        const mensagem = validarArquivo(novoArquivo);
        if (mensagem) {
            limparSelecao();
            setErro(mensagem);
            return;
        }

        setArquivo(novoArquivo);
        setPreviewUrl(URL.createObjectURL(novoArquivo));
    }

    function aoSelecionar(evento: ChangeEvent<HTMLInputElement>) {
        selecionarArquivo(evento.target.files?.[0]);
    }

    function aoSoltar(evento: DragEvent<HTMLDivElement>) {
        evento.preventDefault();
        setArrastando(false);
        if (!enviando) selecionarArquivo(evento.dataTransfer.files[0]);
    }

    async function enviar() {
        if (!arquivo || enviando) return;
        setEnviando(true);
        setErro(null);
        setSucesso(null);
        try {
            await enviarEvidencia(empreendimentoId, arquivo);
            limparSelecao();
            setSucesso("Evidência enviada com sucesso.");
        } catch (error) {
            setErro(mensagemDoErro(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section className="upload-evidencia" aria-labelledby={`${inputId}-titulo`}>
            <CabecalhoSecao
                etiqueta="Progresso visual"
                titulo="Adicionar evidência"
                tituloId={`${inputId}-titulo`}
                descricao="Envie uma imagem JPEG, PNG ou WEBP de até 5 MB."
                nivel={3}
                comDivisor
            />

            <div
                className={`upload-evidencia__dropzone${arrastando ? " upload-evidencia__dropzone--ativa" : ""}`}
                onDragEnter={(evento) => { evento.preventDefault(); setArrastando(true); }}
                onDragOver={(evento) => evento.preventDefault()}
                onDragLeave={() => setArrastando(false)}
                onDrop={aoSoltar}
            >
                <input
                    ref={inputRef}
                    id={inputId}
                    className="upload-evidencia__input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={aoSelecionar}
                    disabled={enviando}
                />
                <p>Arraste uma imagem para cá ou</p>
                <label className="botao secundario" htmlFor={inputId}>Selecionar imagem</label>
            </div>

            {previewUrl && arquivo && (
                <div className="upload-evidencia__preview">
                    <img src={previewUrl} alt={`Pré-visualização de ${arquivo.name}`} />
                    <div>
                        <strong>{arquivo.name}</strong>
                        <span>{(arquivo.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                </div>
            )}

            <div className="upload-evidencia__feedback" aria-live="polite">
                {erro && <p className="feedback-painel feedback-painel--erro" role="alert">{erro}</p>}
                {sucesso && <p className="feedback-painel feedback-painel--sucesso" role="status">{sucesso}</p>}
            </div>

            {arquivo && (
                <div className="barra-acoes">
                    <button className="botao secundario" type="button" onClick={limparSelecao} disabled={enviando}>
                        Remover
                    </button>
                    <button className="botao primario" type="button" onClick={enviar} disabled={enviando}>
                        {enviando && <span className="upload-evidencia__spinner" aria-hidden="true" />}
                        {enviando ? "Enviando..." : "Enviar evidência"}
                    </button>
                </div>
            )}
        </section>
    );
}
