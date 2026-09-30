import type { Metadata } from "next";
import Link from "next/link";

// El prototipo vivía aquí; ahora es la página de inicio.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function LandingRedirect() {
  return (
    <section className="bg-cream-50 px-4 py-28 text-center">
      <meta httpEquiv="refresh" content="0;url=/" />
      <p className="text-[0.95rem] text-stone">
        Esta página se movió al{" "}
        <Link href="/" className="font-semibold text-jade-ink underline underline-offset-4">
          inicio
        </Link>
        .
      </p>
    </section>
  );
}
