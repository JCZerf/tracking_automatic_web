import { useState } from "react";

import type { TrackingResponse } from "../domain/tracking";
import { formatEventDate } from "../utils/date";

type TrackingResultsViewProps = {
  response: TrackingResponse;
  onBack: () => void;
  onNewSearch: () => void;
};

export function TrackingResultsView({
  response,
  onBack,
  onNewSearch,
}: TrackingResultsViewProps) {
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const activeResult =
    response.results[activeResultIndex] ?? response.results[0];

  return (
    <section className="tracker-panel result-view" aria-live="polite">
      <div className="result-page-header">
        <div>
          <p className="eyebrow">Rastreamento</p>
          <h1>
            {response.results.length > 1
              ? `${response.results.length} objetos encontrados`
              : "Resultado da consulta"}
          </h1>
          <p>Acompanhe abaixo o histórico completo de cada objeto.</p>
        </div>
        <button className="back-button" type="button" onClick={onBack}>
          ← Voltar
        </button>
      </div>

      {response.results.length > 1 && (
        <div
          className="result-tabs"
          role="tablist"
          aria-label="Objetos consultados"
        >
          {response.results.map((trackingResult, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeResultIndex === index}
              className={activeResultIndex === index ? "is-active" : undefined}
              key={trackingResult.tracking_code}
              onClick={() => setActiveResultIndex(index)}
            >
              <span>Objeto {index + 1}</span>
              <strong>{trackingResult.tracking_code}</strong>
            </button>
          ))}
        </div>
      )}

      <section
        className="result-panel"
        role={response.results.length > 1 ? "tabpanel" : undefined}
      >
        <div className="result-summary">
          <div>
            <span className="result-label">Código de rastreio</span>
            <strong>{activeResult.tracking_code}</strong>
          </div>
          {activeResult.status === "success" && (
            <div>
              <span className="result-label">Serviço</span>
              <strong>{activeResult.service}</strong>
            </div>
          )}
        </div>

        <div
          className={`current-status${
            activeResult.status === "not_found" ? " is-not-found" : ""
          }`}
        >
          <span>Status atual</span>
          <strong>
            {activeResult.status === "success"
              ? activeResult.current_status
              : activeResult.message}
          </strong>
        </div>

        {activeResult.status === "success" && (
          <div className="tracking-history">
            <h2>Histórico do objeto</h2>

            {activeResult.events.length > 0 ? (
              <ol className="timeline">
                {activeResult.events.map((trackingEvent, index) => (
                  <li
                    key={`${trackingEvent.occurred_at}-${index}`}
                    className={index === 0 ? "is-current" : undefined}
                  >
                    <div className="event-header">
                      <strong>{trackingEvent.description}</strong>
                      <time dateTime={trackingEvent.occurred_at}>
                        {formatEventDate(trackingEvent.occurred_at)}
                      </time>
                    </div>
                    {trackingEvent.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="no-events">Nenhum evento disponível.</p>
            )}
          </div>
        )}
      </section>

      <div className="result-actions">
        <button type="button" onClick={onBack}>
          Voltar
        </button>
        <button className="primary-action" type="button" onClick={onNewSearch}>
          Nova consulta
        </button>
      </div>
    </section>
  );
}
