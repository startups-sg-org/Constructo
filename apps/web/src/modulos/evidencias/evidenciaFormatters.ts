export function formatarDataCaptura(valor: string): string {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Data não informada";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(data);
}
