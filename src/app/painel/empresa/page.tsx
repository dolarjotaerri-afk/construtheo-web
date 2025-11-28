"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type EmpresaResumo = {
  id?: string;
  nome: string;
  tipo?: string;
  localizacao?: string;
  whatsapp?: string;
  email?: string;
};

type ProdutoEmpresa = {
  id: string;
  nome: string;
  categoria: string | null;
  preco: number;
  unidade: string | null;
  destaque: boolean | null;
};

export default function PainelEmpresaPage() {
  const [empresa, setEmpresa] = useState<EmpresaResumo | null>(null);
  const [produtos, setProdutos] = useState<ProdutoEmpresa[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);

  // form de novo produto
  const [novoNome, setNovoNome] = useState("");
  const [novoCategoria, setNovoCategoria] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novoUnidade, setNovoUnidade] = useState("");
  const [novoDestaque, setNovoDestaque] = useState(true);
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  // 1) Carrega empresa do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("construtheo_empresa_atual");

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as EmpresaResumo & { localizacao?: string };
        setEmpresa(parsed);
        return;
      } catch {
        // cai no demo
      }
    }

    // fallback demo
    setEmpresa({
      nome: "Depósito Central",
      tipo: "Depósito de materiais",
      localizacao: "Igaratá - SP",
      whatsapp: "(11) 99999-0000",
      email: "contato@depositocentral.com",
    });
  }, []);

  // 2) Carrega produtos dessa empresa no Supabase
 useEffect(() => {
  if (!empresa?.id) return;

  const empresaId = empresa.id; // agora é string garantida

  async function carregarProdutos() {
    setCarregandoProdutos(true);
    setErroProdutos(null);

    const { data, error } = await supabase
      .from("produtos_empresas")
      .select("id, nome, categoria, preco, unidade, destaque")
      .eq("empresa_id", empresaId)
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Erro ao carregar produtos:", error.message);
      setErroProdutos("Não foi possível carregar seus produtos.");
    } else {
      setProdutos(data || []);
    }

    setCarregandoProdutos(false);
  }

  carregarProdutos();
}, [empresa?.id]);

  const nomeEmpresa = empresa?.nome || "Sua empresa";
  const tipoEmpresa = empresa?.tipo || "Empresa da construção";
  const local = empresa?.localizacao || "Localização não informada";

  const isDemo = !empresa?.id; // se não tiver id, consideramos demo

  // 3) Handle de adicionar produto rápido
  async function handleAddProduto(e: FormEvent) {
    e.preventDefault();
    setErroProdutos(null);

    if (!empresa?.id) {
      setErroProdutos("Para adicionar produtos, finalize o cadastro da empresa.");
      return;
    }

    if (!novoNome || !novoPreco) {
      setErroProdutos("Preencha pelo menos nome e preço do produto.");
      return;
    }

    const precoNumber = Number(
      novoPreco.replace(".", "").replace(",", ".")
    );

    if (Number.isNaN(precoNumber) || precoNumber <= 0) {
      setErroProdutos("Informe um preço válido.");
      return;
    }

    setSalvandoProduto(true);

    const { data, error } = await supabase
      .from("produtos_empresas")
      .insert([
        {
          empresa_id: empresa.id,
          nome: novoNome,
          categoria: novoCategoria || null,
          preco: precoNumber,
          unidade: novoUnidade || null,
          destaque: novoDestaque,
        },
      ])
      .select("id, nome, categoria, preco, unidade, destaque")
      .single();

    if (error) {
      console.error("Erro ao salvar produto:", error.message);
      setErroProdutos("Não foi possível salvar o produto. Tente novamente.");
    } else if (data) {
      // coloca o novo produto na lista (no topo)
      setProdutos((prev) => [data, ...prev]);
      // limpa form
      setNovoNome("");
      setNovoCategoria("");
      setNovoPreco("");
      setNovoUnidade("");
      setNovoDestaque(true);
    }

    setSalvandoProduto(false);
  }

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 12px",
        background: "#DBEAFE",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "22px 18px 22px",
          boxShadow: "0 15px 35px rgba(15,23,42,0.16)",
        }}
      >
        {/* TOPO */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Olá,
            </p>
            <h1
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {nomeEmpresa}
            </h1>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                marginTop: 2,
              }}
            >
              Bem-vindo ao seu painel de empresa no ConstruThéo.
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#9CA3AF",
                marginTop: 2,
              }}
            >
              {tipoEmpresa} • {local}
            </p>
          </div>

          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: isDemo ? "#EFF6FF" : "#DCFCE7",
              fontSize: "0.7rem",
              color: isDemo ? "#2563EB" : "#15803D",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {isDemo ? "Conta demo" : "Empresa conectada"}
          </span>
        </header>

        {/* RESUMO MÉTRICAS (ainda demo) */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 16,
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            fontSize: "0.78rem",
          }}
        >
          <div>
            <p
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Avaliação média
            </p>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#6B7280",
              }}
            >
              <span>⭐</span>
              <span>
                <strong>4,7</strong> (3 avaliações)
              </span>
            </p>
          </div>

          <div
            style={{
              width: 1,
              background: "#E5E7EB",
            }}
          />

          <div>
            <p
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Cupons ativos
            </p>
            <p style={{ color: "#6B7280" }}>
              <strong>3</strong> disponíveis
            </p>
          </div>
        </section>

        {/* PRODUTOS EM DESTAQUE / DA EMPRESA */}
        <section
          style={{
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Seus produtos em destaque
            </p>
            {!isDemo && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#64748B",
                }}
              >
                {carregandoProdutos
                  ? "Carregando..."
                  : `${produtos.length} produto(s)`}
              </span>
            )}
          </div>

          {/* Lista de produtos */}
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {carregandoProdutos ? (
              <div
                style={{
                  minWidth: 190,
                  borderRadius: 18,
                  border: "1px solid #E5E7EB",
                  background: "#F9FAFB",
                  padding: 12,
                  fontSize: "0.8rem",
                  color: "#6B7280",
                }}
              >
                Carregando produtos...
              </div>
            ) : produtos.length === 0 ? (
              <div
                style={{
                  minWidth: 220,
                  borderRadius: 18,
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAFC",
                  padding: 12,
                  fontSize: "0.8rem",
                  color: "#64748B",
                }}
              >
                Nenhum produto cadastrado ainda. Use o formulário abaixo para
                adicionar o primeiro produto do seu depósito.
              </div>
            ) : (
              produtos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    minWidth: 190,
                    borderRadius: 18,
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      height: 80,
                      borderRadius: 12,
                      background: "#E5F0FF",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#64748B",
                    }}
                  >
                    Foto do produto
                  </div>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {p.nome}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {p.categoria || "Produto para obra"}
                  </p>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#16A34A",
                      marginBottom: 4,
                    }}
                  >
                    R$ {p.preco.toFixed(2).replace(".", ",")}
                    {p.unidade ? ` / ${p.unidade}` : ""}
                  </p>

                  {p.destaque && (
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#2563EB",
                        marginBottom: 4,
                      }}
                    >
                      • Em destaque para os clientes
                    </p>
                  )}

                  <button
                    style={{
                      borderRadius: 999,
                      padding: "6px 10px",
                      border: "1px solid #2563EB",
                      background: "white",
                      fontSize: "0.75rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                </div>
              ))
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: "#9CA3AF",
              marginTop: 4,
            }}
          >
            Arraste para o lado para ver todos os produtos
          </p>

          {erroProdutos && (
            <p
              style={{
                marginTop: 6,
                fontSize: "0.75rem",
                color: "#B91C1C",
              }}
            >
              {erroProdutos}
            </p>
          )}
        </section>

        {/* FORMULÁRIO RÁPIDO: ADICIONAR PRODUTO */}
        {!isDemo && (
          <section
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 18,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: 6,
              }}
            >
              Adicionar produto rápido
            </p>

            <form
              onSubmit={handleAddProduto}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <input
                placeholder="Nome do produto (ex: Cimento CP-II 50kg)"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  fontSize: "0.8rem",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 0.9fr",
                  gap: 6,
                }}
              >
                <input
                  placeholder="Categoria (ex: Cimento, Blocos...)"
                  value={novoCategoria}
                  onChange={(e) => setNovoCategoria(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #D1D5DB",
                    fontSize: "0.8rem",
                  }}
                />

                <input
                  placeholder="Preço (ex: 32,90)"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #D1D5DB",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              <input
                placeholder="Unidade (ex: saco 50kg, unidade, m²...)"
                value={novoUnidade}
                onChange={(e) => setNovoUnidade(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  fontSize: "0.8rem",
                }}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.75rem",
                  color: "#4B5563",
                }}
              >
                <input
                  type="checkbox"
                  checked={novoDestaque}
                  onChange={(e) => setNovoDestaque(e.target.checked)}
                />
                Colocar este produto em destaque para clientes próximos
              </label>

              <button
                type="submit"
                disabled={salvandoProduto}
                style={{
                  marginTop: 4,
                  padding: "8px 0",
                  borderRadius: 999,
                  border: "none",
                  background: salvandoProduto
                    ? "#94A3B8"
                    : "linear-gradient(to right, #0284C7, #0EA5E9)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: salvandoProduto ? "default" : "pointer",
                }}
              >
                {salvandoProduto ? "Salvando..." : "Adicionar produto"}
              </button>
            </form>
          </section>
        )}

        {/* PROMOÇÕES / CUPONS ainda demo */}
        <section
          style={{
            borderRadius: 18,
            border: "1px solid #FACC15",
            background: "#FFFBEB",
            padding: "10px 12px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#92400E",
              }}
            >
              Promoções e cupons
            </p>

            <button
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.72rem",
                color: "#B45309",
                cursor: "pointer",
              }}
            >
              Gerenciar →
            </button>
          </div>

          {/* cards de cupom seguem demo por enquanto */}
          {/* ... (pode deixar igual estava, não interfere na sincronização) */}
        </section>

        {/* RODAPÉ / SAIR */}
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            ← Voltar para a tela inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
