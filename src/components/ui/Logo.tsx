import { siteConfig } from "@/config/site";

/**
 * Logotipo tipográfico provisional. Si Maná tiene logotipo propio, sustitúyelo aquí
 * (p. ej. por un <Image> o un SVG) y se actualizará en toda la web.
 */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" | "xl" }) {
  const sizes = { md: "text-[1.75rem]", lg: "text-5xl", xl: "text-[clamp(4rem,16vw,12rem)]" };
  return (
    <span
      className={`font-display leading-none tracking-[-0.02em] ${sizes[size]} ${className}`}
      style={{ fontVariationSettings: '"SOFT" 100' }}
    >
      {siteConfig.name}
    </span>
  );
}
