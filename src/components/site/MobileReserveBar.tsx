"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Botón de reserva fijo en móvil. Aparece al dejar atrás la portada y se oculta cuando la
 * sección de reservas o el pie de página están en pantalla, para no tapar el formulario.
 */
export function MobileReserveBar() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = ["reservas", "contacto"].map((id) => document.getElementById(id)).concat(document.querySelector("footer"));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => t && observer.observe(t));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [pathname]);

  if (pathname !== "/") return null;
  const show = pastHero && !hidden;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
      aria-hidden={!show}
    >
      <Link href="/#reservas" tabIndex={show ? 0 : -1} className="btn btn-primary w-full shadow-[0_18px_40px_-12px_rgb(31_26_22/0.55)]">
        Reservar mesa
      </Link>
    </div>
  );
}
