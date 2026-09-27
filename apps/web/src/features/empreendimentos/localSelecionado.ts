import type { EstruturaLocal } from "@constructo/shared";

export const LOCAL_SELECIONADO_PARAM = "localId";

export type LocalSelecionado = {
    local: EstruturaLocal;
    caminho: EstruturaLocal[];
};

export function obterLocalSelecionadoId(url: string | URL): number | null {
    const valor = new URL(url).searchParams.get(LOCAL_SELECIONADO_PARAM);
    if (valor === null || !/^\d+$/.test(valor)) return null;

    const id = Number(valor);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function encontrarLocalSelecionado(
    estrutura: EstruturaLocal[],
    localId: number | null,
): LocalSelecionado | null {
    if (localId === null) return null;

    for (const local of estrutura) {
        if (local.id === localId) return { local, caminho: [local] };

        const descendente = encontrarLocalSelecionado(local.filhos, localId);
        if (descendente) {
            return {
                local: descendente.local,
                caminho: [local, ...descendente.caminho],
            };
        }
    }

    return null;
}
