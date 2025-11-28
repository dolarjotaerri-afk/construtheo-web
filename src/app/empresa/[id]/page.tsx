"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

type Empresa = {
  id: string;
  nome: string;
  cnpj: string | null;
  responsavel: string | null;
  email: string | null;
  whatsapp: string | null;
  localizacao: string | null;
  tipo: string | null;
  detalhe_tipo: string | null;
  instagram: string | null;
};

type Produto = {
  id: string;
  empresa_id: string;
  nome: string;
  preco: number;
  categoria: string;
  destaque: boolean;
  created_at: string;
};

export default function EmpresaVitrinePage() {
  const { id } = useParams();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega empresa + produtos
  useEffect(() => {
    async function carregar() {
      try {
        if (!id) return;

        // Empresa
        const { data: emp, error: empError } = await supabase
          .from("empresas")
          .select("*")
          .eq("id", id)
          .single();

        if (empError) throw empError;
        setEmpresa(emp);

        // Produtos da empresa
        const { data: prods, error: prodError } = await supabase
          .from("produtos_empresas")
          .select("*")
          .eq("empresa_id", id)
          .order("destaque", { ascending: false })
          .order("created_at", { ascending: false });

        if (prodError) throw prodError;
        setProdutos(prods || []);
      } catch (err) {
        console.error("Erro ao carregar empresa:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#6B7280" }}>Carregando informações...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "#1E293B", fontSize: "1.2rem", fontWeight: 700 }}>
          Empresa não encontrada
        </h2>

        <Link
          href="/painel/cliente"
          style={{
            color: "#2563EB",
            textDecoration: "underline",
            fontSize: "0.9rem",
            marginTop: 12,
            display: "inline-block",
          }}
        >
          Voltar ao painel
        </Link>
      </main>
    );
  }

  const whatsappLink = empresa.whatsapp
    ? `https://wa.me/55${empresa.whatsapp.replace(/\D/g, "")}?text=Olá! Vim pelo ConstruThéo e gostaria de saber mais sobre seus produtos e serviços.`
    : null;

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        paddingBottom: "40px",
        background: "#F1F5F9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "26px 22px 28px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <header style={{ marginBottom: "18px" }}>
          <Link
            href="/painel/cliente"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "underline",
            }}
          >
            ← Voltar
          </Link>

          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#0F172A",
              marginTop: "10px",
              marginBottom: "4px",
            }}
          >
            {empresa.nome}
          </h1>

          <p style={{ color: "#475569", fontSize: "0.85rem" }}>
            {empresa.tipo || "Empresa da construção"}{" "}
            {empresa.detalhe_tipo ? `• ${empresa.detalhe_tipo}` : ""}
          </p>

          {empresa.localizacao && (
            <p
              style={{
                marginTop: "6px",
                fontSize: "0.8rem",
                color: "#64748B",
              }}
            >
              📍 {empresa.localizacao}
            </p>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              style={{
                marginTop: "12px",
                display: "inline-block",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              💬 Falar no WhatsApp
            </a>
          )}
        </header>

        {/* PRODUTOS */}
        <section>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Produtos disponíveis
          </h2>

          {produtos.length === 0 && (
            <p
              style={{
                padding: "12px",
                background: "#F9FAFB",
                border: "1px dashed #E5E7EB",
                borderRadius: "14px",
                color: "#6B7280",
                textAlign: "center",
                fontSize: "0.85rem",
              }}
            >
              Esta empresa ainda não cadastrou produtos.
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {produtos.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {p.destaque && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#DC2626",
                      background: "#FEE2E2",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      display: "inline-block",
                      marginBottom: "6px",
                    }}
                  >
                    ★ Destaque
                  </span>
                )}

                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {p.nome}
                </p>

                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#6B7280",
                    marginBottom: "6px",
                  }}
                >
                  {p.categoria}
                </p>

                <p
                  style={{
                    fontSize: "1rem",
                    color: "#0284C7",
                    fontWeight: 700,
                  }}
                >
                  R$ {p.preco.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
