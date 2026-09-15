import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <NavLink to="/" className="brand">
        <span className="brand-mark">PC</span>
        Climatização JS
      </NavLink>
      <nav className="nav">
        <NavLink to="/" end>
          Início
        </NavLink>
        <a href="/#servicos">Serviços</a>
        <NavLink to="/agendar">Agendar</NavLink>
        <NavLink to="/admin">Área do dono</NavLink>
        <NavLink to="/agendar" className="btn btn-primary">
          Marcar horário
        </NavLink>
      </nav>
    </header>
  );
}
