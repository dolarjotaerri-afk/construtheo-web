"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { buscarEnderecoPorCep } from "../../../lib/cepService";

const steps = ["Dados básicos", "Contato", "Localização"];

export default function CadastroClientePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // senha
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // CEP / endereço
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
      setMensagem(null);

      const endereco = await buscarEnderecoPorCep(cepLimpo);

      setCidade((prev) => prev || endereco.cidade);
      setEstado((prev) => prev || endereco.estado);
      setBairro((prev) => prev || endereco.bairro || "");
    } catch (err: any) {
      console.error(err);
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("load failed")) {
        setMensagem(
          "Não conseguimos conectar para buscar o CEP agora. Tente novamente em instantes."
        );
      } else {
        setMensagem(
          err?.message || "Não foi possível buscar o endereço pelo CEP."
        );
      }
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const nome = ((formData.get("nome") as string) || "").trim();
      const apelido = ((formData.get("apelido") as string) || "").trim();
      const emailRaw = (formData.get("email") as string) || "";
      const email = emailRaw.trim().toLowerCase();
      const whatsapp = ((formData.get("whatsapp") as string) || "").trim();

      const cidadeFinal = cidade.trim();
      const estadoFinal = estado.trim();
      const bairroFinal = bairro.trim();
      const cepFinal = cep.replace(/\D/g, "");

      const aceitaOfertas =
        formData.get("aceita_ofertas_whatsapp") === "on";

      // validações básicas
      if (!nome) {
        setMensagem("Informe seu nome completo.");
        setLoading(false);
        return;
      }

      if (!email) {
        setMensagem("Informe um e-mail para login.");
        setLoading(false);
        return;
      }

      if (!whatsapp) {
        setMensagem("Informe um número de WhatsApp.");
        setLoading(false);
        return;
      }

      if (!cidadeFinal) {
        setMensagem("Informe a cidade onde você está.");
        setLoading(false);
        return;
      }

      if (senha.length < 6) {
        setMensagem("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        setMensagem("As senhas não conferem.");
        setLoading(false);
        return;
      }

      // 1) Verificar se o e-mail já existe em alguma tabela de usuários
      const tabelasUsuarios = ["clientes", "profissionais", "empresas"] as const;

      const resultadosEmail = await Promise.all(
        tabelasUsuarios.map((tabela) =>
          supabase
            .from(tabela)
            .select("id", { count: "exact", head: true })
            .eq("email", email)
        )
      );

      const emailJaExiste = resultadosEmail.some(({ count, error }) => {
        if (error) {
          console.error(`Erro ao verificar e-mail em tabela:`, error.message);
          return false;
        }
        return (count ?? 0) > 0;
      });

      if (emailJaExiste) {
        setMensagem(
          "Este e-mail já está cadastrado na plataforma. Faça login ou recupere sua senha."
        );
        setLoading(false);
        return;
      }

      // 2) Criar usuário no Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              tipo_usuario: "cliente",
              nome,
            },
          },
        });

      if (signUpError) {
        console.error("Erro ao criar usuário:", signUpError.message);
        setMensagem(signUpError.message || "Não foi possível criar sua conta.");
        setLoading(false);
        return;
      }

      const user = signUpData.user;
      if (!user) {
        setMensagem("Não foi possível obter o usuário criado.");
        setLoading(false);
        return;
      }

      // 3) Inserir na tabela CLIENTES
      const { error: insertError } = await supabase.from("clientes").insert({
        id: user.id,
        nome,
        apelido: apelido || null,
        email,
        whatsapp,
        cidade: cidadeFinal || null,
        estado: estadoFinal || null,
        bairro: bairroFinal || null,
        cep: cepFinal || null,
        aceita_ofertas_whatsapp: aceitaOfertas,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Erro ao salvar cliente:", insertError.message);
        setMensagem(
          "Não foi possível salvar seu cadastro. Tente novamente em instantes."
        );
        setLoading(false);
        return;
      }

      // 4) Guarda resumo no localStorage
      if (typeof window !== "undefined") {
        const resumoCliente = {
          id: user.id,
          nome,
          apelido: apelido || null,
          email,
          whatsapp,
          cidade: cidadeFinal || null,
          estado: estadoFinal || null,
          bairro: bairroFinal || null,
          cep: cepFinal || null,
          aceita_ofertas_whatsapp: aceitaOfertas,
        };

        localStorage.setItem(
          "construtheo_cliente_atual",
          JSON.stringify(resumoCliente)
        );
      }

      // 5) Redireciona para o painel do cliente
      router.push("/painel/cliente");
    } catch (err: any) {
      console.error(err);
      const raw = String(err?.message || "").toLowerCase();

      if (raw.includes("load failed") || raw.includes("failed to fetch")) {
        setMensagem(
          "Não conseguimos conectar ao servidor agora. Verifique sua internet e tente novamente."
        );
      } else {
        setMensagem(
          err?.message || "Ocorreu um erro inesperado. Tente novamente."
        );
      }
      setLoading(false);
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
              transition: "all 0.15s ease",
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
              color: "#2563EB",
              marginBottom: "4px",
            }}
          >
            CADASTRO DE CLIENTE
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
            Comece sua conta no{" "}
            <span style={{ color: "#2563EB" }}>ConstruThéo</span>
          </h1>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#4B5563",
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            Um cadastro rápido para sabermos como podemos te ajudar na sua obra.
          </p>
        </header>

        {/* ETAPAS */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "6px",
            borderRadius: "999px",
            background: "#F1F5F9",
            marginBottom: "22px",
          }}
        >
          {steps.map((label, index) => {
            const active = index === 0;
            return (
              <div
                key={label}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  textAlign: "center",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: active ? 600 : 500,
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#2563EB" : "#64748B",
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Nome completo */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="nome"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              placeholder="Seu nome completo"
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

          {/* Apelido */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="apelido"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Como gosta de ser chamado (opcional)
            </label>
            <input
              id="apelido"
              name="apelido"
              placeholder="Ex: Junior, João, Maria..."
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

          {/* WhatsApp */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="whatsapp"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              WhatsApp
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              placeholder="(00) 00000-0000"
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

          {/* Email */}
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
              E-mail (para login)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seuemail@exemplo.com"
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

          {/* Senha */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
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
                Senha de acesso
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
                htmlFor="confirmarSenha"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: "#374151",
                }}
              >
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
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
          </div>

          {/* CEP */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="cep"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              CEP
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                id="cep"
                name="cep"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setCep(onlyDigits);
                }}
                onBlur={handleCepBlur}
                style={{
                  flex: 1,
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
              {buscandoCep && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748B",
                  }}
                >
                  Buscando...
                </span>
              )}
            </div>
            <p
              style={{
                marginTop: "4px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Ao informar o CEP, vamos preencher automaticamente cidade, estado
              e bairro.
            </p>
          </div>

          {/* Cidade */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="cidade"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Cidade
            </label>
            <input
              id="cidade"
              name="cidade"
              placeholder="Ex: Igaratá"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
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

          {/* Estado */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="estado"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Estado (UF)
            </label>
            <input
              id="estado"
              name="estado"
              placeholder="SP, RJ, MG..."
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
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

          {/* Bairro */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="bairro"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Bairro
            </label>
            <input
              id="bairro"
              name="bairro"
              placeholder="Ex: Centro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
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

          {/* Checkbox ofertas */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              fontSize: "0.75rem",
              color: "#4B5563",
            }}
          >
            <input
              type="checkbox"
              name="aceita_ofertas_whatsapp"
              defaultChecked
              style={{ marginTop: "2px" }}
            />
            <span>
              Quero receber promoções, descontos e oportunidades da construção
              civil pelo WhatsApp.
            </span>
          </label>

          {/* ERRO */}
          {mensagem && (
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
              {mensagem}
            </div>
          )}

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "12px 0",
              borderRadius: "999px",
              background: loading
                ? "linear-gradient(to right, #94A3B8, #CBD5F5)"
                : "linear-gradient(to right, #0284C7, #0EA5E9)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>
      </div>
    </main>
  );
}