import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import WhatsappSupportButton from "../components/WhatsappSupportButton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ConstruThéo",
  description: "O Aplicativo completo Para sua Obra!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        {children}
        <WhatsappSupportButton />
      </body>
    </html>
  );
}
