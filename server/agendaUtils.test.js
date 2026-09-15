import test from 'node:test';
import assert from 'node:assert/strict';

import { datasDisponiveis, slotOcupado, horariosLivres } from './agendaUtils.js';

test('datasDisponiveis retorna 14 dias a partir de amanhã e ignora domingo', () => {
  const base = new Date('2026-09-15T12:00:00');
  const datas = datasDisponiveis(base);
  assert.equal(datas.length, 14);
  assert.deepEqual(datas[0], '2026-09-16');
  assert.ok(datas.every((data) => data.length === 10));
  assert.ok(!datas.includes('2026-09-15'));
});

test('slotOcupado identifica conflito de data e horário', () => {
  const agendamentos = [{ data: '2026-09-16', horario: '09:00', id: 'a1' }];
  assert.equal(slotOcupado(agendamentos, '2026-09-16', '09:00'), true);
  assert.equal(slotOcupado(agendamentos, '2026-09-16', '10:00'), false);
});

test('horariosLivres remove horários ocupados', () => {
  const horarios = ['08:00', '09:00', '10:00'];
  const agendamentos = [{ data: '2026-09-16', horario: '09:00' }];
  assert.deepEqual(horariosLivres(horarios, agendamentos, '2026-09-16'), ['08:00', '10:00']);
});
