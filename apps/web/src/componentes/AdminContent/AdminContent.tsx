import type { ReactNode } from "react";

type AdminContentProps = {
    children: ReactNode;
};

export default function AdminContent({ children }: AdminContentProps) {
    return (
        <main className="admin-content min-w-0 w-full flex-1 px-[clamp(24px,5vw,72px)] py-[clamp(30px,4vw,48px)] max-[760px]:px-5 max-[760px]:py-[30px] max-[480px]:px-4 max-[480px]:py-6" id="conteudo-principal">
            <div className="admin-content__container mx-auto w-full max-w-[1440px]">
                {children}
            </div>
        </main>
    );
}
