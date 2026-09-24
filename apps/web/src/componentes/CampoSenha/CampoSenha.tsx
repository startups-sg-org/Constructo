import {
    forwardRef,
    useId,
    useState,
    type InputHTMLAttributes,
    type ReactNode
} from "react";
import "./CampoSenha.css";

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: ReactNode;
    mensagemErro?: ReactNode;
};

const CampoSenha = forwardRef<HTMLInputElement, CampoSenhaProps>(function CampoSenha(
    {
        label,
        mensagemErro,
        id,
        className,
        disabled,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        ...inputProps
    },
    ref
) {
    const idGerado = useId();
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const inputId = id ?? `campo-senha-${idGerado}`;
    const erroId = `${inputId}-erro`;
    const descricaoIds = [ariaDescribedBy, mensagemErro ? erroId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    const acao = senhaVisivel ? "Ocultar senha" : "Mostrar senha";

    return (
        <div className="campo campo-senha">
            <label htmlFor={inputId}>{label}</label>

            <div className="campo-senha__controle">
                <input
                    {...inputProps}
                    ref={ref}
                    id={inputId}
                    className={["campo-senha__input", className].filter(Boolean).join(" ")}
                    type={senhaVisivel ? "text" : "password"}
                    disabled={disabled}
                    aria-invalid={ariaInvalid ?? Boolean(mensagemErro)}
                    aria-describedby={descricaoIds}
                />
                <button
                    className="campo-senha__alternar"
                    type="button"
                    onClick={() => setSenhaVisivel((visivel) => !visivel)}
                    disabled={disabled}
                    aria-label={acao}
                    aria-pressed={senhaVisivel}
                    aria-controls={inputId}
                    title={acao}
                >
                    {senhaVisivel ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m3 3 18 18" />
                            <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                            <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5.5 9 5.5a15.2 15.2 0 0 1-2.1 2.7M6.6 6.7C4.4 8.2 3 10.5 3 10.5S6.5 16 12 16c1.2 0 2.3-.3 3.3-.7" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S3 12 3 12Z" />
                            <circle cx="12" cy="12" r="2.5" />
                        </svg>
                    )}
                </button>
            </div>

            {mensagemErro && (
                <span id={erroId} className="campo__erro" role="alert">
                    {mensagemErro}
                </span>
            )}
        </div>
    );
});

export default CampoSenha;
