"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const steps = ["Dados básicos", "Contato", "Localização"];

// Áreas e funções específicas (pode ajustar nomes depois)
const areasConfig: Record<
  string,
  { label: string; funcoes: string[] }
> = {
  alvenaria: {
    label: "Alvenaria",
    funcoes: [
      "Pedreiro",
      "Ajudante",
      "Servente",
      "Assentamento de tijolos",
      "Concretagem",
      "Demolição",
      "Chapisco / Reboco",
      "Outros",
    ],
  },
  acabamento: {
    label: "Acabamento",
    funcoes: [
      "Pintor",
      "Gesseiro / Drywall",
      "Azulejista / Revestimento",
      "Instalador de piso / porcelanato",
      "Instalador de portas / rodapés",
      "Outros",
    ],
  },
  estrutura: {
    label: "Estrutura",
    funcoes: [
      "Armador / Ferragens",
      "Carpinteiro de forma",
      "Mestre de obras",
      "Marteleteiro / Demolição",
      "Outros",
    ],
  },
  eletrica: {
    label: "Elétrica",
    funcoes: [
      "Eletricista residencial",
      "Eletricista predial",
      "Eletricista industrial",
      "Instalador de quadros / disjuntores",
      "Outros",
    ],
  },
  hidraulica: {
    label: "Hidráulica",
    funcoes: [
      "Encanador",
      "Manutenção hidráulica",
      "Instalador de louças / metais",
      "Outros",
    ],
  },
  vidracaria: {
    label: "Vidracaria",
    funcoes: [
      "Vidraceiro",
      "Instalador de vidro",
      "Instalador de box",
      "Instalador de espelho",
      "Manutenção de vidraçaria",
      "Outros",
    ],
  },
  jardinagem: {
    label: "Jardinagem e paisagismo",
    funcoes: [
      "Jardineiro",
      "Paisagista",
      "Plantio de grama",
      "Poda de árvores / arbustos",
      "Limpeza de jardim / quintal",
      "Outros",
    ],
  },
  geral: {
    label: "Outras áreas da construção",
    funcoes: ["Profissional da construção", "Outros"],
  },
  // se vier ?area=outros, cai aqui também
  outros: {
    label: "Outras áreas da construção",
    funcoes: ["Profissional da construção", "Outros"],
  },
};

// helper pra pegar localização atual do navegador
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
        console.error("Erro ao obter localização do profissional:", err);
        resolve(null); // não trava o cadastro
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  });
}

export default function CadastroProfissionalPage() {
  const router = useRouter();

  const [funcaoSelecionada, setFuncaoSelecionada] = useState<string | null>(
    null
  );
  const [outrosDetalhe, setOutrosDetalhe] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // estados para Auth
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // estado para a área vinda da URL (?area=...)
  const [areaSlug, setAreaSlug] = useState<keyof typeof areasConfig>("geral");

  // lê ?area=... da URL só no browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const area = params.get("area");

    if (area && area in areasConfig) {
      setAreaSlug(area as keyof typeof areasConfig);
    }
  }, []);

  const areaConfig = useMemo(() => {
    return areasConfig[areaSlug] ?? areasConfig["geral"];
  }, [areaSlug]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const nome = ((formData.get("nome") as string) || "").trim();
      const apelidoForm = ((formData.get("apelido") as string) || "").trim();

      const documentoRaw =
        ((formData.get("documento") as string) || "").trim();
      const cpf = documentoRaw.replace(/\D/g, ""); // só números

      const emailRaw = (formData.get("email") as string) || "";
      const email = emailRaw.trim().toLowerCase();

      const whatsapp = ((formData.get("whatsapp") as string) || "").trim();
      const experiencia =
        ((formData.get("experiencia") as string) || "").trim();
      const localizacao =
        ((formData.get("localizacao") as string) || "").trim();
      const disponibilidade =
        ((formData.get("disponibilidade") as string) || "").trim();

      const apelido = apelidoForm || nome;
      const areaPrincipal = areaConfig.label;
      let funcaoPrincipal = funcaoSelecionada || "";

      if (funcaoPrincipal === "Outros" && outrosDetalhe.trim()) {
        funcaoPrincipal = `Outros: ${outrosDetalhe.trim()}`;
      }

      // validações básicas
      if (!nome || !whatsapp || !localizacao) {
        setErro("Preencha pelo menos nome, WhatsApp e localização.");
        setLoading(false);
        return;
      }

      if (!email) {
        setErro("Informe um e-mail para login.");
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

      if (cpf && cpf.length !== 11) {
        setErro("CPF inválido. Informe os 11 dígitos.");
        setLoading(false);
        return;
      }

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
          console.error(`Erro ao verificar e-mail (${email}) em uma tabela:`, error.message);
          return false;
        }
        return (count ?? 0) > 0;
      });

      if (emailJaExiste) {
        setErro(
          "Este e-mail já está cadastrado na plataforma. Faça login ou recupere sua senha."
        );
        setLoading(false);
        return;
      }

      // 🔍 2) Verificar se o CPF já existe para profissionais (se informado)
      if (cpf) {
        const { count: countCpf, error: erroCpf } = await supabase
          .from("profissionais")
          .select("id", { count: "exact", head: true })
          .eq("cpf", cpf);

        if (erroCpf) {
          console.error("Erro ao verificar CPF do profissional:", erroCpf.message);
        }

        if ((countCpf ?? 0) > 0) {
          setErro("Este CPF já está cadastrado como profissional no ConstruThéo.");
          setLoading(false);
          return;
        }
      }

      // 📍 3) Tentar obter geolocalização do profissional
      let latitude: number | null = null;
      let longitude: number | null = null;

      const coords = await obterCoordenadasAtual();
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }

      // 👉 4) Criar usuário na Auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              tipo: "profissional",
              nome,
              apelido,
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

      // 👉 5) Inserir na tabela profissionais amarrando com o user.id
      const { data, error } = await supabase
        .from("profissionais")
        .insert([
          {
            id: user.id, // ID igual ao da Auth
            nome,
            apelido,
            cpf: cpf || null, // coluna cpf na tabela
            email,
            whatsapp,
            experiencia,
            localizacao,
            disponibilidade,
            area: areaPrincipal, // coluna "area" no banco
            funcao: funcaoPrincipal, // coluna "funcao" no banco
            latitude,
            longitude,
          },
        ])
        .select("id, nome, apelido, area, funcao")
        .single();

      if (error) {
        console.error("Erro ao salvar profissional:", error.message);
        setErro("Não foi possível salvar seu cadastro. Tente novamente.");
        setLoading(false);
        return;
      }

      // Guarda um resumo no localStorage
      if (typeof window !== "undefined") {
        const resumoProfissional = {
          id: data?.id,
          nome: data?.nome,
          apelido: data?.apelido,
          area: data?.area,
          funcao: data?.funcao,
          whatsapp,
          localizacao,
          experiencia,
          disponibilidade,
          cpf: cpf || null,
          latitude,
          longitude,
        };

        localStorage.setItem(
          "construtheo_profissional_atual",
          JSON.stringify(resumoProfissional)
        );
      }

      // 👉 6) Redirecionar pro painel usando o ID do usuário
      router.push(
        `/painel/profissional?id=${user.id}&apelido=${encodeURIComponent(
          apelido
        )}`
      );
    } catch (err) {
      console.error(err);
      setErro("Ocorreu um erro inesperado. Tente novamente.");
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
            CADASTRO DE PROFISSIONAL
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
            Comece a atender pelo{" "}
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
            Mostre seu trabalho para quem está construindo ou reformando perto
            de você e organize seus serviços em um só lugar.
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

          {/* CPF / documento */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="documento"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              CPF (somente números)
            </label>
            <input
              id="documento"
              name="documento"
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

          {/* Senhas - EMPILHADAS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                Senha
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

          {/* Função principal – input com sugestões */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              O que você faz na obra?
            </label>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
              }}
            >
              Digite sua atividade principal (ex.: pedreiro, pintor, ajudante,
              eletricista...). As sugestões abaixo são para{" "}
              <strong>{areaConfig.label}</strong>.
            </p>

            <input
              list="funcoes-obra"
              value={funcaoSelecionada || ""}
              onChange={(e) => setFuncaoSelecionada(e.target.value)}
              placeholder="Ex.: pedreiro, ajudante, pintor..."
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

            <datalist id="funcoes-obra">
              {areaConfig.funcoes.map((funcao) => (
                <option key={funcao} value={funcao} />
              ))}
            </datalist>

            {funcaoSelecionada === "Outros" && (
              <input
                value={outrosDetalhe}
                onChange={(e) => setOutrosDetalhe(e.target.value)}
                placeholder="Explique melhor (ex.: telhadista, concreto armado, etc.)"
                style={{
                  marginTop: "6px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              />
            )}
          </div>

          {/* Experiência */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="experiencia"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Experiência na construção
            </label>
            <input
              id="experiencia"
              name="experiencia"
              placeholder="Ex: 5 anos como pedreiro, 2 anos de acabamento..."
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

          {/* Disponibilidade */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="disponibilidade"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Disponibilidade
            </label>
            <input
              id="disponibilidade"
              name="disponibilidade"
              placeholder="Ex: Disponível a partir de 20 dias, de segunda a sexta..."
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

          {/* Localização */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="localizacao"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Localização (cidade / região)
            </label>

            <input
              id="localizacao"
              name="localizacao"
              placeholder="Ex: Igaratá - SP"
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

            <p
              style={{
                marginTop: "4px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Usamos sua cidade e sua localização aproximada para conectar você
              com clientes em um raio de até 20km.
            </p>
          </div>

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
            {loading ? "Salvando..." : "Criar conta de profissional"}
          </button>
        </form>
      </div>
    </main>
  );
}
