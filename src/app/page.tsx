"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SplashScreen from "./SplashScreen";
import { supabase } from "../lib/supabaseClient";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const companies = [
  ["🏪", "Depósito de materiais"],
  ["▦", "Vidraçaria"],
  ["⚙", "Serralheria"],
  ["◫", "Marmoraria"],
  ["☀", "Energia solar"],
  ["▰", "Caçamba de entulho"],
  ["🏗", "Usina de concreto"],
  ["🚜", "Máquinas e equipamentos"],
];

const professionals = [
  ["João", "Pedreiro"],
  ["Carlos", "Pintor"],
  ["Luiz", "Eletricista"],
  ["Marcos", "Encanador"],
  ["Rafael", "Gesseiro e drywall"],
  ["André", "Azulejista"],
  ["Paulo", "Serralheiro"],
  ["Lucas", "Jardineiro"],
];

function Icon({
  name,
}: {
  name: "home" | "search" | "company" | "calc" | "pin" | "user";
}) {
  if (name === "home")
    return (
      <svg viewBox="0 0 24 24">
        <path d="m4 11 8-6 8 6v8H4zM9.5 19v-5h5v5" />
      </svg>
    );

  if (name === "company")
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 20V8l8-4v16M12 9h8v11M7 10h2M7 14h2M15 12h2M15 16h2" />
      </svg>
    );

  if (name === "calc")
    return (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
        <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2" />
      </svg>
    );

  if (name === "pin")
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 20s6-4.5 6-10a6 6 0 1 0-12 0c0 5.5 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    );

  if (name === "user")
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" />
      </svg>
    );

  return (
    <svg viewBox="0 0 24 24">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m14.8 14.8 4.2 4.2M10.5 7.5v6M7.5 10.5h6" />
    </svg>
  );
}

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [accountAction, setAccountAction] = useState({
    label: "Entrar",
    href: "/login",
  });
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolvePanel = (tipo?: string | null) => {
      if (tipo === "empresa") return "/painel/empresa";
      if (tipo === "profissional" || tipo === "prestador")
        return "/painel/profissional";
      return "/painel/cliente";
    };

    const updateAccountAction = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setAccountAction({ label: "Entrar", href: "/login" });
        return;
      }

      let tipo =
        session.user.user_metadata?.tipo ||
        session.user.app_metadata?.tipo ||
        null;

      if (!tipo && typeof window !== "undefined") {
        if (localStorage.getItem("construtheo_empresa_atual")) {
          tipo = "empresa";
        } else if (localStorage.getItem("construtheo_profissional_atual")) {
          tipo = "profissional";
        } else {
          tipo = "cliente";
        }
      }

      setAccountAction({
        label: "Acessar painel",
        href: resolvePanel(tipo),
      });
    };

    updateAccountAction();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(updateAccountAction);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (standalone) return;

    const dismissed =
      sessionStorage.getItem("construtheo_install_card_closed") === "true";

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      if (!dismissed) setShowInstallCard(true);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowInstallCard(false);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setShowInstallCard(false);
    setInstallPrompt(null);
  };

  const closeInstallCard = () => {
    sessionStorage.setItem("construtheo_install_card_closed", "true");
    setShowInstallCard(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <main className="home">
        <div className="shell">
          <header className="topbar">
            <div className="brand">
              <span className="brandMark">C</span>
              <div>
                <strong>Construthéo</strong>
                <small>Sua obra conectada</small>
              </div>
            </div>

            <div className="topActions">
              <div className="region">
                <span className="regionDot" />
                <div>
                  <small>Explorar</small>
                  <strong>Sua região</strong>
                </div>
              </div>

              <Link href={accountAction.href} className="loginButton">
                {accountAction.label}
              </Link>
            </div>
          </header>

          <section className="hero">
            <div className="heroCopy">
              <span className="kicker">Construção civil em um só lugar</span>
              <h1>Sua obra conectada a quem faz acontecer.</h1>
              <p>
                Encontre profissionais e empresas, realize cálculos e divulgue
                seus serviços de forma simples, rápida e regional.
              </p>

              <div className="heroButtons">
                <a href="#atalhos" className="primary">
                  Explorar agora
                </a>
                <Link href="/cadastro/prestador" className="secondary">
                  Divulgar serviço
                </Link>
              </div>
            </div>

            <div className="heroVisual" aria-hidden="true">
              <span className="nearBadge">Perto de você</span>
              <div className="mascotCircle">
                <Image
                  src="/mascote-pedreiro.png"
                  alt=""
                  width={240}
                  height={240}
                  priority
                />
              </div>
            </div>
          </section>

          <section id="atalhos" className="section quickSection">
            <div className="sectionTitle">
              <span>Acesso rápido</span>
              <h2>O que você precisa hoje?</h2>
            </div>

            <div className="quickGrid">
              <a href="#profissionais" className="quick">
                <i><Icon name="search" /></i>
                <span>Profissionais</span>
              </a>

              <a href="#empresas" className="quick">
                <i><Icon name="company" /></i>
                <span>Empresas</span>
              </a>

              <Link href="/painel/calculos" className="quick">
                <i><Icon name="calc" /></i>
                <span>Cálculos</span>
              </Link>

              <Link href="/indicar" className="quick">
                <i><Icon name="pin" /></i>
                <span>Indicar</span>
              </Link>

              <Link href="/cadastro/cliente" className="quick">
                <i><Icon name="user" /></i>
                <span>Cadastre-se</span>
              </Link>
            </div>
          </section>

          <section className="audiences">
            <Link href="/cadastro/cliente" className="audienceCard">
              <div className="audienceIcon"><Icon name="search" /></div>
              <div>
                <small>Para quem está construindo</small>
                <strong>Encontre quem sua obra precisa</strong>
                <p>Cadastre-se grátis e encontre opções próximas de você.</p>
              </div>
              <b>→</b>
            </Link>

            <Link href="/cadastro/prestador" className="audienceCard">
              <div className="audienceIcon dark"><Icon name="user" /></div>
              <div>
                <small>Para quem faz acontecer</small>
                <strong>Deixe novos clientes encontrarem você</strong>
                <p>Crie seu perfil e amplie sua presença na região.</p>
              </div>
              <b>→</b>
            </Link>
          </section>

          <section id="profissionais" className="section">
            <div className="heading">
              <div>
                <span>Profissionais</span>
                <h2>Encontre profissionais na sua região</h2>
                <p>
                  Perfis demonstrativos para mostrar como a busca funciona.
                </p>
              </div>
              <Link href="/cadastro/prestador">Cadastrar perfil</Link>
            </div>

            <div className="horizontal">
              {professionals.map(([name, profession]) => (
                <Link
                  href="/cadastro/prestador"
                  className="proCard"
                  key={`${name}-${profession}`}
                >
                  <div className="proCover">
                    <em>Perfil demonstrativo</em>
                  </div>
                  <div className="avatar">👷</div>
                  <div className="proContent">
                    <strong>{name}</strong>
                    <span>{profession}</span>
                    <small>Seu perfil pode aparecer aqui</small>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section id="empresas" className="section">
            <div className="heading">
              <div>
                <span>Empresas</span>
                <h2>Empresas para cada etapa da obra</h2>
                <p>
                  Materiais, serviços, equipamentos e soluções para construção.
                </p>
              </div>
              <Link href="/cadastro/empresa">Cadastrar empresa</Link>
            </div>

            <div className="horizontal">
              {companies.map(([icon, name]) => (
                <Link href="/cadastro/empresa" className="companyCard" key={name}>
                  <div className="companyIcon">{icon}</div>
                  <strong>{name}</strong>
                  <span>Cadastre ou indique uma empresa</span>
                  <small>Conhecer →</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="calcBanner">
            <div className="calcIcon"><Icon name="calc" /></div>
            <div>
              <span>Ferramentas gratuitas</span>
              <h2>Calcule antes de comprar.</h2>
              <p>
                Concreto, blocos, argamassa, areia, brita, tinta, fiação,
                encanamento e muito mais.
              </p>
            </div>
            <Link href="/painel/calculos">Abrir cálculos</Link>
          </section>

          <section className="indicate">
            <div>
              <span>Construthéo cresce com a região</span>
              <h2>Conhece alguém bom na construção?</h2>
              <p>
                Indique um profissional ou empresa e ajude outras pessoas a
                encontrarem bons serviços perto delas.
              </p>
            </div>
            <Link href="/indicar">Fazer indicação</Link>
          </section>

          <footer className="footer">
            <strong>Construthéo</strong>
            <span>Sua obra conectada a quem faz acontecer.</span>
          </footer>
        </div>
      </main>

      <nav className="bottomNav">
        <a href="#" className="active"><Icon name="home" /><span>Início</span></a>
        <a href="#profissionais"><Icon name="search" /><span>Buscar</span></a>
        <Link href="/painel/calculos"><Icon name="calc" /><span>Cálculos</span></Link>
        <Link href="/indicar"><Icon name="pin" /><span>Indicar</span></Link>
        <Link href={accountAction.href}><Icon name="user" /><span>Perfil</span></Link>
      </nav>

      {showInstallCard && installPrompt && (
        <aside className="installCard">
          <Image
            src="/mascote-pedreiro.png"
            alt="Construthéo"
            width={42}
            height={42}
            priority
          />
          <div>
            <strong>Instale o Construthéo</strong>
            <span>Acesse direto pela tela inicial.</span>
          </div>
          <button onClick={handleInstallApp}>Instalar</button>
          <button className="close" onClick={closeInstallCard}>×</button>
        </aside>
      )}

      <style jsx global>{`
        :root{--blue:#0284c7;--blue2:#0369a1;--text:#0f172a;--muted:#64748b;--line:#e2e8f0}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{background:#f7f9fc}
        .home{min-height:100dvh;background:radial-gradient(circle at top left,rgba(2,132,199,.08),transparent 28%),#f7f9fc;padding-bottom:112px;color:var(--text)}
        .shell{width:min(100%,1160px);margin:auto;padding:18px 16px 38px}
        .topbar,.topActions,.brand,.region{display:flex;align-items:center}.topbar{justify-content:space-between;gap:12px;margin-bottom:16px}.brand{gap:10px}.brandMark{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(145deg,var(--blue),#0ea5e9);color:white;font-weight:900;box-shadow:0 8px 18px rgba(2,132,199,.2)}.brand div,.region div{display:flex;flex-direction:column}.brand strong{font-size:.9rem}.brand small{margin-top:2px;color:#94a3b8;font-size:.56rem;font-weight:700}.topActions{gap:8px}.region{display:none;gap:8px;padding:7px 10px;border:1px solid var(--line);border-radius:13px;background:#fff}.regionDot{width:8px;height:8px;border-radius:50%;background:var(--blue);box-shadow:0 0 0 4px rgba(2,132,199,.11)}.region small{font-size:.5rem;color:#94a3b8}.region strong{font-size:.64rem}.loginButton{min-height:38px;display:flex;align-items:center;padding:0 13px;border:1px solid #bae6fd;border-radius:13px;background:#fff;color:var(--blue2);font-size:.66rem;font-weight:900;text-decoration:none;white-space:nowrap}
        .hero{position:relative;min-height:350px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;gap:12px;padding:24px 22px 0;border-radius:28px;background:linear-gradient(135deg,#075985,#0284c7 50%,#0ea5e9);color:white;box-shadow:0 22px 50px rgba(2,132,199,.22)}.hero:before,.hero:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.14)}.hero:before{width:260px;height:260px;right:-110px;bottom:-110px}.hero:after{width:150px;height:150px;right:-50px;top:-60px;background:rgba(255,255,255,.06)}.heroCopy,.heroVisual{position:relative;z-index:2}.kicker{display:inline-flex;padding:7px 10px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.1);font-size:.56rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.hero h1{max-width:520px;margin:13px 0 9px;font-size:clamp(1.8rem,8vw,3rem);line-height:.98;letter-spacing:-.055em}.hero p{max-width:520px;margin:0;color:rgba(255,255,255,.83);font-size:.78rem;line-height:1.5}.heroButtons{display:flex;flex-wrap:wrap;gap:8px;margin-top:17px}.primary,.secondary{min-height:42px;display:flex;align-items:center;padding:0 15px;border-radius:13px;font-size:.68rem;font-weight:900;text-decoration:none}.primary{background:white;color:#075985}.secondary{border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:white}.heroVisual{min-height:126px}.mascotCircle{position:absolute;right:-4px;bottom:-14px;width:178px;height:178px;display:flex;align-items:flex-end;justify-content:center;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.09)}.mascotCircle img{width:174px;height:174px;object-fit:contain;filter:drop-shadow(0 14px 16px rgba(3,59,88,.25))}.nearBadge{position:absolute;left:0;bottom:18px;z-index:3;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:#075985;font-size:.56rem;font-weight:900;box-shadow:0 8px 20px rgba(3,105,161,.2)}
        .section{margin-top:27px}.sectionTitle span,.heading span,.calcBanner>div:nth-child(2)>span,.indicate span{display:block;margin-bottom:4px;color:var(--blue);font-size:.56rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.sectionTitle h2,.heading h2,.calcBanner h2,.indicate h2{margin:0;font-size:1rem;line-height:1.13;letter-spacing:-.025em}.quickGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:11px}.quick{min-width:0;display:flex;flex-direction:column;align-items:center;gap:7px;color:#334155;font-size:.54rem;font-weight:800;text-align:center;text-decoration:none}.quick i{width:52px;height:52px;display:grid;place-items:center;border:1px solid #dbeafe;border-radius:17px;background:linear-gradient(#fff,#f0f9ff);color:var(--blue);box-shadow:0 8px 18px rgba(15,23,42,.05);font-style:normal}.quick svg,.audienceIcon svg,.calcIcon svg,.bottomNav svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .audiences{display:grid;gap:10px;margin-top:24px}.audienceCard{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:15px;border:1px solid var(--line);border-radius:20px;background:white;color:inherit;text-decoration:none;box-shadow:0 10px 26px rgba(15,23,42,.055)}.audienceIcon{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:#e0f2fe;color:var(--blue)}.audienceIcon.dark{background:#e2e8f0;color:#334155}.audienceCard div:nth-child(2){display:flex;flex-direction:column}.audienceCard small{font-size:.5rem;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.audienceCard strong{margin-top:3px;font-size:.75rem;line-height:1.25}.audienceCard p{margin:3px 0 0;color:var(--muted);font-size:.6rem;line-height:1.38}.audienceCard b{color:var(--blue)}
        .heading{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:13px}.heading p{margin:5px 0 0;color:var(--muted);font-size:.66rem}.heading>a{flex-shrink:0;color:var(--blue2);font-size:.6rem;font-weight:900;text-decoration:none}.horizontal{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 16px 8px 1px}.horizontal::-webkit-scrollbar{display:none}.proCard,.companyCard{flex-shrink:0;scroll-snap-align:start;border:1px solid var(--line);border-radius:19px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 8px 22px rgba(15,23,42,.055)}.proCard{width:150px;overflow:hidden}.proCover{height:57px;position:relative;background:linear-gradient(135deg,rgba(2,132,199,.14),rgba(14,165,233,.03)),#f8fafc}.proCover em{position:absolute;top:8px;left:8px;padding:4px 6px;border-radius:999px;background:#fff;color:#64748b;font-size:.42rem;font-style:normal;font-weight:800}.avatar{width:48px;height:48px;margin:-24px 0 7px 11px;position:relative;z-index:2;display:grid;place-items:center;border:4px solid white;border-radius:50%;background:linear-gradient(#cbd5e1,#94a3b8);font-size:1.2rem}.proContent{display:flex;flex-direction:column;align-items:flex-start;padding:0 11px 12px}.proContent strong{font-size:.7rem}.proContent>span{margin-top:2px;color:var(--blue);font-size:.56rem;font-weight:800}.proContent small{margin-top:8px;padding:5px 7px;border:1px solid #bae6fd;border-radius:999px;background:#f0f9ff;color:var(--blue2);font-size:.45rem;font-weight:900}.companyCard{width:142px;min-height:158px;display:flex;flex-direction:column;align-items:flex-start;padding:13px}.companyIcon{width:40px;height:40px;display:grid;place-items:center;margin-bottom:10px;border-radius:13px;background:#f1f5f9;color:#64748b;filter:grayscale(1)}.companyCard strong{min-height:34px;font-size:.67rem;line-height:1.25}.companyCard>span{margin-top:4px;color:#94a3b8;font-size:.5rem;line-height:1.3}.companyCard small{margin-top:auto;padding-top:10px;color:var(--blue2);font-size:.54rem;font-weight:900}
        .calcBanner{display:grid;grid-template-columns:auto 1fr;gap:13px;margin-top:27px;padding:19px;border-radius:24px;background:linear-gradient(135deg,#0c4a6e,#0369a1 52%,#0284c7);color:white;box-shadow:0 18px 38px rgba(3,105,161,.18)}.calcIcon{width:48px;height:48px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);border-radius:15px;background:rgba(255,255,255,.1)}.calcBanner>div:nth-child(2)>span{color:#bae6fd}.calcBanner h2{color:white}.calcBanner p{margin:5px 0 0;color:rgba(255,255,255,.75);font-size:.62rem;line-height:1.45}.calcBanner>a{grid-column:1/-1;min-height:42px;display:flex;align-items:center;justify-content:center;border-radius:13px;background:white;color:#075985;font-size:.64rem;font-weight:900;text-decoration:none}
        .indicate{display:flex;flex-direction:column;gap:14px;margin-top:18px;padding:19px;border:1px solid #dbeafe;border-radius:24px;background:radial-gradient(circle at right top,rgba(14,165,233,.11),transparent 34%),white}.indicate p{margin:6px 0 0;color:var(--muted);font-size:.64rem;line-height:1.45}.indicate>a{align-self:flex-start;min-height:39px;display:flex;align-items:center;padding:0 13px;border-radius:12px;background:var(--blue);color:white;font-size:.62rem;font-weight:900;text-decoration:none}.footer{padding:28px 0 4px;display:flex;flex-direction:column;align-items:center}.footer strong{font-size:.72rem}.footer span{margin-top:3px;color:#94a3b8;font-size:.53rem}
        .bottomNav{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));z-index:50;width:calc(100% - 20px);max-width:560px;min-height:68px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:7px 6px;border:1px solid rgba(226,232,240,.92);border-radius:22px;background:rgba(255,255,255,.95);box-shadow:0 16px 40px rgba(15,23,42,.16);backdrop-filter:blur(18px)}.bottomNav>a{min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:15px;color:#94a3b8;font-size:.47rem;font-weight:800;text-decoration:none}.bottomNav>a.active{background:#f0f9ff;color:var(--blue)}.bottomNav svg{width:20px;height:20px}
        .installCard{position:fixed;left:50%;bottom:90px;z-index:60;width:calc(100% - 24px);max-width:490px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid #dbeafe;border-radius:18px;background:rgba(255,255,255,.97);box-shadow:0 16px 36px rgba(15,23,42,.2)}.installCard>img{width:44px;height:44px;object-fit:contain;border-radius:13px;background:#f0f9ff}.installCard>div{min-width:0;flex:1;display:flex;flex-direction:column}.installCard strong{font-size:.8rem}.installCard span{color:#64748b;font-size:.67rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.installCard button{border:0;border-radius:12px;padding:10px 13px;background:#0ea5e9;color:white;font-size:.72rem;font-weight:800}.installCard button.close{width:32px;height:32px;padding:0;border-radius:50%;background:#f1f5f9;color:#64748b;font-size:1.05rem}
        @media(min-width:520px){.region{display:flex}.audiences{grid-template-columns:1fr 1fr}.calcBanner{grid-template-columns:auto 1fr auto;align-items:center}.calcBanner>a{grid-column:auto;padding:0 14px}.indicate{flex-direction:row;align-items:center;justify-content:space-between}.indicate>a{flex-shrink:0}}
        @media(min-width:768px){.shell{padding:26px 24px 48px}.hero{min-height:420px;flex-direction:row;align-items:center;padding:44px}.heroCopy{width:60%}.heroVisual{width:40%;min-height:300px}.mascotCircle{right:0;bottom:-40px;width:290px;height:290px}.mascotCircle img{width:280px;height:280px}.nearBadge{left:auto;right:195px;bottom:84px}.section{margin-top:34px}.quick i{width:60px;height:60px}.quick{font-size:.62rem}.sectionTitle h2,.heading h2,.calcBanner h2,.indicate h2{font-size:1.28rem}.proCard{width:180px}.companyCard{width:172px}.calcBanner,.indicate{padding:24px}}
        @media(min-width:1000px){.hero{min-height:455px}.hero h1{font-size:3.8rem}.hero p{font-size:.9rem}.quickGrid{max-width:720px}.audiences{gap:14px}.audienceCard{padding:19px}.audienceCard strong{font-size:.88rem}.proCard{width:195px}.companyCard{width:185px}}
        @media(max-width:380px){.shell{padding-left:12px;padding-right:12px}.brand small{display:none}.hero{padding-left:18px;padding-right:18px}.hero h1{font-size:1.7rem}.quickGrid{gap:4px}.quick i{width:46px;height:46px}.quick{font-size:.48rem}.installCard span{display:none}}
      `}</style>
    </>
  );
}