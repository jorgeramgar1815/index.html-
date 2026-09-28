"use client";

import { m, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Barra dorada de progreso de lectura (parte superior). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-jade via-gold to-gold-soft"
    />
  );
}

/** Titular que se revela palabra por palabra desde una máscara. */
export function WordsReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <m.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <m.span
            className="inline-block"
            variants={{
              hidden: { y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 },
              show: { y: 0, opacity: 1, transition: { duration: 0.85, ease } },
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

/** Línea decorativa que crece al entrar en viewport. */
export function GrowLine({ className = "", origin = "left" }: { className?: string; origin?: "left" | "right" }) {
  return (
    <m.span
      aria-hidden
      className={`block h-px ${origin === "left" ? "origin-left" : "origin-right"} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease, delay: 0.15 }}
    />
  );
}

/**
 * Inclinación 3D + reflejo que sigue al cursor (solo mouse; nada en touch
 * ni con reduced-motion). Usa variables CSS para no re-renderizar.
 */
export function Tilt({ children, className = "", max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    ref.current.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    ref.current.style.setProperty("--gx", `${x * 100}%`);
    ref.current.style.setProperty("--gy", `${y * 100}%`);
    ref.current.style.setProperty("--go", "1");
  };
  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--go", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/tilt relative h-full [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-[var(--go,0)] transition-opacity duration-300 [background:radial-gradient(420px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,244,214,.22),transparent_45%)]"
      />
    </div>
  );
}

/** Contenedor que expone la posición del mouse (--px, --py en -1..1) para capas con parallax. */
export function PointerParallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const frame = useRef(0);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const el = ref.current;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", (((clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--py", (((clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={className}>
      {children}
    </div>
  );
}
