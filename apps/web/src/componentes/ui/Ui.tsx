import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    HTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TableHTMLAttributes,
} from "react";

import { cn } from "../../utils/classes";

type ClassNameProps = { className?: string };

type ContainerProps = HTMLAttributes<HTMLDivElement> & { fluid?: boolean };

export function Container({ className, children, fluid, ...props }: ContainerProps) {
    void fluid;
    return <div className={cn("ui-container", className)} {...props}>{children}</div>;
}

type RowProps = HTMLAttributes<HTMLDivElement>;

export function Row({ className, children, ...props }: RowProps) {
    return <div className={cn("ui-row grid grid-cols-12 gap-3 items-end", className)} {...props}>{children}</div>;
}

type ColProps = HTMLAttributes<HTMLDivElement> & {
    xs?: number;
    sm?: number;
    lg?: number;
};

const colClasses: Record<number, string> = {
    2: "col-span-12 lg:col-span-2",
    3: "col-span-12 sm:col-span-6 lg:col-span-3",
    5: "col-span-12 lg:col-span-5",
    6: "col-span-12 sm:col-span-6",
    12: "col-span-12",
};

export function Col({ xs = 12, sm, lg, className, children, ...props }: ColProps) {
    const classes = [
        colClasses[xs] ?? `col-span-${xs}`,
        sm ? `sm:col-span-${sm}` : undefined,
        lg ? `lg:col-span-${lg}` : undefined,
        className,
    ];

    return <div className={cn(...classes)} {...props}>{children}</div>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ClassNameProps & {
    href?: string;
    variant?: "primary" | "link" | "outline-secondary";
    size?: "sm";
};

export function Button({ href, variant = "primary", size, className, children, ...props }: ButtonProps) {
    const classes = cn(
        "btn inline-flex items-center justify-center gap-2",
        `btn-${variant}`,
        size && `btn-${size}`,
        className,
    );

    if (href) {
        return <a className={classes} href={href} role="button" {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
    }

    return <button className={classes} type={props.type ?? "button"} {...props}>{children}</button>;
}

export function FormGroup({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("form-group", className)} {...props}>{children}</div>;
}

export function FormLabel({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
    return <label className={cn("form-label", className)} {...props}>{children}</label>;
}

export function FormControl({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn("form-control", className)} {...props} />;
}

export function FormSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select className={cn("form-select", className)} {...props}>{children}</select>;
}

export function FormText({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
    return <small className={cn("form-text", className)} {...props}>{children}</small>;
}

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <section className={cn("card", className)} {...props}>{children}</section>;
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("card-body", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("card-title", className)} {...props}>{children}</div>;
}

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
    responsive?: boolean;
    hover?: boolean;
};

export function Table({ responsive = false, hover = false, className, children, ...props }: TableProps) {
    const table = <table className={cn("table", hover && "table-hover", className)} {...props}>{children}</table>;
    return responsive ? <div className="table-responsive">{table}</div> : table;
}

export function VisuallyHidden({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
    return <span className={cn("visually-hidden", className)} {...props}>{children}</span>;
}

export type { ReactNode };
