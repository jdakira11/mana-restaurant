import Image from "next/image";
import Link from "next/link";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ArrowRight } from "@/components/ui/icons";

export function Hero() {
  const { hero } = copy;
  return (
    <section id="inicio" aria-labelledby="hero-title" className="on-dark relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-linen">
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
          className="hero-image object-cover object-[60%_50%] md:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(31_26_22/0.55)_0%,rgb(31_26_22/0.1)_35%,rgb(31_26_22/0.35)_60%,rgb(31_26_22/0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(31_26_22/0.78)_0%,rgb(31_26_22/0.45)_38%,transparent_68%)]" />
      </div>

      <div className="container-x grid w-full gap-10 pb-14 pt-32 md:pb-20 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <p className="eyebrow hero-fade" style={{ ["--d" as string]: "150ms" }}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="display-xl mt-6">
            <span className="hero-line" style={{ ["--i" as string]: 0 }}>
              {hero.title[0]}
            </span>
            <span
              className="hero-line text-[#e9d8b8]"
              style={{ ["--i" as string]: 1 }}
            >
              {hero.title[1]}
            </span>
          </h1>
          <p className="hero-fade mt-7 max-w-md text-lg leading-relaxed text-linen/85 md:text-xl" style={{ ["--d" as string]: "750ms" }}>
            {hero.subtitle}
          </p>
          <div className="hero-fade mt-9 flex flex-wrap gap-3" style={{ ["--d" as string]: "950ms" }}>
            <Link href="#reservas" className="btn btn-primary">
              {hero.primaryCta}
              <ArrowRight className="btn-arrow" width={18} height={18} />
            </Link>
            <Link href="#menu" className="btn btn-ghost">
              {hero.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="hero-fade hidden items-end gap-6 lg:flex" style={{ ["--d" as string]: "1200ms" }}>
          <figure className="w-40">
            <div className="arch relative aspect-[3/4] border border-linen/25">
              <Image src={images.teaSilver.src} alt={images.teaSilver.alt} fill sizes="160px" className="object-cover" placeholder="blur" />
            </div>
          </figure>
          <a href="#historia" className="group flex flex-col items-center gap-3 pb-1 text-[0.6875rem] uppercase tracking-[0.28em] text-linen/70 hover:text-linen">
            <span className="[writing-mode:vertical-rl]">Descubrir</span>
            <span className="scroll-cue relative block h-14 w-px overflow-hidden bg-linen/25" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
