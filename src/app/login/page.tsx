"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const tipoLabels: Record<string, string> = {
  cliente: "Cliente",
  empresa: "Empresa",
  profissional: "Profissional da Construção",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") || "cliente";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const labelTipo = tipoLabels[tipo] || "Cliente";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMensagem(null);

    if (!email || !senha) {
      setMensagem("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      if (tipo === "cliente") {
        // LOGIN CLIENTE: tabela "clientes" (email + senha em texto simples)
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("email", email)
          .eq("senha", senha)
          .single();

        if (error || !data) {
          setMensagem("E-mail ou senha inválidos.");
          return;
        }

        // Salva dados mínimos no localStorage pro painel do cliente
        if (typeof window !== "undefined") {
          const demoCliente = {
            nome: data.nome,
            apelido: data.apelido ?? data.nome,
            email: data.email,
            whatsapp: data.whatsapp,
            cidade: data.cidade,
            estado: data.estado,
            bairro: data.bairro,
            localizacao: `${data.cidade} - ${data.estado}`,
            criadoEm: data.created_at,
          };

          localStorage.setItem(
            "construtheo_demo_cliente",
            JSON.stringify(demoCliente)
          );
        }

        router.push("/painel/cliente");
        return;
      }

      if (tipo === "profissional") {
        // LOGIN PROFISSIONAL (ainda sem senha na tabela, então só confere e-mail)
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .eq("email", email)
          .single();

        if (error || !data) {
          setMensagem(
            "Profissional não encontrado. Cadastre-se como profissional."
          );
          return;
        }

        // Redireciona para o painel do profissional (id + apelido na URL)
        const apelido = data.apelido || data.nome || "profissional";

        router.push(
          `/painel/profissional?id=${encodeURIComponent(
            data.id
          )}&apelido=${encodeURIComponent(apelido)}`
        );
        return;
      }

      if (tipo === "empresa") {
        // Por enquanto, só direciona para cadastro de empresa
        setMensagem("Login de empresa ainda em configuração. Faça seu cadastro.");
        router.push("/cadastro/empresa");
        return;
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setMensagem("Erro ao tentar acessar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
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
        {/* VOLTAR PRA HOME */}
        <div style={{ marginBottom: "12px" }}>
          <Link
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            ← Voltar para escolher o tipo de acesso
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
          Acesse sua conta com e-mail e senha cadastrados.
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

        {/* Links de cadastro */}
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
