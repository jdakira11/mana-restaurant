import { siteConfig } from "@/config/site";

/**
 * Logotipo tipográfico provisional. Si Maná tiene logotipo propio, sustitúyelo aquí
 * (p. ej. por un <Image> o un SVG) y se actualizará en toda la web.
 */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" | "xl" }) {
  const sizes = { md: "text-[2.6rem]", lg: "text-6xl", xl: "text-[clamp(5rem,19vw,14rem)]" };
  return (
    <span
      className={`font-script leading-none ${sizes[size]} ${className}`}
    >
      {siteConfig.name}
    </span>
  );
}
