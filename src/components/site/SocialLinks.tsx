import { siteConfig, type SocialNetwork } from "@/config/site";

const LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  tripadvisor: "Tripadvisor",
  google: "Google",
};

const ICONS: Partial<Record<SocialNetwork, React.ReactNode>> = {
  instagram: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.4 2.3 1.9 3.9 4.2 4.1v3.2c-1.6 0-3-.5-4.2-1.3v6.5a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.3a2.5 2.5 0 1 0 1.7 2.3V3h3.1z" />
    </svg>
  ),
};

/** Botones de redes sociales configuradas en `siteConfig.social`. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const entries = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url)) as [SocialNetwork, string][];
  if (entries.length === 0) return <p className={`text-sm italic opacity-70 ${className}`}>Redes sociales próximamente.</p>;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {entries.map(([network, url]) => (
        <li key={network}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteConfig.name} en ${LABELS[network]}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-current/30 px-4 text-sm font-semibold transition-colors duration-300 hover:border-terracotta hover:bg-terracotta hover:text-linen"
          >
            {ICONS[network]}
            {LABELS[network]}
          </a>
        </li>
      ))}
    </ul>
  );
}
