import { useState } from "react";
import type { FormEvent } from "react";

import "./App.css";
import { AppLayout } from "./components/AppLayout";
import { TrackingResultsView } from "./components/TrackingResultsView";
import { TrackingSearchView } from "./components/TrackingSearchView";
import { parseTrackingCodes } from "./domain/tracking";
import type { TrackingResponse } from "./domain/tracking";
import { fetchTracking } from "./services/trackingApi";
import {
  addRecentSearch,
  clearStoredRecentSearches,
  loadRecentSearches,
} from "./storage/recentSearches";

function App() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<TrackingResponse | null>(null);
  const [recentSearches, setRecentSearches] =
    useState(loadRecentSearches);

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

  const returnToSearch = (clearCode: boolean) => {
    setResponse(null);
    setError("");
    if (clearCode) setCode("");
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
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}

export default App;
