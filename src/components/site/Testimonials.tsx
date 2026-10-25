import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { testimonials, testimonialsAreIllustrative } from "@/content/testimonials";
import { ProvisionalTag } from "@/components/ui/Notice";
import { SectionHeader } from "./SectionHeader";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

export function Testimonials() {
  const items = testimonials.map((t) => ({ ...t, image: images[t.image] }));

  return (
    <section aria-labelledby="opiniones-title" className="on-dark overflow-hidden bg-ink py-24 text-linen md:py-32">
      <div className="container-x">
        <SectionHeader
          id="opiniones-title"
          eyebrow={copy.testimonials.eyebrow}
          title={copy.testimonials.title}
          intro={copy.testimonials.intro}
          tag={
            testimonialsAreIllustrative ? (
              <ProvisionalTag className="text-linen/60">Opiniones ilustrativas · proyecto de portafolio</ProvisionalTag>
            ) : undefined
          }
        />
      </div>

      {items.length > 0 && (
        <div className="mt-14 md:mt-16" data-reveal>
          <TestimonialsCarousel items={items} />
        </div>
      )}

      {siteConfig.reviewUrl && (
        <div className="mt-10 flex justify-center">
          <a href={siteConfig.reviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Comparte tu experiencia
          </a>
        </div>
      )}
    </section>
  );
}
