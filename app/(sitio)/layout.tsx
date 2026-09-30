import type { ReactNode } from "react";
import { ScrollProgress } from "@/components/Effects";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/** Sitio editorial: inicio, servicios, nosotros y aviso de privacidad. */
export default function SitioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
    </>
  );
}
