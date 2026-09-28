import type { ReactNode } from "react";

/** Se vuelve a montar en cada navegación: fade suave entre páginas (CSS, sin esperar a JS). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
