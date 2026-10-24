"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Revela con una transición suave los elementos `[data-reveal]` al entrar en pantalla.
 * El contenido es visible por defecto: solo se ocultan (al montar) los que están por debajo
 * del pliegue, así no hay parpadeos ni contenido inaccesible si falla JavaScript.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const fold = window.innerHeight * 0.92;
    const pending = elements.filter((el) => el.getBoundingClientRect().top > fold);
    pending.forEach((el) => el.setAttribute("data-reveal-pending", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.removeAttribute("data-reveal-pending");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    pending.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      pending.forEach((el) => el.removeAttribute("data-reveal-pending"));
    };
  }, [pathname]);

  return null;
}
