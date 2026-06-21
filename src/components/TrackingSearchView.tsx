import type { FormEventHandler } from "react";

import type { RecentSearch } from "../storage/recentSearches";
import { formatEventDate } from "../utils/date";
import { LoadingState } from "./LoadingState";

type TrackingSearchViewProps = {
  code: string;
  error: string;
  loading: boolean;
  recentSearches: RecentSearch[];
  onClearRecentSearches: () => void;
  onCodeChange: (code: string) => void;
  onRecentSearch: (code: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function TrackingSearchView({
  code,
  error,
  loading,
  recentSearches,
  onClearRecentSearches,
  onCodeChange,
  onRecentSearch,
  onSubmit,
}: TrackingSearchViewProps) {
  return (
    <section className="tracker-panel">
      <div className="tracker-header">
        <p className="eyebrow">Rastreamento</p>
        <h1>Consultar objeto</h1>
        <p>
          Informe até 20 códigos de rastreio, separados por vírgula, para
          acompanhar suas entregas.
        </p>
      </div>

      <form className="tracker-form" onSubmit={onSubmit}>
        <input
          type="text"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="Ex.: TJ000000000BR, AP000000000BR"
          aria-label="Código de rastreio"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Buscar"}
        </button>
      </form>
      <p className="tracking-code-hint">
        Para consultar mais de um objeto, separe os códigos por vírgula.
      </p>

      {error && <div className="message error">{error}</div>}
      {loading && <LoadingState />}

      {!loading && recentSearches.length > 0 && (
        <section className="recent-searches">
          <div className="recent-searches-header">
            <div>
              <h2>Consultas recentes</h2>
              <p>Consulte novamente para atualizar o status da entrega.</p>
            </div>
            <button type="button" onClick={onClearRecentSearches}>
              Limpar histórico
            </button>
          </div>

          <ul>
            {recentSearches.map((search) => (
              <li key={search.trackingCode}>
                <button
                  type="button"
                  onClick={() => onRecentSearch(search.trackingCode)}
                >
                  <span>
                    <strong>{search.trackingCode}</strong>
                    <small>
                      Consultado em {formatEventDate(search.searchedAt)}
                    </small>
                  </span>
                  <span className="search-again">Consultar novamente</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
