// @ts-nocheck
"use client";

import { FollowUpState } from "../../lib/inbox-workflow";

type InboxItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  unread: boolean;
  acknowledged: boolean;
  followUp: FollowUpState;
};

type NotificationInboxPanelProps = {
  title: string;
  subtitle: string;
  items: InboxItem[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleAcknowledged: (id: string, next: boolean) => void;
  onSetFollowUp: (id: string, next: FollowUpState) => void;
};

function toneClasses(item: InboxItem) {
  if (item.followUp === "done") return "border-emerald-200 bg-emerald-50";
  if (item.followUp === "in_progress") return "border-amber-200 bg-amber-50";
  if (item.unread) return "border-sky-200 bg-sky-50";
  return "border-stone-200 bg-slate-50";
}

export function NotificationInboxPanel(props: NotificationInboxPanelProps) {
  const {
    title,
    subtitle,
    items,
    onMarkRead,
    onDelete,
    onToggleAcknowledged,
    onSetFollowUp,
  } = props;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Notification Inbox
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-stone-200 bg-slate-50 px-4 py-8 text-sm text-secondary">
          No notifications are currently available.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.id} className={"rounded-2xl border p-4 " + toneClasses(item)}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-secondary">
                      {item.type} {item.unread ? "• unread" : "• read"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.acknowledged ? "acknowledged" : "unacknowledged"}
                    </span>
                    <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.followUp}
                    </span>
                  </div>
                </div>

                <div className="text-sm leading-6 text-slate-700">{item.message}</div>

                <div className="flex flex-wrap gap-2">
                  {item.unread ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead(item.id)}
                      className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                    >
                      Mark read
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onToggleAcknowledged(item.id, !item.acknowledged)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {item.acknowledged ? "Unacknowledge" : "Acknowledge"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetFollowUp(item.id, "planned")}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    Plan
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetFollowUp(item.id, "in_progress")}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    In Progress
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetFollowUp(item.id, "done")}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    Done
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
