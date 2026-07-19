"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle, Check } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Props { open: boolean; onClose: () => void; notifications?: Notification[] }

const typeIcon = { info:Info, success:CheckCircle, warning:AlertTriangle, error:XCircle };
const typeBg   = { info:"bg-blue-100 text-blue-600", success:"bg-emerald-100 text-emerald-600", warning:"bg-amber-100 text-amber-600", error:"bg-red-100 text-red-600" };

export function NotificationDrawer({ open, onClose, notifications = [] }: Props) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}
            className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
            transition={{duration:0.2, ease:[0.4,0,0.2,1]}}
            className="fixed top-14 right-4 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                {unread > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">{unread}</span>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && <button className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"><Check className="w-3 h-3"/>Mark all read</button>}
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500"/></button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
                  <div className="text-sm font-medium text-slate-700">All caught up!</div>
                  <div className="text-xs text-slate-400 mt-1">No new notifications</div>
                </div>
              ) : notifications.map(n => {
                const Icon = typeIcon[n.type];
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${!n.read ? "bg-amber-50/50" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${typeBg[n.type]}`}>
                      <Icon className="w-4 h-4"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {n.title}
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"/>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</div>
                      <div className="text-xs text-slate-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
