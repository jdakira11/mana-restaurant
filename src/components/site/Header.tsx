"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/config/site";
import { Close } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menú móvil: bloquea el scroll del fondo, cierra con Escape y devuelve el foco.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a, button"));
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const solid = scrolled || !overHero;

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-linen"
      >
        Saltar al contenido
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow,padding] duration-500 ${
          solid ? "bg-ivory/92 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "on-dark text-linen"
        }`}
      >
        <div className={`container-x flex items-center justify-between gap-6 transition-[height] duration-500 ${solid ? "h-16 md:h-[4.5rem]" : "h-20 md:h-24"}`}>
          <Link href="/" className="relative z-10" aria-label="Maná, ir al inicio" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[0.8125rem] font-medium tracking-[0.08em]">
              {navigation.slice(1, 6).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline py-1">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/#reservas" className="btn btn-primary hidden !min-h-0 !py-3 sm:inline-flex">
              Reservar mesa
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-6" aria-hidden>
                <span className={`absolute left-0 top-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-6 bg-current transition-transform duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      <div
        id="menu-movil"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        hidden={!open}
        className="on-dark fixed inset-0 z-[60] flex flex-col bg-olive-deep text-linen lg:hidden"
      >
        <div className="container-x flex h-20 items-center justify-between">
          <Logo />
          <button type="button" onClick={() => setOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Cerrar menú">
            <Close width={26} height={26} />
          </button>
        </div>
        <nav aria-label="Menú móvil" className="container-x flex flex-1 flex-col justify-center pb-10">
          <ul className="space-y-1">
            {navigation.map((item, i) => (
              <li key={item.href} className="menu-line" style={{ ["--i" as string]: i * 0.6 }}>
                <Link href={item.href} onClick={() => setOpen(false)} className="font-script block py-1 text-[clamp(2.9rem,11vw,4.2rem)] leading-tight">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/#reservas" onClick={() => setOpen(false)} className="btn btn-primary mt-10 self-start">
            Reservar mesa
          </Link>
        </nav>
      </div>
    </>
  );
}
