import type {
  TrackingNotFoundResult,
  TrackingResponse,
  TrackingResult,
  TrackingSuccessResult,
} from "../domain/tracking";

type ApiErrorResponse = {
  code: string;
  message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

function isTrackingSuccessResult(data: unknown): data is TrackingSuccessResult {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<TrackingSuccessResult>;
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
    response.status === "success" &&
    typeof response.tracking_code === "string" &&
    typeof response.service === "string" &&
    typeof response.current_status === "string" &&
    hasValidEvents
  );
}

function isTrackingNotFoundResult(
  data: unknown,
): data is TrackingNotFoundResult {
  if (!data || typeof data !== "object") return false;

  const response = data as Partial<TrackingNotFoundResult>;
  return (
    response.status === "not_found" &&
    typeof response.tracking_code === "string" &&
    typeof response.message === "string"
  );
}

function isTrackingResult(data: unknown): data is TrackingResult {
  return isTrackingSuccessResult(data) || isTrackingNotFoundResult(data);
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

export async function fetchTracking(trackingCode: string) {
  if (!API_BASE_URL) {
    throw new Error("A URL da API não foi configurada.");
  }

  const query = new URLSearchParams({ code: trackingCode });

  const response = await fetch(`${API_BASE_URL}/tracking?${query}`);

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(getApiErrorMessage(body, response.status));
  }

  const data: unknown = await response.json();
  if (!isTrackingResponse(data)) {
    throw new Error("A API retornou uma resposta em formato inesperado.");
  }

  return data;
}
