import Image from "next/image";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ArchOrnament } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/Notice";

export function Story() {
  const { story } = copy;
  return (
    <section id="historia" aria-labelledby="historia-title" className="relative overflow-hidden py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-4" data-reveal>
          <p className="eyebrow">{story.eyebrow}</p>
          <ProvisionalTag show={!siteConfig.contentStatus.story} className="text-ink-mute">
            Texto conceptual provisional
          </ProvisionalTag>
        </div>

        <h2 id="historia-title" className="mt-8 max-w-5xl text-[clamp(1.85rem,4.4vw,3.6rem)] leading-[1.12]" data-reveal>
          {story.statement.before}{" "}
          <em className="text-terracotta" style={{ fontVariationSettings: '"SOFT" 100' }}>
            {story.statement.accent}
          </em>
          {story.statement.after}
        </h2>

        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-12 md:gap-8">
          <div className="relative md:col-span-6 lg:col-span-5">
            <div className="arch relative aspect-[4/5] w-full" data-reveal="image">
              <Image src={images.sharedTable.src} alt={images.sharedTable.alt} fill sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw" placeholder="blur" className="object-cover" />
            </div>
            <div
              className="absolute -bottom-10 right-0 w-[42%] border-[6px] border-ivory shadow-[0_30px_60px_-30px_rgb(31_26_22/0.5)] md:-right-10"
              data-reveal="image"
              style={{ ["--reveal-delay" as string]: "200ms" }}
            >
              <div className="relative aspect-[3/4]">
                <Image src={images.doughHands.src} alt={images.doughHands.alt} fill sizes="(min-width: 768px) 20vw, 40vw" placeholder="blur" className="object-cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
            <ArchOrnament className="mb-8 text-brass" data-reveal />
            <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
              {story.paragraphs.map((p, i) => (
                <p key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
                  {p}
                </p>
              ))}
            </div>
            <dl className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
              {story.pillars.map((pillar, i) => (
                <div key={pillar.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
                  <dt className="font-display text-2xl">{pillar.title}</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-mute">{pillar.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
