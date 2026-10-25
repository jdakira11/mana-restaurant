import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ArrowRight } from "@/components/ui/icons";
import { ProvisionalTag } from "@/components/ui/Notice";
import { SectionHeader } from "./SectionHeader";

export function Experience() {
  const { experience } = copy;
  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="on-dark relative overflow-hidden bg-olive-deep py-24 text-linen md:py-36">
      <div className="container-x">
        <SectionHeader
          id="experiencia-title"
          eyebrow={experience.eyebrow}
          title={experience.title}
          intro={experience.intro}
          tag={
            <ProvisionalTag show={!siteConfig.contentStatus.experience} className="text-linen/70">
              Propuesta provisional
            </ProvisionalTag>
          }
        />
      </div>

      {/* Móvil: carrusel con desplazamiento táctil · Escritorio: composición escalonada */}
      <ol
        className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-auto md:mt-24 md:max-w-[88rem] md:grid md:snap-none md:grid-cols-4 md:gap-6 md:overflow-visible md:px-10"
        aria-label="Los cuatro tiempos de la experiencia"
      >
        {experience.moments.map((m, i) => {
          const img = images[m.image];
          return (
            <li
              key={m.key}
              className={`w-[78vw] max-w-sm shrink-0 snap-center md:w-auto md:max-w-none ${i % 2 === 1 ? "md:mt-24" : ""}`}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
            >
              <article className="group text-center">
                <div className={`relative aspect-[3/4] overflow-hidden ${i % 2 === 0 ? "arch" : "rounded-sm"}`}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 24vw, 78vw"
                    placeholder="blur"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/60 via-transparent to-transparent" />
                  <span className="font-display absolute bottom-4 left-5 text-5xl text-linen/90">{m.key}</span>
                </div>
                <h3 className="font-script mt-6 text-[2.3rem] leading-tight md:text-[2.5rem]">{m.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-linen/70">{m.text}</p>
              </article>
            </li>
          );
        })}
      </ol>

      <div className="container-x mt-16 flex justify-center md:mt-24" data-reveal>
        <Link href="#reservas" className="btn btn-ghost">
          Vivir la experiencia
          <ArrowRight className="btn-arrow" width={18} height={18} />
        </Link>
      </div>
    </section>
  );
}
