// @ts-nocheck
type RelationshipCard = {
  title: string;
  value: string;
  detail: string;
  links: string[];
};

type RelationshipGridProps = {
  title: string;
  subtitle: string;
  items: RelationshipCard[];
};

export function RelationshipGrid({ title, subtitle, items }: RelationshipGridProps) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm text-secondary">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item: any) => (
          <div key={item.title} className="rounded-2xl border border-border bg-base-alt p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-primary">{item.title}</div>
              <div className="text-2xl font-semibold tracking-tight text-primary">{item.value}</div>
            </div>

            <div className="mt-3 text-sm leading-6 text-secondary">{item.detail}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.links.map((link: any) => (
                <span
                  key={link}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs text-primary"
                >
                  {link}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
