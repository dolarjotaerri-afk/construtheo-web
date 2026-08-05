"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import {
  getFeaturedCompaniesByLocation,
  type FeaturedCompany,
} from "../../../lib/featuredCompanies";
import {
  getFeaturedProfessionalsByLocation,
  type FeaturedProfessional,
} from "../../../lib/featuredProfessionals";
import ProfessionalCoursesCarousel from "../../../components/ProfessionalCoursesCarousel";

type ClienteResumo = {
  id: string;
  nome: string;
  apelido?: string | null;
  email: string;
  whatsapp?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  aceita_ofertas_whatsapp?: boolean;
};


type EmpresaAprovada = FeaturedCompany & {
  id: string;
  origem: "supabase";
};

type ProfissionalAprovado = FeaturedProfessional & {
  id: string;
  nomeReal: string;
  whatsapp?: string;
  origem: "supabase";
};

export default function PainelClientePage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [carregandoCliente, setCarregandoCliente] = useState(true);
  const [possuiPerfilProfissional, setPossuiPerfilProfissional] =
    useState(false);
  const [carregandoPerfilProfissional, setCarregandoPerfilProfissional] =
    useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [empresaSelecionada, setEmpresaSelecionada] =
    useState<FeaturedCompany | null>(null);

  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState<FeaturedProfessional | null>(null);

  const [empresasAprovadas, setEmpresasAprovadas] = useState<
    EmpresaAprovada[]
  >([]);
  const [profissionaisAprovados, setProfissionaisAprovados] = useState<
    ProfissionalAprovado[]
  >([]);
  const [carregandoAprovados, setCarregandoAprovados] = useState(true);

  useEffect(() => {
  let ativo = true;

  async function verificarAcesso() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao verificar sessão:", error);
      }

      if (!session) {
        localStorage.removeItem("construtheo_cliente_atual");
        localStorage.removeItem("construtheo_demo_cliente");

        router.replace("/login?tipo=cliente");
        return;
      }

      const role = (
        session.user.app_metadata as { role?: string } | null
      )?.role;

      if (ativo) {
        setIsAdmin(role === "admin");
      }

      const salvo = localStorage.getItem("construtheo_cliente_atual");

      if (salvo && ativo) {
        const parsed: ClienteResumo = JSON.parse(salvo);
        setCliente(parsed);
      }

      const { data: perfilProfissional, error: perfilProfissionalError } =
        await supabase
          .from("profissionais")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

      if (perfilProfissionalError) {
        console.error(
          "Erro ao verificar perfil profissional:",
          perfilProfissionalError
        );
      }

      if (ativo) {
        setPossuiPerfilProfissional(Boolean(perfilProfissional));
      }
    } catch (err) {
      console.error("Erro ao carregar painel do cliente:", err);

      if (ativo) {
        router.replace("/login?tipo=cliente");
      }
    } finally {
      if (ativo) {
        setCarregandoCliente(false);
        setCarregandoPerfilProfissional(false);
      }
    }
  }

  verificarAcesso();

  return () => {
    ativo = false;
  };
}, [router]);

  useEffect(() => {
    let ativo = true;

    const cidadeCliente = cliente?.cidade?.trim().toLowerCase() || "";
    const estadoCliente = cliente?.estado?.trim().toUpperCase() || "";
    const possuiLocalizacaoCliente = Boolean(cidadeCliente && estadoCliente);

    function normalizarStatus(valor: unknown) {
      return String(valor || "")
        .trim()
        .replace(/::[a-zA-Z_][a-zA-Z0-9_]*/g, "")
        .replace(/^['"]+|['"]+$/g, "")
        .trim()
        .toLowerCase();
    }

    function pertenceARegiao(
      cidadeRegistro: unknown,
      estadoRegistro: unknown,
      localizacaoRegistro: unknown
    ) {
      // Somente o administrador pode visualizar todos os aprovados
      // quando estiver sem cidade e estado.
      if (!possuiLocalizacaoCliente) return isAdmin;

      const cidade = String(cidadeRegistro || "").trim().toLowerCase();
      const estado = String(estadoRegistro || "").trim().toUpperCase();
      const localizacao = String(localizacaoRegistro || "")
        .trim()
        .toLowerCase();

      const cidadeEncontrada =
        cidade === cidadeCliente ||
        localizacao.includes(cidadeCliente);

      const estadoEncontrado =
        !estado ||
        estado === estadoCliente ||
        localizacao.includes(estadoCliente.toLowerCase());

      return cidadeEncontrada && estadoEncontrado;
    }

    async function carregarCadastrosAprovados() {
      setCarregandoAprovados(true);

      if (!possuiLocalizacaoCliente && !isAdmin) {
        setEmpresasAprovadas([]);
        setProfissionaisAprovados([]);
        setCarregandoAprovados(false);
        return;
      }

      try {
        const [
          { data: empresasData, error: empresasError },
          { data: profissionaisData, error: profissionaisError },
        ] = await Promise.all([
          supabase.from("empresas").select("*").limit(500),
          supabase.from("profissionais").select("*").limit(500),
        ]);

        if (empresasError) {
          console.error("Erro ao carregar empresas aprovadas:", empresasError);
        }

        if (profissionaisError) {
          console.error(
            "Erro ao carregar profissionais aprovados:",
            profissionaisError
          );
        }

        if (!ativo) return;

        const empresasMapeadas: EmpresaAprovada[] = (empresasData || [])
          .filter(
            (empresa: any) =>
              normalizarStatus(empresa.status).includes("aprov") &&
              pertenceARegiao(
                empresa.cidade,
                empresa.estado,
                empresa.localizacao
              )
          )
          .map((empresa: any) => ({
            id: empresa.id,
            name:
              empresa.nome_fantasia ||
              empresa.nome ||
              empresa.razao_social ||
              "Empresa cadastrada",
            category:
              empresa.categoria ||
              empresa.tipo ||
              empresa.area ||
              "Construção civil",
            location:
              empresa.localizacao ||
              [empresa.cidade, empresa.estado].filter(Boolean).join(" - ") ||
              "Localização não informada",
            cities: empresa.cidade ? [empresa.cidade] : [],
            state: empresa.estado || estadoCliente,
            badge: "✓ Empresa aprovada",
            logo: empresa.logo_url || empresa.logo || "",
            whatsapp: String(empresa.whatsapp || "").replace(/\D/g, ""),
            origem: "supabase",
          }));

        const profissionaisMapeados: ProfissionalAprovado[] = (
          profissionaisData || []
        )
          .filter(
            (profissional: any) =>
              normalizarStatus(profissional.status).includes("aprov") &&
              pertenceARegiao(
                profissional.cidade,
                profissional.estado,
                profissional.localizacao
              )
          )
          .map((profissional: any) => {
            const especialidade =
              profissional.especialidade ||
              profissional.funcao ||
              profissional.area ||
              "Profissional da construção";

            const nome =
              profissional.apelido ||
              profissional.nome ||
              "Profissional cadastrado";

            return {
              id: profissional.id,
              nomeReal: nome,
              title: nome,
              subtitle:
                profissional.localizacao ||
                [profissional.cidade, profissional.estado]
                  .filter(Boolean)
                  .join(" - ") ||
                "Localização não informada",
              tag: especialidade,
              cities: profissional.cidade ? [profissional.cidade] : [],
              state: profissional.estado || estadoCliente,
              whatsapp: String(profissional.whatsapp || "").replace(/\D/g, ""),
              origem: "supabase",
            };
          });

        setEmpresasAprovadas(empresasMapeadas);
        setProfissionaisAprovados(profissionaisMapeados);
      } catch (error) {
        console.error("Erro ao carregar cadastros aprovados:", error);

        if (ativo) {
          setEmpresasAprovadas([]);
          setProfissionaisAprovados([]);
        }
      } finally {
        if (ativo) {
          setCarregandoAprovados(false);
        }
      }
    }

    carregarCadastrosAprovados();

    const channel = supabase
      .channel("painel-cliente-aprovados")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profissionais" },
        carregarCadastrosAprovados
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "empresas" },
        carregarCadastrosAprovados
      )
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(channel);
    };
  }, [cliente?.cidade, cliente?.estado, isAdmin]);

  async function handleLogout() {
  await supabase.auth.signOut();

  localStorage.removeItem("construtheo_cliente_atual");
  localStorage.removeItem("construtheo_demo_cliente");
  localStorage.removeItem("construtheo_profissional_atual");

  router.replace("/login");
}

  function formatarCep(cep?: string) {
    if (!cep) return "";
    const somenteDigitos = cep.replace(/\D/g, "");
    if (somenteDigitos.length !== 8) return somenteDigitos;
    return somenteDigitos.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  const cepFormatado = formatarCep(cliente?.cep);

  const nomeExibicao =
    cliente?.apelido && cliente.apelido.trim().length > 0
      ? cliente.apelido
      : cliente?.nome || "Cliente";

  const localLabel =
    cliente?.cidade && cliente?.estado
      ? `${cliente.cidade} - ${cliente.estado}`
      : "Localização não informada";

  const empresasDaRegiao = useMemo(() => {
    if (empresasAprovadas.length > 0) {
      return empresasAprovadas;
    }

    return getFeaturedCompaniesByLocation(cliente?.cidade, cliente?.estado);
  }, [
    cliente?.cidade,
    cliente?.estado,
    empresasAprovadas,
  ]);

  const profissionaisDaRegiao = useMemo(() => {
    if (profissionaisAprovados.length > 0) {
      return profissionaisAprovados;
    }

    return getFeaturedProfessionalsByLocation(
      cliente?.cidade,
      cliente?.estado
    );
  }, [
    cliente?.cidade,
    cliente?.estado,
    profissionaisAprovados,
  ]);

  const budgetMessage = useMemo(
    () => encodeURIComponent("Olá vim através do Construthéo"),
    []
  );

  const profissionalMessage = useMemo(() => {
    const titulo = profissionalSelecionado?.title || "um profissional";
    const profissionalReal = profissionalSelecionado as
      | ProfissionalAprovado
      | null;

    if (profissionalReal?.origem === "supabase") {
      return encodeURIComponent(
        `Olá, vim através do ConstruThéo e gostaria de solicitar um orçamento com ${titulo}.`
      );
    }

    return encodeURIComponent(
      `Olá, vim através do ConstruThéo e quero indicar ${titulo
        .replace("Indique ", "")
        .toLowerCase()}.`
    );
  }, [profissionalSelecionado]);

  if (carregandoCliente) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #cfe8ff, #3b82b8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "22px 26px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
            color: "#374151",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          Verificando seu acesso...
        </div>
      </main>
    );
  }

  return (
    <>
      <main
  style={{
    minHeight: "100vh",
    background: "linear-gradient(180deg, #cfe8ff, #3b82b8)",
    boxSizing: "border-box",
    overflowX: "hidden",
    width: "100%",
    maxWidth: "100%",
    position: "relative",
    padding: "20px 12px",
  }}
>
        <div
  style={{
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    padding: "24px 16px 28px",
    boxSizing: "border-box",
    background: "#FFFFFF",
    borderRadius: 28,
    boxShadow: "0 22px 45px rgba(15, 23, 42, 0.22)",
    border: "1px solid rgba(255, 255, 255, 0.65)",
  }}
>
{/* TOPO */}
<header
  style={{
    marginBottom: 22,
  }}
>
  <p
    style={{
      fontSize: "0.85rem",
      color: "#9CA3AF",
      marginBottom: 2,
    }}
  >
    Olá,
  </p>

  <h1
    style={{
      fontSize: "1.6rem",
      fontWeight: 800,
      color: "#111827",
      margin: 0,
    }}
  >
    {nomeExibicao}
  </h1>

  <p
    style={{
      marginTop: 6,
      fontSize: "0.85rem",
      color: "#6B7280",
      maxWidth: 320,
      lineHeight: 1.4,
    }}
  >
    Bem-vindo ao seu painel de obra no ConstruThéo.
  </p>

  <div
    style={{
      display: "flex",
      gap: 10,
      marginTop: 18,
    }}
  >
    <Link
      href="/"
      style={{
        flex: 1,
        textAlign: "center",
        padding: "10px 0",
        borderRadius: 999,
        background: "#FFFFFF",
        border: "1px solid #D1D5DB",
        color: "#111827",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "0.8rem",
      }}
    >
      Página inicial
    </Link>

    <button
      onClick={handleLogout}
      style={{
        flex: 1,
        border: "none",
        borderRadius: 999,
        background: "#DC2626",
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: "0.8rem",
        cursor: "pointer",
        padding: "10px 0",
      }}
    >
      Sair
    </button>
  </div>
</header>


          {/* CARTÃO DADOS / LOCALIZAÇÃO */}
          <section
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              marginBottom: 20,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {carregandoCliente && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6B7280",
                }}
              >
                Carregando seus dados...
              </p>
            )}

            {!carregandoCliente && !cliente && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#B91C1C",
                }}
              >
                Não encontramos seus dados. Faça login novamente.
              </p>
            )}

            {cliente && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "0.9rem",
                  color: "#111827",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>Localização: </span>
                  <span>{localLabel}</span>
                </div>

                {cliente.whatsapp && (
                  <div>
                    <span style={{ fontWeight: 600 }}>WhatsApp: </span>
                    <span>{cliente.whatsapp}</span>
                  </div>
                )}

                <div>
                  <span style={{ fontWeight: 600 }}>E-mail: </span>
                  <span>{cliente.email}</span>
                </div>

                {cepFormatado && (
                  <div>
                    <span style={{ fontWeight: 600 }}>CEP: </span>
                    <span>{cepFormatado}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ACESSO / CADASTRO COMO PROFISSIONAL */}
          <section
            style={{
              background: possuiPerfilProfissional ? "#EFF6FF" : "#F0FDF4",
              border: possuiPerfilProfissional
                ? "1px solid #BFDBFE"
                : "1px solid #BBF7D0",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              marginBottom: 20,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {carregandoPerfilProfissional ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "#6B7280",
                }}
              >
                Verificando seu perfil profissional...
              </p>
            ) : possuiPerfilProfissional ? (
              <>
                <h2
                  style={{
                    margin: "0 0 6px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#1E3A8A",
                  }}
                >
                  Você também possui um perfil profissional
                </h2>

                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "0.82rem",
                    color: "#4B5563",
                    lineHeight: 1.45,
                  }}
                >
                  Acesse seu painel profissional para completar seu perfil,
                  adicionar fotos dos seus trabalhos e divulgar seus serviços.
                </p>

                <Link
                  href="/painel/profissional"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 999,
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxSizing: "border-box",
                    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
                  }}
                >
                  Acessar como profissional
                </Link>
              </>
            ) : (
              <>
                <h2
                  style={{
                    margin: "0 0 6px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#166534",
                  }}
                >
                  Também trabalha com construção civil?
                </h2>

                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "0.82rem",
                    color: "#4B5563",
                    lineHeight: 1.45,
                  }}
                >
                  Continue usando sua conta como cliente e crie também seu
                  perfil profissional para ser encontrado por novos clientes da
                  sua região.
                </p>

                <Link
                  href="/cadastro/prestador"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 999,
                    background: "#16A34A",
                    color: "#FFFFFF",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxSizing: "border-box",
                    boxShadow: "0 8px 16px rgba(22, 163, 74, 0.2)",
                  }}
                >
                  Quero oferecer meus serviços
                </Link>
              </>
            )}
          </section>

          {/* CARTÃO AZUL – CÁLCULOS */}
          <Link
            href="/painel/calculos"
            style={{
              display: "block",
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            <section
              style={{
                background: "#0284C7",
                borderRadius: 24,
                padding: 18,
                boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
                color: "#FFFFFF",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Cálculos para sua obra
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.95,
                }}
              >
                Calcule concreto, blocos, cimento e outros materiais com mais
                precisão.
              </p>
            </section>
          </Link>

          {/* MELHORES EMPRESAS SINCRONIZADAS */}
          <section style={sectionBlockStyle}>
            <div style={{ marginBottom: 12 }}>
              <p style={sectionLabelStyle}></p>

              <h2 style={sectionTitleStyle}>
                Melhores empresas que atendem sua região
              </h2>

              <p style={sectionTextStyle}>
                {cliente?.cidade && cliente?.estado
                  ? `Empresas em destaque para ${cliente.cidade} - ${cliente.estado}.`
                  : "Complete sua localização para ver empresas mais próximas."}
              </p>
            </div>

            <div style={carouselStyle}>
              {carregandoAprovados && (
                <div style={loadingCardStyle}>
                  Buscando empresas aprovadas da sua região...
                </div>
              )}

              {!carregandoAprovados &&
                empresasDaRegiao.map((empresa) => (
                <button
                  key={empresa.name}
                  type="button"
                  onClick={() => setEmpresaSelecionada(empresa)}
                  style={companyCardStyle}
                >
                  <div style={logoCircleStyle}>
                    {empresa.logo ? (
                      <Image
                        src={empresa.logo}
                        alt={empresa.name}
                        width={40}
                        height={40}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={defaultCompanyLogoStyle}>
                        <span style={defaultCompanyLogoTextStyle}>CT</span>
                      </div>
                    )}
                  </div>

                  <p style={companyNameStyle}>{empresa.name}</p>

                  <p style={companyLocationStyle}>{empresa.location}</p>

                  <span style={premiumTagStyle}>{empresa.badge}</span>
                </button>
              ))}
            </div>
          </section>

          {/* PROFISSIONAIS SINCRONIZADOS */}
          <section style={sectionBlockStyle}>
            <div style={{ marginBottom: 12 }}>
              <p style={sectionLabelStyle}></p>

              <h2 style={sectionTitleStyle}>
                Profissionais que atendem sua região
              </h2>

              <p style={sectionTextStyle}>
                Indique bons profissionais para fortalecer a rede ConstruThéo na
                sua cidade.
              </p>
            </div>

            <div style={carouselStyle}>
              {carregandoAprovados && (
                <div style={loadingCardStyle}>
                  Buscando profissionais aprovados da sua região...
                </div>
              )}

              {!carregandoAprovados &&
                profissionaisDaRegiao.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setProfissionalSelecionado(item)}
                  style={professionalCardStyle}
                >
                  <p style={professionalTitleStyle}>{item.title}</p>

                  <p style={professionalTextStyle}>{item.subtitle}</p>

                  <span style={blueTagStyle}>{item.tag}</span>
                </button>
              ))}
            </div>
          </section>

          {/* CURSOS PROFISSIONALIZANTES REUTILIZÁVEL */}
          <ProfessionalCoursesCarousel />

          {/* BOTÕES "QUERO CADASTRAR" */}
          <section style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#4B5563",
                marginBottom: 8,
              }}
            >
              Quero cadastrar:
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Link
                href="/cadastro/deposito"
                style={{
                  flex: 1,
                  borderRadius: 999,
                  border: "1px solid #D1D5DB",
                  padding: "8px 0",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#111827",
                  textDecoration: "none",
                  background: "#FFFFFF",
                }}
              >
                Uma Empresa
              </Link>

              <Link
                href="/cadastro/prestador"
                style={{
                  flex: 1,
                  borderRadius: 999,
                  border: "1px solid #D1D5DB",
                  padding: "8px 0",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#111827",
                  textDecoration: "none",
                  background: "#FFFFFF",
                }}
              >
                Um Profissional
              </Link>
            </div>
          </section>
        </div>
      </main>

      {empresaSelecionada && (
        <div
          onClick={() => setEmpresaSelecionada(null)}
          style={modalOverlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setEmpresaSelecionada(null)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={modalLogoStyle}>
              {empresaSelecionada.logo ? (
                <Image
                  src={empresaSelecionada.logo}
                  alt={empresaSelecionada.name}
                  width={74}
                  height={74}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={defaultCompanyLogoStyle}>
                  <span
                    style={{
                      ...defaultCompanyLogoTextStyle,
                      fontSize: "1.05rem",
                    }}
                  >
                    CT
                  </span>
                </div>
              )}
            </div>

            <h2 style={modalTitleStyle}>{empresaSelecionada.name}</h2>

            <p style={modalCategoryStyle}>{empresaSelecionada.category}</p>

            <p style={modalLocationStyle}>{empresaSelecionada.location}</p>

            <a
              href={`https://wa.me/${empresaSelecionada.whatsapp}?text=${budgetMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryModalButtonStyle}
            >
              Realize seu orçamento
            </a>
          </div>
        </div>
      )}

      {profissionalSelecionado && (
        <div
          onClick={() => setProfissionalSelecionado(null)}
          style={modalOverlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setProfissionalSelecionado(null)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <h2 style={modalTitleStyle}>{profissionalSelecionado.title}</h2>

            <p style={modalLocationStyle}>
              Ajude o ConstruThéo a encontrar bons profissionais da sua região.
            </p>

            {(
              profissionalSelecionado as ProfissionalAprovado
            )?.origem === "supabase" ? (
              <a
                href={`https://wa.me/${
                  (profissionalSelecionado as ProfissionalAprovado).whatsapp
                }?text=${profissionalMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={primaryModalButtonStyle}
              >
                Solicitar orçamento
              </a>
            ) : (
              <>
                <a
                  href={`https://wa.me/5511988214713?text=${profissionalMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={primaryModalButtonStyle}
                >
                  Indicar pelo WhatsApp
                </a>

                <Link
                  href="/indicar"
                  style={{
                    ...secondaryModalButtonStyle,
                    marginTop: 10,
                  }}
                >
                  Abrir formulário de indicação
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const sectionBlockStyle: CSSProperties = {
  marginBottom: 24,
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 24,
  padding: "15px 14px 16px",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#2563EB",
  marginBottom: 4,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#111827",
  marginBottom: 4,
};

const sectionTextStyle: CSSProperties = {
  fontSize: "0.78rem",
  color: "#6B7280",
  lineHeight: 1.35,
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 4,
  paddingLeft: 2,
  paddingRight: 2,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const companyCardStyle: CSSProperties = {
  minWidth: "136px",
  maxWidth: "136px",
  minHeight: "210px",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  background: "#FFFFFF",
  padding: "18px 16px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
};

const logoCircleStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "999px",
  background: "linear-gradient(180deg, #EFF6FF, #F8FAFC)",
  border: "1px solid #DBEAFE",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  overflow: "hidden",
};

const defaultCompanyLogoStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg, #DBEAFE, #EFF6FF)",
};

const defaultCompanyLogoTextStyle: CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 900,
  color: "#2563EB",
  letterSpacing: "-0.02em",
};

const companyNameStyle: CSSProperties = {
  fontSize: "0.76rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  marginBottom: 5,
  minHeight: 30,
};

const companyLocationStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  marginBottom: 9,
  lineHeight: 1.25,
  minHeight: 30,
};

const professionalCardStyle: CSSProperties = {
  minWidth: 150,
  maxWidth: 150,
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  background: "#FFFFFF",
  padding: "13px 12px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  cursor: "pointer",
  textAlign: "left",
};

const professionalTitleStyle: CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  marginBottom: 6,
};

const professionalTextStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  marginBottom: 10,
  lineHeight: 1.3,
  minHeight: 46,
};

const premiumTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#FFFCF5",
  color: "#B7791F",
  fontSize: "0.62rem",
  fontWeight: 800,
  whiteSpace: "nowrap",
  border: "1px solid #F1E4C3",
};

const blueTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#EEF2FF",
  color: "#1D4ED8",
  fontSize: "0.65rem",
  fontWeight: 800,
};

const loadingCardStyle: CSSProperties = {
  minWidth: 210,
  padding: "14px",
  borderRadius: 18,
  background: "#FFFFFF",
  border: "1px dashed #CBD5E1",
  color: "#64748B",
  fontSize: "0.76rem",
  lineHeight: 1.4,
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

const modalCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  background: "#FFFFFF",
  borderRadius: 24,
  padding: "18px 18px 16px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.22)",
  border: "1px solid #E5E7EB",
};

const closeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "1.1rem",
  color: "#6B7280",
  cursor: "pointer",
};

const modalLogoStyle: CSSProperties = {
  width: 74,
  height: 74,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid #E5E7EB",
  background: "#F9FAFB",
  margin: "0 auto 14px",
};

const modalTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#111827",
  textAlign: "center",
  marginBottom: 6,
  lineHeight: 1.3,
};

const modalCategoryStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "#6B7280",
  textAlign: "center",
  marginBottom: 4,
};

const modalLocationStyle: CSSProperties = {
  fontSize: "0.78rem",
  color: "#4B5563",
  textAlign: "center",
  marginBottom: 16,
  lineHeight: 1.4,
};

const primaryModalButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "0.84rem",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 8px 16px rgba(37, 99, 235, 0.22)",
};

const secondaryModalButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "11px 14px",
  borderRadius: 16,
  background: "#FFFFFF",
  border: "1px solid #D1D5DB",
  color: "#111827",
  fontSize: "0.82rem",
  fontWeight: 800,
  textDecoration: "none",
};