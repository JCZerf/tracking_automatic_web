import { useState } from "react";
import "./App.css";

type TrackingEvent = {
  description: string;
  details: string[];
  occurred_at: string;
};

type TrackingResponse = {
  tracking_code: string;
  service: string;
  current_status: string;
  events: TrackingEvent[];
};

type RecentSearch = {
  trackingCode: string;
  searchedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const RECENT_SEARCHES_KEY = "tracking-recent-searches";
const MAX_RECENT_SEARCHES = 5;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function isTrackingResponse(data: unknown): data is TrackingResponse {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<TrackingResponse>;

  const hasValidEvents =
    Array.isArray(response.events) &&
    response.events.every(
      (event) =>
        event &&
        typeof event === "object" &&
        typeof event.description === "string" &&
        Array.isArray(event.details) &&
        event.details.every((detail) => typeof detail === "string") &&
        typeof event.occurred_at === "string",
    );

  return (
    typeof response.tracking_code === "string" &&
    typeof response.service === "string" &&
    typeof response.current_status === "string" &&
    hasValidEvents
  );
}

function formatEventDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function loadRecentSearches(): RecentSearch[] {
  try {
    const storedValue: unknown = JSON.parse(
      localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]",
    );

    if (!Array.isArray(storedValue)) return [];

    return storedValue
      .filter(
        (item): item is RecentSearch =>
          item !== null &&
          typeof item === "object" &&
          typeof item.trackingCode === "string" &&
          typeof item.searchedAt === "string",
      )
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function BrandHeader() {
  return (
    <header className="site-header">
      <p>Tracking Automatic</p>
      <span>Acompanhe suas entregas de forma simples, rápida e confiável.</span>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <section className="footer-contacts">
          <h2>Contatos</h2>
          <nav aria-label="Contatos do desenvolvedor">
            <a href="mailto:josecarlosmrlt@outlook.com">
              <span>E-mail</span>
              josecarlosmrlt@outlook.com
            </a>
            <a
              href="https://www.linkedin.com/in/jos%C3%A9-carlos-leite-814a15375"
              target="_blank"
              rel="noreferrer"
            >
              <span>LinkedIn</span>
              José Carlos Leite
            </a>
            <a
              href="https://www.facebook.com/jcarlos.mleite"
              target="_blank"
              rel="noreferrer"
            >
              <span>Facebook</span>
              jcarlos.mleite
            </a>
            <a
              href="https://www.instagram.com/jcarlosmleite"
              target="_blank"
              rel="noreferrer"
            >
              <span>Instagram</span>
              @jcarlosmleite
            </a>
          </nav>
        </section>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tracking Automatic</p>
          <p>Developed by ZERF</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [recentSearches, setRecentSearches] =
    useState<RecentSearch[]>(loadRecentSearches);

  const searchTrackingCode = async (trackingCode: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    setCode(trackingCode);

    try {
      if (!API_BASE_URL) {
        throw new Error("A URL da API não foi configurada.");
      }

      const response = await fetch(
        `${API_BASE_URL}/tracking?code=${encodeURIComponent(trackingCode)}`,
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(
          body?.detail || `Erro ${response.status} ao consultar a API.`,
        );
      }

      const data: unknown = await response.json();

      if (!isTrackingResponse(data)) {
        throw new Error("A API retornou uma resposta em formato inesperado.");
      }

      setRecentSearches((currentSearches) => {
        const updatedSearches = [
          { trackingCode, searchedAt: new Date().toISOString() },
          ...currentSearches.filter(
            (search) => search.trackingCode !== trackingCode,
          ),
        ].slice(0, MAX_RECENT_SEARCHES);

        try {
          localStorage.setItem(
            RECENT_SEARCHES_KEY,
            JSON.stringify(updatedSearches),
          );
        } catch {
          // A consulta continua funcionando se o navegador bloquear o storage.
        }
        return updatedSearches;
      });
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao consultar o rastreio.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trackingCode = code.replace(/\s/g, "").toUpperCase();

    if (!trackingCode) {
      setError("Digite um código de rastreio para continuar.");
      return;
    }

    await searchTrackingCode(trackingCode);
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // O estado da tela ainda pode ser limpo sem acesso ao storage.
    }
    setRecentSearches([]);
  };

  const returnToSearch = (clearCode: boolean) => {
    setResult(null);
    setError("");
    if (clearCode) setCode("");
  };

  if (result) {
    return (
      <main className="app-shell result-screen">
        <BrandHeader />
        <section className="tracker-panel result-view" aria-live="polite">
          <div className="result-page-header">
            <div>
              <p className="eyebrow">Rastreamento</p>
              <h1>Resultado da consulta</h1>
              <p>Acompanhe abaixo o histórico completo do seu objeto.</p>
            </div>
            <button
              className="back-button"
              type="button"
              onClick={() => returnToSearch(false)}
            >
              ← Voltar
            </button>
          </div>

          <section className="result-panel">
            <div className="result-summary">
              <div>
                <span className="result-label">Código de rastreio</span>
                <strong>{result.tracking_code}</strong>
              </div>
              <div>
                <span className="result-label">Serviço</span>
                <strong>{result.service}</strong>
              </div>
            </div>

            <div className="current-status">
              <span>Status atual</span>
              <strong>{result.current_status}</strong>
            </div>

            <div className="tracking-history">
              <h2>Histórico do objeto</h2>

              {result.events.length > 0 ? (
                <ol className="timeline">
                  {result.events.map((trackingEvent, index) => (
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
          </section>

          <div className="result-actions">
            <button type="button" onClick={() => returnToSearch(false)}>
              Voltar
            </button>
            <button
              className="primary-action"
              type="button"
              onClick={() => returnToSearch(true)}
            >
              Nova consulta
            </button>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <BrandHeader />
      <section className="tracker-panel">
        <div className="tracker-header">
          <p className="eyebrow">Rastreamento</p>
          <h1>Consultar objeto</h1>
          <p>
            Informe o código de rastreio para acompanhar o status da sua
            entrega.
          </p>
        </div>

        <form className="tracker-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Ex.: TJ 000 000 000 BR"
            aria-label="Código de rastreio"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Consultando..." : "Buscar"}
          </button>
        </form>

        {error && <div className="message error">{error}</div>}

        {loading && (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <div>
              <strong>Consultando seu objeto</strong>
              <p>A primeira consulta pode levar alguns segundos.</p>
            </div>
          </div>
        )}

        {!loading && recentSearches.length > 0 && (
          <section className="recent-searches">
            <div className="recent-searches-header">
              <div>
                <h2>Consultas recentes</h2>
                <p>Consulte novamente para atualizar o status da entrega.</p>
              </div>
              <button type="button" onClick={clearRecentSearches}>
                Limpar histórico
              </button>
            </div>

            <ul>
              {recentSearches.map((search) => (
                <li key={search.trackingCode}>
                  <button
                    type="button"
                    onClick={() => void searchTrackingCode(search.trackingCode)}
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
      <Footer />
    </main>
  );
}

export default App;
