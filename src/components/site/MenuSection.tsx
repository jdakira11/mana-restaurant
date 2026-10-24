"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ALLERGEN_LABELS, menu, type DietaryTag } from "@/content/menu";
import { ProvisionalTag } from "@/components/ui/Notice";

const TAG_LABELS: Record<DietaryTag, string> = {
  vegetariano: "Vegetariano",
  vegano: "Vegano",
  picante: "Picante",
  "para-compartir": "Para compartir",
};

const priceFormat = new Intl.NumberFormat(siteConfig.locale, { style: "currency", currency: siteConfig.currency, maximumFractionDigits: 2 });

export function MenuSection() {
  const [active, setActive] = useState(menu.categories[0]?.id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const category = menu.categories.find((c) => c.id === active) ?? menu.categories[0];
  const isDemo = menu.status === "demo";
  const img = images[category?.image ?? "hummusBowl"];

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
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow" data-reveal>
              {copy.menu.eyebrow}
            </p>
            <h2 id="menu-title" className="display-lg mt-6" data-reveal>
              {copy.menu.title}
            </h2>
          </div>
          <div className="md:col-span-5" data-reveal>
            <p className="text-lg leading-relaxed text-ink-soft">{copy.menu.intro}</p>
            {siteConfig.menuPdfUrl && (
              <a href={siteConfig.menuPdfUrl} className="link-underline mt-4 inline-block text-sm font-semibold uppercase tracking-[0.14em] text-terracotta" target="_blank" rel="noopener">
                Descargar carta (PDF)
              </a>
            )}
          </div>
        </div>

        {isDemo && (
          <p className="mt-10 rounded-lg border border-dashed border-terracotta/50 bg-linen/60 px-5 py-4 text-[0.9375rem] text-ink-soft" data-reveal>
            <strong className="font-semibold text-terracotta">Carta de demostración.</strong> Los platos que ves son ejemplos para mostrar el diseño: la carta oficial,
            con sus platos, precios y alérgenos, se publicará cuando el restaurante la facilite.
          </p>
        )}

        <div className="relative mt-12 md:mt-16" data-reveal>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Categorías de la carta"
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0"
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
          <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-10">
            <div
              id={`panel-${category.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${category.id}`}
              tabIndex={0}
              key={category.id}
              className="md:col-span-7 lg:col-span-7"
              style={{ animation: "fade .6s ease both" }}
            >
              <h3 className="font-script text-5xl md:text-6xl">{category.name}</h3>
              {category.description && <p className="mt-2 text-ink-mute">{category.description}</p>}
              <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {category.items.map((item) => (
                  <li key={item.id} className="py-6">
                    <div className="flex items-baseline gap-4">
                      <h4 className="font-script text-[2rem] leading-none md:text-[2.35rem]">{item.name}</h4>
                      {item.demo && siteConfig.showContentNotices && (
                        <span className="rounded-full border border-terracotta/40 bg-linen px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-terracotta">Ejemplo</span>
                      )}
                      <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-ink/25" />
                      <span className="shrink-0 text-[0.9375rem] font-medium tabular-nums text-ink-soft">
                        {item.price !== null ? priceFormat.format(item.price) : <span className="text-sm italic text-ink-mute">Precio por confirmar</span>}
                      </span>
                    </div>
                    {item.description && <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-ink-mute">{item.description}</p>}
                    {(item.tags?.length || item.allergens?.length) ? (
                      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Características">
                        {item.tags?.map((t) => (
                          <li key={t} className="rounded-full border border-olive/30 px-2.5 py-0.5 text-xs text-olive">
                            {TAG_LABELS[t]}
                          </li>
                        ))}
                        {item.allergens?.map((a) => (
                          <li key={a} className="rounded-full border border-ink/20 px-2.5 py-0.5 text-xs text-ink-mute">
                            {ALLERGEN_LABELS[a]}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-ink-mute">
                ¿Alergias o intolerancias? Indícalo en los comentarios de tu reserva o pregunta a nuestro equipo.
              </p>
            </div>

            <div className="hidden md:col-span-5 md:block lg:col-span-4 lg:col-start-9">
              <div className="sticky top-28">
                <div className="arch relative aspect-[3/4]" key={category.id} style={{ animation: "fade .8s ease both" }}>
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 30vw, 40vw" placeholder="blur" className="object-cover" />
                </div>
                <ProvisionalTag show={!siteConfig.contentStatus.photos} className="mt-4 text-ink-mute">
                  Imagen ilustrativa
                </ProvisionalTag>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-ink/10 pt-10 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <p className="font-script text-5xl md:text-6xl">La mesa te espera.</p>
          <Link href="#reservas" className="btn btn-primary">
            Reservar mesa
          </Link>
        </div>
      </div>
    </section>
  );
}
