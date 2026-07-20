// @ts-nocheck
import Link from "next/link";

type ActionQueueItem = {
  title: string;
  value: string;
  detail: string;
  href?: string;
  tone?: "neutral" | "success" | "warning";
};

type ActionQueueListProps = {
  title: string;
  subtitle: string;
  items: ActionQueueItem[];
};

function toneClasses(tone?: ActionQueueItem["tone"]) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50";
  if (tone === "warning") return "border-amber-200 bg-amber-50";
  return "border-slate-200 bg-slate-50";
}

export function ActionQueueList({ title, subtitle, items }: ActionQueueListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const content = (
            <div className={"rounded-2xl border p-4 " + toneClasses(item.tone)}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">{item.value}</div>
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.title + item.href} href={item.href} className="block transition hover:opacity-95">
                {content}
              </Link>
            );
          }

          return <div key={item.title}>{content}</div>;
        })}
      </div>
    </section>
  );
}
