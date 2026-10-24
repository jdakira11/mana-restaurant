import { z } from "zod";
import { isValidDate, TIME_RE } from "./time";

/** Validación compartida por el formulario (cliente) y la API (servidor). */
export const reservationRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre y apellido")
    .max(80, "El nombre es demasiado largo")
    .regex(/^[^<>{}]+$/, "El nombre contiene caracteres no permitidos"),
  email: z.string().trim().toLowerCase().max(160, "El correo es demasiado largo").email("Escribe un correo electrónico válido"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,22}$/, "Escribe un teléfono válido (puedes incluir el prefijo internacional)")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Escribe un teléfono válido"),
  date: z.string().refine(isValidDate, "Elige una fecha"),
  time: z.string().regex(TIME_RE, "Elige un horario"),
  partySize: z.coerce.number().int("Número de personas no válido").min(1, "Indica el número de personas").max(100),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional().default(""),
  privacy: z.literal(true, { error: "Debes aceptar la política de privacidad" }),
  /** Clave única por intento de envío: evita duplicados por doble clic o reintentos de red. */
  idempotencyKey: z.string().uuid(),
  /** Campo trampa (honeypot): las personas no lo ven; si llega relleno, es un bot. */
  website: z.string().max(0).optional().default(""),
  /** Momento (ms) en que se mostró el formulario. Envíos en menos de 3 s se consideran automatizados. */
  startedAt: z.coerce.number().int().positive(),
  turnstileToken: z.string().max(4096).optional(),
});

export type ReservationRequest = z.infer<typeof reservationRequestSchema>;
export type ReservationRequestInput = z.input<typeof reservationRequestSchema>;

export type ReservationStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed" | "no_show";

export const ACTIVE_STATUSES: ReservationStatus[] = ["pending", "confirmed"];

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  declined: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No se presentó",
};

/** Respuesta pública tras crear una reserva (sin datos sensibles). */
export interface ReservationReceipt {
  reference: string;
  status: ReservationStatus;
  name: string;
  date: string;
  time: string;
  partySize: number;
  manageUrl: string;
  /** Indica si hay un proveedor de correo configurado (para no prometer emails que no se enviarán). */
  emailNotifications: boolean;
  /** Solo en la vista previa estática: la reserva no se ha guardado ni enviado. */
  demo?: boolean;
}
