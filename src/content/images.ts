import type { StaticImageData } from "next/image";
import archedEntry from "@/assets/images/arched-entry-lanterns.webp";
import candlelitTable from "@/assets/images/candlelit-table.webp";
import clayPot from "@/assets/images/clay-pot-stew.webp";
import dipsSpices from "@/assets/images/dips-spices-board.webp";
import doughHands from "@/assets/images/dough-hands.webp";
import grillSkewers from "@/assets/images/grill-skewers.webp";
import heroMezze from "@/assets/images/hero-mezze-slate.webp";
import hummusBowl from "@/assets/images/hummus-patterned-bowl.webp";
import longTable from "@/assets/images/long-table-candles.webp";
import mezzePlates from "@/assets/images/mezze-patterned-plates.webp";
import pistachioPastry from "@/assets/images/pistachio-pastry.webp";
import pomegranate from "@/assets/images/pomegranate-dark.webp";
import sharedTable from "@/assets/images/shared-table-wood.webp";
import teaGlass from "@/assets/images/tea-pouring-glass.webp";
import teaSilver from "@/assets/images/tea-pouring-silver.webp";
import guestBreadTea from "@/assets/images/guest-bread-tea.webp";
import guestMezzeTable from "@/assets/images/guest-mezze-table.webp";
import guestPlatterRice from "@/assets/images/guest-platter-rice.webp";
import guestSoupMezze from "@/assets/images/guest-soup-mezze.webp";
import guestTagineShare from "@/assets/images/guest-tagine-share.webp";
import guestTeaDates from "@/assets/images/guest-tea-dates.webp";

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
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
