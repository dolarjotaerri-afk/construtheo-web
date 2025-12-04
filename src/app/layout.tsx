import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { PwaRegister } from "../components/PwaRegister"; // ⬅ importa o registrador do PWA
// import WhatsAppSupportButton from "../components/WhatsAppSupportButton"; // se você já tiver esse componente global

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
      <head>
        {/* Manifesto do PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Cor da barra do navegador / app */}
        <meta name="theme-color" content="#0EA5E9" />

        {/* iOS (Safari) – deixa o app fullscreen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link
          rel="apple-touch-icon"
          href="/icons/icon-192x192.png"
        />
      </head>
      <body className={poppins.className}>
        {children}

        {/* registra service worker do PWA */}
        <PwaRegister />

        {/* se você já tiver o botão flutuante do WhatsApp, deixa aqui */}
        {/* <WhatsAppSupportButton /> */}
      </body>
    </html>
  );
}
