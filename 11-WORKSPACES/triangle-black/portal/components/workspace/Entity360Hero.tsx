// @ts-nocheck
type Entity360HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  badges: string[];
};

export function Entity360Hero({ eyebrow, title, subtitle, badges }: Entity360HeroProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
      <div className="p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-secondary">
          {subtitle}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-base-alt px-3 py-2 text-xs font-medium text-primary"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
