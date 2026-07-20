// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleWorkbenchHero } from "../../../../components/workspace/RoleWorkbenchHero";
import { WorkbenchSummaryGrid } from "../../../../components/workspace/WorkbenchSummaryGrid";
import { ActionQueueList } from "../../../../components/workspace/ActionQueueList";
import { InsightStack } from "../../../../components/workspace/InsightStack";
import { NotificationInboxPanel } from "../../../../components/workspace/NotificationInboxPanel";
import { inboxApi } from "../../../../lib/inbox-api";
import {
  FollowUpState,
  getWorkflowState,
  INBOX_WORKFLOW_EVENT,
  setAcknowledged,
  setFollowUp,
} from "../../../../lib/inbox-workflow";
import { toList } from "../../../../lib/enterprise-format";

function getUserRole() {
  if (typeof window === "undefined") return "unknown";
  try {
    const raw = localStorage.getItem("tb_user");
    if (!raw) return "unknown";
    const user = JSON.parse(raw);
    return user?.role || "unknown";
  } catch {
    return "unknown";
  }
}

function isUnread(item: any) {
  if (typeof item?.is_read === "boolean") return !item.is_read;
  if (typeof item?.read === "boolean") return !item.read;
  if (item?.read_at) return false;
  return true;
}

export default function InboxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState("unknown");

  async function load() {
    const res = await inboxApi.list();
    const data = toList(res.data);

    const normalized = data.map((item: any, index: number) => {
      const id = String(item?.id || `notification-${index}`);
      const workflow = getWorkflowState(id);

      return {
        id,
        title: String(item?.title || item?.type || "Notification"),
        message: String(item?.message || item?.detail || "No detail available"),
        type: String(item?.type || item?.notification_type || "system"),
        unread: isUnread(item),
        acknowledged: workflow.acknowledged,
        followUp: workflow.followUp,
      };
    });

    setItems(normalized);
    setRole(getUserRole());
  }

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await load();
    })();

    function onWorkflowChange() {
      load();
    }

    window.addEventListener(INBOX_WORKFLOW_EVENT, onWorkflowChange);
    return () => {
      active = false;
      window.removeEventListener(INBOX_WORKFLOW_EVENT, onWorkflowChange);
    };
  }, []);

  async function markRead(id: string) {
    try {
      await inboxApi.markRead(id);
    } catch {}
    await load();
  }

  async function deleteItem(id: string) {
    try {
      await inboxApi.remove(id);
    } catch {}
    await load();
  }

  function toggleAck(id: string, next: boolean) {
    setAcknowledged(id, next);
    load();
  }

  function updateFollowUp(id: string, next: FollowUpState) {
    setFollowUp(id, next);
    load();
  }

  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items]);
  const acknowledgedCount = useMemo(() => items.filter((item) => item.acknowledged).length, [items]);
  const plannedCount = useMemo(() => items.filter((item) => item.followUp === "planned").length, [items]);
  const inProgressCount = useMemo(() => items.filter((item) => item.followUp === "in_progress").length, [items]);
  const doneCount = useMemo(() => items.filter((item) => item.followUp === "done").length, [items]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Inbox"
        title="Role Inbox"
        subtitle="A role-oriented notification inbox for acknowledgment, follow-up, and daily operational control."
        badges={[
          `Role: ${role}`,
          "Notifications",
          "Acknowledge",
          "Follow-up",
        ]}
      />

      <WorkbenchSummaryGrid
        title="Inbox Summary"
        subtitle="Use the inbox as the role-level surface for immediate attention and follow-up tracking."
        items={[
          { label: "Unread", value: String(unreadCount), detail: "Notifications that still need review" },
          { label: "Acknowledged", value: String(acknowledgedCount), detail: "Notifications that were explicitly acknowledged" },
          { label: "Planned", value: String(plannedCount), detail: "Items marked for follow-up planning" },
          { label: "In Progress", value: String(inProgressCount), detail: "Items actively being worked" },
          { label: "Done", value: String(doneCount), detail: "Items marked as completed" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ActionQueueList
          title="Inbox Routing Actions"
          subtitle="Move from inbox review into the right enterprise workspace."
          items={[
            { title: "Open Alerts Center", value: "Now", detail: "Review escalations and enterprise attention items.", href: "/alerts", tone: "warning" },
            { title: "Open Recommendations", value: "Now", detail: "Review cross-object next actions.", href: "/recommendations", tone: "success" },
            { title: "Open Workspace Hub", value: "Now", detail: "Resume work from pinned or recent entities.", href: "/workspace", tone: "neutral" },
            { title: "Open My Day", value: "Now", detail: "Return to your daily command surface.", href: "/workspace/my-day", tone: "neutral" },
          ]}
        />

        <InsightStack
          title="Inbox Guidance"
          subtitle="How to use the inbox as an execution and coordination surface."
          items={[
            {
              title: "Read first, then acknowledge",
              detail: "Use acknowledgment to signal that ownership has been accepted.",
            },
            {
              title: "Use follow-up states intentionally",
              detail: "Move items from planned to in progress to done as the real-world work changes.",
            },
            {
              title: "Route into the right workspace",
              detail: "Use alerts, recommendations, and 360 pages when a notification needs deeper investigation.",
            },
          ]}
        />
      </div>

      <NotificationInboxPanel
        title="Current Notifications"
        subtitle="Review, acknowledge, and track follow-up state on current role notifications."
        items={items}
        onMarkRead={markRead}
        onDelete={deleteItem}
        onToggleAcknowledged={toggleAck}
        onSetFollowUp={updateFollowUp}
      />
    </div>
  );
}
