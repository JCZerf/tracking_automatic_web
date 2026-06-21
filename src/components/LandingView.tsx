type LandingViewProps = {
  onStartSearch: () => void;
};

export function LandingView({ onStartSearch }: LandingViewProps) {
  return (
    <section className="landing-panel">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Rastreamento automático</p>
          <h1>Acompanhe várias encomendas dos Correios em um só lugar</h1>
          <p>
            Consulte o status, os eventos e o histórico da entrega com poucos
            cliques, sem precisar abrir várias páginas separadas.
          </p>
          <div className="landing-actions">
            <button
              type="button"
              className="primary-cta"
              onClick={onStartSearch}
            >
              Consultar agora
            </button>
            <button
              type="button"
              className="secondary-cta"
              onClick={onStartSearch}
            >
              Ver busca rápida
            </button>
          </div>
        </div>

        <div className="landing-highlights">
          <article>
            <span>Até 20 códigos</span>
            <strong>Rastreie vários objetos de uma vez</strong>
          </article>
          <article>
            <span>Atualização rápida</span>
            <strong>Veja o status mais recente da entrega</strong>
          </article>
          <article>
            <span>Histórico completo</span>
            <strong>Confira os eventos ao longo do percurso</strong>
          </article>
        </div>
      </section>

      <section className="landing-steps">
        <div>
          <span>1</span>
          <h2>Digite os códigos</h2>
          <p>Você pode informar vários códigos separados por vírgula.</p>
        </div>
        <div>
          <span>2</span>
          <h2>Veja o resultado</h2>
          <p>O sistema mostra a situação atual e o histórico da entrega.</p>
        </div>
        <div>
          <span>3</span>
          <h2>Consulte novamente</h2>
          <p>Os rastreios recentes ficam disponíveis para uso rápido.</p>
        </div>
      </section>

      <p className="privacy-note">
        Não armazenamos seus códigos em nossos servidores; os códigos usados
        ficam salvos apenas localmente no seu navegador para facilitar o uso.
      </p>
    </section>
  );
}
