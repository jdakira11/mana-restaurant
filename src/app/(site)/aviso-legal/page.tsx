import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Aviso legal",
  alternates: { canonical: "/aviso-legal" },
};

const P = ({ children }: { children: string }) => <mark>[{children}]</mark>;

export default function LegalNoticePage() {
  const legal = siteConfig.legal;
  return (
    <LegalPage
      title="Aviso legal"
      notice={
        <>
          <strong>Plantilla provisional.</strong> Debe completarse con los datos reales del titular y revisarse por un asesor legal antes de publicar la web.
        </>
      }
    >
      <h2>Titular del sitio web</h2>
      <ul>
        <li>Titular: {legal.companyName ?? <P>Razón social</P>}</li>
        <li>Identificación fiscal: {legal.taxId ?? <P>RUT</P>}</li>
        <li>Domicilio: {legal.registeredAddress ?? <P>Domicilio fiscal</P>}</li>
        <li>Correo electrónico: {siteConfig.contact.email ?? <P>Correo de contacto</P>}</li>
        <li>Teléfono: {siteConfig.contact.phone ?? <P>Teléfono</P>}</li>
        <li>
          Datos registrales: <P>Inscripción en el registro mercantil u organismo equivalente, si aplica</P>
        </li>
      </ul>

      <h2>Objeto</h2>
      <p>Este sitio web informa sobre el restaurante {siteConfig.name} y permite solicitar reservas de mesa.</p>

      <h2>Contenido e imágenes</h2>
      <p>
        Mientras el restaurante no disponga de fotografía propia, algunas imágenes de esta web son fotografías ilustrativas obtenidas de Unsplash bajo su licencia.
        No representan platos ni instalaciones reales del restaurante. Consulta los <a href="/creditos">créditos fotográficos</a>.
      </p>

      <h2>Reservas</h2>
      <p>
        Una solicitud de reserva no queda confirmada hasta que la web o el restaurante lo indiquen expresamente. Las condiciones de reserva (antelación,
        cancelaciones, grupos) son: <P>políticas de reserva del restaurante</P>.
      </p>

      <h2>Legislación aplicable</h2>
      <p>
        Legislación de la República de Chile. <P>Detalle a completar por el asesor legal</P>
      </p>
    </LegalPage>
  );
}
