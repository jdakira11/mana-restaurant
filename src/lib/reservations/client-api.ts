import { defaultReservationSettings } from "@/config/reservations";
import { openDatesBetween, slotsFor } from "./availability";
import type { ReservationReceipt } from "./request-schema";
import type { PublicReservationSettings } from "./settings-schema";
import { nowInTimezone } from "./time";

export interface SlotView {
  time: string;
  service: string;
  available: boolean;
  reason: "available" | "full" | "too_soon" | "blocked";
}

export interface MonthResponse {
  today: string;
  dates: { date: string; open: boolean }[];
  settings: PublicReservationSettings;
}

export type SubmitResult =
  | { ok: true; reservation: ReservationReceipt }
  | { ok: false; status: number; error: string; code?: string; fieldErrors?: Record<string, string> };

export interface ReservationClient {
  /** `true` en la vista previa estática: nada se guarda ni se envía. */
  demo: boolean;
  month(from: string, days: number, signal?: AbortSignal): Promise<MonthResponse>;
  slots(date: string, partySize: number, signal?: AbortSignal): Promise<SlotView[]>;
  submit(payload: Record<string, unknown>): Promise<SubmitResult>;
}

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Error");
  return data;
}

const httpClient: ReservationClient = {
  demo: false,
  month: async (from, days, signal) => readJson(await fetch(`/api/availability?from=${from}&days=${days}`, { signal })),
  slots: async (date, partySize, signal) => (await readJson(await fetch(`/api/availability?date=${date}&party=${partySize}`, { signal }))).slots,
  submit: async (payload) => {
    const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.reservation) return { ok: true, reservation: data.reservation };
    return { ok: false, status: res.status, error: data.error ?? "No hemos podido enviar la solicitud. Inténtalo de nuevo.", code: data.code, fieldErrors: data.fieldErrors };
  },
};

/**
 * Vista previa sin servidor (GitHub Pages): calcula la disponibilidad en el navegador con la
 * configuración de `config/reservations.ts` y devuelve una confirmación marcada como demostración.
 */
const settings = defaultReservationSettings;
const publicSettings: PublicReservationSettings = {
  timezone: settings.timezone,
  confirmationMode: settings.confirmationMode,
  partySize: settings.partySize,
  maxDaysAhead: settings.maxDaysAhead,
};

const demoClient: ReservationClient = {
  demo: true,
  month: async (from, days) => {
    const now = nowInTimezone(settings.timezone);
    return { today: now.date, dates: openDatesBetween(from, days, settings, [], now), settings: publicSettings };
  },
  slots: async (date, partySize) =>
    slotsFor({ date, partySize, settings, reservations: [], blocks: [], now: nowInTimezone(settings.timezone) }).map((s) => ({
      time: s.time,
      service: s.service,
      available: s.status === "available",
      reason: s.status,
    })),
  submit: async (payload) => {
    await new Promise((r) => setTimeout(r, 700));
    return {
      ok: true,
      reservation: {
        reference: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: settings.confirmationMode === "auto" ? "confirmed" : "pending",
        name: String(payload.name),
        date: String(payload.date),
        time: String(payload.time),
        partySize: Number(payload.partySize),
        manageUrl: "",
        emailNotifications: false,
        demo: true,
      },
    };
  },
};

export const reservationClient: ReservationClient = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1" ? demoClient : httpClient;
