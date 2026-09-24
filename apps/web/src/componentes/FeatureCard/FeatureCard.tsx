import type { ReactNode } from "react";
import "./FeatureCard.css";

export type FeatureCardProps = {
    icone: ReactNode;
    titulo: string;
    descricao: string;
};

export default function FeatureCard({
    icone,
    titulo,
    descricao
}: FeatureCardProps) {
    return (
        <article className="feature-card">
            <div className="feature-card__icone" aria-hidden="true">
                {icone}
            </div>
            <h3 className="feature-card__titulo">{titulo}</h3>
            <p className="feature-card__descricao">{descricao}</p>
        </article>
    );
}
