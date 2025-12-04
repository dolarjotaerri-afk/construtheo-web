"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cadastrarCliente } from "../../../lib/clienteService";
import { buscarEnderecoPorCep } from "../../../lib/cepService";

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
      setMensagem(
        err?.message || "Não foi possível buscar o endereço pelo CEP."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const nome = ((formData.get("nome") as string) || "").trim();
    const apelidoForm =
      ((formData.get("apelido") as string) || "").trim();
    const emailRaw = (formData.get("email") as string) || "";
    const email = emailRaw.trim().toLowerCase();
    const whatsapp =
      ((formData.get("whatsapp") as string) || "").trim();
    const senha = ((formData.get("senha") as string) || "").trim();

    const apelido = apelidoForm || nome;

    const cidadeFinal = cidade.trim();
    const estadoFinal = estado.trim();
    const bairroFinal = bairro.trim();
    const cepFinal = cep.replace(/\D/g, "");

    const aceitaOfertas =
      formData.get("aceita_ofertas_whatsapp") === "on";

    if (!nome || !email || !whatsapp || !senha || !cidadeFinal) {
      setMensagem(
        "Preencha pelo menos Nome, WhatsApp, E-mail, Senha e Cidade."
      );
      setLoading(false);
      return;
    }

    try {
      // 1) Salva no Supabase (ajustar clienteService para aceitar 'cep')
      await cadastrarCliente({
        nome,
        apelido,
        whatsapp,
        email,
        senha,
        cidade: cidadeFinal,
        estado: estadoFinal,
        bairro: bairroFinal,
        cep: cepFinal || null,
        aceitaOfertasWhatsapp: aceitaOfertas,
      });

      // 2) Mantém local no localStorage para o painel
      const demoCliente = {
        nome,
        apelido,
        email,
        whatsapp,
        cidade: cidadeFinal,
        estado: estadoFinal,
        bairro: bairroFinal,
        cep: cepFinal || null,
        aceitaOfertas,
        localizacao: `${cidadeFinal}${estadoFinal ? " - " + estadoFinal : ""}`,
        criadoEm: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "construtheo_demo_cliente",
          JSON.stringify(demoCliente)
        );
      }

      setMensagem("Conta criada com sucesso! 🎉");

      form.reset();
      setCep("");
      setCidade("");
      setEstado("");
      setBairro("");

      router.push("/painel/cliente");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      setMensagem("Erro ao criar sua conta. Tente novamente em instantes.");
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            Ao informar o CEP, vamos preencher automaticamente cidade, estado e
            bairro.
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
            placeholder="Seu bairro"
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
              color: "#0369A1",
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
