import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación optimista: sin cookie de sesión, /admin redirige al login con un 307 real.
 * NO es la autorización: la sesión se verifica (firma y caducidad) en el servidor en cada
 * página y acción del panel mediante `requireAdmin()`.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("__Host-mana_admin") || request.cookies.has("mana_admin");
  if (!hasSession) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
