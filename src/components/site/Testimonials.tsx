import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { demoTestimonials, verifiedTestimonials, type Testimonial } from "@/content/testimonials";
import { ArchOrnament } from "@/components/ui/icons";

export function Testimonials() {
  const isDev = process.env.NODE_ENV !== "production";
  const items: (Testimonial & { demo?: boolean })[] =
    verifiedTestimonials.length > 0 ? verifiedTestimonials : isDev ? demoTestimonials.map((t) => ({ ...t, demo: true })) : [];

  return (
    <section aria-labelledby="opiniones-title" className="on-dark bg-ink py-24 text-linen md:py-32">
      <div className="container-x">
        <div className="flex flex-col items-center text-center">
          <ArchOrnament className="text-brass" data-reveal />
          <p className="eyebrow mt-8" data-reveal>
            {copy.testimonials.eyebrow}
          </p>
          <h2 id="opiniones-title" className="display-md mt-5 max-w-2xl" data-reveal>
            {copy.testimonials.title}
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl text-center" data-reveal>
            <p className="text-lg leading-relaxed text-linen/70">{copy.testimonials.empty}</p>
            {siteConfig.reviewUrl && (
              <a href={siteConfig.reviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-8">
                Comparte tu experiencia
              </a>
            )}
          </div>
        ) : (
          <ul className="mt-16 grid gap-6 md:grid-cols-3">
            {items.map((t, i) => (
              <li key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
                <figure className="flex h-full flex-col justify-between rounded-sm border border-linen/15 p-8">
                  {t.demo && (
                    <span className="mb-5 self-start rounded-full bg-terracotta-bright/20 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#f0c3a8]">
                      Ficticio · solo en desarrollo
                    </span>
                  )}
                  <blockquote className="font-display text-xl leading-snug text-linen/90 md:text-2xl">“{t.quote}”</blockquote>
                  <figcaption className="mt-8 text-sm text-linen/60">
                    {t.author}
                    {t.source && (
                      <>
                        {" · "}
                        {t.sourceUrl ? (
                          <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                            {t.source}
                          </a>
                        ) : (
                          t.source
                        )}
                      </>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
