import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import type { MarcoComProtocolo, ItemProtocolo } from "@constructo/shared";
import IndicadorProtocolo from "../../../componentes/IndicadorProtocolo";
import { registrarEvidenciaNoMarco } from "../../../features/marcos/marcos.service";

export type ChecklistCapturaProps = {
  marcoInicial?: MarcoComProtocolo;
};

function useSafeLoaderData<T>(): T | undefined {
  try {
    return useLoaderData() as T;
  } catch {
    return undefined;
  }
}

export default function ChecklistCaptura({ marcoInicial }: ChecklistCapturaProps) {
  const dadosLoader = useSafeLoaderData<MarcoComProtocolo>();
  const [marco, setMarco] = useState<MarcoComProtocolo | undefined>(marcoInicial || dadosLoader);

  const [notificacao, setNotificacao] = useState<string | null>(null);

  if (!marco) {
    return <div>Marco não encontrado.</div>;
  }

  const handleUpload = async (item: ItemProtocolo) => {
    try {
      const atualizado = await registrarEvidenciaNoMarco(marco.id, item.id);
      setMarco(atualizado);
      setNotificacao(`Evidência capturada com sucesso: ${item.nome}!`);
      setTimeout(() => setNotificacao(null), 4000);
    } catch {
      // erro tratado silenciosamente no mock
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} data-testid="checklist-captura-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/admin/marcos/${marco.id}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
          ← Voltar para Detalhes do Marco
        </Link>
      </div>

      {notificacao && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "8px",
            color: "#065f46",
            fontSize: "0.875rem",
          }}
          role="alert"
          data-testid="notificacao-checklist"
        >
          {notificacao}
        </div>
      )}


      <IndicadorProtocolo
        nomeMarco={marco.nome}
        protocolo={marco.protocolo}
        variante="checklist"
        onUploadEvidencia={handleUpload}
      />
    </div>
  );
}
