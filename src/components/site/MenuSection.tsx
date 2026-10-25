"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ALLERGEN_LABELS, menu, type DietaryTag } from "@/content/menu";
import { MenuCarousel } from "./MenuCarousel";
import { SectionHeader } from "./SectionHeader";

const TAG_LABELS: Record<DietaryTag, string> = {
  vegetariano: "Vegetariano",
  vegano: "Vegano",
  picante: "Picante",
  "para-compartir": "Para compartir",
};

const priceFormat = new Intl.NumberFormat(siteConfig.locale, { style: "currency", currency: siteConfig.currency, minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function MenuSection() {
  const [active, setActive] = useState(menu.categories[0]?.id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const category = menu.categories.find((c) => c.id === active) ?? menu.categories[0];
  const isDemo = menu.status === "demo";
  // Indicadores de la barra de categorías cuando no caben todas (móvil).
  const [tabEdges, setTabEdges] = useState({ left: false, right: false });
  const [tabsTouched, setTabsTouched] = useState(false);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setTabEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 }),
      );
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
      cancelAnimationFrame(frame);
    };
  }, []);

  /** Selecciona una categoría y centra su botón en la barra. */
  function select(index: number, focus = false) {
    setActive(menu.categories[index].id);
    const tab = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index];
    if (!tab) return;
    if (focus) tab.focus({ preventScroll: true });
    const el = tabsRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: tab.offsetLeft - (el.clientWidth - tab.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }

  function scrollTabs(direction: 1 | -1) {
    const el = tabsRef.current;
    if (!el) return;
    setTabsTouched(true);
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  // Navegación por teclado entre pestañas (patrón WAI-ARIA Tabs).
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const count = menu.categories.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % count;
    if (e.key === "ArrowLeft") next = (index - 1 + count) % count;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = count - 1;
    if (next >= 0) {
      e.preventDefault();
      select(next, true);
    }
  }

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-sand py-24 md:py-36">
      <div className="container-x">
        <SectionHeader
          id="menu-title"
          eyebrow={copy.menu.eyebrow}
          title={copy.menu.title}
          intro={
            <>
              <p className="text-ink-soft">{copy.menu.intro}</p>
              {siteConfig.menuPdfUrl && (
                <a href={siteConfig.menuPdfUrl} className="link-underline mt-4 inline-block text-sm font-semibold uppercase tracking-[0.14em] text-terracotta" target="_blank" rel="noopener">
                  Descargar carta (PDF)
                </a>
              )}
            </>
          }
        />

        {isDemo && (
          <p className="mx-auto mt-10 max-w-4xl rounded-lg border border-dashed border-terracotta/50 bg-linen/60 px-5 py-4 text-center text-[0.9375rem] text-ink-soft" data-reveal>
            <strong className="font-semibold text-terracotta">Carta de demostración.</strong> Los platos que ves son ejemplos para mostrar el diseño: la carta oficial,
            con sus platos, precios y alérgenos, se publicará cuando el restaurante la facilite.
          </p>
        )}

        <div className="mt-12 md:mt-16" data-reveal>
          <div className="relative -mx-5 md:mx-0">
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Categorías de la carta"
              onTouchStart={() => setTabsTouched(true)}
              className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-5 py-1 md:flex-wrap md:justify-center md:px-0"
            >
              {menu.categories.map((c, i) => {
                const selected = c.id === category?.id;
                return (
                  <button
                    key={c.id}
                    id={`tab-${c.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`panel-${c.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                      selected ? "border-ink bg-ink text-linen" : "border-ink/20 text-ink-soft hover:border-ink/60 hover:text-ink"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            {/* Indicadores: degradado y flecha en el lado donde quedan categorías ocultas */}
            <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-sand via-sand/80 to-transparent transition-opacity duration-300 ${tabEdges.left ? "opacity-100" : "opacity-0"}`} />
            <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-sand via-sand/80 to-transparent transition-opacity duration-300 ${tabEdges.right ? "opacity-100" : "opacity-0"}`} />
            <button
              type="button"
              tabIndex={-1}
              aria-label="Ver categorías anteriores"
              onClick={() => scrollTabs(-1)}
              className={`absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-linen text-ink shadow-sm transition-opacity duration-300 ${tabEdges.left ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronLeft width={16} height={16} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Ver más categorías"
              onClick={() => scrollTabs(1)}
              className={`absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-linen text-ink shadow-sm transition-opacity duration-300 ${tabEdges.right ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronRight width={16} height={16} />
            </button>
          </div>
          {(tabEdges.left || tabEdges.right) && (
            <p
              aria-hidden
              className={`mt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-mute transition-opacity duration-500 ${tabsTouched || tabEdges.left ? "opacity-0" : "opacity-100"}`}
            >
              <ChevronLeft width={14} height={14} /> Desliza para ver más <ChevronRight width={14} height={14} />
            </p>
          )}
        </div>

        {category && (
          <div
            id={`panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${category.id}`}
            tabIndex={0}
            key={category.id}
            className="mt-12 outline-none"
            style={{ animation: "fade .6s ease both" }}
          >
            <h3 className="font-script text-center text-5xl md:text-6xl">{category.name}</h3>
            {category.description && <p className="mt-2 text-center text-ink-mute">{category.description}</p>}
            <div className="mt-8">
              <MenuCarousel
                label={category.name}
                items={category.items.map((item) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  photo: item.image ? images[item.image] : null,
                  tags: [...(item.tags ?? []).map((t) => TAG_LABELS[t]), ...(item.allergens ?? []).map((a) => ALLERGEN_LABELS[a])],
                  priceLabel: item.price !== null ? priceFormat.format(item.price) : <span className="text-sm font-normal italic text-ink-mute">Precio por confirmar</span>,
                }))}
              />
            </div>
            <p className="mt-6 text-center text-sm text-ink-mute">
              ¿Alergias o intolerancias? Indícalo en los comentarios de tu reserva o pregunta a nuestro equipo.
            </p>
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-6 border-t border-ink/10 pt-12 text-center" data-reveal>
          <p className="font-script text-5xl md:text-6xl">La mesa te espera.</p>
          <Link href="#reservas" className="btn btn-primary">
            Reservar mesa
          </Link>
        </div>
      </div>
    </section>
  );
}
