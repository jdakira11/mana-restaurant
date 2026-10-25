import type { ImageKey } from "./images";

/**
 * CARTA DE MANÁ — estructura de datos editable sin tocar los componentes.
 *
 * Maná es un restaurante ficticio (proyecto de portafolio): platos, descripciones y precios
 * son de muestra. Precios en la moneda de `siteConfig.currency` (pesos chilenos, CLP).
 * Fotos: Unsplash (ver content/images.ts y /creditos). Añade `allergens` solo con información verificada.
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

const item = (id: string, name: string, description: string, price: number, image: ImageKey, tags?: DietaryTag[]): MenuItem => ({
  id,
  name,
  description,
  price,
  image,
  tags,
});

export const menu: Menu = {
  status: "official",
  categories: [
    {
      id: "entradas",
      name: "Entradas y aperitivos",
      description: "Pequeños platos para abrir la mesa.",
      items: [
        item("hummus", "Hummus", "Crema de garbanzos con tahini, limón y aceite de oliva, con pan pita caliente.", 7900, "dishHummus", ["vegetariano"]),
        item("falafel", "Falafel", "Croquetas crujientes de garbanzo y hierbas con nabo encurtido y salsa de tahini.", 8900, "dishFalafel", ["vegetariano"]),
        item("kibbeh", "Kibbeh", "Bulgur relleno de carne especiada y piñones, servido con limón y tomate.", 9500, "dishKibbeh"),
      ],
    },
    {
      id: "compartir",
      name: "Platos para compartir",
      description: "Pensados para el centro de la mesa.",
      items: [
        item("mezze", "Mezze Maná", "Hummus, labneh, tabulé, falafel, kibbeh y empanadillas: un poco de todo para descubrir.", 22900, "dishMezze", ["para-compartir"]),
        item("bandeja-casa", "Bandeja de la casa", "Hummus, tabulé, falafel y carnes a la parrilla con pan pita recién horneado.", 29900, "dishHousePlatter", ["para-compartir"]),
        item("bandeja-verde", "Bandeja verde", "Falafel, hummus, tabulé y encurtidos con pan pita.", 19900, "dishGreenPlatter", ["para-compartir", "vegetariano"]),
      ],
    },
    {
      id: "principales",
      name: "Platos principales",
      description: "Del fuego a la mesa.",
      items: [
        item("parrillada", "Parrillada mixta", "Brochetas de pollo, kafta y cordero con verduras asadas, salsas y pan.", 26900, "grill", ["para-compartir"]),
        item("kafta", "Kafta a la parrilla", "Brochetas de carne picada con perejil y especias, granada y menta fresca.", 16900, "dishKafta"),
      ],
    },
    {
      id: "especialidades",
      name: "Especialidades árabes",
      description: "Recetas de cocción lenta y tradición.",
      items: [
        item("cazuela", "Cazuela de cordero", "Cordero cocinado lentamente con tomate, pimientos y especias, en cazuela de barro.", 19900, "clayPot"),
        item("warak-enab", "Hojas de parra", "Hojas de parra rellenas de arroz, tomate y hierbas, con limón y granada.", 10900, "dishVineLeaves", ["vegetariano"]),
      ],
    },
    {
      id: "vegetarianas",
      name: "Opciones vegetarianas",
      description: "Frescas, coloridas y llenas de hierbas.",
      items: [
        item("tabule", "Tabulé", "Perejil, bulgur, tomate y menta con limón y aceite de oliva.", 8500, "dishTabbouleh", ["vegano"]),
        item("fattoush", "Fattoush", "Hortalizas crujientes, hierbas frescas y pan tostado con zumaque.", 8900, "dishFattoush", ["vegano"]),
        item("ensalada-granada", "Ensalada de granada", "Tomate, hierbas frescas y granada con vinagreta de limón.", 8900, "dishPomegranateSalad", ["vegano"]),
      ],
    },
    {
      id: "postres",
      name: "Postres",
      description: "Algo dulce para la sobremesa.",
      items: [
        item("baklava", "Baklava de pistacho", "Capas de masa filo, pistacho y almíbar de azahar.", 5900, "dishBaklava", ["vegetariano"]),
        item("nido-kataifi", "Nido de kataifi", "Masa kataifi crujiente con pistachos enteros y miel.", 6500, "dishKataifiNest", ["vegetariano"]),
        item("conos-kataifi", "Conos de kataifi", "Conos de masa kataifi rellenos de pistacho molido.", 5900, "pastry", ["vegetariano"]),
      ],
    },
    {
      id: "bebidas",
      name: "Bebidas",
      description: "Para acompañar la mesa y la sobremesa.",
      items: [
        item("te-menta", "Té de menta", "Té verde con menta fresca, servido a la manera tradicional.", 3500, "teaSilver", ["vegano"]),
        item("cafe-arabe", "Café árabe", "Café de molienda fina aromatizado con cardamomo.", 3500, "drinkCoffee", ["vegano"]),
        item("limonada", "Limonada con menta", "Limón exprimido, menta fresca y hielo.", 4500, "drinkLemonade", ["vegano"]),
      ],
    },
  ],
};
