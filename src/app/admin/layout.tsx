import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel de reservas", template: "%s · Panel Maná" },
  robots: { index: false, follow: false },
};

// El panel depende de la sesión: siempre se resuelve en el servidor en cada petición.
export const instant = false;

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-linen text-ink">{children}</div>;
}
