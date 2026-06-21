import { useEffect, useState } from "react";
import "./App.css";

type TrackingEvent = {
  description: string;
  details: string[];
  occurred_at: string;
};

type TrackingResult = {
  tracking_code: string;
  service: string;
  current_status: string;
  events: TrackingEvent[];
};

type TrackingResponse = {
  results: TrackingResult[];
};

type RecentSearch = {
  trackingCode: string;
  searchedAt: string;
};

type ApiErrorResponse = {
  code: string;
  message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const RECENT_SEARCHES_KEY = "tracking-recent-searches";
const MAX_RECENT_SEARCHES = 5;
const DOCUMENT_LENGTHS = new Set([11, 14]);
const MAX_TRACKING_CODES = 20;
const TRACKING_CODE_PATTERN = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
const LOADING_STEP_INTERVAL_MS = 1800;
const LOADING_STEPS = [
  {
    title: "Acessando os Correios",
    description: "Iniciando uma consulta segura para suas entregas.",
  },
  {
    title: "Processando a verificação de segurança",
    description: "Esta etapa pode levar alguns segundos.",
  },
  {
    title: "Buscando sua entrega",
    description: "Consultando os eventos mais recentes do rastreamento.",
  },
  {
    title: "Organizando o histórico",
    description: "Preparando os dados para apresentar o resultado.",
  },
] as const;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function isTrackingResult(data: unknown): data is TrackingResult {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<TrackingResult>;

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

function isTrackingResponse(data: unknown): data is TrackingResponse {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<TrackingResponse>;
  return (
    Array.isArray(response.results) &&
    response.results.length > 0 &&
    response.results.every(isTrackingResult)
  );
}

function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<ApiErrorResponse>;
  return (
    typeof response.code === "string" &&
    typeof response.message === "string" &&
    response.message.trim().length > 0
  );
}

function getApiErrorMessage(data: unknown, status: number) {
  if (isApiErrorResponse(data)) return data.message;

  if (status === 404) return "Um ou mais objetos não foram encontrados.";
  if (status === 422) return "Informe um código de rastreamento válido.";
  if (status === 502) {
    return "Não foi possível consultar os Correios neste momento.";
  }
  if (status >= 500) return "O serviço está temporariamente indisponível.";
  return `Não foi possível concluir a consulta (erro ${status}).`;
}

function isCpfOrCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  const containsOnlyDocumentCharacters = /^[\d./\-\s]+$/.test(value);
  return containsOnlyDocumentCharacters && DOCUMENT_LENGTHS.has(digits.length);
}

function parseTrackingCodes(value: string) {
  const rawCodes = value.split(",");

  if (rawCodes.length > MAX_TRACKING_CODES) {
    throw new Error(
      `Informe no máximo ${MAX_TRACKING_CODES} códigos de rastreamento por consulta.`,
    );
  }
  if (rawCodes.some((code) => isCpfOrCnpj(code))) {
    throw new Error(
      "Não é possível consultar com CPF ou CNPJ. Informe apenas códigos de rastreamento.",
    );
  }

  const trackingCodes = rawCodes.map((code) =>
    code.replace(/\s/g, "").toUpperCase(),
  );

  if (trackingCodes.some((code) => !TRACKING_CODE_PATTERN.test(code))) {
    throw new Error(
      "Informe códigos de rastreamento válidos separados por vírgula.",
    );
  }
  if (new Set(trackingCodes).size !== trackingCodes.length) {
    throw new Error("Não repita códigos na mesma consulta.");
  }

  return trackingCodes;
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [recentSearches, setRecentSearches] =
    useState<RecentSearch[]>(loadRecentSearches);

  useEffect(() => {
    if (!loading) return;

    const timers = LOADING_STEPS.slice(1).map((_, index) =>
      window.setTimeout(
        () => setLoadingStep(index + 1),
        LOADING_STEP_INTERVAL_MS * (index + 1),
      ),
    );

    return () => timers.forEach(window.clearTimeout);
  }, [loading]);

  const searchTrackingCode = async (trackingCode: string) => {
    setLoadingStep(0);
    setLoading(true);
    setError("");
    setResult(null);
    setActiveResultIndex(0);
    setCode(trackingCode);

    try {
      if (!API_BASE_URL) {
        throw new Error("A URL da API não foi configurada.");
      }

      const response = await fetch(
        `${API_BASE_URL}/tracking?code=${encodeURIComponent(trackingCode)}`,
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(getApiErrorMessage(body, response.status));
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
        err instanceof TypeError
          ? "Não foi possível conectar à API. Verifique sua conexão e tente novamente."
          : err instanceof Error
          ? err.message
          : "Erro inesperado ao consultar o rastreio.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const trackingCodes = parseTrackingCodes(code);
      await searchTrackingCode(trackingCodes.join(","));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível validar os códigos informados.",
      );
      return;
    }
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
    setActiveResultIndex(0);
    setError("");
    if (clearCode) setCode("");
  };

  if (result) {
    const activeResult = result.results[activeResultIndex] ?? result.results[0];

    return (
      <main className="app-shell result-screen">
        <BrandHeader />
        <section className="tracker-panel result-view" aria-live="polite">
          <div className="result-page-header">
            <div>
              <p className="eyebrow">Rastreamento</p>
              <h1>
                {result.results.length > 1
                  ? `${result.results.length} objetos encontrados`
                  : "Resultado da consulta"}
              </h1>
              <p>Acompanhe abaixo o histórico completo de cada objeto.</p>
            </div>
            <button
              className="back-button"
              type="button"
              onClick={() => returnToSearch(false)}
            >
              ← Voltar
            </button>
          </div>

          {result.results.length > 1 && (
            <div className="result-tabs" role="tablist" aria-label="Objetos consultados">
              {result.results.map((trackingResult, index) => (
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
            role={result.results.length > 1 ? "tabpanel" : undefined}
          >
            <div className="result-summary">
              <div>
                <span className="result-label">Código de rastreio</span>
                <strong>{activeResult.tracking_code}</strong>
              </div>
              <div>
                <span className="result-label">Serviço</span>
                <strong>{activeResult.service}</strong>
              </div>
            </div>

            <div className="current-status">
              <span>Status atual</span>
              <strong>{activeResult.current_status}</strong>
            </div>

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
            Informe até 20 códigos de rastreio, separados por vírgula, para
            acompanhar suas entregas.
          </p>
        </div>

        <form className="tracker-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
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

        {loading && (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <div className="loading-copy" key={loadingStep}>
              <strong>{LOADING_STEPS[loadingStep].title}</strong>
              <p>{LOADING_STEPS[loadingStep].description}</p>
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
