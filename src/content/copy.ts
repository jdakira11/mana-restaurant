import type { ImageKey } from "./images";

/**
 * Textos de la web. Son PROPUESTAS CREATIVAS PROVISIONALES: transmiten el concepto de marca
 * («sabores que reúnen») sin afirmar hechos sobre Maná (fundadores, trayectoria, recetas…).
 * Sustitúyelos por la historia y la propuesta reales del restaurante.
 */
export const copy = {
  hero: {
    eyebrow: "Cocina árabe",
    title: ["Sabores", "que reúnen"],
    subtitle: "Una mesa pensada para compartir, descubrir y quedarse un poco más.",
    primaryCta: "Reservar mesa",
    secondaryCta: "Ver la carta",
  },

  story: {
    eyebrow: "Nuestra historia",
    statement: {
      before: "En Maná, la mesa es un lugar de",
      accent: "encuentro",
      after: ": platos que llegan al centro, manos que se cruzan y conversaciones sin prisa.",
    },
    paragraphs: [
      "Creemos que la cocina árabe se entiende mejor compartida. Por eso cada visita está pensada como una sucesión de pequeños descubrimientos que se reparten entre todos.",
      "Este espacio contará la historia real de Maná: quién está detrás, de dónde viene su cocina y qué hace especial su manera de recibir.",
    ],
    space: { eyebrow: "Nuestro espacio", title: "Un lugar para quedarse" },
    pillars: [
      { title: "Compartir", text: "Platos al centro, para probar un poco de todo." },
      { title: "Hospitalidad", text: "Recibir a cada mesa como a un invitado." },
      { title: "Origen", text: "Sabores con raíz, servidos con mirada actual." },
    ],
  },

  experience: {
    eyebrow: "La experiencia",
    title: "Una comida en cuatro tiempos",
    intro: "Así imaginamos una visita a Maná: un recorrido que empieza con el pan y termina con una sobremesa larga.",
    moments: [
      { key: "01", title: "El pan abre la mesa", text: "Lo primero que llega, lo que invita a empezar a compartir.", image: "doughHands" },
      { key: "02", title: "Pequeños platos", text: "Cremas, texturas y colores que se reparten de mano en mano.", image: "mezzePlates" },
      { key: "03", title: "El fuego", text: "El momento central de la comida, pensado para el centro de la mesa.", image: "grill" },
      { key: "04", title: "La sobremesa", text: "Algo dulce, algo caliente y tiempo para la conversación.", image: "teaSilver" },
    ] satisfies { key: string; title: string; text: string; image: ImageKey }[],
  },

  menu: {
    eyebrow: "La carta",
    title: "Para el centro de la mesa",
    intro: "Una carta organizada para compartir. Elige varios platos y deja que la mesa se llene.",
  },

  reservations: {
    eyebrow: "Reservas",
    title: "Reserva tu mesa",
    intro: "Elige el día, la hora y el número de personas. Al enviar la solicitud verás al momento el estado de tu reserva.",
  },

  testimonials: {
    eyebrow: "Opiniones",
    title: "Lo que se dice en la mesa",
    intro: "Experiencias de quienes ya compartieron mesa con nosotros.",
  },

  contact: {
    eyebrow: "Visítanos",
    title: "Ubicación y contacto",
  },
} as const;
