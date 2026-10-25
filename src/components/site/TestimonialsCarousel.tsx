"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { MandalaFrame } from "./MandalaFrame";

export interface CarouselItem {
  quote: string;
  author: string;
  place?: string;
  image: { src: StaticImageData; alt: string };
}

const INTERVAL_MS = 4500;
const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Galería de opiniones en bucle. Avanza sola de izquierda a derecha y destaca la tarjeta
 * central. Se pausa al pasar el ratón o al enfocar con teclado, tiene botón de pausa
 * (WCAG 2.2.2) y no se mueve sola si el usuario pidió reducir el movimiento.
 */
export function TestimonialsCarousel({ items }: { items: CarouselItem[] }) {
  const n = items.length;
  // Tres copias para un bucle sin saltos visibles; se trabaja siempre sobre la copia central.
  const loop = [...items, ...items, ...items];
  const [index, setIndex] = useState(n);
  const [animate, setAnimate] = useState(true);
  // Sin preferencia del usuario, reproduce salvo que el sistema pida reducir el movimiento.
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED).matches, () => false);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const playing = userChoice ?? !reducedMotion;
  const [hovered, setHovered] = useState(false);
  const [metrics, setMetrics] = useState({ viewport: 0, step: 0, card: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLLIElement>(null);

  // Medidas para centrar la tarjeta activa.
  useLayoutEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const card = firstCardRef.current;
      if (!vp || !card) return;
      const gap = parseFloat(getComputedStyle(card.parentElement!).columnGap || "0");
      setMetrics({ viewport: vp.clientWidth, step: card.offsetWidth + gap, card: card.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const go = useCallback((delta: number) => {
    setAnimate(true);
    setIndex((i) => i + delta);
  }, []);

  // Avance automático: las tarjetas se desplazan de izquierda a derecha.
  useEffect(() => {
    if (!playing || hovered) return;
    const id = window.setInterval(() => go(-1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [playing, hovered, go]);

  // Al salir de la copia central, se recoloca sin animación en la equivalente.
  const onTransitionEnd = () => {
    if (index < n || index >= 2 * n) {
      setAnimate(false);
      setIndex((i) => ((i % n) + n) % n + n);
    }
  };
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const offset = metrics.viewport / 2 - (index * metrics.step + metrics.card / 2);
  const active = ((index % n) + n) % n;

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Opiniones de comensales"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div ref={viewportRef} className="relative overflow-hidden py-4">
        <ul
          className="flex gap-4 md:gap-8"
          style={{
            transform: `translate3d(${offset}px,0,0)`,
            transition: animate ? "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
            visibility: metrics.step ? "visible" : "hidden",
          }}
          onTransitionEnd={(e) => e.target === e.currentTarget && onTransitionEnd()}
        >
          {loop.map((item, i) => {
            const isActive = i === index;
            return (
              <li
                key={i}
                ref={i === 0 ? firstCardRef : undefined}
                aria-hidden={!isActive}
                className="w-[16rem] shrink-0 md:w-[19rem]"
              >
                <figure
                  className={`flex flex-col items-center text-center transition-[transform,opacity] duration-700 ease-[var(--ease-out-soft)] ${
                    isActive ? "scale-100 opacity-100" : "scale-[0.78] opacity-40"
                  }`}
                >
                  <div className="relative aspect-square w-full">
                    <MandalaFrame className={`absolute inset-0 h-full w-full transition-colors duration-700 ${isActive ? "text-brass" : "text-linen/40"}`} />
                    <div className="absolute inset-[11%] overflow-hidden rounded-full">
                      <Image src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 768px) 240px, 200px" className="object-cover" placeholder="blur" />
                    </div>
                  </div>
                  <figcaption className={`mt-6 min-h-[9.5rem] transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <blockquote className="font-display text-lg leading-snug text-linen/90 md:text-xl">“{item.quote}”</blockquote>
                    <p className="mt-4 text-sm text-linen/60">
                      <span className="font-script text-3xl text-[#e9d8b8]">{item.author}</span>
                      {item.place && <span className="block text-xs uppercase tracking-[0.18em]">{item.place}</span>}
                    </p>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-linen/25 hover:bg-linen/10" aria-label="Opinión anterior">
          <ChevronLeft />
        </button>
        <div className="flex gap-2" aria-hidden>
          {items.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-brass" : "w-1.5 bg-linen/30"}`} />
          ))}
        </div>
        <button type="button" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-linen/25 hover:bg-linen/10" aria-label="Opinión siguiente">
          <ChevronRight />
        </button>
        <button
          type="button"
          onClick={() => setUserChoice(!playing)}
          className="ml-2 rounded-full border border-linen/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-linen/10"
          aria-pressed={!playing}
        >
          {playing ? "Pausar" : "Reproducir"}
        </button>
      </div>
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        Opinión {active + 1} de {n}: {items[active].quote} — {items[active].author}
      </p>
    </div>
  );
}
