import type { ImageKey } from "./images";

/**
 * CARTA DE MANÁ — estructura de datos editable sin tocar los componentes.
 *
 * ⚠️ ESTADO ACTUAL: DEMOSTRACIÓN. Los platos de abajo son ejemplos genéricos de cocina árabe
 * para mostrar el diseño. NO forman parte de la carta oficial y no tienen precio.
 * Cuando el restaurante facilite su carta:
 *   1. Cambia `status` a "official".
 *   2. Sustituye categorías y platos (quita `demo: true`).
 *   3. Indica `price` como número (p. ej. 145) en la moneda de `siteConfig.currency`.
 *   4. Añade `allergens` solo si la información está verificada por la cocina.
 */

export type Allergen =
  | "gluten"
  | "crustaceos"
  | "huevo"
  | "pescado"
  | "cacahuetes"
  | "soja"
  | "lacteos"
  | "frutos-de-cascara"
  | "apio"
  | "mostaza"
  | "sesamo"
  | "sulfitos"
  | "altramuces"
  | "moluscos";

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  crustaceos: "Crustáceos",
  huevo: "Huevo",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  lacteos: "Lácteos",
  "frutos-de-cascara": "Frutos de cáscara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
};

export type DietaryTag = "vegetariano" | "vegano" | "picante" | "para-compartir";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  /** Precio en la moneda del sitio. `null` = no publicado. */
  price: number | null;
  image?: ImageKey;
  allergens?: Allergen[];
  tags?: DietaryTag[];
  /** Marca el plato como ejemplo de demostración (se muestra la etiqueta «Ejemplo»). */
  demo?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: ImageKey;
  items: MenuItem[];
}

export interface Menu {
  status: "demo" | "official";
  categories: MenuCategory[];
}

const demo = (id: string, name: string, description: string, tags?: DietaryTag[]): MenuItem => ({
  id,
  name,
  description,
  price: null,
  tags,
  demo: true,
});

export const menu: Menu = {
  status: "demo",
  categories: [
    {
      id: "entradas",
      name: "Entradas y aperitivos",
      description: "Pequeños platos para abrir la mesa.",
      image: "dipsSpices",
      items: [
        demo("hummus", "Hummus", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
        demo("mutabal", "Mutabal", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
        demo("falafel", "Falafel", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
        demo("fatayer", "Fatayer", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
      ],
    },
    {
      id: "compartir",
      name: "Platos para compartir",
      description: "Pensados para el centro de la mesa.",
      image: "mezzePlates",
      items: [
        demo("mezze", "Selección de mezze", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["para-compartir"]),
        demo("tabule", "Tabulé", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
        demo("fattoush", "Fattoush", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
      ],
    },
    {
      id: "principales",
      name: "Platos principales",
      image: "grill",
      items: [
        demo("parrilla", "Parrillada mixta", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["para-compartir"]),
        demo("kafta", "Kafta", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
        demo("shawarma", "Shawarma al plato", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
      ],
    },
    {
      id: "especialidades",
      name: "Especialidades árabes",
      image: "clayPot",
      items: [
        demo("kibbeh", "Kibbeh", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
        demo("maqluba", "Maqluba", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["para-compartir"]),
      ],
    },
    {
      id: "vegetarianas",
      name: "Opciones vegetarianas",
      image: "hummusBowl",
      items: [
        demo("mujaddara", "Mujaddara", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
        demo("musaqa", "Berenjena al horno", "Ejemplo de plato. Descripción pendiente de la carta oficial.", ["vegetariano"]),
      ],
    },
    {
      id: "postres",
      name: "Postres",
      image: "pastry",
      items: [
        demo("baklava", "Baklava", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
        demo("knafeh", "Knafeh", "Ejemplo de plato. Descripción pendiente de la carta oficial."),
      ],
    },
    {
      id: "bebidas",
      name: "Bebidas",
      image: "teaSilver",
      items: [
        demo("te", "Té", "Ejemplo de bebida. Descripción pendiente de la carta oficial."),
        demo("cafe", "Café", "Ejemplo de bebida. Descripción pendiente de la carta oficial."),
        demo("limonada", "Limonada", "Ejemplo de bebida. Descripción pendiente de la carta oficial."),
      ],
    },
  ],
};
