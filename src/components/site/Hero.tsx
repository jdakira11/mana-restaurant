import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ArrowRight } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/Logo";

export function Hero() {
  const { hero } = copy;
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink text-center text-linen"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={images.hero.src}
          alt={images.hero.alt}
          fill
          loading="eager"
          fetchPriority="high"
          quality={82}
          sizes="100vw"
          placeholder="blur"
          className="hero-image object-cover object-center"
        />
        {/* Oscurece el centro para que el texto centrado se lea sobre la fotografía */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(31_26_22/0.78)_0%,rgb(31_26_22/0.55)_45%,rgb(31_26_22/0.35)_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(31_26_22/0.55)_0%,transparent_25%,transparent_70%,rgb(31_26_22/0.85)_100%)]" />
      </div>

      <div className="container-x flex flex-col items-center pb-24 pt-32 md:pb-28">
        <LogoMark className="hero-fade h-20 w-auto text-brass md:h-24" />
        <h1 id="hero-title" className="display-xl mt-3">
          <span className="hero-line" style={{ ["--i" as string]: 0 }}>
            {siteConfig.name}
          </span>
          <span className="sr-only"> · {hero.title.join(" ")}</span>
        </h1>
        <p className="eyebrow eyebrow-center hero-fade mt-4" style={{ ["--d" as string]: "350ms" }}>
          {hero.eyebrow}
        </p>
        <p aria-hidden className="font-script hero-fade mt-6 text-[clamp(2.6rem,6vw,4.5rem)] leading-none text-[#e9d8b8]" style={{ ["--d" as string]: "550ms" }}>
          {hero.title.join(" ")}
        </p>
        <p className="hero-fade mx-auto mt-6 max-w-md text-lg leading-relaxed text-linen/85 md:text-xl" style={{ ["--d" as string]: "750ms" }}>
          {hero.subtitle}
        </p>
        <div className="hero-fade mt-9 flex flex-wrap justify-center gap-3" style={{ ["--d" as string]: "950ms" }}>
          <Link href="#reservas" className="btn btn-primary">
            {hero.primaryCta}
            <ArrowRight className="btn-arrow" width={18} height={18} />
          </Link>
          <Link href="#menu" className="btn btn-ghost">
            {hero.secondaryCta}
          </Link>
        </div>
      </div>

      <a
        href="#historia"
        className="hero-fade absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.6875rem] uppercase tracking-[0.28em] text-linen/70 hover:text-linen"
        style={{ ["--d" as string]: "1200ms" }}
      >
        Descubrir
        <span className="scroll-cue relative block h-10 w-px overflow-hidden bg-linen/25" aria-hidden />
      </a>
    </section>
  );
}
