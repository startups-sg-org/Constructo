import type { ZodType } from "zod";

export type ActionError = {
    erro: string;
    campos?: Record<string, string>;
};

export function validarFormulario<T>(
    schema: ZodType<T>,
    dados: Record<string, FormDataEntryValue | boolean>,
): { dados: T; erro?: never } | { dados?: never; erro: ActionError } {
    const resultado = schema.safeParse(dados);

    if (resultado.success) return { dados: resultado.data };

    const campos: Record<string, string> = {};

    for (const issue of resultado.error.issues) {
        const campo = issue.path[0];
        if (typeof campo === "string" && !campos[campo]) campos[campo] = issue.message;
    }

    return {
        erro: {
            erro: resultado.error.issues[0]?.message ?? "Confira os dados informados.",
            campos,
        },
    };
}

export function mensagemDeErro(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}
