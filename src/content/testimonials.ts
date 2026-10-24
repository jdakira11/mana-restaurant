/**
 * Reseñas de clientes.
 *
 * `verifiedTestimonials`: SOLO reseñas reales, con permiso del autor o citadas de una
 * plataforma pública (indica la fuente). Se publican en producción.
 *
 * `demoTestimonials`: textos FICTICIOS para revisar el diseño. Solo se muestran en
 * desarrollo (`npm run dev`) y llevan la etiqueta «Ficticio». Nunca se publican.
 */
export interface Testimonial {
  quote: string;
  author: string;
  /** Fuente verificable, p. ej. "Google", "TripAdvisor". */
  source?: string;
  sourceUrl?: string;
}

export const verifiedTestimonials: Testimonial[] = [];

export const demoTestimonials: Testimonial[] = [
  { quote: "Texto de ejemplo para maquetación. Aquí irá una reseña real de un comensal.", author: "Nombre de ejemplo" },
  { quote: "Segundo texto de ejemplo, algo más largo, para comprobar cómo se adapta el diseño a reseñas de distinta extensión.", author: "Nombre de ejemplo" },
  { quote: "Tercer texto ficticio de demostración.", author: "Nombre de ejemplo" },
];
