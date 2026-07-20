// @ts-nocheck
export type FollowUpState = "none" | "planned" | "in_progress" | "done";

export type InboxWorkflowState = {
  acknowledged: boolean;
  followUp: FollowUpState;
  updatedAt: string;
};

const KEY = "tb_inbox_workflow_state";
export const INBOX_WORKFLOW_EVENT = "tb-inbox-workflow-change";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readMap(): Record<string, InboxWorkflowState> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writeMap(data: Record<string, InboxWorkflowState>) {
  if (!canUseStorage()) return;
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(INBOX_WORKFLOW_EVENT));
}

export function getWorkflowState(id: string): InboxWorkflowState {
  const map = readMap();
  return (
    map[id] || {
      acknowledged: false,
      followUp: "none",
      updatedAt: "",
    }
  );
}

export function setAcknowledged(id: string, value = true) {
  const map = readMap();
  const current = getWorkflowState(id);

  map[id] = {
    ...current,
    acknowledged: value,
    updatedAt: new Date().toISOString(),
  };

  writeMap(map);
}

export function setFollowUp(id: string, followUp: FollowUpState) {
  const map = readMap();
  const current = getWorkflowState(id);

  map[id] = {
    ...current,
    followUp,
    updatedAt: new Date().toISOString(),
  };

  writeMap(map);
}

export function clearWorkflowState(id: string) {
  const map = readMap();
  delete map[id];
  writeMap(map);
}
