import type { StaticImageData } from "next/image";
import archedEntry from "@/assets/images/arched-entry-lanterns.webp";
import candlelitTable from "@/assets/images/candlelit-table.webp";
import clayPot from "@/assets/images/clay-pot-stew.webp";
import doughHands from "@/assets/images/dough-hands.webp";
import grillSkewers from "@/assets/images/grill-skewers.webp";
import heroMezze from "@/assets/images/hero-mezze-slate.webp";
import mezzePlates from "@/assets/images/mezze-patterned-plates.webp";
import pistachioPastry from "@/assets/images/pistachio-pastry.webp";
import teaSilver from "@/assets/images/tea-pouring-silver.webp";
import guestBreadTea from "@/assets/images/guest-bread-tea.webp";
import guestMezzeTable from "@/assets/images/guest-mezze-table.webp";
import guestPlatterRice from "@/assets/images/guest-platter-rice.webp";
import guestSoupMezze from "@/assets/images/guest-soup-mezze.webp";
import guestTagineShare from "@/assets/images/guest-tagine-share.webp";
import guestTeaDates from "@/assets/images/guest-tea-dates.webp";
import dishHummus from "@/assets/images/dish-hummus.webp";
import dishFalafel from "@/assets/images/dish-falafel.webp";
import dishKibbeh from "@/assets/images/dish-kibbeh.webp";
import dishMezze from "@/assets/images/dish-mezze.webp";
import dishHousePlatter from "@/assets/images/dish-house-platter.webp";
import dishGreenPlatter from "@/assets/images/dish-green-platter.webp";
import dishKafta from "@/assets/images/dish-kafta.webp";
import dishVineLeaves from "@/assets/images/dish-vine-leaves.webp";
import dishTabbouleh from "@/assets/images/dish-tabbouleh.webp";
import dishFattoush from "@/assets/images/dish-fattoush.webp";
import dishPomegranateSalad from "@/assets/images/dish-pomegranate-salad.webp";
import dishBaklava from "@/assets/images/dish-baklava.webp";
import dishKataifiNest from "@/assets/images/dish-kataifi-nest.webp";
import drinkCoffee from "@/assets/images/drink-coffee.webp";
import drinkLemonade from "@/assets/images/drink-lemonade.webp";

/**
 * Registro de imágenes. Todas proceden de Unsplash (licencia Unsplash: uso comercial gratuito,
 * sin atribución obligatoria; no se permite revenderlas sin modificar ni recopilarlas para
 * crear un servicio similar). Se verificó en la página de cada foto que NO eran «Unsplash+».
 *
 * ⚠️ Son fotografías ILUSTRATIVAS: no muestran platos ni instalaciones reales de Maná.
 * Sustitúyelas por fotografía propia cuando esté disponible (mismo nombre de clave).
 */
export interface SiteImage {
  src: StaticImageData;
  alt: string;
  credit: { author: string; profile: string; source: string };
}

const unsplash = (author: string, handle: string, photoId: string) => ({
  author,
  profile: `https://unsplash.com/@${handle}`,
  source: `https://unsplash.com/photos/${photoId}`,
});

export const images = {
  hero: {
    src: heroMezze,
    alt: "Mesa oscura con cuencos de cremas para untar decoradas con granada, nueces y aceite de oliva",
    credit: unsplash("Husien Bisky", "husien_bisky1", "-AlYYc8JRAs"),
  },
  mezzePlates: {
    src: mezzePlates,
    alt: "Vista cenital de platos de cerámica pintada con hummus, calabaza asada y cremas sobre una mesa de madera",
    credit: unsplash("Filipp Romanovski", "filipp_roman_photography", "OwhL1lhzOOI"),
  },
  doughHands: {
    src: doughHands,
    alt: "Manos enharinadas extendiendo una masa sobre la mesa de trabajo",
    credit: unsplash("Aldward Castillo", "aldwardcv31", "bPqMD7uSrJg"),
  },
  grill: {
    src: grillSkewers,
    alt: "Brochetas y carnes a la parrilla con verduras asadas y salsas",
    credit: unsplash("Victoria Shes", "victoriakosmo", "UC0HZdUitWY"),
  },
  clayPot: {
    src: clayPot,
    alt: "Cazuelas de barro con guisos de carne, tomates y pimientos",
    credit: unsplash("Hakan Çınar", "altimod", "QFGOSN99_lU"),
  },
  pastry: {
    src: pistachioPastry,
    alt: "Dulces de masa kataifi rellenos de pistacho sobre pistacho molido",
    credit: unsplash("mohamed hassouna", "mhassouna931", "eK6JE-JD3tQ"),
  },
  teaSilver: {
    src: teaSilver,
    alt: "Té servido desde una tetera plateada en vasos de cristal",
    credit: unsplash("Louis Hansel", "louishansel", "hB4oeoLKMBc"),
  },
  candlelitTable: {
    src: candlelitTable,
    alt: "Mesa alargada con velas, flores y platos bajo una luz cálida",
    credit: unsplash("Mounish Raja", "mounishraja", "PyL-lApI1F8"),
  },
  archedEntry: {
    src: archedEntry,
    alt: "Arco de entrada en penumbra con una gran lámpara de faroles encendida",
    credit: unsplash("İrfan Simsar", "irfansimsar", "epv5Xvjtnqg"),
  },
  // Fotos de la galería de opiniones: personas compartiendo mesa, sin caras reconocibles
  // (las opiniones son ilustrativas y no deben atribuirse a personas reales identificables).
  guestMezzeTable: {
    src: guestMezzeTable,
    alt: "Comensal ante una mesa con platos de mezze, pan y brochetas",
    credit: unsplash("Jean-Luc Picard", "jeanlucbe", "KzVfKnpqO6k"),
  },
  guestTagineShare: {
    src: guestTagineShare,
    alt: "Varias manos sirviéndose de una cazuela compartida con frutos secos y ciruelas",
    credit: unsplash("sour moha", "sour_moha", "5t2SP3vQz28"),
  },
  guestTeaDates: {
    src: guestTeaDates,
    alt: "Manos alrededor de una mesa con tetera, dátiles y mantel estampado",
    credit: unsplash("86 media", "eightysixmedia", "87GUGAcSyC4"),
  },
  guestPlatterRice: {
    src: guestPlatterRice,
    alt: "Comensal sirviéndose de una gran fuente de arroz con verduras y carnes",
    credit: unsplash("Pouya Hajibagheri", "pouyahajibagheri", "9diPgS3uS0Q"),
  },
  guestSoupMezze: {
    src: guestSoupMezze,
    alt: "Mesa con sopa, croquetas y pequeños platos compartidos",
    credit: unsplash("Cemrecan Yurtman", "cmrcn_", "CwGpQibkkXg"),
  },
  guestBreadTea: {
    src: guestBreadTea,
    alt: "Manos compartiendo pan horneado y té en vaso de cristal",
    credit: unsplash("Yasin Onus", "yasinonus", "ge7FkL5jPl4"),
  },
  // Platos de la carta.
  dishHummus: {
    src: dishHummus,
    alt: "Fuente de hummus decorada con aceite de oliva y una rosa de tomate",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "GfjSm9IvI3Q"),
  },
  dishFalafel: {
    src: dishFalafel,
    alt: "Cuenco de falafel con nabo encurtido junto a encurtidos y especias",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "9oepWGu1bSQ"),
  },
  dishKibbeh: {
    src: dishKibbeh,
    alt: "Kibbeh frito sobre lechuga con tomate y limón",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "Go_BsrnVId4"),
  },
  dishMezze: {
    src: dishMezze,
    alt: "Plato de mezze con hummus, labneh, tabulé, falafel, kibbeh y empanadillas",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "_Y7_OVpMxsI"),
  },
  dishHousePlatter: {
    src: dishHousePlatter,
    alt: "Bandeja con hummus, tabulé, falafel, carnes a la parrilla y pan pita",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "dcgMs7GEj2M"),
  },
  dishGreenPlatter: {
    src: dishGreenPlatter,
    alt: "Bandeja de falafel, hummus, tabulé y pan pita sobre una mesa de madera",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "XYELC0jO8_U"),
  },
  dishKafta: {
    src: dishKafta,
    alt: "Brochetas de kafta con granada y hierbas en un plato azul",
    credit: unsplash("Sara Dubler", "ahungryblonde_", "lOaXEG1tVUM"),
  },
  dishVineLeaves: {
    src: dishVineLeaves,
    alt: "Hojas de parra rellenas sobre lechuga con limón y granada",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "uAvDWzrEzq8"),
  },
  dishTabbouleh: {
    src: dishTabbouleh,
    alt: "Cuenco de tabulé con tomate picado, perejil y limón",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "m5YZbsHYeWk"),
  },
  dishFattoush: {
    src: dishFattoush,
    alt: "Ensalada de hortalizas y hierbas frescas con limón",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "r1ojWpwr4Uc"),
  },
  dishPomegranateSalad: {
    src: dishPomegranateSalad,
    alt: "Ensalada de tomate, hierbas y granada decorada con rosas de tomate",
    credit: unsplash("Chez Le Libanais", "chezlelibanais", "SApwArn0jeU"),
  },
  dishBaklava: {
    src: dishBaklava,
    alt: "Baklava dorado relleno de pistacho picado",
    credit: unsplash("Benjamin Chambon", "benjamin_photo_lab", "OEDeQheVySQ"),
  },
  dishKataifiNest: {
    src: dishKataifiNest,
    alt: "Nido de masa kataifi relleno de pistachos",
    credit: unsplash("Shoeib Abolhassani", "shoeibabhn", "NzNFM69MMnI"),
  },
  drinkCoffee: {
    src: drinkCoffee,
    alt: "Taza de café sobre un platillo de cerámica decorada",
    credit: unsplash("Ebru Doğan", "ebrubodyy", "dgmaFq0dorU"),
  },
  drinkLemonade: {
    src: drinkLemonade,
    alt: "Vaso de limonada con hielo, lima y menta",
    credit: unsplash("kimia kazemi", "kimick", "aM3LR10BeAc"),
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
