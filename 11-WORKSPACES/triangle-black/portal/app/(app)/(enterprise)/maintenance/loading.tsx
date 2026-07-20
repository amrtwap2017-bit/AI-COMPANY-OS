import { LoadingState } from "@/components/ui";

export default function MaintenanceLoading() {
  return (
    <div className="px-4 sm:px-6 py-5">
      <LoadingState type="cards" rows={4} cols={4} />
    </div>
  );
}
