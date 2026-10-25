import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession, isAdminConfigured } from "@/lib/auth/session";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Acceso" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo variant="stacked" size="lg" />
          <h1 className="mt-6 text-3xl">Panel de reservas</h1>
        </div>
        <div className="mt-10">
          <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-sand" />}>
            <LoginGate />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function LoginGate() {
  if (await getAdminSession()) redirect("/admin");
  if (!isAdminConfigured()) {
    return (
      <div role="note" className="rounded-lg border border-dashed border-terracotta/60 p-5 text-[0.9375rem] leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">Acceso no configurado</p>
        <p className="mt-2">
          Define <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code> y <code>SESSION_SECRET</code> en las variables de entorno del servidor. Genera el hash
          con <code>npm run admin:hash -- &quot;tu contraseña&quot;</code>. Consulta el README.
        </p>
      </div>
    );
  }
  return <LoginForm />;
}
