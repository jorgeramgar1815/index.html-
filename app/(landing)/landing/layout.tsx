import type { ReactNode } from "react";
import { LandingFooter, LandingHeader } from "@/components/landing/Kit";

/** Prototipo 2: landing de conversión con cabecera y pie propios. */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingHeader />
      <main id="contenido">{children}</main>
      <LandingFooter />
    </>
  );
}
