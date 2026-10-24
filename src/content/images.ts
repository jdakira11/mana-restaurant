import type { StaticImageData } from "next/image";
import archedEntry from "@/assets/images/arched-entry-lanterns.jpg";
import candlelitTable from "@/assets/images/candlelit-table.jpg";
import clayPot from "@/assets/images/clay-pot-stew.jpg";
import dipsSpices from "@/assets/images/dips-spices-board.jpg";
import doughHands from "@/assets/images/dough-hands.jpg";
import grillSkewers from "@/assets/images/grill-skewers.jpg";
import heroMezze from "@/assets/images/hero-mezze-slate.jpg";
import hummusBowl from "@/assets/images/hummus-patterned-bowl.jpg";
import longTable from "@/assets/images/long-table-candles.jpg";
import mezzePlates from "@/assets/images/mezze-patterned-plates.jpg";
import pistachioPastry from "@/assets/images/pistachio-pastry.jpg";
import pomegranate from "@/assets/images/pomegranate-dark.jpg";
import sharedTable from "@/assets/images/shared-table-wood.jpg";
import teaGlass from "@/assets/images/tea-pouring-glass.jpg";
import teaSilver from "@/assets/images/tea-pouring-silver.jpg";

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
  hummusBowl: {
    src: hummusBowl,
    alt: "Cuenco de hummus con garbanzos y aceite de oliva en cerámica de borde azul",
    credit: unsplash("Filipp Romanovski", "filipp_roman_photography", "GdLWD8eWFhI"),
  },
  sharedTable: {
    src: sharedTable,
    alt: "Mesa de madera con panes, ensaladas y varios platos dispuestos para compartir",
    credit: unsplash("Charles-Albert Clarysse", "charlesalb", "-5B_sfWV2TE"),
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
  teaGlass: {
    src: teaGlass,
    alt: "Infusión vertida en una jarra de cristal en penumbra",
    credit: unsplash("Anna Volkova", "annivol", "eVeMvEa2gmc"),
  },
  pomegranate: {
    src: pomegranate,
    alt: "Granada abierta con sus granos sobre fondo negro",
    credit: unsplash("Margarita Zueva", "margzu", "Ws4axEMbsvY"),
  },
  candlelitTable: {
    src: candlelitTable,
    alt: "Mesa alargada con velas, flores y platos bajo una luz cálida",
    credit: unsplash("Mounish Raja", "mounishraja", "PyL-lApI1F8"),
  },
  longTable: {
    src: longTable,
    alt: "Mesa larga preparada con platos blancos, velas y botellas de cristal",
    credit: unsplash("Nadia Valko", "nadiavalko", "0hAdietsUrE"),
  },
  archedEntry: {
    src: archedEntry,
    alt: "Arco de entrada en penumbra con una gran lámpara de faroles encendida",
    credit: unsplash("İrfan Simsar", "irfansimsar", "epv5Xvjtnqg"),
  },
  dipsSpices: {
    src: dipsSpices,
    alt: "Tabla de madera con pan, cremas, encurtidos y especias en pequeños cuencos",
    credit: unsplash("Chetanya Sharma", "chetanya_designs", "zyeyksoJf78"),
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
