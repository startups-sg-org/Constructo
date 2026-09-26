import type { PapelUsuario } from "@constructo/shared";

export function obterDestinoAposLogin(url: string, papel: PapelUsuario): string {
    if (papel === "COMPRADOR") return "/";

    const redirectTo = new URL(url).searchParams.get("redirectTo");

    return redirectTo === "/admin" || redirectTo?.startsWith("/admin/")
        ? redirectTo
        : "/admin";
}
