import React from 'react';
import { Bell, BellRing, X, CheckCircle2, Wrench, Truck, ShieldAlert } from 'lucide-react';
import { PushNotificationItem, pushTargetLabel } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  onMarkAllRead: () => void;
}

const TYPE_ICONS: Record<PushNotificationItem['type'], React.ReactNode> = {
  appointment: <Wrench className="w-4 h-4" />,
  order: <Truck className="w-4 h-4" />,
  inventory: <CheckCircle2 className="w-4 h-4" />,
  security: <ShieldAlert className="w-4 h-4" />
};

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">

          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-black font-mono text-white">NOTIFICATIONS</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Bell className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-sm text-zinc-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    n.read
                      ? 'bg-zinc-900/60 border-zinc-800/70'
                      : 'bg-zinc-900 border-red-500/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === 'security'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {TYPE_ICONS[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-mono">{n.timestamp}</span>
                      <span className="text-[9px] text-amber-400/70 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                        To: {pushTargetLabel(n.to)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};