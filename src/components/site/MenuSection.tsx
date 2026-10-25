"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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
      setActive(menu.categories[next].id);
      tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
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

        <div className="relative mt-12 md:mt-16" data-reveal>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Categorías de la carta"
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:px-0"
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
                  onClick={() => setActive(c.id)}
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
