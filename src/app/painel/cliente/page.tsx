"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../supabaseClient";

type ClienteResumo = {
  id: string;
  nome: string;
  apelido?: string | null;
  email: string;
  whatsapp?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  aceita_ofertas_whatsapp?: boolean;
};

export default function PainelClientePage() {
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        // tenta localStorage
        const salvo = localStorage.getItem("construtheo_cliente_atual");
        if (salvo) {
          setCliente(JSON.parse(salvo));
          setCarregando(false);
          return;
        }

        // tenta auth supabase
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (user) {
          const { data } = await supabase
            .from("clientes")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (data) {
            localStorage.setItem("construtheo_cliente_atual", JSON.stringify(data));
            setCliente(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function formatarCep(cep?: string) {
    if (!cep) return "";
    const d = cep.replace(/\D/g, "");
    if (d.length !== 8) return d;
    return d.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  const nomeExibicao =
    cliente?.apelido && cliente.apelido.trim() !== ""
      ? cliente.apelido
      : cliente?.nome || "cliente";

  return (
    <main style={{ minHeight: "100vh", background: "#F9FAFB", padding: 16 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 12, color: "#6B7280" }}>Bem-vindo(a)</p>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{nomeExibicao}</h1>
          </div>

          <Link
            href="/login"
            onClick={() => {
              localStorage.removeItem("construtheo_cliente_atual");
              supabase.auth.signOut();
            }}
            style={{ fontSize: 12, textDecoration: "underline", color: "#2563EB" }}
          >
            Sair
          </Link>
        </header>

        <section
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Seus dados</h2>

          {carregando && <p>Carregando...</p>}

          {!carregando && !cliente && (
            <p style={{ color: "red" }}>
              Não encontramos seus dados. Faça login novamente.
            </p>
          )}

          {cliente && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p><strong>Nome:</strong> {cliente.nome}</p>
              {cliente.apelido && (
                <p>
                  <strong>Como gosta de ser chamado:</strong> {cliente.apelido}
                </p>
              )}
              <p><strong>Email:</strong> {cliente.email}</p>
              {cliente.whatsapp && (
                <p><strong>WhatsApp:</strong> {cliente.whatsapp}</p>
              )}
            </div>
          )}
        </section>

        {cliente && (
          <section
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Localização
            </h2>

            <p><strong>Cidade:</strong> {cliente.cidade}</p>
            <p><strong>Estado:</strong> {cliente.estado}</p>
            <p><strong>Bairro:</strong> {cliente.bairro}</p>
            <p><strong>CEP:</strong> {formatarCep(cliente.cep)}</p>
          </section>
        )}

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 999,
            background: "#0284C7",
            color: "#fff",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Voltar para a tela inicial
        </Link>
      </div>
    </main>
  );
}