// @ts-nocheck
"use client";
export default function Error({error,reset}:{error:Error;reset:()=>void}) {
  return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-red-400 mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white">
        Retry
      </button>
    </div>
  );
}
