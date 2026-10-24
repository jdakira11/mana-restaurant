/**
 * Datos comerciales de Maná — FUENTE ÚNICA DE VERDAD.
 *
 * Cualquier valor `null` se muestra en la web como «Pendiente de confirmar» y NO se
 * publica en los datos estructurados (SEO). Sustituye cada `null` por el dato real
 * cuando el propietario lo facilite. No rellenes estos campos con datos inventados.
 */

export type SocialNetwork = "instagram" | "facebook" | "tiktok" | "tripadvisor" | "google";

export interface SiteConfig {
  name: string;
  /** Línea de marca. Propuesta creativa provisional, editable. */
  tagline: string;
  description: string;
  /** Locale BCP 47 para textos y formatos (fechas, precios). */
  locale: string;
  /** Moneda de la carta (código ISO 4217). */
  currency: string;
  /** URL pública definitiva. Se sobreescribe con NEXT_PUBLIC_SITE_URL. */
  url: string;
  contact: {
    /** Calle y número. `null` = no se publica una dirección exacta (solo comuna/región). */
    address: string | null;
    /** Comuna o ciudad. */
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    /** Teléfono en formato internacional, p. ej. "+56 9 1234 5678". */
    phone: string | null;
    /** Número de WhatsApp solo con dígitos y prefijo de país, p. ej. "56912345678". */
    whatsapp: string | null;
    email: string | null;
    /** URL de inserción de Google Maps (Compartir → Insertar un mapa → src del iframe). */
    mapEmbedUrl: string | null;
    /** Enlace para abrir la ubicación en Maps. */
    mapLink: string | null;
  };
  social: Partial<Record<SocialNetwork, string>>;
  /** URL donde los clientes pueden dejar una reseña (Google, TripAdvisor…). */
  reviewUrl: string | null;
  /** PDF de la carta oficial, si existe (p. ej. "/carta-mana.pdf" dentro de /public). */
  menuPdfUrl: string | null;
  legal: {
    /** Razón social y RUT del titular. Necesarios para el aviso legal. */
    companyName: string | null;
    taxId: string | null;
    registeredAddress: string | null;
  };
  /**
   * Indica qué bloques ya contienen información real verificada.
   * Mientras sea `false`, la web muestra un aviso discreto de «contenido provisional».
   */
  contentStatus: {
    story: boolean;
    experience: boolean;
    menu: boolean;
    photos: boolean;
    hours: boolean;
  };
  /**
   * Muestra etiquetas de «Contenido provisional» en la web pública.
   * Desactívalo solo cuando todo el contenido provisional haya sido sustituido.
   */
  showContentNotices: boolean;
}

export const siteConfig: SiteConfig = {
  name: "Maná",
  tagline: "Sabores que reúnen",
  description:
    "Maná, restaurante de cocina árabe. Una mesa pensada para compartir, descubrir sabores y disfrutar de la hospitalidad. Reserva tu mesa online.",
  locale: "es-CL",
  currency: "USD", // Precios de la carta en dólares estadounidenses.
  url: "http://localhost:3000",
  contact: {
    address: null, // Restaurante ficticio (proyecto de portafolio): sin dirección exacta.
    city: "Las Condes",
    region: "Región Metropolitana",
    postalCode: null,
    country: "Chile",
    phone: null,
    whatsapp: null,
    email: null,
    // Mapa de la comuna (no de una dirección concreta).
    mapEmbedUrl: "https://www.google.com/maps?q=Las+Condes,+Regi%C3%B3n+Metropolitana,+Chile&z=13&output=embed",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Las+Condes%2C+Regi%C3%B3n+Metropolitana%2C+Chile",
  },
  social: {
    // instagram: "https://www.instagram.com/…",
  },
  reviewUrl: null,
  menuPdfUrl: null,
  legal: {
    companyName: null,
    taxId: null,
    registeredAddress: null,
  },
  contentStatus: {
    story: false,
    experience: false,
    menu: false,
    photos: false,
    hours: false,
  },
  showContentNotices: true,
};

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (fromEnv && fromEnv.length > 0 ? fromEnv : siteConfig.url).replace(/\/$/, "");
}

export const navigation = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#historia", label: "Nuestra historia" },
  { href: "/#experiencia", label: "Experiencia" },
  { href: "/#menu", label: "Menú" },
  { href: "/#reservas", label: "Reservas" },
  { href: "/#contacto", label: "Contacto" },
] as const;
