import type { ImageKey } from "./images";

/**
 * Opiniones de comensales.
 *
 * Maná es un restaurante ficticio (proyecto de portafolio): estas opiniones son ILUSTRATIVAS
 * y la web lo indica. Si el restaurante pasa a ser real, sustitúyelas por reseñas reales
 * (con permiso del autor o citando la fuente pública) y pon `illustrative: false`.
 */
export interface Testimonial {
  quote: string;
  author: string;
  /** Comuna o ciudad del comensal. */
  place?: string;
  image: ImageKey;
  /** Fuente verificable, p. ej. "Google", "TripAdvisor". */
  source?: string;
  sourceUrl?: string;
}

export const testimonialsAreIllustrative = true;

export const testimonials: Testimonial[] = [
  {
    quote: "Pedimos varios mezze para compartir y terminamos pidiendo más pan. Una mesa generosa y un servicio muy cálido.",
    author: "Camila R.",
    place: "Las Condes",
    image: "guestMezzeTable",
  },
  {
    quote: "La cazuela llegó al centro de la mesa y en minutos no quedaba nada. Sabores intensos y muy bien equilibrados.",
    author: "Tomás A.",
    place: "Providencia",
    image: "guestTagineShare",
  },
  {
    quote: "La sobremesa con té y dátiles fue lo mejor de la noche. Se nota el cariño en cada detalle.",
    author: "Fernanda M.",
    place: "Vitacura",
    image: "guestTeaDates",
  },
  {
    quote: "Fuimos a celebrar un cumpleaños y nos recibieron como en casa. Volveremos con más amigos.",
    author: "Ignacio P.",
    place: "Ñuñoa",
    image: "guestPlatterRice",
  },
  {
    quote: "Probamos un poco de todo: cremas, sopa y pequeños platos. Ideal para ir en grupo y compartir.",
    author: "Valentina S.",
    place: "Lo Barnechea",
    image: "guestSoupMezze",
  },
  {
    quote: "Ambiente acogedor, buena música y una carta perfecta para disfrutar sin prisa.",
    author: "Martín C.",
    place: "La Reina",
    image: "guestBreadTea",
  },
];
