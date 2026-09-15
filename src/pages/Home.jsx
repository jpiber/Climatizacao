import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Ar no ponto. Sem espera.</p>
          <h1>Instalação e manutenção de climatização com horário marcado.</h1>
          <p className="lede">
            Atendemos residências e empresas. Você escolhe o serviço, a data e o
            horário — e cada faixa já ocupada some da lista para ninguém marcar
            o mesmo horário duas vezes.
          </p>
          <div className="hero-actions">
            <Link to="/agendar" className="btn btn-primary">
              Agendar visita
            </Link>
            <a href="#servicos" className="btn btn-ghost">
              Ver serviços
            </a>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>2</strong>
              <span>serviços principais</span>
            </div>
            <div className="stat">
              <strong>9</strong>
              <span>horários por dia</span>
            </div>
            <div className="stat">
              <strong>1</strong>
              <span>slot por horário</span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <svg className="ac-unit" viewBox="0 0 360 220" fill="none" aria-hidden="true">
            <rect x="40" y="48" width="280" height="110" rx="18" fill="#0b2438" stroke="#7ee0f8" />
            <rect x="62" y="70" width="236" height="18" rx="9" fill="#13344d" />
            <rect x="62" y="100" width="236" height="36" rx="8" fill="#102c42" />
            <circle cx="300" cy="103" r="8" fill="#7ee0f8" />
            <path d="M80 180 C110 150, 140 210, 170 180 S230 150, 260 180" stroke="#7ee0f8" strokeWidth="3" />
            <path d="M100 196 C130 166, 160 226, 190 196 S250 166, 280 196" stroke="#c9f4ff" strokeWidth="2" opacity="0.6" />
          </svg>
          <h3>Atendimento de segunda a sábado</h3>
          <p>Das 8h às 17h, com intervalo de almoço. Domingo fechado.</p>
        </div>
      </section>

      <section className="section" id="servicos">
        <div className="section-head">
          <p className="eyebrow">O que fazemos</p>
          <h2>Do split novo ao aparelho que parou de gelar.</h2>
        </div>
        <div className="grid-2">
          <article className="card">
            <span className="tag">Serviço</span>
            <h3>Instalação</h3>
            <p className="lede">
              Instalação de ar-condicionado split e sistemas de climatização,
              com visita no horário que você escolher.
            </p>
            <ul className="list">
              <li>Instalação residencial e comercial</li>
              <li>Posicionamento da evaporadora e da condensadora</li>
              <li>Teste de funcionamento no mesmo dia</li>
            </ul>
          </article>
          <article className="card">
            <span className="tag">Serviço</span>
            <h3>Manutenção</h3>
            <p className="lede">
              Limpeza, recarga, diagnóstico de vazamento e revisão preventiva
              para o aparelho render mais e gastar menos.
            </p>
            <ul className="list">
              <li>Higienização de filtros e serpentinas</li>
              <li>Checagem de gás e vazamentos</li>
              <li>Manutenção corretiva e preventiva</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Como funciona</p>
          <h2>Três passos até o técnico chegar.</h2>
        </div>
        <div className="steps">
          <article className="card">
            <div className="step-n">1</div>
            <h3>Informe seus dados</h3>
            <p className="lede">Nome, telefone e endereço da visita.</p>
          </article>
          <article className="card">
            <div className="step-n">2</div>
            <h3>Escolha data e hora</h3>
            <p className="lede">
              Só aparecem horários livres. O que já foi marcado some do select.
            </p>
          </article>
          <article className="card">
            <div className="step-n">3</div>
            <h3>Confirmamos no painel</h3>
            <p className="lede">O dono vê todos os agendamentos em um só lugar.</p>
          </article>
        </div>
      </section>
    </>
  );
}
