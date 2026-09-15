const HORARIOS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

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
      const mm = String(cursor.getMonth() + 1).padStart(2, '0');
      const dd = String(cursor.getDate()).padStart(2, '0');
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

export function horariosLivres(horarios, agendamentos, data) {
  return horarios.filter((h) => !agendamentos.some((a) => a.data === data && a.horario === h));
}

export { HORARIOS };
