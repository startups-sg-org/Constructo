import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { Taxonomia } from "../../../features/empreendimentos/empreendimentos.service";
import TaxonomyConfiguration from "./TaxonomyConfiguration";

const estilos = {
    fundo: "fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm",
    dialogo: "ds-panel my-auto grid max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-hidden p-0! shadow-2xl",
    cabecalho: "flex items-start justify-between gap-4 border-b border-border-muted bg-surface-muted px-6 py-4",
    sobrelinha: "m-0 text-[11px] font-medium uppercase tracking-[0.08em] text-accent",
    titulo: "mt-1 mb-0 text-[22px] font-semibold leading-7 text-foreground-strong",
    descricao: "mt-1 mb-0 max-w-xl text-[13px] leading-5 text-foreground-muted",
    fechar: "ds-icon-button size-9 flex-none border border-border-control bg-surface p-0 text-foreground-muted hover:bg-surface-hover hover:text-foreground-strong",
    corpo: "overflow-y-auto bg-canvas p-6 max-sm:p-4",
} as const;

type TaxonomyInitialSetupDialogProps = {
    empreendimentoId: number;
    empreendimentoNome: string;
    onClose: () => void;
    onConfigured: (taxonomia: Taxonomia) => void;
};

export default function TaxonomyInitialSetupDialog({
    empreendimentoId,
    empreendimentoNome,
    onClose,
    onConfigured,
}: TaxonomyInitialSetupDialogProps) {
    const dialogRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            dialogRef.current?.querySelector<HTMLElement>("select, button, input")?.focus();
        });

        function aoPressionarTecla(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) return;
            const focaveis = [...dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), select:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
            )];
            if (!focaveis.length) return;

            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (event.shiftKey && document.activeElement === primeiro) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primeiro.focus();
            }
        }

        document.addEventListener("keydown", aoPressionarTecla);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("keydown", aoPressionarTecla);
            document.body.style.overflow = overflowAnterior;
            focoAnterior?.focus();
        };
    }, [onClose]);

    return createPortal(
        <div
            className={estilos.fundo}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className={estilos.dialogo}
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="configuracao-inicial-taxonomia-titulo"
                aria-describedby="configuracao-inicial-taxonomia-descricao"
            >
                <header className={estilos.cabecalho}>
                    <div>
                        <p className={estilos.sobrelinha}>Configuração inicial</p>
                        <h2 className={estilos.titulo} id="configuracao-inicial-taxonomia-titulo">
                            Configurar taxonomia
                        </h2>
                        <p className={estilos.descricao} id="configuracao-inicial-taxonomia-descricao">
                            Escolha a estrutura inicial de etapas e marcos para {empreendimentoNome}.
                        </p>
                    </div>
                    <button className={estilos.fechar} type="button" onClick={onClose} aria-label="Fechar configuração da taxonomia">
                        <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                </header>
                <div className={estilos.corpo}>
                    <TaxonomyConfiguration
                        empreendimentoId={empreendimentoId}
                        onConfigured={onConfigured}
                    />
                </div>
            </section>
        </div>,
        document.body,
    );
}
