import type { ReactNode } from "react";

export default function CadastroLayout({ children }: { children: ReactNode }) {
  return (
    <main className="login-screen">
      <div className="login-card cadastro-card">{children}</div>
    </main>
  );
}
