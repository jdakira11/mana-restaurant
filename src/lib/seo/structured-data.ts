import { defaultReservationSettings } from "@/config/reservations";
import { getSiteUrl, siteConfig } from "@/config/site";

const DAY_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Datos estructurados schema.org/Restaurant.
 * Solo se generan cuando existen los datos reales mínimos (dirección, ciudad, país y teléfono).
 * Así nunca se publican en buscadores direcciones, teléfonos u horarios inventados.
 */
export function restaurantJsonLd(): Record<string, unknown> | null {
  const c = siteConfig.contact;
  if (!c.address || !c.city || !c.country || !c.phone) return null;
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: siteConfig.name,
    description: siteConfig.description,
    url,
    image: `${url}/opengraph-image.jpg`,
    servesCuisine: ["Árabe", "Oriente Medio"],
    telephone: c.phone,
    ...(c.email ? { email: c.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: c.city,
      ...(c.postalCode ? { postalCode: c.postalCode } : {}),
      addressCountry: c.country,
    },
    acceptsReservations: `${url}/#reservas`,
    ...(siteConfig.menuPdfUrl ? { hasMenu: new URL(siteConfig.menuPdfUrl, url).toString() } : {}),
    ...(siteConfig.contentStatus.hours
      ? {
          openingHoursSpecification: defaultReservationSettings.weeklySchedule.flatMap((windows, day) =>
            windows.map((w) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_SCHEMA[day], opens: w.start, closes: w.end === "24:00" ? "23:59" : w.end })),
          ),
        }
      : {}),
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}
