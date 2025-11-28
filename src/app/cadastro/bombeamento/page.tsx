import Link from "next/link";

const steps = ["Dados da empresa", "Equipamentos", "Confirmação"];

export default function CadastroBombeamentoPage() {
  return (
    <>
      <header className="form-header">
        <Link href="/" className="form-back">
          ← Voltar para a escolha de acesso
        </Link>

        <p className="login-badge">Cadastro de Bombeamento</p>
        <h1 className="login-title">
          Mostre sua estrutura de <span>bombeamento</span>
        </h1>
        <p className="login-subtitle">
          Cadastre sua empresa para receber pedidos de bombeamento de concreto
          direto das obras.
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
          <label className="form-label" htmlFor="empresa">
            Nome da empresa
          </label>
          <input
            id="empresa"
            name="empresa"
            className="form-input"
            placeholder="Ex: Bombeamentos Construcity"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="contato">
            Nome do contato
          </label>
          <input
            id="contato"
            name="contato"
            className="form-input"
            placeholder="Pessoa para negociar pedidos"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="telefone">
            Telefone / WhatsApp comercial
          </label>
          <input
            id="telefone"
            name="telefone"
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
