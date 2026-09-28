import type { ReactNode } from "react";

export type TomBadgeStatus =
    | "informativo"
    | "alerta"
    | "sucesso"
    | "neutro"
    | "erro";

type BadgeStatusProps = {
    children: ReactNode;
    tom?: TomBadgeStatus;
    className?: string;
};

export default function BadgeStatus({
    children,
    tom = "neutro",
    className,
}: BadgeStatusProps) {
    const classes = ["badge-status", `badge-status--${tom}`, className]
        .filter(Boolean)
        .join(" ");

    return <span className={classes}>{children}</span>;
}
