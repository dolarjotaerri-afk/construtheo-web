import Link from "next/link";

const steps = ["Dados da usina", "Regiões de atendimento", "Confirmação"];

export default function CadastroUsinaPage() {
  return (
    <>
      <header className="form-header">
        <Link href="/" className="form-back">
          ← Voltar para a escolha de acesso
        </Link>

        <p className="login-badge">Cadastro de Usina de Concreto</p>
        <h1 className="login-title">
          Conecte sua <span>usina</span> às melhores obras
        </h1>
        <p className="login-subtitle">
          Cadastre as informações principais para receber pedidos de concreto
          pela plataforma.
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
          <label className="form-label" htmlFor="nome-usina">
            Nome da usina
          </label>
          <input
            id="nome-usina"
            name="nome-usina"
            className="form-input"
            placeholder="Ex: Concretos São João"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="responsavel">
            Responsável comercial
          </label>
          <input
            id="responsavel"
            name="responsavel"
            className="form-input"
            placeholder="Nome do contato principal"
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
