import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <span>Climatização · Instalação e manutenção de ar-condicionado</span>
      <Link to="/admin">Painel do proprietário</Link>
    </footer>
  );
}
