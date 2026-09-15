import { useEffect, useState } from "react";

function formatarData(iso) {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function Admin() {
  const [senha, setSenha] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") || "");
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState("");
  const [acaoPendente, setAcaoPendente] = useState(null);

  async function carregar(auth = token) {
    const res = await fetch("/api/admin/agendamentos", {
      headers: { Authorization: `Bearer ${auth}` },
    });
    if (!res.ok) {
      sessionStorage.removeItem("adminToken");
      setToken("");
      throw new Error("Sessão inválida.");
    }
    setLista(await res.json());
  }

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.erro || "Não entrou.");
      return;
    }
    sessionStorage.setItem("adminToken", data.token);
    setToken(data.token);
    await carregar(data.token);
  }

  function abrirConfirmacao(tipo, agendamento) {
    setAcaoPendente({ tipo, agendamento });
  }

  async function executarAcao() {
    if (!acaoPendente) return;

    const { tipo, agendamento } = acaoPendente;
    const res = await fetch(
      tipo === "confirmar"
        ? `/api/admin/agendamentos/${agendamento.id}/confirmar`
        : `/api/admin/agendamentos/${agendamento.id}`,
      {
        method: tipo === "confirmar" ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAcaoPendente(null);
    if (res.ok) await carregar();
  }

  function sair() {
    sessionStorage.removeItem("adminToken");
    setToken("");
    setLista([]);
  }

  useEffect(() => {
    if (!token) return;
    carregar().catch(() => {});
  }, [token]);

  if (!token) {
    return (
      <section className="section form-wrap">
        <div className="section-head">
          <p className="eyebrow">Painel</p>
          <h2>Área do dono</h2>
          <p className="lede">Entre para ver os horários já marcados pelos clientes.</p>
        </div>
        <form className="card" onSubmit={entrar}>
          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha do proprietário"
              required
            />
          </label>
          {erro ? <div className="alert error">{erro}</div> : null}
          <button className="btn btn-primary" type="submit">
            Entrar
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="eyebrow">Agenda</p>
          <h2>Horários agendados</h2>
          <p className="lede">Cada combinação de data + horário aparece no máximo uma vez.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={sair}>
          Sair
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="empty">Nenhum agendamento ainda.</p>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Serviço</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <td>{formatarData(a.data)}</td>
                  <td>{a.horario}</td>
                  <td>{a.servico}</td>
                  <td>{a.nome}</td>
                  <td>{a.telefone}</td>
                  <td>{a.endereco}</td>
                  <td>
                    {a.status === "confirmado" ? "Confirmado" : "Pendente"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => abrirConfirmacao("confirmar", a)}
                        disabled={a.status === "confirmado"}
                      >
                        Confirmar
                      </button>
                      <button className="btn btn-danger" type="button" onClick={() => abrirConfirmacao("cancelar", a)}>
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {acaoPendente ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setAcaoPendente(null)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmacao-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`modal-icon ${acaoPendente.tipo === "confirmar" ? "modal-icon-confirm" : "modal-icon-danger"}`}>
              {acaoPendente.tipo === "confirmar" ? "✓" : "!"}
            </div>
            <p className="eyebrow">Atenção</p>
            <h3 id="confirmacao-titulo">
              {acaoPendente.tipo === "confirmar" ? "Confirmar este agendamento?" : "Cancelar este agendamento?"}
            </h3>
            <p className="modal-copy">
              {acaoPendente.tipo === "confirmar"
                ? "O cliente ficará marcado como confirmado na sua agenda."
                : "Este horário será liberado para outro cliente e não poderá ser recuperado."}
            </p>
            <div className="modal-booking">
              <strong>{acaoPendente.agendamento.nome}</strong>
              <span>
                {formatarData(acaoPendente.agendamento.data)} às {acaoPendente.agendamento.horario}
              </span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setAcaoPendente(null)}>
                Voltar
              </button>
              <button
                className={`btn ${acaoPendente.tipo === "confirmar" ? "btn-primary" : "btn-danger"}`}
                type="button"
                onClick={executarAcao}
              >
                {acaoPendente.tipo === "confirmar" ? "Sim, confirmar" : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
