import Link from "next/link";
import { logoutAction } from "../actions";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "/admin", label: "Reservas" },
  { href: "/admin/bloqueos", label: "Bloqueos" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-linen/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute">Panel</span>
          </div>
          <nav aria-label="Panel" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm font-medium hover:bg-sand">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="link-underline text-ink-mute">
              Ver web
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="link-underline font-medium">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 md:py-12">{children}</main>
    </>
  );
}
