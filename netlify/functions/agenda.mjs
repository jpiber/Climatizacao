import { randomUUID } from "crypto";
import {
  ADMIN_PASSWORD,
  HORARIOS,
  SERVICOS,
  datasDisponiveis,
  loadData,
  saveData,
  slotOcupado,
} from "../../server/agendaStorage.js";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function getRoute(pathname) {
  const normalized = (pathname || "/").replace(/\/+/g, "/");
  const clean = normalized.replace(/^\/+/, "").replace(/^\.netlify\/functions\/agenda\/?/, "");
  if (!clean) return "/";
  return `/${clean}`;
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }

  const route = getRoute(event.path || "/");
  const body = parseBody(event);

  if (route === "/api/opcoes" && event.httpMethod === "GET") {
    const store = await loadData();
    return jsonResponse(200, {
      servicos: SERVICOS,
      datas: datasDisponiveis(),
      horarios: HORARIOS,
      ocupados: store.agendamentos.map((a) => ({ data: a.data, horario: a.horario })),
    });
  }

  if (route === "/api/horarios" && event.httpMethod === "GET") {
    const dataSelecionada = String(event.queryStringParameters?.data || "");
    const datas = datasDisponiveis();
    if (!datas.includes(dataSelecionada)) {
      return jsonResponse(400, { erro: "Data inválida." });
    }

    const store = await loadData();
    const horariosLivres = HORARIOS.filter(
      (h) => !slotOcupado(store.agendamentos, dataSelecionada, h)
    );
    return jsonResponse(200, { horarios: horariosLivres });
  }

  if (route === "/api/agendamentos" && event.httpMethod === "POST") {
    const { nome, telefone, endereco, servico, data, horario } = body;

    if (!nome?.trim() || !telefone?.trim() || !endereco?.trim() || !servico || !data || !horario) {
      return jsonResponse(400, { erro: "Preencha todos os campos." });
    }
    if (!SERVICOS.includes(servico)) {
      return jsonResponse(400, { erro: "Tipo de serviço inválido." });
    }
    if (!datasDisponiveis().includes(data)) {
      return jsonResponse(400, { erro: "Data inválida." });
    }
    if (!HORARIOS.includes(horario)) {
      return jsonResponse(400, { erro: "Horário inválido." });
    }

    const store = await loadData();
    if (slotOcupado(store.agendamentos, data, horario)) {
      return jsonResponse(409, {
        erro: "Este horário já foi agendado. Escolha outra data ou horário.",
      });
    }

    const agendamento = {
      id: randomUUID(),
      nome: nome.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      servico,
      data,
      horario,
      criadoEm: new Date().toISOString(),
    };

    store.agendamentos.push(agendamento);
    await saveData(store);
    return jsonResponse(201, agendamento);
  }

  if (route === "/api/admin/login" && event.httpMethod === "POST") {
    const { senha } = body;
    if (senha !== ADMIN_PASSWORD) {
      return jsonResponse(401, { erro: "Senha incorreta." });
    }
    return jsonResponse(200, { ok: true, token: ADMIN_PASSWORD });
  }

  if (route === "/api/admin/agendamentos" && event.httpMethod === "GET") {
    const token = (event.headers?.authorization || "").replace("Bearer ", "");
    if (token !== ADMIN_PASSWORD) {
      return jsonResponse(401, { erro: "Não autorizado." });
    }

    const store = await loadData();
    const lista = [...store.agendamentos].sort(
      (a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`)
    );
    return jsonResponse(200, lista);
  }

  if (route.startsWith("/api/admin/agendamentos/") && event.httpMethod === "DELETE") {
    const token = (event.headers?.authorization || "").replace("Bearer ", "");
    if (token !== ADMIN_PASSWORD) {
      return jsonResponse(401, { erro: "Não autorizado." });
    }

    const id = route.replace("/api/admin/agendamentos/", "");
    const store = await loadData();
    const before = store.agendamentos.length;
    store.agendamentos = store.agendamentos.filter((a) => a.id !== id);

    if (store.agendamentos.length === before) {
      return jsonResponse(404, { erro: "Agendamento não encontrado." });
    }

    await saveData(store);
    return jsonResponse(200, { ok: true });
  }

  return jsonResponse(404, { erro: "Rota não encontrada." });
}
