export function obterDestinoAposLogin(url: string): string {
    const redirectTo = new URL(url).searchParams.get("redirectTo");

    return redirectTo === "/admin" || redirectTo?.startsWith("/admin/")
        ? redirectTo
        : "/admin";
}
