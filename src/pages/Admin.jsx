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

  async function cancelar(id) {
    if (!confirm("Cancelar este horário? Ele volta a ficar livre para novos clientes.")) return;
    const res = await fetch(`/api/admin/agendamentos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
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
                <th></th>
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
                    <button className="btn btn-danger" type="button" onClick={() => cancelar(a.id)}>
                      Liberar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
