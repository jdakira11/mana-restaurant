import { Experience } from "@/components/site/Experience";
import { Hero } from "@/components/site/Hero";
import { Location } from "@/components/site/Location";
import { MenuSection } from "@/components/site/MenuSection";
import { ReservationsSection } from "@/components/site/ReservationsSection";
import { Story } from "@/components/site/Story";
import { Testimonials } from "@/components/site/Testimonials";
import { restaurantJsonLd } from "@/lib/seo/structured-data";

export default function HomePage() {
  const jsonLd = restaurantJsonLd();
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <Hero />
      <Story />
      <Experience />
      <MenuSection />
      <ReservationsSection />
      <Testimonials />
      <Location />
    </>
  );
}
