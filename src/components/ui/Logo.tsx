import { siteConfig } from "@/config/site";

/**
 * Logotipo de Maná: emblema de arco apuntado con estrella de ocho puntas + nombre en caligrafía.
 * Emblema provisional en SVG (nítido a cualquier tamaño). Para usar un logo definitivo,
 * sustituye `LogoMark` y se actualizará en toda la web.
 */
export function LogoMark({ className = "", ...rest }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden {...rest}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 76V38C7 21 20 9 32 3c12 6 25 18 25 35v38" strokeWidth="2.2" />
        <path d="M14 76V39c0-12.5 9.5-22 18-26.5 8.5 4.5 18 14 18 26.5v37" strokeWidth="1.2" opacity="0.7" />
        <path d="M2 76.5h60" strokeWidth="2.2" />
        <g transform="translate(32 47)" strokeWidth="1.5">
          <rect x="-8" y="-8" width="16" height="16" />
          <rect x="-8" y="-8" width="16" height="16" transform="rotate(45)" />
          <circle r="2.6" fill="currentColor" stroke="none" />
        </g>
        <circle cx="32" cy="3" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

type Variant = "inline" | "stacked";

export function Logo({ className = "", variant = "inline", size = "md" }: { className?: string; variant?: Variant; size?: "md" | "lg" | "xl" }) {
  if (variant === "stacked") {
    const mark = { md: "h-14", lg: "h-20", xl: "h-24 md:h-32" }[size];
    const word = { md: "text-6xl", lg: "text-7xl md:text-8xl", xl: "text-[clamp(5.5rem,17vw,10rem)]" }[size];
    return (
      <span className={`inline-flex flex-col items-center ${className}`}>
        <LogoMark className={`${mark} w-auto text-brass`} />
        <span className={`font-script mt-1 leading-none ${word}`}>{siteConfig.name}</span>
      </span>
    );
  }
  const mark = { md: "h-9", lg: "h-12", xl: "h-16" }[size];
  const word = { md: "text-[2.4rem]", lg: "text-6xl", xl: "text-7xl" }[size];
  return (
    <span className={`inline-flex items-end gap-2.5 ${className}`}>
      <LogoMark className={`${mark} w-auto shrink-0 text-brass`} />
      <span className={`font-script leading-[0.8] ${word}`}>{siteConfig.name}</span>
    </span>
  );
}
