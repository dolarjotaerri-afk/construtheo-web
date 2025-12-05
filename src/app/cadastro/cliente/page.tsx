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

  // estados CEP
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
      const raw = String(err?.message || "");
      if (raw.toLowerCase().includes("load failed")) {
        setMensagem("Não conseguimos conectar agora. Tente novamente.");
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
      if (senha.length < 6) throw new Error("A senha precisa ter 6 caracteres.");
      if (senha !== confirmarSenha) throw new Error("As senhas não conferem.");

      // 1 — cadastro auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, tipo_usuario: "cliente" },
        },
      });

      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error("Erro ao criar usuário.");

      // dados adicionais
      const apelido = String(formData.get("apelido") || "").trim() || null;
      const whatsapp = String(formData.get("whatsapp") || "").trim() || null;
      const cepForm = String(formData.get("cep") || "");
      const cidadeForm = String(formData.get("cidade") || "");
      const estadoForm = String(formData.get("estado") || "");
      const bairroForm = String(formData.get("bairro") || "");
      const aceita = formData.get("aceita_ofertas_whatsapp") === "on";

      // 2 — insert tabela clientes
      const { error: insertErr } = await supabase.from("clientes").insert({
        id: user.id,
        nome,
        email,
        apelido,
        whatsapp,
        cep: cepForm,
        cidade: cidadeForm,
        estado: estadoForm,
        bairro: bairroForm,
        aceita_ofertas_whatsapp: aceita,
        created_at: new Date().toISOString(),
      });

      if (insertErr) throw insertErr;

      // 3 — salvar localStorage
      localStorage.setItem(
        "construtheo_cliente_atual",
        JSON.stringify({
          id: user.id,
          nome,
          apelido,
          email,
          whatsapp,
          cep: cepForm,
          cidade: cidadeForm,
          estado: estadoForm,
          bairro: bairroForm,
          aceita_ofertas_whatsapp: aceita,
        })
      );

      router.push("/painel/cliente");
    } catch (err: any) {
      console.error("ERRO AO CRIAR CLIENTE:", err);

      const raw = String(err?.message || "").toLowerCase();

      if (raw.includes("load failed")) {
        setMensagem("Falha de conexão. Tente novamente.");
      } else if (raw.includes("duplicate") || raw.includes("already registered")) {
        setMensagem("E-mail já cadastrado.");
      } else {
        setMensagem(err.message || "Erro ao criar conta.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "20px 0" }}>
      <Link
        href="/login"
        style={{
          display: "inline-block",
          marginBottom: 20,
          color: "#2563EB",
          fontWeight: 600,
        }}
      >
        ← Voltar
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Criar conta de cliente
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <input name="nome" placeholder="Nome completo" />

        <input name="apelido" placeholder="Como gosta de ser chamado" />

        <input name="email" type="email" placeholder="E-mail" />

        <input name="whatsapp" placeholder="WhatsApp" />

        <input name="senha" type="password" placeholder="Senha" />

        <input name="confirmar_senha" type="password" placeholder="Confirmar senha" />

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
          <input name="aceita_ofertas_whatsapp" type="checkbox" defaultChecked />  
          Receber ofertas pelo WhatsApp
        </label>

        <button
          disabled={loading}
          style={{
            padding: "12px 0",
            borderRadius: 999,
            background: "#0284C7",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {loading ? "Criando..." : "Criar minha conta"}
        </button>

        {mensagem && (
          <p style={{ color: "red", textAlign: "center" }}>{mensagem}</p>
        )}
      </form>
    </div>
  );
}