// @ts-nocheck
import Link from "next/link";

type EntityPillProps = {
  basePath: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  label?: string;
};

export function buildEntityHref(basePath: string, entityType: string, entityId?: string, entityName?: string) {
  const params = new URLSearchParams();
  params.set("entity", entityType);
  if (entityId) params.set("id", entityId);
  if (entityName) params.set("name", entityName);
  return `${basePath}?${params.toString()}`;
}

export function EntityPill({
  basePath,
  entityType,
  entityId,
  entityName,
  label = "Open Context",
}: EntityPillProps) {
  return (
    <Link
      href={buildEntityHref(basePath, entityType, entityId, entityName)}
      className="inline-flex rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-primary transition hover:border-border hover:bg-base-alt"
    >
      {label}
    </Link>
  );
}
