// @ts-nocheck
export type WorkspaceEntity = {
  entityType: string;
  entityId: string;
  entityName: string;
  href: string;
  contextPath?: string;
  notedAt: string;
};

const RECENT_KEY = "tb_workspace_recent_entities";
const PINNED_KEY = "tb_workspace_pinned_entities";
export const WORKSPACE_MEMORY_EVENT = "tb-workspace-memory-change";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function entityKey(entity: WorkspaceEntity) {
  return [entity.entityType, entity.entityId, entity.entityName].join("::");
}

function readList(key: string): WorkspaceEntity[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: WorkspaceEntity[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(WORKSPACE_MEMORY_EVENT));
}

export function listRecentEntities() {
  return readList(RECENT_KEY);
}

export function listPinnedEntities() {
  return readList(PINNED_KEY);
}

export function isPinnedEntity(entity: WorkspaceEntity) {
  return listPinnedEntities().some((item) => entityKey(item) === entityKey(entity));
}

export function pushRecentEntity(entity: WorkspaceEntity) {
  const current = listRecentEntities();
  const next = [
    entity,
    ...current.filter((item) => entityKey(item) !== entityKey(entity)),
  ].slice(0, 24);

  writeList(RECENT_KEY, next);
}

export function togglePinnedEntity(entity: WorkspaceEntity) {
  const current = listPinnedEntities();
  const exists = current.some((item) => entityKey(item) === entityKey(entity));

  const next = exists
    ? current.filter((item) => entityKey(item) !== entityKey(entity))
    : [entity, ...current].slice(0, 24);

  writeList(PINNED_KEY, next);
  return !exists;
}
