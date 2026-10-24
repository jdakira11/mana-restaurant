# Maná · Web y sistema de reservas

Web del restaurante de cocina árabe **Maná**: experiencia editorial y sistema de reservas real, con persistencia, control de capacidad, panel de administración y avisos por correo.

> **Proyecto de portafolio:** Maná es un restaurante ficticio ubicado en Las Condes (Región Metropolitana, Chile), sin dirección exacta. Los precios de la carta se expresan en dólares estadounidenses (USD).

> **Estado:** funcional y probado en local. Faltan los **datos reales del restaurante** (ver «[Lo que debe aportar el propietario](#lo-que-debe-aportar-el-propietario)») y la **configuración de los servicios externos** de producción (base de datos, correo y hosting).

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Puesta en marcha local](#puesta-en-marcha-local)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Cómo editar el contenido](#cómo-editar-el-contenido)
5. [Sistema de reservas](#sistema-de-reservas)
6. [Panel de administración](#panel-de-administración)
7. [Base de datos (Supabase u otro PostgreSQL)](#base-de-datos)
8. [Correo electrónico (Resend)](#correo-electrónico)
9. [Despliegue](#despliegue)
10. [Seguridad](#seguridad)
11. [Pruebas y resultados](#pruebas-y-resultados)
12. [Lo que debe aportar el propietario](#lo-que-debe-aportar-el-propietario)
13. [Funciones que requieren servicios externos](#funciones-que-requieren-servicios-externos)
14. [Limitaciones conocidas](#limitaciones-conocidas)

---

## Tecnologías

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | **Next.js 16.4** (App Router, Cache Components, Turbopack) | Home estática y ultrarrápida + API y panel en el mismo proyecto |
| UI | React 19.3, **Tailwind CSS 4.3** | Sistema de diseño con tokens |
| Lenguaje | TypeScript 5.9 | Tipado de punta a punta |
| Validación | **zod 4** | El mismo esquema valida en el navegador y en el servidor |
| Base de datos | **PostgreSQL** (`pg`) · **PGlite** en local | Un único dialecto SQL; en local, sin instalar nada |
| Correo | **Resend** (API REST, sin SDK) | Sencillo; si no está configurado, no se simula |
| Anti-bots | Honeypot + tiempo mínimo + límite de peticiones · **Turnstile** opcional | Sin captchas molestos por defecto |
| Animaciones | CSS + IntersectionObserver (sin librerías) | Cero JS extra; respeta `prefers-reduced-motion` |
| Fuentes | Fraunces (titulares) + Instrument Sans (texto), vía `next/font` | Autoalojadas, sin peticiones a Google en tiempo de ejecución |
| Pruebas | Vitest | Lógica de disponibilidad y servicio de reservas contra PostgreSQL real (PGlite) |

Se descartó Framer Motion: las animaciones necesarias (aparición de secciones, hero, menú móvil, galería) se resuelven con CSS (`transform` y `opacity`) sin añadir peso.

---

## Puesta en marcha local

Requisitos: **Node.js ≥ 22.18** (probado con 24.20) y npm.

```bash
npm install
cp .env.example .env.local      # en Windows: copy .env.example .env.local
npm run admin:hash -- "una-contraseña-larga-y-única"
#   → copia ADMIN_PASSWORD_HASH y SESSION_SECRET a .env.local y define ADMIN_EMAIL
npm run dev                     # http://localhost:3000
```

Sin `DATABASE_URL`, la web usa **PGlite**: un PostgreSQL embebido que guarda los datos en `.data/pglite` (ignorado por git). Las reservas persisten entre reinicios. Para empezar de cero, borra la carpeta `.data`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` · `npm start` | Compilación y servidor de producción |
| `npm test` | Pruebas (Vitest) |
| `npm run typecheck` · `npm run lint` | TypeScript y ESLint |
| `npm run admin:hash -- "contraseña"` | Genera `ADMIN_PASSWORD_HASH` y un `SESSION_SECRET` |
| `npm run db:migrate` | Aplica el esquema en la base de datos de `DATABASE_URL` |
| `npm run db:export-sql` | Regenera `db/schema.sql` (para pegarlo en Supabase) |

> Para probar `npm start` en local sin `DATABASE_URL`, añade `ALLOW_EMBEDDED_DB=true` a `.env.local`.

---

## Estructura del proyecto

```
src/
  config/
    site.ts              ← DATOS DEL RESTAURANTE (dirección, teléfono, redes, legal…)
    reservations.ts      ← Horarios, capacidad y políticas de reserva (valores iniciales)
  content/
    copy.ts              ← Textos de todas las secciones
    menu.ts              ← La carta (categorías, platos, precios, alérgenos)
    images.ts            ← Registro de imágenes con texto alternativo y créditos
    testimonials.ts      ← Reseñas verificadas (y ficticias solo para desarrollo)
  assets/images/         ← Fotografías (se optimizan automáticamente)
  app/
    (site)/              ← Web pública: home, privacidad, aviso legal, créditos, gestionar reserva
    admin/               ← Panel: login, reservas, bloqueos, ajustes (+ server actions)
    api/                 ← availability, reservations, hours
    sitemap.ts, robots.ts, opengraph-image.jpg, icon.svg
  components/
    site/                ← Secciones de la web (Hero, Story, Experience, MenuSection…)
    reservations/        ← Formulario, calendario y confirmación
    admin/               ← Componentes del panel
  lib/
    reservations/        ← Dominio: disponibilidad, validación, repositorio, servicio, avisos
    db/                  ← Conexión (PostgreSQL / PGlite) y esquema SQL
    auth/                ← Sesión firmada y verificación de contraseña
    email/               ← Proveedor (Resend) y plantillas
    security/            ← Límite de peticiones, Turnstile, utilidades criptográficas
  proxy.ts               ← Redirección optimista de /admin sin sesión
db/schema.sql            ← Esquema SQL exportado
docs/                    ← Créditos de imágenes y estrategia de imágenes
tests/                   ← Pruebas Vitest
```

---

## Cómo editar el contenido

Todo el contenido está separado del código de los componentes:

- **Datos del negocio** → `src/config/site.ts`. Cada `null` se muestra como «Pendiente de confirmar» y se excluye de los datos estructurados de SEO. Rellena solo con datos reales.
- **Textos** → `src/content/copy.ts`. Son propuestas creativas provisionales: no afirman hechos sobre Maná.
- **Carta** → `src/content/menu.ts`. Está en modo `demo`: platos de ejemplo sin precio, con la etiqueta «Ejemplo». Para publicar la carta real, cambia `status: "official"`, sustituye los platos, quita `demo: true` e indica `price` y, si están verificados, `allergens`. Si hay PDF, ponlo en `public/` y define `menuPdfUrl` en `site.ts`.
- **Fotos** → ver [docs/IMAGENES.md](docs/IMAGENES.md).
- **Reseñas** → `src/content/testimonials.ts`, solo con reseñas reales (`verifiedTestimonials`). Las ficticias únicamente se ven con `npm run dev`.
- **Avisos de «contenido provisional»** → `contentStatus` en `site.ts` (por bloque). Con `showContentNotices: false` desaparecen todos de golpe.
- **Logotipo** → `src/components/ui/Logo.tsx` (ahora es un logotipo tipográfico provisional).

---

## Sistema de reservas

### Flujo del cliente
1. Elige el número de personas (selector −/+; mínimo y máximo configurables).
2. Elige la fecha en un calendario: los días pasados, cerrados, bloqueados o fuera del rango aparecen desactivados.
3. Elige la hora: solo se ofrecen horarios reales, agrupados por servicio («Mediodía», «Noche»). Los completos aparecen tachados.
4. Rellena sus datos y acepta la política de privacidad.
5. Ve una pantalla con nombre, fecha, hora, personas, **estado real** (pendiente o confirmada), referencia, próximos pasos y un enlace privado para consultar o cancelar.

### Reglas de disponibilidad (`src/lib/reservations/availability.ts`)
- **Horario semanal** con varias franjas por día, **horarios especiales** y **cierres por fecha**.
- **Intervalo** entre horarios de llegada, **duración** estimada de cada reserva y **última llegada** antes del cierre.
- **Zona horaria** del restaurante: «hoy» y la **antelación mínima** se calculan en la hora local del restaurante, no en la del visitante.
- **Capacidad**: máximo de comensales **sentados a la vez**, teniendo en cuenta los solapes por duración, y máximo de comensales **por horario de llegada** (ritmo de cocina).
- Cuentan para la capacidad las reservas **pendientes y confirmadas**.
- **Bloqueos** desde el panel (día completo o franja).

### Garantías del servidor (`src/lib/reservations/service.ts`)
- La disponibilidad **se recalcula en el servidor** dentro de una transacción con **bloqueo por fecha** (`pg_advisory_xact_lock`). Dos solicitudes simultáneas no pueden superar la capacidad.
- **Duplicados**: se rechaza una segunda reserva activa el mismo día con el mismo correo o teléfono.
- **Idempotencia**: cada envío lleva una clave única. Un doble clic o un reintento de red no crea dos reservas.
- **Modalidad de confirmación** configurable:
  - `manual` (**por defecto**): la solicitud queda pendiente y el restaurante la confirma en el panel.
  - `auto`: se confirma al instante si hay disponibilidad real.
  - La web nunca muestra «confirmada» si solo se ha enviado una solicitud.

> Se dejó **manual** por defecto porque la capacidad real aún no está verificada. Cambia a automática desde **/admin/ajustes** cuando los valores sean reales.

### Mesas de distintos tamaños
El modelo actual controla la capacidad por número de comensales. Si se necesita asignar mesas concretas, se puede añadir una tabla `tables` y sustituir `fitsCapacity()` por un algoritmo de asignación sin tocar la interfaz.

---

## Panel de administración

`/admin` (protegido con usuario y contraseña definidos en variables de entorno):

- **Reservas**: vista por día, próximos 30 días o pendientes; filtros por estado; búsqueda por nombre, correo, teléfono o referencia; totales de reservas y comensales; datos de contacto con enlaces para llamar o escribir; comentarios del cliente.
- **Acciones**: confirmar, rechazar, cancelar, marcar como completada o «no se presentó». Cada cambio avisa al cliente por correo si el correo está configurado.
- **Registro de notificaciones** por reserva: enviado, fallido o **no enviado** (con el motivo, p. ej. «correo no configurado»).
- **Bloqueos** de días completos o franjas, con motivo interno.
- **Ajustes**: modalidad de confirmación, capacidad, intervalos, duración, antelación, rango de días, zona horaria, horario semanal y cierres u horarios especiales. Tienen prioridad sobre `config/reservations.ts` y se pueden restaurar a los valores del código.

Para revocar todas las sesiones abiertas, cambia `SESSION_SECRET`.

---

## Base de datos

### Opción recomendada: Supabase (o cualquier PostgreSQL)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **Project Settings → Database → Connection string → URI**. Para hosting serverless (Vercel), usa el **Transaction pooler** (puerto 6543).
3. Define `DATABASE_URL` en el hosting. Si tu proveedor usa un certificado propio, configura `DATABASE_CA_CERT` o, como último recurso, `DATABASE_SSL=no-verify`.
4. Aplica el esquema con `npm run db:migrate`, o pega `db/schema.sql` en el **SQL Editor** de Supabase. El esquema también se aplica solo al arrancar.

**Seguridad en Supabase:** el esquema activa **Row Level Security sin políticas** en todas las tablas. Así, las claves públicas de Supabase (`anon` / `authenticated`) **no pueden leer ni escribir nada** a través de su API REST. Solo el servidor de la web accede a los datos, mediante `DATABASE_URL`. **No uses la clave `service_role` en el navegador** y no crees políticas públicas sobre estas tablas.

Tablas: `reservations`, `reservation_blocks`, `app_settings`, `rate_limits` y `notification_log`.

### PGlite (solo local o servidor propio)
Sin `DATABASE_URL` se usa PGlite en `.data/pglite`. En producción está **bloqueado** salvo que se active `ALLOW_EMBEDDED_DB=true`, para evitar perder datos en hostings sin disco persistente. Úsalo solo en un VPS con disco persistente y una única instancia, y haz copias de seguridad de `.data/`.

---

## Correo electrónico

1. Crea una cuenta en [resend.com](https://resend.com) y **verifica tu dominio** (registros DNS).
2. Define `RESEND_API_KEY`, `EMAIL_FROM` (p. ej. `Maná <reservas@tudominio.com>`) y `RESTAURANT_NOTIFICATION_EMAIL`.

Avisos implementados:
- **Cliente:** solicitud recibida o reserva confirmada (con enlace de gestión), confirmación posterior, rechazo, cancelación por el restaurante y cancelación propia.
- **Restaurante:** nueva solicitud o reserva, y cancelación por parte del cliente.

**Sin estas variables no se envía ningún correo y no se simula el envío.** El panel lo indica con un aviso y el registro de cada reserva lo deja anotado. Los correos se envían después de responder al cliente (`after()`), así que un fallo del proveedor nunca deshace una reserva ya guardada.

---

## Despliegue

### Vercel (recomendado)
1. Sube el proyecto a un repositorio **privado** (el `.gitignore` ya excluye `.env*` y `.data`).
2. Importa el repositorio en Vercel.
3. Configura las variables de entorno de `.env.example`, como mínimo: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, y las de correo cuando las tengas.
4. Despliega y conecta el dominio.

### Demo de portafolio en Vercel (sin base de datos externa)

Para enseñar la web con reservas funcionando, sin crear una base de datos:

1. En [vercel.com/new](https://vercel.com/new), importa el repositorio de GitHub (framework: Next.js, sin más ajustes).
2. Añade estas variables de entorno:
   - `ALLOW_EMBEDDED_DB=true`: usa PGlite en `/tmp`.
   - `NEXT_PUBLIC_SITE_URL=https://<tu-proyecto>.vercel.app`
   - Para el panel: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` y `SESSION_SECRET` (generados con `npm run admin:hash`).
3. Despliega. A partir de ahí, cada push crea una vista previa automática.

> En este modo las reservas se guardan en el disco temporal de la función: **se borran cuando Vercel recicla la instancia** y no se comparten entre instancias. Vale para una demo; para datos reales, usa `DATABASE_URL`.

### Servidor propio (Node)
```bash
npm ci && npm run build && npm start   # puerto 3000; usa PORT para cambiarlo
```
Colócalo detrás de un proxy inverso (Nginx o Caddy) con HTTPS. El proxy **debe sobrescribir** `X-Forwarded-For` / `X-Real-IP`, porque el límite de peticiones se basa en ellas.

---

## Seguridad

- **Credenciales** solo en variables de entorno del servidor. Únicamente `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_TURNSTILE_SITE_KEY` llegan al navegador, y ninguna es secreta.
- **Panel**: contraseña con hash **scrypt**; sesión en cookie **firmada (HMAC-SHA256)**, `HttpOnly`, `SameSite=Lax`, `Secure` y prefijo `__Host-` en producción, con caducidad de 8 h. La autorización se comprueba **en el servidor en cada página y acción** (`requireAdmin()`); `proxy.ts` solo hace una redirección optimista. Las server actions de Next.js validan además el origen (protección CSRF).
- **Login**: máximo 5 intentos cada 15 min por IP y por correo; mensajes genéricos sin revelar qué dato falla.
- **Formulario público**: validación con zod en cliente y servidor, límite de tamaño del cuerpo, honeypot, tiempo mínimo de cumplimentación, 5 solicitudes cada 10 min por IP y Turnstile opcional.
- **Privacidad**: se piden solo los datos necesarios. Las IP se guardan anonimizadas (HMAC con sal secreta) solo para el límite de peticiones y se purgan periódicamente. Las páginas de gestión y del panel no se indexan (`noindex`, `robots.txt`), no se cachean (`no-store`) y usan enlaces con token aleatorio de 256 bits, del que solo se guarda el hash SHA-256.
- **Cabeceras**: `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción.

---

## Pruebas y resultados

Ejecutado en Windows 11 con Node 24.20 el 24/10/2026:

| Prueba | Resultado |
|---|---|
| `npm run typecheck` · `npm run lint` | ✅ sin errores |
| `npm run build` | ✅ home estática; panel y gestión con prerenderizado parcial |
| `npm test`: 26 pruebas (zonas horarias, horarios, antelación, cierres, bloqueos, capacidad simultánea y por llegada, duplicados, idempotencia, **8 solicitudes concurrentes con capacidad para 5 → entran exactamente 5**, transiciones de estado, cancelación del cliente) | ✅ 26/26 |
| API contra el servidor de producción local: validaciones (422), honeypot, envío demasiado rápido, fechas pasadas, horas fuera de turno, duplicados (409), idempotencia, límite de peticiones (429), formato no admitido (415) | ✅ |
| **37 comprobaciones en navegador real** (Chrome sin interfaz) a 1440 px y 390 px: imágenes, encabezados, anclas, pestañas de la carta, lightbox con teclado, menú móvil, botón fijo de reserva, sin scroll horizontal, flujo completo de reserva, login, confirmar desde el panel, registro de correo «no enviado», bloqueos, ajustes, cierre de sesión, cancelación con el enlace del cliente, token falso, **0 errores de consola** | ✅ 37/37 |
| Lighthouse escritorio | Rendimiento 97 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |
| Lighthouse móvil (4G lenta simulada) | Rendimiento 85–86 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |

Durante las pruebas se detectaron y corrigieron, entre otros: el borrado de la cookie `__Host-` al cerrar sesión, que no funcionaba; el menú móvil incompleto con «reducir movimiento» activado; y la pérdida del correo tras un login fallido.

---

## Lo que debe aportar el propietario

**Imprescindible antes de publicar**
- [ ] Dirección exacta (opcional: hoy se muestra solo la comuna y un mapa de Las Condes)
- [ ] Teléfono, WhatsApp y correo de contacto
- [ ] **Horarios reales** de apertura y de reservas, días de cierre y festivos
- [ ] **Capacidad real** (comensales simultáneos), duración media de una mesa, intervalo entre turnos y ritmo de llegadas
- [ ] Mínimo y máximo de personas por reserva online y política para grupos grandes
- [ ] Antelación mínima y hasta cuántos días se puede reservar
- [ ] Confirmación **automática o manual**
- [x] Ubicación general: **Las Condes, Región Metropolitana, Chile** (sin dirección exacta), zona horaria `America/Santiago`, precios en **USD**
- [ ] Razón social, identificación fiscal y domicilio (aviso legal), y revisión legal de la **política de privacidad**
- [ ] Plazo de conservación de los datos de reservas
- [ ] Dominio definitivo

**Contenido**
- [ ] La **carta oficial**: platos, descripciones, precios y alérgenos verificados (o PDF)
- [ ] Historia real de Maná, filosofía y propuesta gastronómica
- [ ] **Fotografía propia** de platos, sala y equipo (sustituirá a las ilustrativas)
- [ ] Logotipo, si existe
- [ ] Redes sociales y enlace para dejar reseñas
- [ ] Reseñas reales con permiso, o citadas de una fuente pública

---

## Funciones que requieren servicios externos

| Función | Servicio | Variables | Sin configurar… |
|---|---|---|---|
| Base de datos de producción | Supabase / PostgreSQL | `DATABASE_URL` (+ `DATABASE_SSL`, `DATABASE_CA_CERT`) | En producción la web se niega a usar la base embebida; las reservas muestran un error claro |
| Correos | Resend | `RESEND_API_KEY`, `EMAIL_FROM`, `RESTAURANT_NOTIFICATION_EMAIL` | Las reservas funcionan, pero no se envía ningún correo (queda registrado) |
| Panel | — | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | El login muestra «acceso no configurado» |
| Anti-bots avanzado (opcional) | Cloudflare Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Se usan honeypot, tiempo mínimo y límite de peticiones |
| Mapa | Google Maps (iframe) | `contact.mapEmbedUrl` en `site.ts` | Se muestra «Mapa próximamente» |
| Imágenes con IA (opcional) | Proveedor de imágenes, **no** la API de Claude | p. ej. `OPENAI_API_KEY` | No se usa; ver docs/IMAGENES.md |

---

## Limitaciones conocidas

- **Contenido provisional:** textos, carta, fotos, horario y capacidad son provisionales y lo indican en la web. Las fotos son de banco de imágenes y no muestran Maná.
- **PostgreSQL real no probado en este entorno:** las pruebas usan PGlite (PostgreSQL 18 compilado a WASM), que comparte dialecto y semántica con PostgreSQL, pero con **una sola conexión**. El bloqueo `pg_advisory_xact_lock`, que serializa reservas concurrentes entre varias conexiones, está implementado pero **no se ha probado contra un servidor PostgreSQL multiconexión**. Conviene repetir la prueba de concurrencia tras conectar Supabase.
- **Correo no probado de extremo a extremo:** la integración con Resend sigue su documentación oficial, pero sin clave no se ha podido enviar un correo real.
- **Turnstile** está implementado, pero no se ha probado con claves reales.
- **Sesiones sin estado:** cerrar sesión borra la cookie, pero una cookie copiada sigue siendo válida hasta caducar (8 h). Para revocarlas todas, cambia `SESSION_SECRET`.
- **IP del cliente:** el límite de peticiones confía en `X-Forwarded-For`. En Vercel lo fija la plataforma; en un servidor propio, el proxy debe sobrescribirla.
- **Modificar una reserva** (fecha u hora) no está implementado: hoy se cancela y se crea otra. Tampoco se crean reservas manuales (telefónicas) desde el panel.
- **Retención de datos:** no hay purga automática de reservas antiguas; queda pendiente de definir el plazo legal.
- **Rendimiento móvil (85–86):** el límite es la descarga de la fuente de titulares en conexiones lentas. Se puede mejorar sustituyendo la cursiva por una sintética o con un subconjunto propio de la fuente.
- **Referencias de diseño:** faithibiza.com y qissa.co.uk se consultaron como **texto extraído** (estructura, secciones y contenido). No se pudo inspeccionar su diseño renderizado (tipografías, colores, animaciones), así que la dirección de arte es una propuesta original basada en esa estructura y en el briefing.
