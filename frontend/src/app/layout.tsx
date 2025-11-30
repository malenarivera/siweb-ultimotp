import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import App from "./App";

const atkinson = localFont({
  src: [
    { path: "../../public/assets/Atkinson_Hyperlegible/AtkinsonHyperlegible-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/assets/Atkinson_Hyperlegible/AtkinsonHyperlegible-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/assets/Atkinson_Hyperlegible/AtkinsonHyperlegible-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/assets/Atkinson_Hyperlegible/AtkinsonHyperlegible-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRZ - Panel",
  description: "Panel de administración CRZ",
  icons: {
    icon: "/assets/favicon.ico",
  },
};

export default function RootLayout() {
  return (
    <html lang="es">
      <body className={`${atkinson.variable} font-sans antialiased`}>
      <App />
      <div id="modal-root"></div>
      </body>
    </html>
  );
}
