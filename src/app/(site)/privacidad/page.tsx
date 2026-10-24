import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
};

const P = ({ children }: { children: string }) => <mark>[{children}]</mark>;

export default function PrivacyPage() {
  const legal = siteConfig.legal;
  return (
    <LegalPage
      title="Política de privacidad"
      notice={
        <>
          <strong>Plantilla provisional.</strong> Este texto describe con precisión qué datos recoge el sistema de reservas, pero debe completarse con los
          datos del titular y revisarse por un asesor legal según la normativa chilena aplicable (Ley N.º 19.628 sobre protección de la vida privada y sus modificaciones, incluida la Ley N.º 21.719) antes de publicar la web.
          Los campos marcados entre corchetes están pendientes.
        </>
      }
    >
      <h2>1. Responsable del tratamiento</h2>
      <p>
        {legal.companyName ?? <P>Razón social del titular</P>}, con identificación fiscal {legal.taxId ?? <P>RUT</P>} y domicilio en{" "}
        {legal.registeredAddress ?? <P>domicilio fiscal</P>}. Contacto: {siteConfig.contact.email ?? <P>correo de contacto para privacidad</P>}.
      </p>

      <h2>2. Qué datos recogemos</h2>
      <p>Cuando solicitas una reserva a través de esta web recogemos únicamente:</p>
      <ul>
        <li>Nombre y apellido.</li>
        <li>Correo electrónico y número de teléfono.</li>
        <li>Fecha, hora y número de personas de la reserva.</li>
        <li>Los comentarios que decidas incluir (por ejemplo, alergias). Te pedimos que no incluyas información que no sea necesaria.</li>
      </ul>
      <p>
        Para proteger el formulario frente a abusos registramos de forma temporal un identificador cifrado (hash) derivado de tu dirección IP, que no permite
        conocer la IP original. No usamos cookies publicitarias ni de seguimiento.
      </p>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Gestionar tu reserva: confirmarla, avisarte de cambios o cancelaciones y atenderte el día de tu visita.</li>
        <li>Enviarte los correos relacionados con la reserva.</li>
        <li>Prevenir envíos fraudulentos o automatizados.</li>
      </ul>
      <p>No usamos estos datos para enviarte publicidad ni los vendemos a terceros.</p>

      <h2>4. Base jurídica</h2>
      <p>
        <P>A completar por el asesor legal: normalmente, la ejecución de la solicitud de reserva que nos haces y, en su caso, el consentimiento.</P>
      </p>

      <h2>5. Con quién los compartimos</h2>
      <p>Solo con los proveedores técnicos necesarios para prestar el servicio, que actúan como encargados del tratamiento:</p>
      <ul>
        <li>
          Alojamiento de la web: <P>proveedor de hosting</P>.
        </li>
        <li>
          Base de datos: <P>proveedor de base de datos</P>.
        </li>
        <li>
          Envío de correos electrónicos: <P>proveedor de correo transaccional</P>.
        </li>
      </ul>

      <h2>6. Cuánto tiempo los conservamos</h2>
      <p>
        <P>Plazo de conservación a definir por el titular</P>. Los registros técnicos antiabuso se purgan periódicamente una vez transcurridas 24 horas.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes solicitar el acceso, la rectificación, la cancelación o supresión de tus datos y oponerte a su tratamiento escribiendo a{" "}
        {siteConfig.contact.email ?? <P>correo de contacto</P>}. También puedes cancelar tu reserva desde el enlace de gestión que recibes al reservar.{" "}
        <P>Autoridad de control competente en Chile, a confirmar por el asesor legal</P>.
      </p>
    </LegalPage>
  );
}
