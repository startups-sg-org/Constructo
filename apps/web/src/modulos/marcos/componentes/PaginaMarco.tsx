import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import type { MarcoComProtocolo, ItemProtocolo } from "@constructo/shared";
import IndicadorProtocolo from "../../../componentes/IndicadorProtocolo";
import { registrarEvidenciaNoMarco } from "../../../features/marcos/marcos.service";

export type PaginaMarcoProps = {
  marcoInicial?: MarcoComProtocolo;
};

function useSafeLoaderData<T>(): T | undefined {
  try {
    return useLoaderData() as T;
  } catch {
    return undefined;
  }
}

export default function PaginaMarco({ marcoInicial }: PaginaMarcoProps) {
  const dadosLoader = useSafeLoaderData<MarcoComProtocolo>();
  const [marco, setMarco] = useState<MarcoComProtocolo | undefined>(marcoInicial || dadosLoader);

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  if (!marco) {
    return <div>Marco não encontrado.</div>;
  }

  const handleUpload = async (item: ItemProtocolo) => {
    try {
      const atualizado = await registrarEvidenciaNoMarco(marco.id, item.id);
      setMarco(atualizado);
      setMensagemSucesso(`Evidência anexada com sucesso para "${item.nome}"!`);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch {
      // erro tratado silenciosamente no mock
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} data-testid="pagina-marco-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/admin/marcos" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
          ← Voltar para Lista de Marcos
        </Link>
        {marco.protocolo && (
          <Link
            to={`/admin/marcos/${marco.id}/checklist`}
            className="botao primario"
            style={{ padding: "8px 16px", fontSize: "0.875rem" }}
          >
            Abrir Checklist de Captura
          </Link>
        )}
      </div>

      {mensagemSucesso && (
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
        >
          {mensagemSucesso}
        </div>
      )}

      {/* Card de Informações Gerais */}
      <div className="card">
        <h2>{marco.nome}</h2>
        {marco.descricaoTecnica && (
          <p style={{ color: "#475569", marginBottom: "8px", fontSize: "0.9rem" }}>
            <strong>Descrição Técnica:</strong> {marco.descricaoTecnica}
          </p>
        )}
        {marco.descricaoCliente && (
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            <strong>Visão Comprador:</strong> {marco.descricaoCliente}
          </p>
        )}
      </div>

      {/* Indicador Detalhado do Protocolo */}
      <IndicadorProtocolo
        nomeMarco={marco.nome}
        protocolo={marco.protocolo}
        variante="card"
        onUploadEvidencia={handleUpload}
      />
    </div>
  );
}
