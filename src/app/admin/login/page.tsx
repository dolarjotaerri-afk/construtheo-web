"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@construtheo.com");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Se já estiver logado como admin, vai direto pro painel
  useEffect(() => {
    const verificarSessao = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      const role = (data.user.app_metadata as any)?.role;
      if (role === "admin") {
        router.replace("/painel/admin");
      }
    };

    verificarSessao();
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password: senha,
      });

      if (error) {
        console.error("Erro no login admin:", error);
        setErro(error.message || "Não foi possível entrar. Verifique os dados.");
        setLoading(false);
        return;
      }

      const user = data.user;
      const role = (user?.app_metadata as any)?.role;

      if (role !== "admin") {
        // se não for admin, não deixa ficar logado
        await supabase.auth.signOut();
        setErro("Você não tem permissão para acessar o painel do administrador.");
        setLoading(false);
        return;
      }

      router.push("/painel/admin");
    } catch (err: any) {
      console.error(err);
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "26px 22px 28px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        {/* VOLTAR */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
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
        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#B91C1C",
              marginBottom: "4px",
            }}
          >
            ACESSO RESTRITO
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
            Login do administrador
          </h1>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#4B5563",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            Use o e-mail e a senha exclusivos do administrador para gerenciar
            toda a plataforma ConstruThéo.
          </p>
        </header>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="email"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              E-mail do administrador
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.2s",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="senha"
              style={{
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
              placeholder="Digite sua senha"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.2s",
              }}
            />
          </div>

          {erro && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "0.8rem",
                color: "#B91C1C",
                background: "#FEE2E2",
                borderRadius: "10px",
                padding: "8px 10px",
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "12px 0",
              borderRadius: "999px",
              background: loading
                ? "linear-gradient(to right, #94A3B8, #CBD5F5)"
                : "linear-gradient(to right, #DC2626, #F97316)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar no painel do administrador"}
          </button>
        </form>
      </div>
    </main>
  );
}
