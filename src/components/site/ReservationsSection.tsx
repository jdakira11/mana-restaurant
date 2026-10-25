import Image from "next/image";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Phone, WhatsAppIcon } from "@/components/ui/icons";
import { OpeningHours } from "./OpeningHours";
import { SectionHeader } from "./SectionHeader";

export function ReservationsSection() {
  const { phone, whatsapp } = siteConfig.contact;
  const contactHint = phone ? `Llámanos al ${phone}.` : whatsapp ? "Escríbenos por WhatsApp." : "Contáctanos directamente para grupos.";

  return (
    <section id="reservas" aria-labelledby="reservas-title" className="relative bg-ivory py-24 md:py-36">
      <div className="container-x">
        <SectionHeader id="reservas-title" eyebrow={copy.reservations.eyebrow} title={copy.reservations.title} intro={copy.reservations.intro} />
      </div>
      <div className="container-x mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="relative hidden aspect-[16/10] max-w-md overflow-hidden rounded-sm lg:block" data-reveal="image">
              <Image src={images.candlelitTable.src} alt={images.candlelitTable.alt} fill sizes="30vw" placeholder="blur" className="object-cover" />
            </div>

            <div className="mt-10 max-w-md space-y-6 text-[0.9375rem] text-ink-soft" data-reveal>
              <div>
                <p className="field-label">Horario</p>
                <OpeningHours compact />
              </div>
              {(phone || whatsapp) && (
                <div>
                  <p className="field-label">¿Prefieres hablar con nosotros?</p>
                  <div className="flex flex-col items-start gap-4">
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, quisiera reservar una mesa en ${siteConfig.name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-[#1f7a4d] text-linen hover:bg-[#17603c]"
                      >
                        <WhatsAppIcon />
                        Escríbenos por WhatsApp
                      </a>
                    )}
                    {phone && (
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline inline-flex items-center gap-2 font-medium text-ink">
                        <Phone width={16} height={16} /> {phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
          <div className="rounded-2xl border border-line bg-sand/60 p-5 shadow-[0_40px_80px_-50px_rgb(31_26_22/0.45)] sm:p-8 md:p-10">
            <ReservationForm contactHint={contactHint} />
          </div>
        </div>
      </div>
    </section>
  );
}
