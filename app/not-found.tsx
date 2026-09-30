import Link from "next/link";
import { Lotus } from "@/components/Lotus";
import { SpaButton } from "@/components/landing/Kit";

export default function NotFound() {
  return (
    <section className="bg-cream-50 px-4 py-28 text-center sm:py-36">
      <Lotus className="mx-auto h-12 w-12 text-jade-ink" />
      <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-ink">Error 404</p>
      <h1 className="mt-4 text-[2rem] leading-tight sm:text-[2.6rem]">
        Esta página <em className="text-jade-ink">no existe.</em>
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-[0.95rem] text-stone">Vuelve al inicio o escríbenos y te ayudamos a agendar.</p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-[3.25rem] items-center justify-center rounded-[3px] border border-ink/40 px-7 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream-50"
        >
          Ir al inicio
        </Link>
        <SpaButton>Escribir por WhatsApp</SpaButton>
      </div>
    </section>
  );
}
