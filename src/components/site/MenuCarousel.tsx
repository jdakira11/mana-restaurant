"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";

export interface MenuCarouselItem {
  id: string;
  name: string;
  description?: string;
  priceLabel: React.ReactNode;
  tags: string[];
  photo: { src: StaticImageData; alt: string } | null;
}

/**
 * Platos de una categoría en fila horizontal con desplazamiento táctil, arrastre con ratón y
 * ajuste al centro. El plato central se destaca; los laterales se atenúan. Degradados en los
 * bordes, flechas y puntos indican que hay más platos a los lados.
 */
export function MenuCarousel({ items, label }: { items: MenuCarouselItem[]; label: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ left: false, right: items.length > 1 });
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const frame = useRef(0);

  const cards = () => Array.from(scrollerRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []);

  // Plato más cercano al centro y estado de los bordes.
  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards().forEach((card, i) => {
      const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
    setEdges({ left: el.scrollLeft > 8, right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8 });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [update]);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(update);
  };

  const goTo = (index: number) => {
    const el = scrollerRef.current;
    const card = cards()[Math.max(0, Math.min(items.length - 1, index))];
    if (!el || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
    setTouched(true);
  };

  // Arrastre con ratón (en táctil se usa el desplazamiento nativo).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !scrollerRef.current) return;
    drag.current = { x: e.clientX, left: scrollerRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!drag.current || !el) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 5 && !drag.current.moved) {
      drag.current.moved = true;
      el.style.scrollSnapType = "none";
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    const el = scrollerRef.current;
    if (!drag.current || !el) return;
    const moved = drag.current.moved;
    drag.current = null;
    if (moved) {
      el.style.scrollSnapType = "";
      goTo(active);
    }
  };

  return (
    <div className="relative -mx-5 md:mx-0" role="group" aria-roledescription="carrusel" aria-label={label}>
      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label={`${label}: desliza para ver todos los platos`}
        onScroll={onScroll}
        onTouchStart={() => setTouched(true)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain py-6 outline-none [--card:min(72vw,21rem)] [padding-inline:calc((100%-var(--card))/2)] active:cursor-grabbing md:gap-8"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <article
              key={item.id}
              data-card
              aria-current={isActive ? "true" : undefined}
              className={`flex w-[var(--card)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-ink/10 bg-linen transition-[transform,opacity,filter,box-shadow] duration-500 ease-[var(--ease-out-soft)] ${
                isActive
                  ? "scale-100 opacity-100 shadow-[0_30px_60px_-35px_rgb(31_26_22/0.6)]"
                  : "scale-[0.9] opacity-50 shadow-none saturate-[0.25]"
              }`}
              onClick={(e) => {
                if (!isActive) {
                  e.preventDefault();
                  goTo(i);
                }
              }}
            >
              {item.photo && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={item.photo.src} alt={item.photo.alt} fill sizes="(min-width: 768px) 336px, 72vw" placeholder="blur" draggable={false} className="object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 text-center">
                <h4 className="font-script text-[2.2rem] leading-tight">{item.name}</h4>
                {item.description && <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-mute">{item.description}</p>}
                {item.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Características">
                    {item.tags.map((t) => (
                      <li key={t} className="rounded-full border border-olive/30 px-2.5 py-0.5 text-xs text-olive">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 border-t border-ink/10 pt-4 text-lg font-semibold tabular-nums text-terracotta">{item.priceLabel}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Degradados laterales: indican que hay más platos hacia ese lado */}
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-sand to-transparent transition-opacity duration-300 md:w-24 ${edges.left ? "opacity-100" : "opacity-0"}`} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sand to-transparent transition-opacity duration-300 md:w-24 ${edges.right ? "opacity-100" : "opacity-0"}`} />

      {/* Flechas */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        aria-label="Plato anterior"
        className="absolute left-1 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-linen/90 text-ink shadow-sm backdrop-blur transition-opacity hover:bg-linen disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        disabled={active === items.length - 1}
        aria-label="Plato siguiente"
        className="absolute right-1 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-linen/90 text-ink shadow-sm backdrop-blur transition-opacity hover:bg-linen disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronRight />
      </button>

      {/* Puntos de posición + aviso para deslizar */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver ${item.name}`}
              aria-current={i === active ? "true" : undefined}
              className="flex h-6 items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-terracotta" : "w-1.5 bg-ink/25"}`} />
            </button>
          ))}
        </div>
        <p
          aria-hidden
          className={`flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-mute transition-opacity duration-500 md:hidden ${touched || items.length < 2 ? "opacity-0" : "opacity-100"}`}
        >
          <ChevronLeft width={14} height={14} /> Desliza para ver más <ChevronRight width={14} height={14} />
        </p>
      </div>
    </div>
  );
}
