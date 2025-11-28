"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const steps = ["Dados básicos", "Contato", "Localização"];

export default function CadastroEmpresaPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const nomeFantasia =
        ((formData.get("nome_fantasia") as string) || "").trim();
      const responsavel =
        ((formData.get("responsavel") as string) || "").trim();
      const cnpj = ((formData.get("cnpj") as string) || "").trim();
      const tipoEmpresa = ((formData.get("tipo") as string) || "").trim();
      const detalheTipo =
        ((formData.get("detalhe_tipo") as string) || "").trim();

      const emailRaw = (formData.get("email") as string) || "";
      const email = emailRaw.trim().toLowerCase();

      const whatsapp = ((formData.get("whatsapp") as string) || "").trim();
      const telefone = ((formData.get("telefone") as string) || "").trim(); // só localStorage
      const instagram =
        ((formData.get("instagram") as string) || "").trim();

      const cidade = ((formData.get("cidade") as string) || "").trim();
      const estado = ((formData.get("estado") as string) || "").trim();
      const bairro = ((formData.get("bairro") as string) || "").trim();
      const endereco = ((formData.get("endereco") as string) || "").trim(); // só localStorage

      const aceitaOfertas =
        formData.get("aceita_ofertas_whatsapp") === "on";

      // monta localizacao para a coluna "localizacao"
      let localizacao = [cidade, estado].filter(Boolean).join(" - ");
      if (bairro) {
        localizacao = localizacao
          ? `${localizacao} (${bairro})`
          : bairro;
      }

      // validações básicas
      if (!nomeFantasia || !whatsapp || !cidade) {
        setErro(
          "Preencha pelo menos Nome fantasia, WhatsApp e Cidade da empresa."
        );
        setLoading(false);
        return;
      }

      if (!tipoEmpresa) {
        setErro("Selecione o tipo de empresa.");
        setLoading(false);
        return;
      }

      if (!email) {
        setErro("Informe um e-mail para login da empresa.");
        setLoading(false);
        return;
      }

      if (senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        setErro("As senhas não conferem.");
        setLoading(false);
        return;
      }

      // 👉 1) Criar usuário na Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              tipo: "empresa",
              nome: nomeFantasia,
            },
          },
        });

      if (signUpError) {
        console.error("Erro ao criar usuário:", signUpError.message);
        setErro(signUpError.message || "Não foi possível criar sua conta.");
        setLoading(false);
        return;
      }

      const user = signUpData.user;
      if (!user) {
        setErro("Não foi possível obter o usuário criado.");
        setLoading(false);
        return;
      }

      // 👉 2) Inserir na tabela EMPRESAS com as colunas reais
      const { data, error } = await supabase
        .from("empresas")
        .insert([
          {
            id: user.id, // mesmo id da Auth
            nome: nomeFantasia,
            cnpj,
            responsavel,
            email,
            whatsapp,
            tipo: tipoEmpresa,
            detalhe_tipo: detalheTipo,
            localizacao,
            instagram,
          },
        ])
        .select("id, nome, tipo, localizacao, whatsapp, email")
        .single();

      if (error) {
        console.error("Erro ao salvar empresa:", error.message);
        setErro(
          "Não foi possível salvar o cadastro da empresa. Tente novamente."
        );
        setLoading(false);
        return;
      }

      // 👉 3) Guarda um resumo no localStorage (para usar no painel)
      if (typeof window !== "undefined") {
        const resumoEmpresa = {
          id: data?.id,
          nome: data?.nome || nomeFantasia,
          tipo: data?.tipo || tipoEmpresa,
          localizacao: data?.localizacao || localizacao,
          whatsapp,
          email,
          telefone,
          cidade,
          estado,
          bairro,
          endereco,
          instagram,
          aceitaOfertas,
        };

        localStorage.setItem(
          "construtheo_empresa_atual",
          JSON.stringify(resumoEmpresa)
        );
      }

      // 👉 4) Redireciona para o painel da empresa
      router.push("/painel/empresa");
    } catch (err) {
      console.error(err);
      setErro("Ocorreu um erro inesperado. Tente novamente.");
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
          CADASTRO DE EMPRESA
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
          Comece a vender pelo{" "}
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
          Conecte sua empresa com clientes que estão construindo e reformando na
          sua região e destaque seus produtos e serviços.
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
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {/* Nome fantasia */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="nome_fantasia"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Nome da empresa (como será exibido)
          </label>
          <input
            id="nome_fantasia"
            name="nome_fantasia"
            placeholder="Ex: Depósito Central"
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

        {/* Responsável */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="responsavel"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Nome do responsável (opcional)
          </label>
          <input
            id="responsavel"
            name="responsavel"
            placeholder="Quem responde pela empresa"
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

        {/* CNPJ */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="cnpj"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            CNPJ (opcional)
          </label>
          <input
            id="cnpj"
            name="cnpj"
            placeholder="00.000.000/0000-00"
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

        {/* Tipo de empresa */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="tipo"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Tipo de empresa
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue=""
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #D1D5DB",
              background: "#FFFFFF",
              fontSize: "0.9rem",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            <option value="Deposito de materiais">
              Depósito de materiais
            </option>
            <option value="Usina de concreto">Usina de concreto</option>
            <option value="Locadora de caçambas">
              Locadora de caçambas
            </option>
            <option value="Serralheria">Serralheria</option>
            <option value="Marmoraria">Marmoraria</option>
            <option value="Energia solar">Empresa de energia solar</option>
            <option value="Outros">Outros serviços para obra</option>
          </select>

          <input
            id="detalhe_tipo"
            name="detalhe_tipo"
            placeholder="Detalhe do tipo (ex: só concreto usinado, só telhas, etc.) - opcional"
            style={{
              marginTop: "6px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              fontSize: "0.8rem",
              outline: "none",
            }}
          />
        </div>

        {/* Contatos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "10px",
          }}
        >
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
              WhatsApp principal
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

          {/* Telefone fixo (só localStorage) */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="telefone"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Telefone fixo (opcional)
            </label>
            <input
              id="telefone"
              name="telefone"
              placeholder="(00) 0000-0000"
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

        {/* Email login */}
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
            placeholder="contato@minhaempresa.com"
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
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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

        {/* Localização */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "10px",
          }}
        >
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

        {/* Endereço completo (só localStorage) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="endereco"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Endereço completo (opcional)
          </label>
          <input
            id="endereco"
            name="endereco"
            placeholder="Rua, número, complemento..."
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

        {/* Instagram */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            htmlFor="instagram"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "4px",
              color: "#374151",
            }}
          >
            Instagram da empresa (opcional)
          </label>
          <input
            id="instagram"
            name="instagram"
            placeholder="@nome_da_sua_empresa"
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
            Quero receber novidades, oportunidades e dicas para vender mais pelo
            ConstruThéo no WhatsApp.
          </span>
        </label>

        {/* ERRO */}
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
          {loading ? "Criando conta..." : "Criar conta de empresa"}
        </button>
      </form>
    </div>
  );
}
