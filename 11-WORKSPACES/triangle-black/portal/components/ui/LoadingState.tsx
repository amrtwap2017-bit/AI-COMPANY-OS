// @ts-nocheck
interface Props { message?: string; rows?: number; cols?: number; type?: "table"|"cards"|"detail" }
export function LoadingState({ rows = 5, cols = 4, type = "table" }: Props) {
  if (type === "cards") {
    return (
      <div className={`grid grid-cols-${cols} gap-4`}>
        {Array.from({length:rows}).map((_,i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-2/3 mb-3" />
            <div className="h-8 bg-slate-100 rounded-xl animate-pulse w-1/2 mb-2" />
            <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    );
  }
  if (type === "detail") {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-100 rounded-xl animate-pulse w-1/3" />
        <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-1/2" />
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3 mb-3" />
              <div className="h-7 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {Array.from({length:rows}).map((_,i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-slate-50">
          {Array.from({length:cols}).map((_,j) => (
            <div key={j} className="h-4 bg-slate-100 rounded-lg animate-pulse flex-1" style={{opacity:1-j*0.1}} />
          ))}
        </div>
      ))}
    </div>
  );
}
