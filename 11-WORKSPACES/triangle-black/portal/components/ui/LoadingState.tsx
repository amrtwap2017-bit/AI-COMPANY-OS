// @ts-nocheck
// Triangle Black - Loading State
// UI-000: Fixed grid-cols dynamic 
class (Tailwind purge bug)
interface Props {
  message?: string;
  rows?:    number;
  cols?:    2 | 3 | 4 | 5;
  type?:    "table" | "cards" | "detail" | "list";
}

const GRID: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
};

export function LoadingState({ rows = 5, cols = 4, type = "table" }: Props) {
  if (type === "cards") {
    return (
      <div className={"grid gap-4 " + (GRID[cols] || GRID[4])}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-5">
            <div className="h-3 skeleton w-2/3 mb-3" />
            <div className="h-8 skeleton w-1/2 mb-2" />
            <div className="h-3 skeleton w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border">
            <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5">
              <div className="skeleton h-3 w-2/3 mb-3" />
              <div className="skeleton h-7 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-divider">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-4 flex-1" style={{ opacity: 1 - j * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
