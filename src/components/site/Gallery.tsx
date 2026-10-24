"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ChevronLeft, ChevronRight, Close, Expand } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/Notice";

const items = copy.gallery.items.map((item) => ({ ...item, ...images[item.image] }));

// Composición editorial en 12 columnas: piezas anchas y altas alternadas.
const desktopSpans = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5 md:row-span-3",
  "md:col-span-4 md:row-span-3",
  "md:col-span-3 md:row-span-3",
  "md:col-span-5 md:row-span-2",
  "md:col-span-4 md:row-span-3",
  "md:col-span-4 md:row-span-3",
  "md:col-span-4 md:row-span-3",
];

export function Gallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index !== null ? items[index] : null;

  return (
    <section id="galeria" aria-labelledby="galeria-title" className="py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow" data-reveal>
              {copy.gallery.eyebrow}
            </p>
            <h2 id="galeria-title" className="display-lg mt-6 max-w-2xl" data-reveal>
              {copy.gallery.title}
            </h2>
          </div>
          <ProvisionalTag show={!siteConfig.contentStatus.photos} className="self-start text-ink-mute md:self-auto">
            Fotografías ilustrativas de banco de imágenes
          </ProvisionalTag>
        </div>

        <ul className="mt-14 grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] md:mt-20 md:auto-rows-[7.5rem] md:grid-cols-12 md:gap-5 lg:auto-rows-[8.5rem]">
          {items.map((item, i) => (
            <li
              key={item.image}
              className={`${item.layout === "wide" ? "col-span-2 row-span-2" : "col-span-1 row-span-2"} ${desktopSpans[i] ?? "md:col-span-4 md:row-span-3"}`}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 3) * 90}ms` }}
            >
              <button
                type="button"
                onClick={() => open(i)}
                className={`group relative block h-full w-full overflow-hidden bg-sand ${i === 1 || i === 5 ? "arch" : "rounded-sm"}`}
                aria-label={`Ampliar imagen: ${item.alt}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 50vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-linen/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand width={16} height={16} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Galería ampliada"
        className="on-dark m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-linen backdrop:bg-ink/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm tabular-nums text-linen/70">
                {index! + 1} / {items.length}
              </span>
              <button type="button" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-linen/10" aria-label="Cerrar galería">
                <Close width={24} height={24} />
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image key={current.image} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain px-4 md:px-20" style={{ animation: "fade .5s ease both" }} />
              <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-linen/15 md:left-6" aria-label="Imagen anterior">
                <ChevronLeft width={26} height={26} />
              </button>
              <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-linen/15 md:right-6" aria-label="Imagen siguiente">
                <ChevronRight width={26} height={26} />
              </button>
            </div>
            <p className="px-5 py-5 text-center text-sm text-linen/75">
              {current.alt}
              <span className="mx-2 opacity-50">·</span>
              <a href={current.credit.source} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                Foto: {current.credit.author} / Unsplash
              </a>
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}
