"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cadastrarCliente } from "../../../lib/clienteService";
import { supabase } from "../../../lib/supabaseClient";

const steps = ["Dados básicos", "Contato", "Localização"];

// helper pra pegar localização atual
async function obterCoordenadasAtual(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Erro ao obter localização do cliente:", err);
        resolve(null); // não trava o cadastro se der erro
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  });
}

export default function CadastroClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const nome = ((formData.get("nome") as string) || "").trim();
    const apelido = ((formData.get("apelido") as string) || "").trim() || nome;

    const emailRaw = (formData.get("email") as string) || "";
    const email = emailRaw.trim().toLowerCase();

    const whatsapp = ((formData.get("whatsapp") as string) || "").trim();

    const senha = ((formData.get("senha") as string) || "").trim();

    const cidade = ((formData.get("cidade") as string) || "").trim();
    const estado = ((formData.get("estado") as string) || "").trim();
    const bairro = ((formData.get("bairro") as string) || "").trim();

    const aceitaOfertas =
      formData.get("aceita_ofertas_whatsapp") === "on";

    // CPF (opcional, mas se preencher a gente valida e usa)
    const cpfRaw = ((formData.get("cpf") as string) || "").trim();
    const cpf = cpfRaw.replace(/\D/g, ""); // só números

    if (!nome || !email || !whatsapp || !senha || !cidade) {
      setMensagem(
        "Preencha pelo menos Nome, WhatsApp, E-mail, Senha e Cidade."
      );
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setMensagem("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    if (cpf && cpf.length !== 11) {
      setMensagem("CPF inválido. Informe os 11 dígitos.");
      setLoading(false);
      return;
    }

    try {
      // 🔍 1) Verificar se o e-mail já existe em qualquer tabela de usuário
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
          console.error(`Erro ao verificar e-mail:`, error.message);
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

      // 🔍 2) Verificar se o CPF já existe para clientes (se informado)
      if (cpf) {
        const { count: countCpf, error: erroCpf } = await supabase
          .from("clientes")
          .select("id", { count: "exact", head: true })
          .eq("cpf", cpf);

        if (erroCpf) {
          console.error("Erro ao verificar CPF:", erroCpf.message);
        }

        if ((countCpf ?? 0) > 0) {
          setMensagem("Este CPF já está cadastrado como cliente no ConstruThéo.");
          setLoading(false);
          return;
        }
      }

      // 📍 3) Tentar obter geolocalização do cliente
      let latitude: number | null = null;
      let longitude: number | null = null;

      const coords = await obterCoordenadasAtual();
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }

      // 4) Salva no Supabase com os CAMPOS REAIS da tabela "clientes"
      await cadastrarCliente({
        nome,
        apelido,
        whatsapp,
        email,
        senha,
        cidade,
        estado,
        bairro,
        aceitaOfertasWhatsapp: aceitaOfertas,
        // fotoPerfil: null, // se tiver depois
      });

      // 5) Atualiza CPF e localização na tabela "clientes"
      try {
        const { data: userData, error: erroUser } =
          await supabase.auth.getUser();

        if (!erroUser && userData?.user) {
          const userId = userData.user.id;

          await supabase
            .from("clientes")
            .update({
              cpf: cpf || null,
              latitude,
              longitude,
            })
            .eq("id", userId);
        }
      } catch (errUpdate) {
        console.error(
          "Erro ao atualizar CPF/localização do cliente:",
          errUpdate
        );
      }

      // 6) Mantém resumo no localStorage pra usar no painel
      const demoCliente = {
        nome,
        apelido,
        email,
        whatsapp,
        cidade,
        estado,
        bairro,
        aceitaOfertas,
        cpf: cpf || null,
        localizacao: `${cidade} - ${estado}`,
        latitude,
        longitude,
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

      // 7) Redireciona pro painel do cliente
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

        {/* CPF (opcional) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="cpf"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            CPF (opcional)
          </label>
          <input
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
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
            placeholder="Crie uma senha (mínimo 6 caracteres)"
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
