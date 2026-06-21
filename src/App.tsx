import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import "./App.css";
import { AppLayout } from "./components/AppLayout";
import { LandingView } from "./components/LandingView";
import { TrackingResultsView } from "./components/TrackingResultsView";
import { TrackingSearchView } from "./components/TrackingSearchView";
import type { TrackingResponse } from "./domain/tracking";
import { parseTrackingCodes } from "./domain/tracking";
import { fetchTracking } from "./services/trackingApi";
import {
  addRecentSearch,
  clearStoredRecentSearches,
  loadRecentSearches,
  removeRecentSearch,
} from "./storage/recentSearches";

const DEFAULT_PAGE_TITLE = "Rastreamento dos Correios | Consulte seu objeto";
const DEFAULT_PAGE_DESCRIPTION =
  "Consulte o status dos Correios em tempo real, acompanhe eventos e veja o histórico da entrega.";

const upsertMeta = (attr: "name" | "property", key: string, value: string) => {
  const selector = `meta[${attr}="${key}"]`;
  const existingTag = document.querySelector(selector);

  if (existingTag) {
    existingTag.setAttribute("content", value);
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attr, key);
  meta.setAttribute("content", value);
  document.head.appendChild(meta);
};

function App() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<TrackingResponse | null>(null);
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [showLanding, setShowLanding] = useState(true);
  const [pendingRemovalCode, setPendingRemovalCode] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const firstResult = response?.results?.[0];
    const trackingCode = firstResult?.tracking_code ?? "";
    const title = trackingCode
      ? `${trackingCode} | Rastreamento dos Correios`
      : DEFAULT_PAGE_TITLE;
    const description =
      firstResult?.status === "success"
        ? `Acompanhe ${trackingCode} nos Correios com status atual "${firstResult.current_status}" e histórico detalhado.`
        : DEFAULT_PAGE_DESCRIPTION;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
  }, [response]);

  const searchTrackingCode = async (trackingCode: string) => {
    setLoading(true);
    setError("");
    setResponse(null);
    setCode(trackingCode);

    try {
      const trackingResponse = await fetchTracking(trackingCode);
      setRecentSearches((currentSearches) =>
        addRecentSearch(currentSearches, trackingCode),
      );
      setResponse(trackingResponse);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    }
  };

  const clearRecentSearches = () => {
    clearStoredRecentSearches();
    setRecentSearches([]);
  };

  const removeRecentSearchItem = (trackingCode: string) => {
    setPendingRemovalCode(trackingCode);
  };

  const confirmRemoval = () => {
    if (!pendingRemovalCode) {
      return;
    }

    setRecentSearches((currentSearches) =>
      removeRecentSearch(currentSearches, pendingRemovalCode),
    );
    setPendingRemovalCode(null);
  };

  const cancelRemoval = () => {
    setPendingRemovalCode(null);
  };

  const returnToSearch = (clearCode: boolean) => {
    setResponse(null);
    setError("");
    if (clearCode) setCode("");
    setShowLanding(false);
  };

  if (response) {
    return (
      <AppLayout resultScreen>
        <TrackingResultsView
          response={response}
          onBack={() => returnToSearch(false)}
          onNewSearch={() => returnToSearch(true)}
        />
      </AppLayout>
    );
  }

  if (showLanding) {
    return (
      <AppLayout>
        <LandingView onStartSearch={() => setShowLanding(false)} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TrackingSearchView
        code={code}
        error={error}
        loading={loading}
        recentSearches={recentSearches}
        onClearRecentSearches={clearRecentSearches}
        onCodeChange={setCode}
        onRecentSearch={(trackingCode) => void searchTrackingCode(trackingCode)}
        onRemoveRecentSearch={removeRecentSearchItem}
        onSubmit={handleSubmit}
        pendingRemovalCode={pendingRemovalCode}
        onConfirmRemoval={confirmRemoval}
        onCancelRemoval={cancelRemoval}
      />
    </AppLayout>
  );
}

export default App;
