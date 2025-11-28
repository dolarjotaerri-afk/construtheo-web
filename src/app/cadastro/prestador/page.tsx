import Link from "next/link";

const steps = ["Dados pessoais", "Serviços", "Confirmação"];

export default function CadastroPrestadorPage() {
  return (
    <>
      <header className="form-header">
        <Link href="/" className="form-back">
          ← Voltar para a escolha de acesso
        </Link>

        <p className="login-badge">Cadastro de Prestador</p>
        <h1 className="login-title">
          Mostre seu trabalho no <span>ConstruThéo</span>
        </h1>
        <p className="login-subtitle">
          Pedreiro, eletricista, pintor, encanador... cadastre seus dados para
          aparecer para clientes da sua região.
        </p>
      </header>

      <div className="form-steps">
        {steps.map((label, index) => (
          <div
            key={label}
            className={
              "form-step " + (index === 0 ? "form-step--current" : "")
            }
          >
            {label}
          </div>
        ))}
      </div>

      <form className="form-body">
        <div className="form-row">
          <label className="form-label" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            className="form-input"
            placeholder="Seu nome"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="especialidade">
            Principal especialidade
          </label>
          <input
            id="especialidade"
            name="especialidade"
            className="form-input"
            placeholder="Ex: Pedreiro, Pintor, Eletricista..."
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            className="form-input"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="form-primary-btn">
            Continuar
          </button>
        </div>
      </form>
    </>
  );
}
