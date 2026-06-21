import { useEffect, useState } from "react";

const LOADING_STEP_INTERVAL_MS = 3000;
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

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = LOADING_STEPS.slice(1).map((_, index) =>
      window.setTimeout(
        () => setCurrentStep(index + 1),
        LOADING_STEP_INTERVAL_MS * (index + 1),
      ),
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <div className="loading-copy" key={currentStep}>
        <strong>{LOADING_STEPS[currentStep].title}</strong>
        <p>{LOADING_STEPS[currentStep].description}</p>
      </div>
    </div>
  );
}
