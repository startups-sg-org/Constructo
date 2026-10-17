import type { ReactNode } from "react";

type AdminContentProps = {
    children: ReactNode;
};

export default function AdminContent({ children }: AdminContentProps) {
    return (
        <main className="admin-content flex min-w-0 w-full flex-1 flex-col items-start gap-4 px-4 pb-6 pt-2" id="conteudo-principal">
            <div className="admin-content__container w-full">
                {children}
            </div>
        </main>
    );
}
