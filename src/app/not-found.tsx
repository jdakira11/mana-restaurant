import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="on-dark flex min-h-dvh flex-col items-center justify-center bg-olive-deep px-6 text-center text-linen">
      <Logo variant="stacked" size="lg" />
      <h1 className="display-md mt-10">Esta mesa no existe</h1>
      <p className="mt-4 max-w-md text-linen/75">La página que buscas no está disponible. Volvamos al inicio.</p>
      <Link href="/" className="btn btn-primary mt-10">
        Ir al inicio
      </Link>
    </main>
  );
}
