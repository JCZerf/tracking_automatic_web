export type TrackingEvent = {
  description: string;
  details: string[];
  occurred_at: string;
};

export type TrackingResult = {
  tracking_code: string;
  service: string;
  current_status: string;
  events: TrackingEvent[];
};

export type TrackingResponse = {
  results: TrackingResult[];
};

const DOCUMENT_LENGTHS = new Set([11, 14]);
const MAX_TRACKING_CODES = 20;
const TRACKING_CODE_PATTERN = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

function isCpfOrCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  const containsOnlyDocumentCharacters = /^[\d./\-\s]+$/.test(value);
  return containsOnlyDocumentCharacters && DOCUMENT_LENGTHS.has(digits.length);
}

export function parseTrackingCodes(value: string) {
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
