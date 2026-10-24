export function LegalPage({ title, children, notice }: { title: string; children: React.ReactNode; notice?: React.ReactNode }) {
  return (
    <article className="container-x pb-24 pt-32 md:pb-36 md:pt-44">
      <div className="mx-auto max-w-3xl">
        <h1 className="display-md">{title}</h1>
        {notice && (
          <div role="note" className="mt-8 rounded-lg border border-dashed border-terracotta/60 bg-linen px-5 py-4 text-[0.9375rem] text-ink-soft">
            {notice}
          </div>
        )}
        <div className="mt-10 space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft [&_a]:text-terracotta [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_mark]:rounded [&_mark]:bg-brass/25 [&_mark]:px-1 [&_mark]:text-ink">
          {children}
        </div>
      </div>
    </article>
  );
}
