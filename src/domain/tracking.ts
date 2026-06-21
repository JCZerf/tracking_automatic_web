export type TrackingEvent = {
  description: string;
  details: string[];
  occurred_at: string;
};

export type TrackingSuccessResult = {
  status: "success";
  tracking_code: string;
  service: string;
  current_status: string;
  events: TrackingEvent[];
};

export type TrackingNotFoundResult = {
  status: "not_found";
  tracking_code: string;
  message: string;
};

export type TrackingResult = TrackingSuccessResult | TrackingNotFoundResult;

export type TrackingResponse = {
  results: TrackingResult[];
};

const DOCUMENT_LENGTHS = new Set([11, 14]);
const MAX_TRACKING_CODES = 20;
const TRACKING_CODE_PATTERN = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
const S10_WEIGHTS = [8, 6, 4, 2, 3, 5, 9, 7] as const;

function isCpfOrCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  const containsOnlyDocumentCharacters = /^[\d./\-\s]+$/.test(value);
  return containsOnlyDocumentCharacters && DOCUMENT_LENGTHS.has(digits.length);
}

function hasValidS10CheckDigit(trackingCode: string) {
  if (!TRACKING_CODE_PATTERN.test(trackingCode)) return false;

  const remainder = trackingCode
    .slice(2, 10)
    .split("")
    .reduce(
      (total, digit, index) => total + Number(digit) * S10_WEIGHTS[index],
      0,
    ) % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit === 10) checkDigit = 0;
  if (checkDigit === 11) checkDigit = 5;

  return Number(trackingCode[10]) === checkDigit;
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

  if (trackingCodes.some((code) => !hasValidS10CheckDigit(code))) {
    throw new Error(
      "Código de objeto, CPF ou CNPJ informado não está válido.",
    );
  }
  if (new Set(trackingCodes).size !== trackingCodes.length) {
    throw new Error("Não repita códigos na mesma consulta.");
  }

  return trackingCodes;
}
