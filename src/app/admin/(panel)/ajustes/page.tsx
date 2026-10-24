import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth/session";
import { getReservationSettings } from "@/lib/reservations/settings-store";

export const metadata: Metadata = { title: "Ajustes" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-4xl">Ajustes de reservas</h1>
      <p className="mt-2 max-w-2xl text-ink-mute">
        Estos valores tienen prioridad sobre <code>src/config/reservations.ts</code>. Los valores iniciales son provisionales: ajústalos a la capacidad y al horario
        reales del restaurante antes de activar la confirmación automática.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-sand" />}>
          <Settings />
        </Suspense>
      </div>
    </div>
  );
}

async function Settings() {
  await requireAdmin();
  const settings = await getReservationSettings();
  return <SettingsForm settings={settings} />;
}
