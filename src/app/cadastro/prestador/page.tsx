"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { buscarEnderecoPorCep } from "../../../lib/cepService";

const CONSTRUTHEO_WHATSAPP = "5511988214713";
const PAINEL_PROFISSIONAL = "/painel/profissional";

export default function CadastroPrestadorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [bairro, setBairro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function handleCepBlur() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      setBuscandoCep(true);
      setErro(null);

      const endereco = await buscarEnderecoPorCep(cepLimpo);

      setCidade(endereco.cidade || "");
      setEstado(endereco.estado || "");
      setBairro(endereco.bairro || "");
    } catch (error: unknown) {
      console.error(error);
      setErro("Não foi possível buscar o endereço pelo CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      const nome = String(formData.get("nome") || "").trim();
      const especialidade = String(
        formData.get("especialidade") || ""
      ).trim();
      const whatsapp = String(formData.get("whatsapp") || "").trim();
      const email = String(formData.get("email") || "")
        .trim()
        .toLowerCase();

      const cepFinal = cep.replace(/\D/g, "");
      const cidadeFinal = cidade.trim();
      const estadoFinal = estado.trim();
      const bairroFinal = bairro.trim();

      const localizacao = [cidadeFinal, estadoFinal]
        .filter(Boolean)
        .join(" - ");

      if (
        !nome ||
        !especialidade ||
        !whatsapp ||
        !email ||
        !cepFinal ||
        !cidadeFinal
      ) {
        setErro(
          "Preencha nome, especialidade, WhatsApp, e-mail e CEP para continuar."
        );
        setLoading(false);
        return;
      }

      if (senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        setErro("As senhas não conferem.");
        setLoading(false);
        return;
      }

      const tabelasUsuarios = [
        "clientes",
        "profissionais",
        "empresas",
      ] as const;

      const verificacoes = await Promise.all(
        tabelasUsuarios.map((tabela) =>
          supabase
            .from(tabela)
            .select("id", { count: "exact", head: true })
            .eq("email", email)
        )
      );

      const emailJaExiste = verificacoes.some(({ count }) => (count ?? 0) > 0);

      if (emailJaExiste) {
        setErro(
          "Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha."
        );
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              tipo: "profissional",
              nome,
              especialidade,
            },
          },
        });

      if (signUpError) {
        console.error(signUpError);
        setErro(signUpError.message || "Não foi possível criar sua conta.");
        setLoading(false);
        return;
      }

      const user = signUpData.user;

      if (!user) {
        setErro("Não foi possível concluir a criação do usuário.");
        setLoading(false);
        return;
      }

      const { data: profissional, error: profissionalError } = await supabase
        .from("profissionais")
        .insert([
          {
            id: user.id,
            nome,
            especialidade,
            whatsapp,
            email,
            cep: cepFinal,
            cidade: cidadeFinal,
            estado: estadoFinal || null,
            bairro: bairroFinal || null,
            localizacao,
          },
        ])
        .select(
          "id, nome, especialidade, whatsapp, email, cep, cidade, estado, bairro, localizacao"
        )
        .single();

      if (profissionalError) {
        console.error(profissionalError);
        setErro(
          "Sua conta foi criada, mas não conseguimos salvar o perfil profissional. Entre em contato com o suporte."
        );
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "construtheo_profissional_atual",
          JSON.stringify({
            id: profissional.id,
            nome: profissional.nome,
            especialidade: profissional.especialidade,
            whatsapp: profissional.whatsapp,
            email: profissional.email,
            cep: profissional.cep,
            cidade: profissional.cidade,
            estado: profissional.estado,
            bairro: profissional.bairro,
            localizacao: profissional.localizacao,
            perfilCompleto: false,
          })
        );

        const mensagem = encodeURIComponent(
          `Olá, realizei meu cadastro como profissional no Construthéo.\n\n` +
            `Nome: ${nome}\n` +
            `Especialidade: ${especialidade}\n` +
            `WhatsApp: ${whatsapp}\n` +
            `Região: ${localizacao || cidadeFinal}\n\n` +
            `Quero ativar e completar meu perfil profissional.`
        );

        window.open(
          `https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${mensagem}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      router.push(PAINEL_PROFISSIONAL);
    } catch (error) {
      console.error(error);
      setErro("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "16px 16px 32px",
        boxSizing: "border-box",
        background: "#F9FAFB",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "999px",
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "#2563EB",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            ← Voltar para a tela inicial
          </Link>
        </div>

        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#2563EB",
              marginBottom: "4px",
            }}
          >
            CADASTRO PROFISSIONAL
          </p>

          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#111827",
              marginBottom: "6px",
            }}
          >
            Mostre seu trabalho no{" "}
            <span style={{ color: "#2563EB" }}>ConstruThéo</span>
          </h1>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#4B5563",
              maxWidth: "330px",
              margin: "0 auto",
              lineHeight: 1.45,
            }}
          >
            Faça seu cadastro rápido agora. Depois, no seu painel, você poderá
            adicionar fotos, experiências e mais informações sobre seus
            serviços.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Campo
            id="nome"
            label="Nome completo"
            placeholder="Seu nome"
            autoComplete="name"
          />

          <Campo
            id="especialidade"
            label="Principal especialidade"
            placeholder="Ex: Pedreiro, Pintor, Eletricista..."
          />

          <Campo
            id="whatsapp"
            label="WhatsApp"
            placeholder="(00) 00000-0000"
            inputMode="tel"
            autoComplete="tel"
          />

          <Campo
            id="email"
            label="E-mail para login"
            placeholder="seuemail@exemplo.com"
            type="email"
            autoComplete="email"
          />

          <Campo
            id="senha"
            label="Senha de acesso"
            placeholder="Mínimo 6 caracteres"
            type="password"
            value={senha}
            onChange={setSenha}
            autoComplete="new-password"
          />

          <Campo
            id="confirmarSenha"
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            type="password"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            autoComplete="new-password"
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="cep" style={labelStyle}>
              CEP
            </label>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                id="cep"
                name="cep"
                placeholder="00000-000"
                value={cep}
                inputMode="numeric"
                autoComplete="postal-code"
                onChange={(event) =>
                  setCep(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
                onBlur={handleCepBlur}
                style={{ ...inputStyle, flex: 1 }}
              />

              {buscandoCep && (
                <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                  Buscando...
                </span>
              )}
            </div>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "0.72rem",
                color: "#6B7280",
                lineHeight: 1.35,
              }}
            >
              O CEP será usado para mostrar seu perfil aos clientes da sua
              região.
            </p>
          </div>

          {cidade && (
            <div
              style={{
                padding: "11px 12px",
                borderRadius: "12px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1E40AF",
                fontSize: "0.78rem",
                lineHeight: 1.4,
              }}
            >
              <strong>Região localizada:</strong>{" "}
              {[bairro, cidade, estado].filter(Boolean).join(" - ")}
            </div>
          )}

          {erro && (
            <div
              role="alert"
              style={{
                fontSize: "0.8rem",
                color: "#B91C1C",
                background: "#FEE2E2",
                borderRadius: "10px",
                padding: "9px 10px",
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              padding: "13px 16px",
              borderRadius: "999px",
              border: "none",
              background: loading
                ? "linear-gradient(to right, #94A3B8, #CBD5E1)"
                : "linear-gradient(to right, #0284C7, #0EA5E9)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 700,
              boxShadow: "0 5px 12px rgba(2, 132, 199, 0.2)",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Criando seu perfil..." : "Criar meu perfil profissional"}
          </button>

          <p
            style={{
              margin: "-4px 12px 0",
              textAlign: "center",
              fontSize: "0.7rem",
              color: "#6B7280",
              lineHeight: 1.4,
            }}
          >
            Após o cadastro, abriremos o WhatsApp do Construthéo e você já
            poderá acessar seu painel profissional.
          </p>
        </form>
      </div>
    </main>
  );
}

type CampoProps = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
};

function Campo({
  id,
  label,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  value,
  onChange,
}: CampoProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: 500,
  marginBottom: "4px",
  color: "#374151",
} as const;

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #D1D5DB",
  background: "#FFFFFF",
  fontSize: "0.9rem",
  outline: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
} as const;