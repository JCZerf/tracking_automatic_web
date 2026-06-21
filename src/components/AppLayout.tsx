import type { PropsWithChildren } from "react";

type AppLayoutProps = PropsWithChildren<{
  resultScreen?: boolean;
}>;

export function AppLayout({ children, resultScreen = false }: AppLayoutProps) {
  return (
    <main className={`app-shell${resultScreen ? " result-screen" : ""}`}>
      <header className="site-header">
        <p>Tracking Automatic</p>
        <span>Acompanhe suas entregas de forma simples, rápida e confiável.</span>
      </header>

      {children}

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
    </main>
  );
}
