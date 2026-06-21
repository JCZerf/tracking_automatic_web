import type { FormEventHandler } from "react";

import type { RecentSearch } from "../storage/recentSearches";
import { formatEventDate } from "../utils/date";
import { ConfirmationModal } from "./ConfirmationModal";
import { LoadingState } from "./LoadingState";

type TrackingSearchViewProps = {
  code: string;
  error: string;
  loading: boolean;
  recentSearches: RecentSearch[];
  onClearRecentSearches: () => void;
  onCodeChange: (code: string) => void;
  onRecentSearch: (code: string) => void;
  onRemoveRecentSearch: (code: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  pendingRemovalCode?: string | null;
  onConfirmRemoval: () => void;
  onCancelRemoval: () => void;
};

export function TrackingSearchView({
  code,
  error,
  loading,
  recentSearches,
  onClearRecentSearches,
  onCodeChange,
  onRecentSearch,
  onRemoveRecentSearch,
  onSubmit,
  pendingRemovalCode,
  onConfirmRemoval,
  onCancelRemoval,
}: TrackingSearchViewProps) {
  return (
    <section className="tracker-panel tracker-panel--search">
      <div className="tracker-header">
        <p className="eyebrow">Consultar objeto</p>
        <h1>Buscar rastreio</h1>
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
      <p className="privacy-note privacy-note--inline">
        Não armazenamos seus códigos em nossos servidores; os códigos usados
        ficam salvos apenas localmente no seu navegador.
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
                <div className="recent-search-item">
                  <button
                    type="button"
                    className="recent-search-link"
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
                  <button
                    type="button"
                    className="recent-search-remove"
                    onClick={() => onRemoveRecentSearch(search.trackingCode)}
                    aria-label={`Excluir ${search.trackingCode}`}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmationModal
        isOpen={Boolean(pendingRemovalCode)}
        title="Excluir consulta recente?"
        message={`Deseja realmente remover ${pendingRemovalCode ?? "este item"} do histórico?`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        onConfirm={onConfirmRemoval}
        onCancel={onCancelRemoval}
      />
    </section>
  );
}
