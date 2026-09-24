import type { ReactNode } from "react";
import "./AdminContent.css";

type AdminContentProps = {
    children: ReactNode;
};

export default function AdminContent({ children }: AdminContentProps) {
    return (
        <main className="admin-content" id="conteudo-principal">
            <div className="admin-content__container">
                {children}
            </div>
        </main>
    );
}
