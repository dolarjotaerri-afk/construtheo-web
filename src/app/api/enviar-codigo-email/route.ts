import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  criarCodigoVerificacao,
  TipoUsuario,
} from "../../../utils/codigosVerificacao";

export const runtime = "nodejs"; // importante p/ nodemailer funcionar

function criarTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Configuração SMTP ausente (.env)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = TLS
    auth: {
      user,
      pass,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { tipoUsuario, usuarioId, email } = (await req.json()) as {
      tipoUsuario: TipoUsuario;
      usuarioId: string;
      email: string;
    };

    if (!tipoUsuario || !usuarioId || !email) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const { codigo } = await criarCodigoVerificacao(
      tipoUsuario,
      usuarioId,
      "email"
    );

    const transporter = criarTransporter();

    const from = process.env.SMTP_FROM || "Construthéo <no-reply@construtheo.com>";

    const mailOptions = {
      from,
      to: email,
      subject: "Código de verificação - Construthéo",
      html: `
        <p>Olá!</p>
        <p>Seu código de verificação do <strong>Construthéo</strong> é:</p>
        <p style="font-size: 22px; font-weight: bold;">${codigo}</p>
        <p>Ele é válido por <strong>15 minutos</strong>.</p>
        <p>Se você não solicitou este cadastro, ignore este e-mail.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao enviar código por e-mail:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Erro interno ao enviar código",
      },
      { status: 500 }
    );
  }
}