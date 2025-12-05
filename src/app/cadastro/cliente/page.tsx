"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { buscarEnderecoPorCep } from "../../../lib/cepService";
import { supabase } from "../../../lib/supabaseClient";

const steps = ["Dados básicos", "Contato", "Localização"];

export default function CadastroClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // estados para endereço / CEP
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [bairro, setBairro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function handleCepBlur() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return; // se tiver menos de 8 dígitos, não chama API
    }

    try {
      setBuscandoCep(true);
      setMensagem(null);

      const endereco = await buscarEnderecoPorCep(cepLimpo);

      setCidade((prev) => prev || endereco.cidade);
      setEstado((prev) => prev || endereco.estado);
      setBairro((prev) => prev || endereco.bairro || "");
    } catch (err: any) {
      console.error(err);
      const raw = String(err?.message || "");
      if (raw.toLowerCase().includes("load failed")) {
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
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const nome = String(formData.get("nome") || "").trim();
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const senhaForm = String(formData.get("senha") || "");
      const confirmarSenhaForm = String(formData.get("confirmar_senha") || "");

      if (!nome || !email || !senhaForm || !confirmarSenhaForm) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      if (senhaForm.length < 6) {
        throw new Error("A senha precisa ter pelo menos 6 caracteres.");
      }

      if (senhaForm !== confirmarSenhaForm) {
        throw new Error("As senhas não conferem.");
      }

      // 1) Cadastra no Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: senhaForm,
          options: {
            data: {
              nome,
              tipo_usuario: "cliente",
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      const user = signUpData.user;
      if (!user) {
        throw new Error("Não foi possível criar o usuário. Tente novamente.");
      }

      // 2) monta dados do cliente
      const apelido = String(formData.get("apelido") || "").trim() || null;
      const whatsapp =
        String(formData.get("whatsapp") || "").trim() || null;
      const cepForm = String(formData.get("cep") || "");
      const cidadeForm = String(formData.get("cidade") || "");
      const estadoForm = String(formData.get("estado") || "");
      const bairroForm = String(formData.get("bairro") || "");
      const aceitaOfertas =
        formData.get("aceita_ofertas_whatsapp") === "on";

      // 3) Insere na tabela clientes
      const { error: insertError } = await supabase.from("clientes").insert({
        id: user.id, // ajusta aqui se na tabela o campo for auth_id em vez de id
        nome,
        email,
        apelido,
        whatsapp,
        cep: cepForm,
        cidade: cidadeForm,
        estado: estadoForm,
        bairro: bairroForm,
        aceita_ofertas_whatsapp: aceitaOfertas,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      // 4) Salva no localStorage pra já entrar com painel preenchido
      if (typeof window !== "undefined") {
        const clienteResumo = {
          id: user.id,
          nome,
          apelido,
          email,
          whatsapp,
          cep: cepForm,
          cidade: cidadeForm,
          estado: estadoForm,
          bairro: bairroForm,
          aceita_ofertas_whatsapp: aceitaOfertas,
        };
        try {
          localStorage.setItem(
            "construtheo_cliente_atual",
            JSON.stringify(clienteResumo)
          );
        } catch (err) {
          console.warn("Não foi possível salvar cliente no localStorage:", err);
        }
      }

      // deu tudo certo
      router.push("/painel/cliente");
    } catch (err: any) {
      console.error("ERRO AO CRIAR CONTA:", err);

      const raw = String(err?.message || "");
      const msg = raw.toLowerCase();

      if (msg.includes("load failed") || msg.includes("failed to fetch")) {
        setMensagem(
          "Não conseguimos conectar ao servidor agora. Verifique sua internet ou tente novamente em alguns instantes."
        );
      } else if (
        msg.includes("already registered") ||
        msg.includes("duplicate key")
      ) {
        setMensagem("Esse e-mail já está cadastrado. Tente fazer login.");
      } else if (msg.includes("password")) {
        setMensagem("Senha inválida. Use pelo menos 6 caracteres.");
      } else if (
        msg.includes("row-level security") ||
        msg.includes("permission")
      ) {
        setMensagem(
          "Erro de permissão ao salvar seus dados. Verifique as políticas RLS da tabela no Supabase."
        );
      } else {
        setMensagem(
          err?.message ||
            "Erro ao criar sua conta. Tente novamente em instantes."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "440px",
        margin: "0 auto",
        paddingTop: "12px",
        paddingBottom: "32px",
      }}
    >
      {/* BOTÃO VOLTAR */}
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

      {/* TÍTULOS */}
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
          marginBottom: "26px",
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

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Nome */}
        {/* ... (resto do formulário exatamente como você já tinha) ... */}

        {/* Vou deixar igual ao seu código original pra não alongar demais */}
        {/* Copia daqui pra baixo do seu arquivo atual sem mudanças de layout */}

        {/* Nome */}
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
              transition: "all 0.2s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
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
            Como gosta de ser chamado
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
            E-mail
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

        {/* Senha */}
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
            name="senha"
            type="password"
            placeholder="Crie uma senha"
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

        {/* Confirmar senha */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="confirmar_senha"
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
            id="confirmar_senha"
            name="confirmar_senha"
            type="password"
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

        {/* CEP, Cidade, Estado, Bairro e checkbox iguais aos que você já tinha */}
        {/* ... (mantém igual, só mudamos a parte de lógica lá em cima) ... */}

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

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "8px",
            padding: "12px 0",
            borderRadius: "999px",
            background: "linear-gradient(to right, #0284C7, #0EA5E9)",
            border: "none",
            color: "#FFFFFF",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            transition: "all 0.2s",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>

        {mensagem && (
          <p
            style={{
              marginTop: "6px",
              fontSize: "0.8rem",
              color: "#DC2626",
              textAlign: "center",
            }}
          >
            {mensagem}
          </p>
        )}
      </form>
    </div>
  );
}