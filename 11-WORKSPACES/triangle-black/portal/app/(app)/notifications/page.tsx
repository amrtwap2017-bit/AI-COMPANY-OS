// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface Notification {
  id:      string;
  type:    "success" | "warning" | "info" | "error";
  title:   string;
  message: string;
  time:    string;
  read:    boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id:"1", type:"warning", title:"SLA Breach Risk",       message:"Work Order WO-2026-042 approaching SLA deadline", time:"5m ago",  read:false },
  { id:"2", type:"success", title:"Work Order Completed",  message:"WO-2026-039 Pool Circulation Pump Leak resolved",  time:"2h ago",  read:false },
  { id:"3", type:"info",    title:"New Lead Assigned",     message:"Marriott Cairo lead assigned to your team",        time:"4h ago",  read:true  },
  { id:"4", type:"warning", title:"Low Stock Alert",       message:"HVAC filters below minimum stock level",           time:"1d ago",  read:true  },
  { id:"5", type:"info",    title:"Technician Dispatched", message:"Mohamed Ali dispatched to Grand Cairo Hotel",      time:"1d ago",  read:true  },
];

export default function NotificationsPage() {
  const [notes, setNotes] = useState(MOCK_NOTIFICATIONS);
  const unread = notes.filter(n => !n.read).length;
  const icons = { success:CheckCircle, warning:AlertTriangle, info:Info, error:AlertTriangle };
  const colors = {
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    info:    "text-blue-600 bg-blue-50",
    error:   "text-red-600 bg-red-50",
  };

  function markRead(id: string) {
    setNotes(ns => ns.map(n => n.id===id ? {...n, read:true} : n));
  }
  function markAllRead() {
    setNotes(ns => ns.map(n => ({...n, read:true})));
  }
  function dismiss(id: string) {
    setNotes(ns => ns.filter(n => n.id !== id));
  }

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Notifications" subtitle={`${unread} unread notifications`} badge="NOTIF"
        actions={unread>0&&(
          <button onClick={markAllRead}
            className="text-xs text-amber-600 hover:underline">Mark all read</button>
        )}/>
      <div className="space-y-2">
        {notes.length===0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
            <p className="text-slate-500">No notifications</p>
          </div>
        ) : notes.map(note => {
          const Icon = icons[note.type];
          return (
            <div key={note.id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all ${
                note.read ? "border-slate-100 opacity-70" : "border-slate-200 shadow-sm"
              }`}
              onClick={() => markRead(note.id)}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[note.type]}`}>
                <Icon className="w-4 h-4"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${note.read?"text-slate-500":"text-slate-900"}`}>{note.title}</p>
                  {!note.read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"/>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{note.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{note.time}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();dismiss(note.id);}}
                className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                <X className="w-4 h-4"/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
