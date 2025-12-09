import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { TipoUsuario } from "../../../utils/codigosVerificacao";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { tipoUsuario, usuarioId, codigo } = (await req.json()) as {
      tipoUsuario: TipoUsuario;
      usuarioId: string;
      codigo: string;
    };

    if (!tipoUsuario || !usuarioId || !codigo) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const agora = new Date().toISOString();

    // Busca código válido, não usado e não expirado
    const { data, error } = await supabase
      .from("codigos_verificacao")
      .select("*")
      .eq("tipo_usuario", tipoUsuario)
      .eq("usuario_id", usuarioId)
      .eq("codigo", codigo)
      .eq("usado", false)
      .gte("expiracao", agora) // expiracao >= agora (ainda válido)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar código:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao validar código" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    // marca código como usado
    const { error: erroUpdateCodigo } = await supabase
      .from("codigos_verificacao")
      .update({ usado: true })
      .eq("id", data.id);

    if (erroUpdateCodigo) {
      console.error("Erro ao marcar código como usado:", erroUpdateCodigo);
    }

    // tabela alvo
    const tabela =
      tipoUsuario === "cliente"
        ? "clientes"
        : tipoUsuario === "profissional"
        ? "profissionais"
        : "empresas";

    const { error: erroUpdateUsuario } = await supabase
      .from(tabela)
      .update({ verificado: true })
      .eq("id", usuarioId);

    if (erroUpdateUsuario) {
      console.error("Erro ao atualizar usuário:", erroUpdateUsuario);
      return NextResponse.json(
        { success: false, error: "Erro ao confirmar verificação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao verificar código:", err);
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}