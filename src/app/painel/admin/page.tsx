"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type TipoUsuario = "cliente" | "profissional" | "empresa";

type UsuarioAdmin = {
  id: string;
  tipo: TipoUsuario;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
  detalhe: string | null;
  status: string | null;
  created_at: string | null;
};

type Pendencia = UsuarioAdmin & {
  tipo: "profissional" | "empresa";
};

type Metricas = {
  clientes: number;
  profissionais: number;
  empresas: number;
  total: number;
  pendentes: number;
  novosHoje: number;
  novosSemana: number;
};

const LIMITE_POR_TABELA = 500;

function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo || null;
}


function normalizarStatus(valor: unknown, fallback: string) {
  if (valor == null) return fallback;

  const limpo = String(valor)
    .trim()
    .replace(/::[a-zA-Z_][a-zA-Z0-9_]*/g, "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim()
    .toLowerCase();

  if (limpo.includes("aprov")) return "aprovado";
  if (limpo.includes("recus")) return "recusado";
  if (limpo.includes("bloque")) return "bloqueado";
  if (limpo.includes("pendent")) return "pendente";
  if (limpo.includes("cadastr")) return "cadastrado";

  return limpo || fallback;
}

function formatarData(data?: string | null) {
  if (!data) return "Data não informada";

  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return "Data não informada";

  return date.toLocaleDateString("pt-BR");
}

function inicioDoDia() {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  return agora.getTime();
}

function inicioDosUltimosSeteDias() {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  agora.setDate(agora.getDate() - 6);
  return agora.getTime();
}

function scrollCarrossel(
  ref: React.MutableRefObject<HTMLDivElement | null>,
  direction: "left" | "right"
) {
  const elemento = ref.current;
  if (!elemento) return;

  elemento.scrollBy({
    left:
      direction === "right"
        ? elemento.clientWidth * 0.82
        : -elemento.clientWidth * 0.82,
    behavior: "smooth",
  });
}

export default function PainelAdminPage() {
  const router = useRouter();

  const clientesRef = useRef<HTMLDivElement | null>(null);
  const profissionaisRef = useRef<HTMLDivElement | null>(null);
  const empresasRef = useRef<HTMLDivElement | null>(null);

  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [clientes, setClientes] = useState<UsuarioAdmin[]>([]);
  const [profissionais, setProfissionais] = useState<UsuarioAdmin[]>([]);
  const [empresas, setEmpresas] = useState<UsuarioAdmin[]>([]);

  useEffect(() => {
    let ativo = true;

    async function verificarAdmin() {
      const { data, error } = await supabase.auth.getUser();

      if (!ativo) return;

      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }

      const role = (data.user.app_metadata as { role?: string } | null)?.role;

      if (role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setVerificandoAdmin(false);
    }

    verificarAdmin();

    return () => {
      ativo = false;
    };
  }, [router]);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [
        { data: clientesData, error: clientesError },
        { data: profissionaisData, error: profissionaisError },
        { data: empresasData, error: empresasError },
      ] = await Promise.all([
        supabase
          .from("clientes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(LIMITE_POR_TABELA),
        supabase
          .from("profissionais")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(LIMITE_POR_TABELA),
        supabase
          .from("empresas")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(LIMITE_POR_TABELA),
      ]);

      const erros = [
        clientesError && `Clientes: ${clientesError.message}`,
        profissionaisError && `Profissionais: ${profissionaisError.message}`,
        empresasError && `Empresas: ${empresasError.message}`,
      ].filter(Boolean);

      if (erros.length > 0) {
        console.error("Erros ao carregar painel admin:", erros);
        setErro(erros.join(" | "));
      }

      const clientesMapeados: UsuarioAdmin[] = (clientesData || []).map(
        (cliente: any) => ({
          id: String(cliente.id),
          tipo: "cliente",
          nome:
            texto(cliente.apelido) ||
            texto(cliente.nome) ||
            "Cliente sem nome",
          email: texto(cliente.email),
          whatsapp: texto(cliente.whatsapp),
          cidade: texto(cliente.cidade),
          estado: texto(cliente.estado),
          bairro: texto(cliente.bairro),
          detalhe: null,
          status: normalizarStatus(cliente.status, "cadastrado"),
          created_at: texto(cliente.created_at),
        })
      );

      const profissionaisMapeados: UsuarioAdmin[] = (
        profissionaisData || []
      ).map((profissional: any) => ({
        id: String(profissional.id),
        tipo: "profissional",
        nome:
          texto(profissional.apelido) ||
          texto(profissional.nome) ||
          "Profissional sem nome",
        email: texto(profissional.email),
        whatsapp: texto(profissional.whatsapp),
        cidade: texto(profissional.cidade),
        estado: texto(profissional.estado),
        bairro: texto(profissional.bairro),
        detalhe:
          texto(profissional.especialidade) ||
          texto(profissional.funcao) ||
          texto(profissional.area) ||
          "Profissão não informada",
        status: normalizarStatus(profissional.status, "pendente"),
        created_at: texto(profissional.created_at),
      }));

      const empresasMapeadas: UsuarioAdmin[] = (empresasData || []).map(
        (empresa: any) => ({
          id: String(empresa.id),
          tipo: "empresa",
          nome:
            texto(empresa.nome_fantasia) ||
            texto(empresa.nome) ||
            texto(empresa.razao_social) ||
            "Empresa sem nome",
          email: texto(empresa.email),
          whatsapp: texto(empresa.whatsapp),
          cidade: texto(empresa.cidade),
          estado: texto(empresa.estado),
          bairro: texto(empresa.bairro),
          detalhe:
            texto(empresa.categoria) ||
            texto(empresa.tipo) ||
            texto(empresa.area) ||
            "Categoria não informada",
          status: normalizarStatus(empresa.status, "pendente"),
          created_at: texto(empresa.created_at),
        })
      );

      setClientes(clientesMapeados);
      setProfissionais(profissionaisMapeados);
      setEmpresas(empresasMapeadas);
    } catch (error: any) {
      console.error("Erro geral no painel admin:", error);
      setErro(
        error?.message ||
          "Não foi possível carregar os dados reais da plataforma."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (verificandoAdmin) return;
    carregarDados();
  }, [verificandoAdmin, carregarDados]);

  useEffect(() => {
    if (verificandoAdmin) return;

    const channel = supabase
      .channel("painel-admin-cadastros")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clientes" },
        carregarDados
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profissionais" },
        carregarDados
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "empresas" },
        carregarDados
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [verificandoAdmin, carregarDados]);

  const pendencias = useMemo<Pendencia[]>(() => {
    return [...profissionais, ...empresas]
      .filter(
        (usuario) =>
          usuario.tipo !== "cliente" &&
          normalizarStatus(usuario.status, "pendente") === "pendente"
      )
      .map((usuario) => usuario as Pendencia);
  }, [profissionais, empresas]);

  const todosUsuarios = useMemo(
    () =>
      [...clientes, ...profissionais, ...empresas].sort((a, b) => {
        const dataA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dataB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dataB - dataA;
      }),
    [clientes, profissionais, empresas]
  );

  const metricas = useMemo<Metricas>(() => {
    const hoje = inicioDoDia();
    const seteDias = inicioDosUltimosSeteDias();

    const novosHoje = todosUsuarios.filter((usuario) => {
      if (!usuario.created_at) return false;
      return new Date(usuario.created_at).getTime() >= hoje;
    }).length;

    const novosSemana = todosUsuarios.filter((usuario) => {
      if (!usuario.created_at) return false;
      return new Date(usuario.created_at).getTime() >= seteDias;
    }).length;

    return {
      clientes: clientes.length,
      profissionais: profissionais.length,
      empresas: empresas.length,
      total: todosUsuarios.length,
      pendentes: pendencias.length,
      novosHoje,
      novosSemana,
    };
  }, [clientes, profissionais, empresas, todosUsuarios, pendencias]);

  async function atualizarStatus(
    pendencia: Pendencia,
    novoStatus: "aprovado" | "recusado"
  ) {
    if (atualizandoId) return;

    setAtualizandoId(pendencia.id);
    setErro(null);
    setSucesso(null);

    const tabela =
      pendencia.tipo === "profissional" ? "profissionais" : "empresas";

    try {
      const { data, error } = await supabase
        .from(tabela)
        .update({
          status: novoStatus,
        })
        .eq("id", pendencia.id)
        .select("id, status")
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "O Supabase não confirmou a atualização deste cadastro."
        );
      }

      if (pendencia.tipo === "profissional") {
        setProfissionais((atuais) =>
          atuais.map((usuario) =>
            usuario.id === pendencia.id
              ? { ...usuario, status: normalizarStatus(novoStatus, novoStatus) }
              : usuario
          )
        );
      } else {
        setEmpresas((atuais) =>
          atuais.map((usuario) =>
            usuario.id === pendencia.id
              ? { ...usuario, status: normalizarStatus(novoStatus, novoStatus) }
              : usuario
          )
        );
      }

      setSucesso(
        novoStatus === "aprovado"
          ? `${pendencia.nome} foi aprovado com sucesso.`
          : `${pendencia.nome} foi recusado com sucesso.`
      );

      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao atualizar cadastro:", error);
      setErro(
        error?.message ||
          "Não foi possível atualizar o cadastro. Verifique as permissões do Supabase."
      );
    } finally {
      setAtualizandoId(null);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (verificandoAdmin) {
    return (
      <main style={loadingPageStyle}>
        <p>Verificando permissões do administrador...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "18px 12px 32px",
        boxSizing: "border-box",
        background: "#EEF2F7",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          margin: "0 auto",
          padding: "20px 14px 24px",
          boxSizing: "border-box",
          borderRadius: 26,
          background: "#FFFFFF",
          boxShadow: "0 18px 42px rgba(15,23,42,0.12)",
        }}
      >
        <header style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={adminTagStyle}>Painel do administrador</span>

            <button type="button" onClick={sair} style={logoutButtonStyle}>
              Sair
            </button>
          </div>

          <p style={eyebrowStyle}>CONSTRUTHÉO • DADOS REAIS</p>
          <h1 style={titleStyle}>Controle geral da plataforma</h1>
          <p style={descriptionStyle}>
            Acompanhe cadastros reais de clientes, profissionais e empresas.
          </p>
        </header>

        <section style={metricGridStyle}>
          <MetricCard titulo="Clientes" valor={metricas.clientes} />
          <MetricCard titulo="Profissionais" valor={metricas.profissionais} />
          <MetricCard titulo="Empresas" valor={metricas.empresas} />
          <MetricCard titulo="Total de perfis" valor={metricas.total} />
          <MetricCard titulo="Pendentes" valor={metricas.pendentes} destaque />
          <MetricCard titulo="Novos hoje" valor={metricas.novosHoje} />
          <MetricCard titulo="Últimos 7 dias" valor={metricas.novosSemana} />
        </section>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={carregarDados}
            disabled={carregando}
            style={{
              ...refreshButtonStyle,
              opacity: carregando ? 0.65 : 1,
            }}
          >
            {carregando ? "Atualizando..." : "Atualizar dados"}
          </button>

          <Link href="/" style={homeButtonStyle}>
            Página inicial
          </Link>
        </div>

        {erro && <div style={errorStyle}>{erro}</div>}

        {sucesso && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 14,
              background: "#DCFCE7",
              color: "#15803D",
              fontSize: "0.75rem",
              lineHeight: 1.4,
              fontWeight: 700,
            }}
          >
            {sucesso}
          </div>
        )}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Cadastros aguardando análise</h2>
              <p style={sectionSubtitleStyle}>
                Lista vertical otimizada para aprovar pelo celular.
              </p>
            </div>
            <span style={countTagStyle}>{pendencias.length}</span>
          </div>

          {carregando ? (
            <p style={emptyStyle}>Carregando pendências...</p>
          ) : pendencias.length === 0 ? (
            <p style={emptyStyle}>Nenhum cadastro pendente no momento.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {pendencias.map((pendencia) => {
                const atualizando = atualizandoId === pendencia.id;

                return (
                  <article key={`${pendencia.tipo}-${pendencia.id}`} style={pendingCardStyle}>
                    <span style={pendingTypeStyle}>
                      {pendencia.tipo === "profissional"
                        ? "Profissional"
                        : "Empresa"}
                    </span>

                    <h3 style={cardNameStyle}>{pendencia.nome}</h3>

                    {pendencia.detalhe && (
                      <p style={cardDetailStyle}>{pendencia.detalhe}</p>
                    )}

                    <p style={cardMetaStyle}>
                      {[pendencia.cidade, pendencia.estado]
                        .filter(Boolean)
                        .join(" - ") || "Localização não informada"}
                    </p>

                    {pendencia.whatsapp && (
                      <p style={cardMetaStyle}>
                        WhatsApp: {pendencia.whatsapp}
                      </p>
                    )}

                    <div style={actionRowStyle}>
                      <button
                        type="button"
                        disabled={Boolean(atualizandoId)}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          atualizarStatus(pendencia, "aprovado");
                        }}
                        style={{
                          ...approveButtonStyle,
                          opacity: atualizando ? 0.65 : 1,
                          touchAction: "manipulation",
                        }}
                      >
                        {atualizando ? "Salvando..." : "Aprovar"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(atualizandoId)}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          atualizarStatus(pendencia, "recusado");
                        }}
                        style={{
                          ...rejectButtonStyle,
                          opacity: atualizando ? 0.65 : 1,
                          touchAction: "manipulation",
                        }}
                      >
                        Recusar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <UsersCarousel
          titulo="Todos os profissionais"
          subtitulo="Cadastros reais da tabela profissionais"
          usuarios={profissionais}
          carouselRef={profissionaisRef}
          onLeft={() => scrollCarrossel(profissionaisRef, "left")}
          onRight={() => scrollCarrossel(profissionaisRef, "right")}
        />

        <UsersCarousel
          titulo="Todas as empresas"
          subtitulo="Cadastros reais da tabela empresas"
          usuarios={empresas}
          carouselRef={empresasRef}
          onLeft={() => scrollCarrossel(empresasRef, "left")}
          onRight={() => scrollCarrossel(empresasRef, "right")}
        />

        <UsersCarousel
          titulo="Todos os clientes"
          subtitulo="Cadastros reais da tabela clientes"
          usuarios={clientes}
          carouselRef={clientesRef}
          onLeft={() => scrollCarrossel(clientesRef, "left")}
          onRight={() => scrollCarrossel(clientesRef, "right")}
        />

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Cadastros mais recentes</h2>
              <p style={sectionSubtitleStyle}>
                Últimos registros reais das três tabelas.
              </p>
            </div>
          </div>

          {todosUsuarios.length === 0 ? (
            <p style={emptyStyle}>Nenhum cadastro encontrado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todosUsuarios.slice(0, 10).map((usuario) => (
                <div
                  key={`${usuario.tipo}-${usuario.id}`}
                  style={recentItemStyle}
                >
                  <div>
                    <p style={recentNameStyle}>{usuario.nome}</p>
                    <p style={recentMetaStyle}>
                      {usuario.tipo} • {formatarData(usuario.created_at)}
                    </p>
                  </div>
                  <span style={statusTag(usuario.status)}>
                    {usuario.status || "cadastrado"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          .admin-carousel::-webkit-scrollbar {
            display: none;
          }

          button {
            -webkit-tap-highlight-color: transparent;
          }
        `}
      </style>
    </main>
  );
}

function MetricCard({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 10px",
        borderRadius: 16,
        border: destaque ? "1px solid #FCA5A5" : "1px solid #E5E7EB",
        background: destaque ? "#FEF2F2" : "#F8FAFC",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.72rem",
          color: destaque ? "#B91C1C" : "#64748B",
        }}
      >
        {titulo}
      </p>
      <strong
        style={{
          display: "block",
          marginTop: 3,
          fontSize: "1.15rem",
          color: "#111827",
        }}
      >
        {valor.toLocaleString("pt-BR")}
      </strong>
    </div>
  );
}

function UsersCarousel({
  titulo,
  subtitulo,
  usuarios,
  carouselRef,
  onLeft,
  onRight,
}: {
  titulo: string;
  subtitulo: string;
  usuarios: UsuarioAdmin[];
  carouselRef: React.MutableRefObject<HTMLDivElement | null>;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>{titulo}</h2>
          <p style={sectionSubtitleStyle}>{subtitulo}</p>
        </div>
        <span style={countTagStyle}>{usuarios.length}</span>
      </div>

      {usuarios.length === 0 ? (
        <p style={emptyStyle}>Nenhum cadastro encontrado.</p>
      ) : (
        <>
          <div
            ref={carouselRef}
            className="admin-carousel"
            style={carouselStyle}
          >
            {usuarios.map((usuario) => (
              <article
                key={`${usuario.tipo}-${usuario.id}`}
                style={userCardStyle}
              >
                <span style={typeTag(usuario.tipo)}>{usuario.tipo}</span>
                <h3 style={cardNameStyle}>{usuario.nome}</h3>

                {usuario.detalhe && (
                  <p style={cardDetailStyle}>{usuario.detalhe}</p>
                )}

                <p style={cardMetaStyle}>
                  {[usuario.cidade, usuario.estado]
                    .filter(Boolean)
                    .join(" - ") || "Localização não informada"}
                </p>

                {usuario.bairro && (
                  <p style={cardMetaStyle}>Bairro: {usuario.bairro}</p>
                )}

                {usuario.whatsapp && (
                  <p style={cardMetaStyle}>WhatsApp: {usuario.whatsapp}</p>
                )}

                {usuario.email && (
                  <p
                    style={{
                      ...cardMetaStyle,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {usuario.email}
                  </p>
                )}

                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <span style={statusTag(usuario.status)}>
                    {usuario.status || "cadastrado"}
                  </span>
                  <p style={{ ...cardMetaStyle, marginTop: 6 }}>
                    Cadastro: {formatarData(usuario.created_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div style={carouselControlsStyle}>
            <button type="button" onClick={onLeft} style={arrowButtonStyle}>
              ◀
            </button>
            <span style={{ fontSize: "0.7rem", color: "#64748B" }}>
              Arraste para o lado
            </span>
            <button type="button" onClick={onRight} style={arrowButtonStyle}>
              ▶
            </button>
          </div>
        </>
      )}
    </section>
  );
}

const loadingPageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  background: "#F8FAFC",
  color: "#64748B",
};

const adminTagStyle: CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  background: "#FEF2F2",
  color: "#B91C1C",
  fontSize: "0.72rem",
  fontWeight: 800,
};

const logoutButtonStyle: CSSProperties = {
  minHeight: 40,
  padding: "7px 14px",
  borderRadius: 999,
  border: "none",
  background: "#111827",
  color: "#FFFFFF",
  fontWeight: 700,
  cursor: "pointer",
  touchAction: "manipulation",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 4px",
  color: "#2563EB",
  fontSize: "0.7rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "1.35rem",
  lineHeight: 1.25,
};

const descriptionStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "#64748B",
  fontSize: "0.82rem",
  lineHeight: 1.45,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

const refreshButtonStyle: CSSProperties = {
  flex: 1,
  minHeight: 44,
  border: "none",
  borderRadius: 999,
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "0.78rem",
  fontWeight: 800,
  cursor: "pointer",
  touchAction: "manipulation",
};

const homeButtonStyle: CSSProperties = {
  flex: 1,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: "1px solid #D1D5DB",
  color: "#111827",
  fontSize: "0.78rem",
  fontWeight: 800,
  textDecoration: "none",
};

const errorStyle: CSSProperties = {
  marginBottom: 16,
  padding: "10px 12px",
  borderRadius: 14,
  background: "#FEF2F2",
  color: "#B91C1C",
  fontSize: "0.75rem",
  lineHeight: 1.4,
};

const sectionStyle: CSSProperties = {
  marginTop: 16,
  padding: "13px 11px",
  borderRadius: 20,
  border: "1px solid #E5E7EB",
  background: "#F8FAFC",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.92rem",
  color: "#111827",
};

const sectionSubtitleStyle: CSSProperties = {
  margin: "3px 0 0",
  fontSize: "0.7rem",
  color: "#64748B",
};

const countTagStyle: CSSProperties = {
  minWidth: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  background: "#DBEAFE",
  color: "#1D4ED8",
  fontSize: "0.75rem",
  fontWeight: 800,
};

const emptyStyle: CSSProperties = {
  margin: 0,
  padding: "10px 4px",
  color: "#64748B",
  fontSize: "0.78rem",
};

const pendingCardStyle: CSSProperties = {
  padding: 12,
  borderRadius: 16,
  border: "1px solid #FCA5A5",
  background: "#FFFFFF",
  boxShadow: "0 3px 10px rgba(127,29,29,0.07)",
};

const pendingTypeStyle: CSSProperties = {
  display: "inline-flex",
  marginBottom: 5,
  padding: "3px 8px",
  borderRadius: 999,
  background: "#FEF2F2",
  color: "#B91C1C",
  fontSize: "0.68rem",
  fontWeight: 800,
};

const cardNameStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.88rem",
  color: "#111827",
  lineHeight: 1.3,
};

const cardDetailStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: "0.75rem",
  color: "#2563EB",
  lineHeight: 1.35,
};

const cardMetaStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: "0.7rem",
  color: "#64748B",
  lineHeight: 1.35,
};

const actionRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 10,
};

const approveButtonStyle: CSSProperties = {
  minHeight: 46,
  border: "none",
  borderRadius: 999,
  background: "#16A34A",
  color: "#FFFFFF",
  fontSize: "0.8rem",
  fontWeight: 800,
  cursor: "pointer",
};

const rejectButtonStyle: CSSProperties = {
  minHeight: 46,
  border: "none",
  borderRadius: 999,
  background: "#DC2626",
  color: "#FFFFFF",
  fontSize: "0.8rem",
  fontWeight: 800,
  cursor: "pointer",
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 5,
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
  scrollSnapType: "x proximity",
};

const userCardStyle: CSSProperties = {
  minWidth: "82%",
  maxWidth: "82%",
  minHeight: 210,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  padding: 12,
  borderRadius: 16,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  scrollSnapAlign: "start",
};

const carouselControlsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
  marginTop: 7,
};

const arrowButtonStyle: CSSProperties = {
  minWidth: 38,
  minHeight: 38,
  border: "none",
  borderRadius: 999,
  background: "#E2E8F0",
  color: "#334155",
  cursor: "pointer",
  touchAction: "manipulation",
};

const recentItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "9px 10px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
};

const recentNameStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#111827",
};

const recentMetaStyle: CSSProperties = {
  margin: "3px 0 0",
  fontSize: "0.68rem",
  color: "#64748B",
};

function typeTag(tipo: TipoUsuario): CSSProperties {
  const config = {
    cliente: { background: "#FFEDD5", color: "#C2410C" },
    profissional: { background: "#DBEAFE", color: "#1D4ED8" },
    empresa: { background: "#DCFCE7", color: "#15803D" },
  }[tipo];

  return {
    display: "inline-flex",
    alignSelf: "flex-start",
    marginBottom: 6,
    padding: "3px 8px",
    borderRadius: 999,
    background: config.background,
    color: config.color,
    fontSize: "0.66rem",
    fontWeight: 800,
    textTransform: "capitalize",
  };
}

function statusTag(status?: string | null): CSSProperties {
  const normalizado = normalizarStatus(status, "cadastrado");

  const config =
    normalizado === "aprovado"
      ? { background: "#DCFCE7", color: "#15803D" }
      : normalizado === "bloqueado" || normalizado === "recusado"
      ? { background: "#FEE2E2", color: "#B91C1C" }
      : normalizado === "pendente"
      ? { background: "#FEF3C7", color: "#B45309" }
      : { background: "#E2E8F0", color: "#475569" };

  return {
    display: "inline-flex",
    padding: "3px 8px",
    borderRadius: 999,
    background: config.background,
    color: config.color,
    fontSize: "0.66rem",
    fontWeight: 800,
    textTransform: "capitalize",
  };
}