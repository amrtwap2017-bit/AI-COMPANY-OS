import { LoadingState } from "@/components/ui";

export default function AnalyticsLoading() {
  return (
    <div className="px-4 sm:px-6 py-5">
      <LoadingState type="cards" rows={8} cols={4} />
    </div>
  );
}
