import { useState, useId, type ChangeEvent, type ReactNode } from "react";
import {
  StatusProtocolo,
  calcularResumoProtocolo,
  type ItemProtocolo,
  type ProtocoloEvidencias,
  type ResumoProtocolo,
} from "@constructo/shared";
import "./IndicadorProtocolo.css";

export type IndicadorProtocoloVariante = "badge" | "compact" | "card" | "checklist";

export type IndicadorProtocoloProps = {
  /** Nome do marco associado (ex: "Impermeabilização") */
  nomeMarco?: string;
  /** Objeto de protocolo com a lista de itens/requisitos */
  protocolo?: ProtocoloEvidencias | null;
  /** Status explícito (se não passado, calcula a partir do protocolo) */
  status?: StatusProtocolo;
  /** Quantidade de evidências registradas/atendidas */
  totalRegistrado?: number;
  /** Quantidade total de evidências necessárias pelo protocolo */
  totalNecessario?: number;
  /** Lista de itens ou nomes de pendências */
  pendencias?: Array<string | ItemProtocolo>;
  /** Todos os itens do protocolo (opcional) */
  itens?: ItemProtocolo[];
  /** Variante visual de exibição */
  variante?: IndicadorProtocoloVariante;
  /** Se as pendências iniciam abertas na visualização compacta */
  pendenciasAbertasInicial?: boolean;
  /** Callback executado após o upload/registro de uma nova evidência */
  onUploadEvidencia?: (item: ItemProtocolo, file?: File) => void | Promise<void>;
  /** Elemento extra ou ações customizadas */
  acoesExtras?: ReactNode;
  /** ID para propósitos de teste ou acessibilidade */
  id?: string;
};

export default function IndicadorProtocolo({
  nomeMarco,
  protocolo,
  status: statusProp,
  totalRegistrado: totalRegistradoProp,
  totalNecessario: totalNecessarioProp,
  pendencias: pendenciasProp,
  itens: itensProp,
  variante = "compact",
  pendenciasAbertasInicial = false,
  onUploadEvidencia,
  acoesExtras,
  id,
}: IndicadorProtocoloProps) {
  const [pendenciasAbertas, setPendenciasAbertas] = useState(pendenciasAbertasInicial);
  const [uploadEmAndamento, setUploadEmAndamento] = useState<string | number | null>(null);
  const internalId = useId();
  const componenteId = id || internalId;

  // Calcula o resumo dinâmico a partir do protocolo ou utiliza as props fornecidas
  let resumo: ResumoProtocolo;

  if (protocolo !== undefined) {
    resumo = calcularResumoProtocolo(protocolo);
  } else {
    const totalNec = totalNecessarioProp ?? 0;
    const totalReg = totalRegistradoProp ?? 0;
    let statusCalculado: StatusProtocolo = statusProp ?? StatusProtocolo.SEM_PROTOCOLO;

    if (!statusProp) {
      if (totalNec <= 0) {
        statusCalculado = StatusProtocolo.SEM_PROTOCOLO;
      } else if (totalReg >= totalNec) {
        statusCalculado = StatusProtocolo.COMPLETO;
      } else {
        statusCalculado = StatusProtocolo.INCOMPLETO;
      }
    }

    const itensConvertidos: ItemProtocolo[] = (itensProp || []).map((item) => ({
      ...item,
    }));

    const pendenciasFormatadas: ItemProtocolo[] = (pendenciasProp || []).map((p, idx) => {
      if (typeof p === "string") {
        return {
          id: `pendencia-${idx}`,
          nome: p,
          atendido: false,
          obrigatorio: true,
        };
      }
      return p;
    });

    resumo = {
      status: statusCalculado,
      totalNecessario: totalNec,
      totalRegistrado: totalReg,
      pendencias: pendenciasFormatadas,
      itens: itensConvertidos,
      percentualAtendido: totalNec > 0 ? Math.round((totalReg / totalNec) * 100) : 0,
    };
  }

  const { status, totalRegistrado, totalNecessario, pendencias, itens, percentualAtendido } = resumo;

  const getStatusInfo = (st: StatusProtocolo) => {
    switch (st) {
      case StatusProtocolo.COMPLETO:
        return {
          rotulo: "Completo",
          classeModificadora: "indicador-protocolo--completo",
          descricaoAcessivel: `Protocolo completo: ${totalRegistrado} de ${totalNecessario} evidências atendidas`,
          icone: "✓",
        };
      case StatusProtocolo.INCOMPLETO:
        return {
          rotulo: "Incompleto",
          classeModificadora: "indicador-protocolo--incompleto",
          descricaoAcessivel: `Protocolo incompleto: ${totalRegistrado} de ${totalNecessario} evidências. ${pendencias.length} pendências`,
          icone: "!",
        };
      case StatusProtocolo.SEM_PROTOCOLO:
      default:
        return {
          rotulo: "Sem protocolo",
          classeModificadora: "indicador-protocolo--sem-protocolo",
          descricaoAcessivel: "Marco sem protocolo de evidências cadastrado",
          icone: "—",
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  const handleFileChange = async (item: ItemProtocolo, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (onUploadEvidencia) {
      setUploadEmAndamento(item.id);
      try {
        await onUploadEvidencia(item, file);
      } finally {
        setUploadEmAndamento(null);
      }
    }
  };

  // Renderização: Variante BADGE simples
  if (variante === "badge") {
    return (
      <span
        id={componenteId}
        className={`indicador-protocolo indicador-protocolo__badge ${statusInfo.classeModificadora}`}
        role="status"
        aria-label={statusInfo.descricaoAcessivel}
        data-testid={`indicador-protocolo-badge-${status.toLowerCase()}`}
      >
        <span className="indicador-protocolo__badge-dot" aria-hidden="true" />
        <span>{statusInfo.rotulo}</span>
        {status !== StatusProtocolo.SEM_PROTOCOLO && (
          <span className="indicador-protocolo__badge-count">
            {totalRegistrado} / {totalNecessario}
          </span>
        )}
      </span>
    );
  }

  // Renderização: Variante COMPACT (Lista de Marcos)
  if (variante === "compact") {
    return (
      <div
        id={componenteId}
        className={`indicador-protocolo indicador-protocolo--compact ${statusInfo.classeModificadora}`}
        data-testid="indicador-protocolo-compact"
      >
        <div className="indicador-protocolo__compact-header">
          <div className="indicador-protocolo__compact-info">
            {nomeMarco && <strong className="indicador-protocolo__marco-titulo">{nomeMarco}</strong>}
            <span
              className={`indicador-protocolo__badge ${statusInfo.classeModificadora}`}
              role="status"
              data-testid="indicador-status-badge"
            >
              <span className="indicador-protocolo__badge-dot" aria-hidden="true" />
              <span>{statusInfo.rotulo}</span>
            </span>
            {status !== StatusProtocolo.SEM_PROTOCOLO && (
              <span
                className="indicador-protocolo__compact-quantidades"
                data-testid="indicador-quantidades"
              >
                {totalRegistrado} / {totalNecessario} evidências
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {status === StatusProtocolo.INCOMPLETO && pendencias.length > 0 && (
              <button
                type="button"
                className="indicador-protocolo__toggle-pendencias"
                onClick={() => setPendenciasAbertas((prev) => !prev)}
                aria-expanded={pendenciasAbertas}
                aria-controls={`pendencias-${componenteId}`}
                data-testid="btn-toggle-pendencias"
              >
                {pendenciasAbertas ? "Ocultar pendências" : `Ver pendências (${pendencias.length})`}
              </button>
            )}
            {acoesExtras}
          </div>
        </div>

        {status === StatusProtocolo.INCOMPLETO && pendenciasAbertas && pendencias.length > 0 && (
          <div
            id={`pendencias-${componenteId}`}
            className="indicador-protocolo__pendencias-container"
            data-testid="container-pendencias"
          >
            <h4 className="indicador-protocolo__pendencias-titulo">
              <span>Pendências ({pendencias.length})</span>
            </h4>
            <ul className="indicador-protocolo__lista-pendencias" data-testid="lista-pendencias">
              {pendencias.map((pendencia) => (
                <li
                  key={String(pendencia.id)}
                  className="indicador-protocolo__item-pendencia"
                  data-testid="item-pendencia"
                >
                  <div className="indicador-protocolo__item-info">
                    <span
                      className="indicador-protocolo__item-status-icone indicador-protocolo__item-status-icone--pendente"
                      aria-hidden="true"
                    >
                      !
                    </span>
                    <span>{pendencia.nome}</span>
                  </div>
                  {onUploadEvidencia && (
                    <label className="indicador-protocolo__botao-upload">
                      <input
                        type="file"
                        aria-label={`Enviar evidência para ${pendencia.nome}`}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(pendencia, e)}
                        disabled={uploadEmAndamento === pendencia.id}
                      />
                      {uploadEmAndamento === pendencia.id ? "Enviando..." : "Enviar Evidência"}
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Renderização: Variante CHECKLIST (Checklist de Captura)
  if (variante === "checklist") {
    const listaExibicao = itens.length > 0 ? itens : pendencias;

    return (
      <section
        id={componenteId}
        className={`indicador-protocolo indicador-protocolo--checklist ${statusInfo.classeModificadora}`}
        aria-labelledby={`titulo-checklist-${componenteId}`}
        data-testid="indicador-protocolo-checklist"
      >
        <div className="indicador-protocolo__checklist-resumo">
          <div>
            <h3 id={`titulo-checklist-${componenteId}`} className="indicador-protocolo__marco-titulo">
              {nomeMarco ? `Checklist de Captura: ${nomeMarco}` : "Checklist de Captura"}
            </h3>
            <p className="indicador-protocolo__marco-subtitulo">
              {status === StatusProtocolo.SEM_PROTOCOLO
                ? "Este marco não possui itens de evidência obrigatórios definidos."
                : `${totalRegistrado} de ${totalNecessario} evidências registradas (${percentualAtendido}%)`}
            </p>
          </div>
          <span
            className={`indicador-protocolo__badge ${statusInfo.classeModificadora}`}
            role="status"
            data-testid="indicador-status-badge"
          >
            <span className="indicador-protocolo__badge-dot" aria-hidden="true" />
            <span>{statusInfo.rotulo}</span>
          </span>
        </div>

        {status !== StatusProtocolo.SEM_PROTOCOLO && (
          <div className="indicador-protocolo__progresso-wrapper">
            <div className="indicador-protocolo__barra-trilho">
              <div
                className="indicador-protocolo__barra-preenchimento"
                style={{ width: `${percentualAtendido}%` }}
                role="progressbar"
                aria-valuenow={totalRegistrado}
                aria-valuemin={0}
                aria-valuemax={totalNecessario}
              />
            </div>
          </div>
        )}

        {listaExibicao.length > 0 && (
          <div className="indicador-protocolo__checklist-itens" data-testid="checklist-itens">
            {listaExibicao.map((item) => {
              const estaAtendido = Boolean(item.atendido);
              return (
                <div
                  key={String(item.id)}
                  className={`indicador-protocolo__checklist-item ${
                    estaAtendido
                      ? "indicador-protocolo__checklist-item--atendido"
                      : "indicador-protocolo__checklist-item--pendente"
                  }`}
                  data-testid={`checklist-item-${String(item.id)}`}
                >
                  <div className="indicador-protocolo__item-info">
                    <span
                      className={`indicador-protocolo__item-status-icone ${
                        estaAtendido
                          ? "indicador-protocolo__item-status-icone--atendido"
                          : "indicador-protocolo__item-status-icone--pendente"
                      }`}
                      aria-hidden="true"
                    >
                      {estaAtendido ? "✓" : "!"}
                    </span>
                    <div className="indicador-protocolo__checklist-item-detalhes">
                      <span className="indicador-protocolo__checklist-item-nome">{item.nome}</span>
                      {item.descricao && (
                        <span className="indicador-protocolo__checklist-item-subtexto">
                          {item.descricao}
                        </span>
                      )}
                      {estaAtendido && (
                        <span
                          style={{ fontSize: "0.725rem", color: "#059669", fontWeight: 600 }}
                        >
                          Evidência capturada
                        </span>
                      )}
                    </div>
                  </div>

                  {!estaAtendido && onUploadEvidencia && (
                    <label className="indicador-protocolo__botao-upload">
                      <input
                        type="file"
                        aria-label={`Capturar evidência para ${item.nome}`}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(item, e)}
                        disabled={uploadEmAndamento === item.id}
                      />
                      {uploadEmAndamento === item.id ? "Enviando..." : "Capturar Foto / Upload"}
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // Renderização: Variante CARD (Página do Marco / Painel Administrativo)
  return (
    <article
      id={componenteId}
      className={`indicador-protocolo indicador-protocolo--card ${statusInfo.classeModificadora}`}
      data-testid="indicador-protocolo-card"
    >
      <div className="indicador-protocolo__card-header">
        <div>
          {nomeMarco && (
            <h3 className="indicador-protocolo__marco-titulo" data-testid="marco-nome">
              {nomeMarco}
            </h3>
          )}
          <p className="indicador-protocolo__marco-subtitulo">Status do protocolo de evidências</p>
        </div>
        <span
          className={`indicador-protocolo__badge ${statusInfo.classeModificadora}`}
          role="status"
          data-testid="indicador-status-badge"
        >
          <span className="indicador-protocolo__badge-dot" aria-hidden="true" />
          <span>{statusInfo.rotulo}</span>
        </span>
      </div>

      {status !== StatusProtocolo.SEM_PROTOCOLO ? (
        <>
          <div className="indicador-protocolo__progresso-wrapper">
            <div className="indicador-protocolo__progresso-info">
              <span data-testid="indicador-quantidades">
                {totalRegistrado} / {totalNecessario} evidências
              </span>
              <span>{percentualAtendido}%</span>
            </div>
            <div className="indicador-protocolo__barra-trilho">
              <div
                className="indicador-protocolo__barra-preenchimento"
                style={{ width: `${percentualAtendido}%` }}
                role="progressbar"
                aria-valuenow={totalRegistrado}
                aria-valuemin={0}
                aria-valuemax={totalNecessario}
              />
            </div>
          </div>

          {pendencias.length > 0 && (
            <div className="indicador-protocolo__pendencias-container" data-testid="container-pendencias">
              <h4 className="indicador-protocolo__pendencias-titulo">
                <span>Pendências ({pendencias.length})</span>
              </h4>
              <ul className="indicador-protocolo__lista-pendencias" data-testid="lista-pendencias">
                {pendencias.map((pendencia) => (
                  <li
                    key={String(pendencia.id)}
                    className="indicador-protocolo__item-pendencia"
                    data-testid="item-pendencia"
                  >
                    <div className="indicador-protocolo__item-info">
                      <span
                        className="indicador-protocolo__item-status-icone indicador-protocolo__item-status-icone--pendente"
                        aria-hidden="true"
                      >
                        !
                      </span>
                      <span>{pendencia.nome}</span>
                    </div>
                    {onUploadEvidencia && (
                      <label className="indicador-protocolo__botao-upload">
                        <input
                          type="file"
                          aria-label={`Enviar evidência para ${pendencia.nome}`}
                          style={{ display: "none" }}
                          onChange={(e) => handleFileChange(pendencia, e)}
                          disabled={uploadEmAndamento === pendencia.id}
                        />
                        {uploadEmAndamento === pendencia.id ? "Enviando..." : "Enviar Evidência"}
                      </label>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            color: "#64748b",
            fontSize: "0.85rem",
          }}
          data-testid="sem-protocolo-mensagem"
        >
          Nenhum protocolo de evidências cadastrado para este marco.
        </div>
      )}

      {acoesExtras && <div style={{ marginTop: "8px" }}>{acoesExtras}</div>}
    </article>
  );
}
