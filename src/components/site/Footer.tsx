import Link from "next/link";
import { navigation, siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Pending } from "@/components/ui/Notice";
import { CurrentYear } from "./CurrentYear";
import { OpeningHours } from "./OpeningHours";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const c = siteConfig.contact;
  return (
    <footer className="on-dark bg-olive-deep text-linen">
      <div className="container-x pb-28 pt-20 md:pb-12 md:pt-28">
        <div className="flex flex-col items-center gap-8 border-b border-linen/15 pb-14 text-center">
          <div className="flex flex-col items-center">
            <Logo variant="stacked" size="xl" className="text-linen" />
            <p className="font-script mt-3 text-4xl text-linen/70">{siteConfig.tagline}</p>
          </div>
          <Link href="/#reservas" className="btn btn-primary">
            Reservar mesa
          </Link>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Pie de página">
            <p className="eyebrow">Explora</p>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-linen/80">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline hover:text-linen">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow">Contacto</p>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-linen/80">
              <li>{[c.address, c.city, c.region, c.country].filter(Boolean).join(", ") || <Pending label="Dirección pendiente" />}</li>
              <li>{c.phone ? <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="link-underline">{c.phone}</a> : <Pending label="Teléfono pendiente" />}</li>
              <li>{c.email ? <a href={`mailto:${c.email}`} className="link-underline">{c.email}</a> : <Pending label="Correo pendiente" />}</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Horario</p>
            <OpeningHours compact className="mt-5 text-[0.9375rem] text-linen/80" />
          </div>
          <div>
            <p className="eyebrow">Síguenos</p>
            <SocialLinks className="mt-5 text-linen/80" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-linen/15 pt-8 text-sm text-linen/60 md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.legal.companyName ?? siteConfig.name}. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacidad" className="link-underline hover:text-linen">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/aviso-legal" className="link-underline hover:text-linen">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/creditos" className="link-underline hover:text-linen">
                Créditos fotográficos
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
