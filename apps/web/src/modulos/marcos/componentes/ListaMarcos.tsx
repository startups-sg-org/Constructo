import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import {
  StatusProtocolo,
  calcularResumoProtocolo,
  type MarcoComProtocolo,
} from "@constructo/shared";
import IndicadorProtocolo from "../../../componentes/IndicadorProtocolo";
import "./ListaMarcos.css";

export type ListaMarcosProps = {
  marcosIniciais?: MarcoComProtocolo[];
};

function useSafeLoaderData<T>(): T | undefined {
  try {
    return useLoaderData() as T;
  } catch {
    return undefined;
  }
}

export default function ListaMarcos({ marcosIniciais }: ListaMarcosProps) {
  const dadosLoader = useSafeLoaderData<MarcoComProtocolo[]>();
  const lista = marcosIniciais || dadosLoader || [];


  const [filtro, setFiltro] = useState<string>("TODOS");

  const marcosComStatus = lista.map((marco) => {
    const resumo = calcularResumoProtocolo(marco.protocolo);
    return {
      marco,
      resumo,
    };
  });

  const marcosFiltrados = marcosComStatus.filter(({ resumo }) => {
    if (filtro === "TODOS") return true;
    return resumo.status === filtro;
  });

  const contagens = {
    TODOS: lista.length,
    COMPLETO: marcosComStatus.filter((m) => m.resumo.status === StatusProtocolo.COMPLETO).length,
    INCOMPLETO: marcosComStatus.filter((m) => m.resumo.status === StatusProtocolo.INCOMPLETO).length,
    SEM_PROTOCOLO: marcosComStatus.filter((m) => m.resumo.status === StatusProtocolo.SEM_PROTOCOLO).length,
  };

  return (
    <div className="lista-marcos-container" data-testid="lista-marcos-view">
      <div className="lista-marcos-filtros" role="tablist" aria-label="Filtrar por protocolo">
        <button
          type="button"
          role="tab"
          aria-selected={filtro === "TODOS"}
          className={`lista-marcos-filtro-btn ${filtro === "TODOS" ? "ativo" : ""}`}
          onClick={() => setFiltro("TODOS")}
        >
          Todos ({contagens.TODOS})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filtro === StatusProtocolo.INCOMPLETO}
          className={`lista-marcos-filtro-btn ${filtro === StatusProtocolo.INCOMPLETO ? "ativo" : ""}`}
          onClick={() => setFiltro(StatusProtocolo.INCOMPLETO)}
        >
          Incompletos ({contagens.INCOMPLETO})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filtro === StatusProtocolo.COMPLETO}
          className={`lista-marcos-filtro-btn ${filtro === StatusProtocolo.COMPLETO ? "ativo" : ""}`}
          onClick={() => setFiltro(StatusProtocolo.COMPLETO)}
        >
          Completos ({contagens.COMPLETO})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filtro === StatusProtocolo.SEM_PROTOCOLO}
          className={`lista-marcos-filtro-btn ${filtro === StatusProtocolo.SEM_PROTOCOLO ? "ativo" : ""}`}
          onClick={() => setFiltro(StatusProtocolo.SEM_PROTOCOLO)}
        >
          Sem Protocolo ({contagens.SEM_PROTOCOLO})
        </button>
      </div>

      <div className="lista-marcos-grid" data-testid="grid-marcos">
        {marcosFiltrados.length === 0 ? (
          <p style={{ color: "#64748b", padding: "20px 0" }}>Nenhum marco encontrado neste filtro.</p>
        ) : (
          marcosFiltrados.map(({ marco }) => (
            <div key={String(marco.id)} className="lista-marcos-item-card" data-testid={`marco-item-${marco.id}`}>
              <div className="lista-marcos-item-header">
                <span className="lista-marcos-item-titulo">{marco.nome}</span>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <Link to={`/admin/marcos/${marco.id}`} className="lista-marcos-item-link">
                    Ver Detalhes
                  </Link>
                  {marco.protocolo && (
                    <Link
                      to={`/admin/marcos/${marco.id}/checklist`}
                      className="lista-marcos-item-link"
                      style={{ color: "#059669" }}
                    >
                      Checklist de Captura
                    </Link>
                  )}
                </div>
              </div>

              <IndicadorProtocolo
                protocolo={marco.protocolo}
                variante="compact"
                nomeMarco={undefined}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
