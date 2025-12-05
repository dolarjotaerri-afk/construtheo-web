"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { buscarEnderecoPorCep } from "../../../lib/cepService";
import { supabase } from "../../../lib/supabaseClient";

export default function CadastroClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

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

      setCidade(endereco.cidade || "");
      setEstado(endereco.estado || "");
      setBairro(endereco.bairro || "");
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.includes("load failed")) {
        setMensagem("Falha ao buscar CEP. Verifique sua conexão.");
      } else {
        setMensagem("Não foi possível buscar o endereço.");
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
      const formData = new FormData(e.currentTarget);

      const nome = String(formData.get("nome") || "").trim();
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const senha = String(formData.get("senha") || "");
      const confirmarSenha = String(formData.get("confirmar_senha") || "");

      if (!nome || !email || !senha || !confirmarSenha) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      if (senha.length < 6) {
        throw new Error("A senha precisa ter pelo menos 6 caracteres.");
      }

      if (senha !== confirmarSenha) {
        throw new Error("As senhas não conferem.");
      }

      // CADASTRA NO SUPABASE AUTH
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, tipo_usuario: "cliente" },
        },
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Erro inesperado ao criar sua conta.");

      // CAMPOS EXTRAS
      const apelido = String(formData.get("apelido") || "").trim() || null;
      const whatsapp = String(formData.get("whatsapp") || "").trim() || null;

      const aceita =
        formData.get("aceita_ofertas_whatsapp") === "on";

      // INSERE NA TABELA CLIENTES
      const { error: insertError } = await supabase.from("clientes").insert({
        id: user.id,
        nome,
        email,
        apelido,
        whatsapp,
        cep,
        cidade,
        estado,
        bairro,
        aceita_ofertas_whatsapp: aceita,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // SALVA LOCALMENTE
      localStorage.setItem(
        "construtheo_cliente_atual",
        JSON.stringify({
          id: user.id,
          nome,
          email,
          apelido,
          whatsapp,
          cep,
          cidade,
          estado,
          bairro,
          aceita_ofertas_whatsapp: aceita,
        })
      );

      router.push("/painel/cliente");
    } catch (err: any) {
      console.error("ERRO AO CRIAR CLIENTE:", err);

      const msg = String(err?.message || "").toLowerCase();

      if (msg.includes("load failed")) {
        setMensagem("Não foi possível conectar ao servidor. Tente novamente.");
      } else if (msg.includes("duplicate") || msg.includes("already")) {
        setMensagem("Esse e-mail já está cadastrado.");
      } else {
        setMensagem(err.message || "Erro ao criar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "22px 12px 36px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <Link
          href="/login"
          style={{
            fontSize: "0.85rem",
            color: "#2563EB",
            textDecoration: "underline",
          }}
        >
          ← Voltar
        </Link>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "1.6rem",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        Criar conta de Cliente
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: 24,
          color: "#555",
        }}
      >
        Preencha seus dados para continuar.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <input name="nome" placeholder="Nome completo" />

        <input name="apelido" placeholder="Como gosta de ser chamado" />

        <input name="email" type="email" placeholder="E-mail" />

        <input name="whatsapp" placeholder="WhatsApp" />

        <input
          name="senha"
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
        />

        <input
          name="confirmar_senha"
          type="password"
          placeholder="Confirmar senha"
        />

        <input
          name="cep"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          onBlur={handleCepBlur}
        />

        <input
          name="cidade"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />

        <input
          name="estado"
          placeholder="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        />

        <input
          name="bairro"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />

        <label style={{ fontSize: 14 }}>
          <input
            type="checkbox"
            name="aceita_ofertas_whatsapp"
            defaultChecked
            style={{ marginRight: 6 }}
          />
          Quero receber promoções pelo WhatsApp
        </label>

        <button
          disabled={loading}
          style={{
            padding: "12px 0",
            borderRadius: 999,
            background: "#0284C7",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>

        {mensagem && (
          <p style={{ textAlign: "center", color: "red", marginTop: 8 }}>
            {mensagem}
          </p>
        )}
      </form>
    </div>
  );
}