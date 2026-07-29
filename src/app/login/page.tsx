"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const tipoLabels: Record<string, string> = {
  cliente: "Cliente",
  empresa: "Empresa",
  profissional: "Profissional da Construção",
};

type TipoUsuario = "cliente" | "empresa" | "profissional";

export default function LoginPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoUsuario>("cliente");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

useEffect(() => {
  let mounted = true;

  async function verificarSessao() {
    const params = new URLSearchParams(window.location.search);
    const tipoUrl = params.get("tipo");

    if (
      tipoUrl === "cliente" ||
      tipoUrl === "empresa" ||
      tipoUrl === "profissional"
    ) {
      setTipo(tipoUrl);
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!mounted) return;

    if (error) {
      console.error("Erro ao verificar sessão:", error);
      setCheckingSession(false);
      return;
    }

    if (!session?.user) {
      setCheckingSession(false);
      return;
    }

    const user = session.user;

    const tipoUsuario =
      (user.user_metadata?.tipo_usuario as TipoUsuario | undefined) ||
      "cliente";

    if (tipoUsuario === "empresa") {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id, status, situacao")
        .eq("email", user.email ?? "")
        .maybeSingle();

      if (!mounted) return;

      const status = empresa?.status || empresa?.situacao;

      if (empresa && (!status || status === "aprovado")) {
        router.replace("/painel/empresa");
        return;
      }

      setMensagem("Seu cadastro de empresa ainda está em análise.");
      setCheckingSession(false);
      return;
    }

    if (tipoUsuario === "profissional") {
      const { data: profissional } = await supabase
        .from("profissionais")
        .select("id, nome, apelido, status, situacao")
        .eq("email", user.email ?? "")
        .maybeSingle();

      if (!mounted) return;

      const status = profissional?.status || profissional?.situacao;

      if (profissional && (!status || status === "aprovado")) {
        const apelido =
          profissional.apelido ||
          profissional.nome ||
          "profissional";

        router.replace(
          `/painel/profissional?id=${encodeURIComponent(
            profissional.id
          )}&apelido=${encodeURIComponent(apelido)}`
        );

        return;
      }

      setMensagem("Seu cadastro profissional ainda está em análise.");
      setCheckingSession(false);
      return;
    }
marcarPrimeiroLogin();
    router.replace("/painel/cliente");
  }

  verificarSessao();

  return () => {
    mounted = false;
  };
}, [router]);

  const labelTipo = tipoLabels[tipo] || "Cliente";
  function marcarPrimeiroLogin() {
  if (typeof window !== "undefined") {
    localStorage.setItem("construtheo-ja-logou", "true");
  }
}

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);

    const emailTratado = email.trim().toLowerCase();

    if (!emailTratado || !senha) {
      setMensagem("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: emailTratado,
          password: senha,
        });

      if (loginError || !loginData.user) {
        console.error("Erro Supabase Auth:", loginError);
        setMensagem("E-mail ou senha inválidos.");
        return;
      }

      const user = loginData.user;

      const tipoUsuario =
        (user.user_metadata?.tipo_usuario as TipoUsuario | undefined) || tipo;

      if (tipoUsuario === "cliente") {
        const { data: clienteData, error: clienteError } = await supabase
          .from("clientes")
          .select("*")
          .eq("email", emailTratado)
          .maybeSingle();

        if (clienteError) {
          console.error("Erro ao buscar cliente:", clienteError);
        }

        const nomeCliente =
          clienteData?.nome ||
          user.user_metadata?.nome ||
          emailTratado.split("@")[0];

        const clienteAtual = {
          nome: nomeCliente,
          apelido: clienteData?.apelido || nomeCliente,
          email: clienteData?.email || emailTratado,
          whatsapp: clienteData?.whatsapp || "",
          cidade: clienteData?.cidade || "",
          estado: clienteData?.estado || "",
          bairro: clienteData?.bairro || "",
          localizacao:
            clienteData?.cidade && clienteData?.estado
              ? `${clienteData.cidade} - ${clienteData.estado}`
              : clienteData?.cidade || "Localização não informada",
          criadoEm: clienteData?.created_at || user.created_at,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "construtheo_cliente_atual",
            JSON.stringify(clienteAtual)
          );

          localStorage.setItem(
            "construtheo_demo_cliente",
            JSON.stringify(clienteAtual)
          );
        }

        localStorage.setItem("construtheo-ja-logou", "true");

router.replace("/painel/cliente");
        return;
      }

      if (tipoUsuario === "profissional") {
        const { data: profissionalData, error: profissionalError } =
          await supabase
            .from("profissionais")
            .select("*")
            .eq("email", emailTratado)
            .maybeSingle();

        if (profissionalError) {
          console.error("Erro ao buscar profissional:", profissionalError);
        }

        if (!profissionalData) {
          setMensagem(
            "Seu cadastro profissional está em análise ou ainda não foi localizado pela equipe ConstruThéo."
          );
          return;
        }

        const status = profissionalData.status || profissionalData.situacao;

        if (status && status !== "aprovado") {
          setMensagem(
            "Seu cadastro profissional ainda está em análise pela equipe ConstruThéo."
          );
          return;
        }

        const apelido =
          profissionalData.apelido || profissionalData.nome || "profissional";

        localStorage.setItem("construtheo-ja-logou", "true");
marcarPrimeiroLogin();
router.push(
  `/painel/profissional?id=${encodeURIComponent(
    profissionalData.id
  )}&apelido=${encodeURIComponent(apelido)}`
);
          router.push(
          `/painel/profissional?id=${encodeURIComponent(
            profissionalData.id
          )}&apelido=${encodeURIComponent(apelido)}`
        );
        return;
      }

      if (tipoUsuario === "empresa") {
        const { data: empresaData, error: empresaError } = await supabase
          .from("empresas")
          .select("*")
          .eq("email", emailTratado)
          .maybeSingle();

        if (empresaError) {
          console.error("Erro ao buscar empresa:", empresaError);
        }

        if (!empresaData) {
          setMensagem(
            "Seu cadastro de empresa está em análise ou ainda não foi localizado pela equipe ConstruThéo."
          );
          return;
        }

        const status = empresaData.status || empresaData.situacao;

        if (status && status !== "aprovado") {
          setMensagem(
            "Seu cadastro de empresa ainda está em análise pela equipe ConstruThéo."
          );
          return;
        }

        localStorage.setItem("construtheo-ja-logou", "true");
marcarPrimeiroLogin();
router.push("/painel/empresa");
        router.push("/painel/empresa");
        return;
      }

      router.push("/painel/cliente");
    } catch (err) {
      console.error("Erro no login:", err);
      setMensagem("Erro ao tentar acessar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }
if (checkingSession) {
  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F1F5F9",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "999px",
          border: "4px solid #DBEAFE",
          borderTopColor: "#2563EB",
          animation: "loginSpin 0.8s linear infinite",
        }}
      />

      <style jsx>{`
        @keyframes loginSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 12px",
        background: "#F1F5F9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "24px 22px 26px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Voltar para a página inicial
          </Link>
        </div>

        <h1
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            marginBottom: "4px",
            color: "#111827",
          }}
        >
          Acessar minha conta
        </h1>

        <p
          style={{
            fontSize: "0.8rem",
            color: "#6B7280",
            marginBottom: "16px",
          }}
        >
          Entre como {labelTipo.toLowerCase()} usando o e-mail e senha
          cadastrados.
        </p>

        {mensagem && (
          <div
            style={{
              marginBottom: "10px",
              fontSize: "0.78rem",
              color: "#B91C1C",
              background: "#FEE2E2",
              borderRadius: "10px",
              padding: "8px 10px",
            }}
          >
            {mensagem}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="email"
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={{
                padding: "11px 13px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="senha"
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha de acesso"
              style={{
                padding: "11px 13px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              padding: "11px 0",
              borderRadius: "999px",
              background: "linear-gradient(to right, #0284C7, #0EA5E9)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 600,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p
          style={{
            marginTop: "10px",
            fontSize: "0.78rem",
            color: "#6B7280",
          }}
        >
          Ainda não tem conta?{" "}
          {tipo === "cliente" && (
            <Link
              href="/cadastro/cliente"
              style={{ color: "#2563EB", fontWeight: 600 }}
            >
              Criar conta de cliente
            </Link>
          )}
          {tipo === "profissional" && (
            <Link
              href="/cadastro/profissional"
              style={{ color: "#2563EB", fontWeight: 600 }}
            >
              Cadastrar como profissional
            </Link>
          )}
          {tipo === "empresa" && (
            <Link
              href="/cadastro/empresa"
              style={{ color: "#2563EB", fontWeight: 600 }}
            >
              Cadastrar empresa
            </Link>
          )}
        </p>
      </div>
    </main>
  );
}