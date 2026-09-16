import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { enviarEmailConfirmacao } from "./email.js";
import {
  ADMIN_PASSWORD,
  HORARIOS,
  SERVICOS,
  datasDisponiveis,
  slotOcupado,
  loadData,
  saveData,
} from "./agendaStorage.js";

const app = express();
app.use(cors());
app.use(express.json());

export { app };

app.get("/api/opcoes", async (_req, res) => {
  const data = await loadData();
  const datas = datasDisponiveis();
  const ocupados = data.agendamentos.map((a) => ({
    data: a.data,
    horario: a.horario,
  }));

  res.json({
    servicos: SERVICOS,
    datas,
    horarios: HORARIOS,
    ocupados,
  });
});

app.get("/api/horarios", async (req, res) => {
  const dataSelecionada = String(req.query.data || "");
  const datas = datasDisponiveis();
  if (!datas.includes(dataSelecionada)) {
    return res.status(400).json({ erro: "Data inválida." });
  }

  const store = await loadData();
  const livres = HORARIOS.filter(
    (h) => !slotOcupado(store.agendamentos, dataSelecionada, h)
  );
  res.json({ horarios: livres });
});

app.post("/api/agendamentos", async (req, res) => {
  const { nome, telefone, email, endereco, servico, data, horario } = req.body || {};

  if (!nome?.trim() || !telefone?.trim() || !endereco?.trim() || !servico || !data || !horario) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }
  if (!SERVICOS.includes(servico)) {
    return res.status(400).json({ erro: "Tipo de serviço inválido." });
  }
  if (!datasDisponiveis().includes(data)) {
    return res.status(400).json({ erro: "Data inválida." });
  }
  if (!HORARIOS.includes(horario)) {
    return res.status(400).json({ erro: "Horário inválido." });
  }

  const store = await loadData();
  if (slotOcupado(store.agendamentos, data, horario)) {
    return res.status(409).json({
      erro: "Este horário já foi agendado. Escolha outra data ou horário.",
    });
  }

  const agendamento = {
    id: randomUUID(),
    nome: nome.trim(),
    telefone: telefone.trim(),
    email: String(email || "").trim(),
    endereco: endereco.trim(),
    servico,
    data,
    horario,
    status: "pendente",
    criadoEm: new Date().toISOString(),
  };

  store.agendamentos.push(agendamento);
  await saveData(store);
  let emailEnviado = false;
  try {
    emailEnviado = (await enviarEmailConfirmacao(agendamento)).enviado;
  } catch (error) {
    console.error("Não foi possível enviar o e-mail de confirmação:", error.message);
  }
  res.status(201).json({ ...agendamento, emailEnviado });
});

app.post("/api/admin/login", (req, res) => {
  const senha = String(req.body?.senha ?? "").trim();
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: "Senha incorreta." });
  }
  res.json({ ok: true, token: ADMIN_PASSWORD });
});

function exigirAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: "Não autorizado." });
  }
  next();
}

app.get("/api/admin/agendamentos", exigirAdmin, async (_req, res) => {
  const store = await loadData();
  const lista = [...store.agendamentos].sort((a, b) =>
    `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`)
  );
  res.json(lista);
});

app.post("/api/admin/agendamentos/:id/confirmar", exigirAdmin, async (req, res) => {
  const store = await loadData();
  const agendamento = store.agendamentos.find((item) => item.id === req.params.id);
  if (!agendamento) {
    return res.status(404).json({ erro: "Agendamento não encontrado." });
  }

  agendamento.status = "confirmado";
  await saveData(store);
  res.json(agendamento);
});

app.delete("/api/admin/agendamentos/:id", exigirAdmin, async (req, res) => {
  const store = await loadData();
  const before = store.agendamentos.length;
  store.agendamentos = store.agendamentos.filter((a) => a.id !== req.params.id);
  if (store.agendamentos.length === before) {
    return res.status(404).json({ erro: "Agendamento não encontrado." });
  }
  await saveData(store);
  res.json({ ok: true });
});

const PORT = 3002;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API de agendamentos em http://127.0.0.1:${PORT}`);
  });
}
