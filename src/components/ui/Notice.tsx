import { siteConfig } from "@/config/site";

/** Etiqueta discreta que señala contenido provisional. Se desactiva con `siteConfig.showContentNotices`. */
export function ProvisionalTag({ children = "Contenido provisional", show = true, className = "" }: { children?: React.ReactNode; show?: boolean; className?: string }) {
  if (!siteConfig.showContentNotices || !show) return null;
  return <span className={`notice-tag ${className}`}>{children}</span>;
}

/** Valor pendiente de recibir del propietario. */
export function Pending({ label = "Pendiente de confirmar" }: { label?: string }) {
  return <span className="italic opacity-70">{label}</span>;
}
