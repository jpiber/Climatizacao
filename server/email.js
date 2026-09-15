function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function criarEmailConfirmacao(agendamento) {
  const campos = [
    ["Serviço", agendamento.servico],
    ["Data", formatarData(agendamento.data)],
    ["Horário", agendamento.horario],
    ["Nome", agendamento.nome],
    ["Telefone", agendamento.telefone],
    ["E-mail", agendamento.email],
    ["Endereço", agendamento.endereco],
  ];

  const linhas = campos
    .map(
      ([rotulo, valor]) => `
        <tr>
          <td style="padding:10px 0;color:#607487;width:34%;">${escapeHtml(rotulo)}</td>
          <td style="padding:10px 0;color:#102c40;font-weight:600;">${escapeHtml(valor)}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `Agendamento confirmado - ${agendamento.servico}`,
    html: `
      <div style="margin:0;background:#f3f8fa;padding:32px 16px;font-family:Arial,sans-serif;color:#102c40;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dce8ed;border-radius:16px;padding:32px;">
          <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#e2f9f0;color:#16734e;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Climatização JS</div>
          <h1 style="margin:22px 0 8px;font-size:28px;color:#102c40;">Agendamento recebido!</h1>
          <p style="margin:0;color:#607487;font-size:16px;line-height:1.6;">Olá, ${escapeHtml(agendamento.nome)}. Seu horário foi reservado com sucesso.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:24px;border-top:1px solid #dce8ed;">${linhas}</table>
          <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #dce8ed;color:#607487;font-size:13px;line-height:1.5;">A equipe da Climatização JS entrará em contato para confirmar os detalhes do atendimento.</p>
        </div>
      </div>`,
  };
}

export async function enviarEmailConfirmacao(agendamento) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { enviado: false, motivo: "RESEND_API_KEY não configurada" };
  }

  const email = criarEmailConfirmacao(agendamento);
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Climatização JS <onboarding@resend.dev>",
      to: [agendamento.email],
      subject: email.subject,
      html: email.html,
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`Resend ${resposta.status}: ${detalhe}`);
  }

  return { enviado: true };
}
