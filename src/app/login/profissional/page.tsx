"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginProfissionalPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !senha.trim()) {
      setErro("Informe seu e-mail e senha.");
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        console.error("Erro login:", error.message);
        setErro("E-mail ou senha inválidos.");
        setCarregando(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setErro("Não foi possível acessar sua conta.");
        setCarregando(false);
        return;
      }

      const meta = (user.user_metadata || {}) as any;
      const apelido =
        meta.apelido || meta.nome || "profissional";

      // redireciona pro painel usando o id da Auth
      router.push(
        `/painel/profissional?id=${user.id}&apelido=${encodeURIComponent(
          apelido
        )}`
      );
    } catch (err: any) {
      console.error(err);
      setErro("Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F3F4F6",
        padding: "24px 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "26px",
          padding: "24px 22px 26px",
          boxShadow: "0 4px 18px rgba(15,23,42,0.12)",
        }}
      >
        {/* VOLTAR */}
        <div style={{ marginBottom: "14px" }}>
          <Link
            href="/login"
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
            ← Voltar para a tela de acesso
          </Link>
        </div>

        {/* TÍTULO */}
        <header style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#2563EB",
              marginBottom: "4px",
            }}
          >
            LOGIN · PROFISSIONAL
          </p>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Acesse seu painel profissional
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#6B7280",
            }}
          >
            Use o e-mail e a senha cadastrados para gerenciar suas obras e
            mostrar seu trabalho.
          </p>
        </header>

        {/* ERRO */}
        {erro && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.82rem",
            }}
          >
            {erro}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.85rem",
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
                width: "100%",
                padding: "11px 13px",
                borderRadius: "11px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <div style={{ marginBottom: "6px" }}>
            <label
              htmlFor="senha"
              style={{
                display: "block",
                fontSize: "0.85rem",
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
              placeholder="Sua senha"
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "11px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>

          <p
            style={{
              fontSize: "0.78rem",
              color: "#6B7280",
              marginBottom: "10px",
            }}
          >
            Esqueceu a senha? Em breve você poderá redefinir direto pelo app.
          </p>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "11px 0",
              borderRadius: "999px",
              border: "none",
              background: carregando
                ? "linear-gradient(to right, #94A3B8, #CBD5F5)"
                : "linear-gradient(to right, #0284C7, #0EA5E9)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.98rem",
              cursor: carregando ? "default" : "pointer",
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
            }}
          >
            {carregando ? "Entrando..." : "Entrar como profissional"}
          </button>

          <p
            style={{
              marginTop: "10px",
              fontSize: "0.82rem",
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Ainda não tem cadastro?{" "}
            <Link
              href="/cadastro/profissoes"
              style={{ color: "#2563EB", textDecoration: "none" }}
            >
              Criar conta de profissional
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
