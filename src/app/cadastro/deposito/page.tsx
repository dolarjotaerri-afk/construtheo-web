import Link from "next/link";

const steps = ["Dados do responsável", "Dados do depósito", "Confirmação"];

export default function CadastroDepositoPage() {
  return (
    <>
      <header className="form-header">
        <Link href="/" className="form-back">
          ← Voltar para a escolha de acesso
        </Link>

        <p className="login-badge">Cadastro de Depósito</p>
        <h1 className="login-title">
          Coloque seu <span>depósito de materiais</span> no mapa
        </h1>
        <p className="login-subtitle">
          Cadastre os dados principais para começar a receber pedidos da sua
          região.
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
          <label className="form-label" htmlFor="responsavel">
            Nome do responsável
          </label>
          <input
            id="responsavel"
            name="responsavel"
            className="form-input"
            placeholder="Quem responde pelo depósito"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="nome-deposito">
            Nome do depósito
          </label>
          <input
            id="nome-deposito"
            name="nome-deposito"
            className="form-input"
            placeholder="Ex: Depósito Central da Construção"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="telefone">
            Telefone comercial / WhatsApp
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
