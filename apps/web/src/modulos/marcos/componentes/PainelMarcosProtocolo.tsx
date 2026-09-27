import { Link } from "react-router-dom";
import {
  StatusProtocolo,
  calcularResumoProtocolo,
  type MarcoComProtocolo,
} from "@constructo/shared";
import IndicadorProtocolo from "../../../componentes/IndicadorProtocolo";
import { marcosMock } from "../../../features/marcos/marcos.service";

export type PainelMarcosProtocoloProps = {
  marcos?: MarcoComProtocolo[];
};

export default function PainelMarcosProtocolo({ marcos = marcosMock }: PainelMarcosProtocoloProps) {
  const marcosComResumo = marcos.map((marco) => ({
    marco,
    resumo: calcularResumoProtocolo(marco.protocolo),
  }));

  const incompletos = marcosComResumo.filter(
    (m) => m.resumo.status === StatusProtocolo.INCOMPLETO
  );

  return (
    <section
      className="card"
      style={{ marginTop: "24px" }}
      aria-labelledby="titulo-painel-marcos"
      data-testid="painel-marcos-protocolo"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 id="titulo-painel-marcos" style={{ margin: 0, fontSize: "1.15rem" }}>
            Protocolos de Evidências dos Marcos
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>
            Identificação de pendências para liberação e conclusão de marcos
          </p>
        </div>
        <Link to="/admin/marcos" className="botao secundario" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
          Ver Todos os Marcos ({marcos.length})
        </Link>
      </div>

      {incompletos.length === 0 ? (
        <p style={{ color: "#059669", fontSize: "0.9rem" }}>
          ✓ Todos os protocolos com requisitos definidos estão completamente atendidos!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "0.85rem", color: "#b45309", fontWeight: 600 }}>
            ⚠️ {incompletos.length} marcos possuem protocolos com evidências pendentes:
          </p>
          {incompletos.map(({ marco }) => (
            <div
              key={String(marco.id)}
              style={{
                border: "1px solid #fed7aa",
                borderRadius: "10px",
                padding: "12px",
                backgroundColor: "#fffaf5",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{marco.nome}</strong>
                <Link
                  to={`/admin/marcos/${marco.id}/checklist`}
                  style={{ color: "#2563eb", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}
                >
                  Abrir Checklist →
                </Link>
              </div>

              <IndicadorProtocolo
                protocolo={marco.protocolo}
                variante="compact"
                pendenciasAbertasInicial={true}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
