"use client";

import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

const ease = [0.76, 0, 0.24, 1] as const;

/** Filete de progreso de lectura (parte superior). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <m.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-jade-ink" />;
}

/** Titular revelado palabra por palabra desde una máscara. */
export function WordsReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <m.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <m.span
            className="inline-block"
            variants={{
              hidden: { y: reduce ? 0 : "108%", opacity: reduce ? 0 : 1 },
              show: { y: 0, opacity: 1, transition: { duration: 1, ease } },
            }}
          >
            {w}
          </m.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </m.span>
  );
}

/** Filete que se dibuja de izquierda a derecha. */
export function Rule({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <m.span
      aria-hidden
      className={`block h-px origin-left ${dark ? "bg-cream/20" : "bg-ink/15"} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease }}
    />
  );
}

/**
 * Imagen que se revela como cortina (de abajo hacia arriba) y luego
 * se desplaza levemente con el scroll dentro de su marco.
 */
export function ClipReveal({
  children,
  className = "",
  delay = 0,
  drift = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  drift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-drift, drift]);
  return (
    <m.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0 0 0 0)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.4, ease, delay }}
    >
      <m.div className="absolute -inset-y-12 inset-x-0" style={{ y }}>
        {children}
      </m.div>
    </m.div>
  );
}
