import { siteConfig, type SocialNetwork } from "@/config/site";

const LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  tripadvisor: "Tripadvisor",
  google: "Google",
};

/** Enlaces a redes sociales. Solo se muestran las que estén configuradas en `siteConfig.social`. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const entries = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url)) as [SocialNetwork, string][];
  if (entries.length === 0) return <p className={`text-sm italic opacity-70 ${className}`}>Redes sociales próximamente.</p>;
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-[0.14em] ${className}`}>
      {entries.map(([network, url]) => (
        <li key={network}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="link-underline">
            {LABELS[network]}
          </a>
        </li>
      ))}
    </ul>
  );
}
