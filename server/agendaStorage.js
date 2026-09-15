import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getStore } from "@netlify/blobs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data.json");

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "2026";
export const HORARIOS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
export const SERVICOS = ["Instalação", "Manutenção"];

export function datasDisponiveis(dataBase = new Date()) {
  const datas = [];
  const hoje = new Date(dataBase);
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

export function slotOcupado(agendamentos, data, horario, exceptId) {
  return agendamentos.some(
    (a) => a.data === data && a.horario === horario && (exceptId == null || a.id !== exceptId)
  );
}

export async function loadData() {
  if (process.env.NETLIFY) {
    const store = getStore({ name: "agenda-store" });
    const raw = await store.get("agenda-data.json");
    if (!raw) return { agendamentos: [] };
    return JSON.parse(raw);
  }

  try {
    const file = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(file);
  } catch {
    return { agendamentos: [] };
  }
}

export async function saveData(data) {
  if (process.env.NETLIFY) {
    const store = getStore({ name: "agenda-store" });
    await store.set("agenda-data.json", JSON.stringify(data, null, 2));
    return;
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}
