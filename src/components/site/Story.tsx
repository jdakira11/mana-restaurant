import Image from "next/image";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { LogoMark } from "@/components/ui/Logo";
import { ProvisionalTag } from "@/components/ui/Notice";

export function Story() {
  const { story } = copy;
  return (
    <section id="historia" aria-labelledby="historia-title" className="relative overflow-hidden pt-24 md:pt-36">
      <div className="container-x">
        <div className="flex flex-col items-center gap-4 text-center" data-reveal>
          <LogoMark className="h-9 w-auto text-brass" />
          <p className="eyebrow eyebrow-center mt-1">{story.eyebrow}</p>
          <ProvisionalTag show={!siteConfig.contentStatus.story} className="text-ink-mute">
            Texto conceptual provisional
          </ProvisionalTag>
        </div>

        <h2 id="historia-title" className="mx-auto mt-8 max-w-5xl text-center text-[clamp(1.85rem,4.4vw,3.6rem)] leading-[1.12]" data-reveal>
          {story.statement.before}{" "}
          <em className="font-script text-[1.4em] leading-[0.7] text-terracotta not-italic">
            {story.statement.accent}
          </em>
          {story.statement.after}
        </h2>

        <div className="mx-auto mt-12 max-w-2xl space-y-5 text-center text-lg leading-relaxed text-ink-soft md:mt-16">
          {story.paragraphs.map((p, i) => (
            <p key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
              {p}
            </p>
          ))}
        </div>
        <dl className="mx-auto mt-14 grid max-w-4xl gap-8 border-t border-line pt-10 text-center sm:grid-cols-3">
          {story.pillars.map((pillar, i) => (
            <div key={pillar.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
              <dt className="font-script text-4xl">{pillar.title}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-mute">{pillar.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Imagen fija del local: la página se desliza por encima (fondo fijo recortado con clip-path,
          compatible también con móviles, donde background-attachment: fixed no funciona). */}
      <div className="relative mt-20 h-[75svh] min-h-[26rem] [clip-path:inset(0)] md:mt-28" role="img" aria-label={images.archedEntry.alt}>
        <div className="fixed inset-0">
          <Image src={images.archedEntry.src} alt="" fill sizes="100vw" placeholder="blur" className="object-cover object-[50%_40%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(31_26_22/0.35)_0%,rgb(31_26_22/0.1)_40%,rgb(31_26_22/0.8)_100%)]" />
        </div>
        <div className="on-dark relative flex h-full flex-col items-center justify-end pb-12 text-center text-linen">
          <p className="eyebrow eyebrow-center">{story.space.eyebrow}</p>
          <p className="font-script mt-3 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">{story.space.title}</p>
          <ProvisionalTag show={!siteConfig.contentStatus.photos} className="mt-5 text-linen/70">
            Imagen ilustrativa
          </ProvisionalTag>
        </div>
      </div>
    </section>
  );
}
