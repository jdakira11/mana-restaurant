import { LogoMark } from "@/components/ui/Logo";

/** Encabezado centrado de sección: emblema, antetítulo, título y entradilla opcional. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  tag,
  className = "",
  as: Heading = "h2",
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tag?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <header className={`mx-auto flex max-w-3xl flex-col items-center text-center ${className}`}>
      <LogoMark className="h-9 w-auto text-brass" data-reveal />
      <p className="eyebrow eyebrow-center mt-5" data-reveal>
        {eyebrow}
      </p>
      {tag && (
        <div className="mt-4" data-reveal>
          {tag}
        </div>
      )}
      <Heading id={id} className="display-lg mt-5" data-reveal>
        {title}
      </Heading>
      {intro && (
        <div className="mt-5 max-w-2xl text-lg leading-relaxed opacity-80" data-reveal>
          {intro}
        </div>
      )}
    </header>
  );
}
