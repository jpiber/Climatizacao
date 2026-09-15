import { useEffect, useMemo, useState } from "react";

function formatarData(iso) {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function gerarDatasFallback() {
  const datas = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let cursor = new Date(hoje);
  cursor.setDate(cursor.getDate() + 1);

  while (datas.length < 14) {
    const dia = cursor.getDay();
    if (dia !== 0) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, "0");
      const dd = String(cursor.getDate()).padStart(2, "0");
      datas.push(`${yyyy}-${mm}-${dd}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return datas;
}

const opcoesFallback = {
  servicos: ["Instalação", "Manutenção"],
  datas: gerarDatasFallback(),
  horarios: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  ocupados: [],
};

const formVazio = {
  nome: "",
  telefone: "",
  email: "",
  endereco: "",
  servico: "",
  data: "",
  horario: "",
};

export default function Agendar() {
  const [opcoes, setOpcoes] = useState({
    servicos: [],
    datas: [],
    horarios: [],
    ocupados: [],
  });
  const [form, setForm] = useState(formVazio);
  const [status, setStatus] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  async function carregarOpcoes() {
    setStatus({ tipo: "", texto: "" });

    try {
      const res = await fetch("/api/opcoes");
      if (!res.ok) throw new Error("API indisponível");

      const data = await res.json();
      if (!data || !Array.isArray(data.servicos) || !Array.isArray(data.datas)) {
        throw new Error("Dados inválidos da API");
      }

      setOpcoes(data);
      setForm((atual) => ({
        ...atual,
        servico: atual.servico || data.servicos[0] || "",
        data: atual.data || data.datas[0] || "",
      }));
      return;
    } catch {
      setOpcoes(opcoesFallback);
      setForm((atual) => ({
        ...atual,
        servico: atual.servico || opcoesFallback.servicos[0] || "",
        data: atual.data || opcoesFallback.datas[0] || "",
      }));
    }
  }

  useEffect(() => {
    carregarOpcoes().catch(() =>
      setStatus({ tipo: "error", texto: "Não foi possível carregar as datas." })
    );
  }, []);

  const horariosLivres = useMemo(() => {
    if (!form.data) return [];
    return (opcoes.horarios || []).filter(
      (h) => !opcoes.ocupados.some((o) => o.data === form.data && o.horario === h)
    );
  }, [form.data, opcoes]);

  useEffect(() => {
    if (form.horario && !horariosLivres.includes(form.horario)) {
      setForm((atual) => ({ ...atual, horario: "" }));
    }
  }, [form.horario, horariosLivres]);

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setStatus({ tipo: "", texto: "" });
    setEnviando(true);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ tipo: "error", texto: data.erro || "Não foi possível agendar." });
        await carregarOpcoes();
        return;
      }
      setStatus({
        tipo: "ok",
        texto: `Agendado: ${data.servico} em ${formatarData(data.data)} às ${data.horario}.`,
      });
      setForm((atual) => ({
        ...atual,
        nome: "",
        telefone: "",
        email: "",
        endereco: "",
        horario: "",
      }));
      await carregarOpcoes();
    } catch {
      setStatus({ tipo: "error", texto: "Falha de conexão. Tente de novo." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="section form-wrap">
      <div className="section-head">
        <p className="eyebrow">Agendamento</p>
        <h2>Marque instalação ou manutenção.</h2>
        <p className="lede">
          Data e horário são listas. Se aquele horário já tiver dono, ele não
          aparece de novo — e o servidor também recusa duplicata.
        </p>
      </div>

      <form className="card" onSubmit={enviar}>
        <label>
          Nome
          <input
            required
            value={form.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Seu nome completo"
          />
        </label>
        <label>
          Telefone
          <input
            required
            value={form.telefone}
            maxLength={15}
            onChange={(e) => atualizar("telefone", e.target.value.slice(0, 15))}
            placeholder="(00) 00000-0000"
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            required
            value={form.email}
            pattern=".+@.+\\..+"
            onChange={(e) => atualizar("email", e.target.value)}
            placeholder="seuemail@email.com"
          />
        </label>
        <label>
          Endereço
          <textarea
            required
            rows={3}
            value={form.endereco}
            onChange={(e) => atualizar("endereco", e.target.value)}
            placeholder="Rua, número, bairro, cidade"
          />
        </label>
        <label>
          Tipo de serviço
          <select
            required
            value={form.servico}
            onChange={(e) => atualizar("servico", e.target.value)}
          >
            {opcoes.servicos.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="row-2">
          <label>
            Data
            <select
              required
              value={form.data}
              onChange={(e) => atualizar("data", e.target.value)}
            >
              {opcoes.datas.map((d) => (
                <option key={d} value={d}>
                  {formatarData(d)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Horário
            <select
              required
              value={form.horario}
              onChange={(e) => atualizar("horario", e.target.value)}
              disabled={horariosLivres.length === 0}
            >
              <option value="">
                {horariosLivres.length ? "Selecione" : "Nenhum horário livre"}
              </option>
              {horariosLivres.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>

        {status.texto ? <div className={`alert ${status.tipo}`}>{status.texto}</div> : null}

        <button className="btn btn-primary" type="submit" disabled={enviando || !form.horario}>
          {enviando ? "Enviando..." : "Confirmar agendamento"}
        </button>
        <p className="hint">Atendimento de segunda a sábado. Cada horário aceita só um cliente.</p>
      </form>
    </section>
  );
}
