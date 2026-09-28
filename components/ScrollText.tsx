"use client";

import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";

function Word({ children, progress, range, still }: { children: ReactNode; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const opacity = useTransform(progress, range, still ? [1, 1] : [0.14, 1]);
  return (
    <span className="relative mr-[0.22em] inline-block">
      <m.span style={{ opacity }}>{children}</m.span>
    </span>
  );
}

/**
 * Párrafo que se "entinta" palabra por palabra mientras se hace scroll.
 * Las palabras en `emphasis` se muestran en cursiva jade.
 */
export function ScrollText({ text, emphasis = [], className = "" }: { text: string; emphasis?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          const start = i / words.length;
          const node = emphasis.includes(w.replace(/[.,]/g, "")) ? <em className="text-jade-ink">{w}</em> : w;
          return (
            <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} still={!!reduce}>
              {node}
            </Word>
          );
        })}
      </span>
    </p>
  );
}
