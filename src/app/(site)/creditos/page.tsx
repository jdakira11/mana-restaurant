import type { Metadata } from "next";
import Image from "next/image";
import { images } from "@/content/images";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Créditos fotográficos",
  alternates: { canonical: "/creditos" },
};

export default function CreditsPage() {
  return (
    <LegalPage title="Créditos fotográficos">
      <p>
        Las fotografías de esta web son imágenes ilustrativas publicadas en{" "}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
          Unsplash
        </a>{" "}
        bajo la{" "}
        <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
          licencia de Unsplash
        </a>
        . No muestran platos ni instalaciones reales del restaurante. Gracias a sus autores:
      </p>
      <ul className="!mt-8 grid gap-4 sm:grid-cols-2">
        {Object.entries(images).map(([key, img]) => (
          <li key={key} className="!ml-0 flex !list-none items-center gap-4">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-sand">
              <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="text-[0.9375rem]">
              <a href={img.credit.source} target="_blank" rel="noopener noreferrer">
                Foto
              </a>{" "}
              de{" "}
              <a href={img.credit.profile} target="_blank" rel="noopener noreferrer">
                {img.credit.author}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
