import Image from "next/image";
import { siteConfig } from "@/config/site";
import { copy } from "@/content/copy";
import { images } from "@/content/images";
import { Chat, Clock, Mail, Phone, Pin } from "@/components/ui/icons";
import { Pending } from "@/components/ui/Notice";
import { OpeningHours } from "./OpeningHours";
import { SectionHeader } from "./SectionHeader";
import { SocialLinks } from "./SocialLinks";

export function Location() {
  const c = siteConfig.contact;
  const fullAddress = [c.address, c.postalCode, c.city, c.region, c.country].filter(Boolean).join(", ");

  const rows = [
    {
      icon: Pin,
      label: c.address ? "Dirección" : "Ubicación",
      value: c.address || c.city ? (
        c.mapLink ? (
          <a href={c.mapLink} target="_blank" rel="noopener noreferrer" className="link-underline">
            {fullAddress}
          </a>
        ) : (
          fullAddress
        )
      ) : (
        <Pending label="Dirección pendiente de confirmar" />
      ),
    },
    {
      icon: Phone,
      label: "Teléfono",
      value: c.phone ? (
        <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="link-underline">
          {c.phone}
        </a>
      ) : (
        <Pending />
      ),
    },
    {
      icon: Chat,
      label: "WhatsApp",
      value: c.whatsapp ? (
        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="link-underline">
          Escríbenos
        </a>
      ) : (
        <Pending />
      ),
    },
    {
      icon: Mail,
      label: "Correo",
      value: c.email ? (
        <a href={`mailto:${c.email}`} className="link-underline">
          {c.email}
        </a>
      ) : (
        <Pending />
      ),
    },
  ];

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="py-24 md:py-36">
      <div className="container-x">
        <SectionHeader id="contacto-title" eyebrow={copy.contact.eyebrow} title={copy.contact.title} />
      </div>
      <div className="container-x mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <dl className="divide-y divide-line border-y border-line" data-reveal>
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="grid grid-cols-[2rem_1fr] gap-x-3 py-5 sm:grid-cols-[2rem_8rem_1fr]">
                <Icon className="mt-0.5 text-terracotta" />
                <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</dt>
                <dd className="col-start-2 mt-1 text-[0.9375rem] sm:col-start-3 sm:mt-0">{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[2rem_1fr] gap-x-3 py-5 sm:grid-cols-[2rem_8rem_1fr]">
              <Clock className="mt-0.5 text-terracotta" />
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-mute">Horario</dt>
              <dd className="col-start-2 mt-1 text-[0.9375rem] sm:col-start-3 sm:mt-0">
                <OpeningHours compact />
              </dd>
            </div>
          </dl>

          <div className="mt-8" data-reveal>
            <SocialLinks />
          </div>
        </div>

        <div className="lg:col-span-7" data-reveal="image">
          {c.mapEmbedUrl ? (
            <iframe
              src={c.mapEmbedUrl}
              title={`Mapa de ubicación de ${siteConfig.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] h-auto w-full rounded-sm border-0 grayscale-[30%] lg:aspect-auto lg:h-full lg:min-h-[32rem]"
            />
          ) : (
            <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-sm bg-olive lg:aspect-auto lg:h-full lg:min-h-[32rem]">
              <Image src={images.archedEntry.src} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" placeholder="blur" className="object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep via-olive-deep/40 to-transparent" />
              <div className="on-dark relative p-8 text-linen md:p-10">
                <p className="font-script text-5xl md:text-6xl">Mapa próximamente</p>
                <p className="mt-3 max-w-sm text-linen/75">Publicaremos aquí la ubicación exacta de {siteConfig.name} en cuanto esté confirmada.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
