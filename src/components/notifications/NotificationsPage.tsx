import React, { useState } from 'react';
import { useApp, AppPage } from '../../context/AppContext';
import { HRAlertNotification } from '../../types';
import { ConfirmDeleteDialog } from '../common/BulkActions';
import { Bell, BellOff, CheckCheck, ChevronRight, FileText, Building2, ShieldCheck, Trash2, UserPlus, Info } from 'lucide-react';

const CATEGORY_STYLE: Record<HRAlertNotification['category'], { icon: React.ElementType; className: string; label: string }> = {
  contract: { icon: FileText, className: 'bg-amber-50 text-amber-700', label: 'Contract' },
  document: { icon: FileText, className: 'bg-rose-50 text-rose-600', label: 'Document' },
  compliance: { icon: ShieldCheck, className: 'bg-sky-50 text-sky-700', label: 'Compliance' },
  onboarding: { icon: UserPlus, className: 'bg-[#EBF7EE] text-[#147D4A]', label: 'New staff' },
  system: { icon: Building2, className: 'bg-[#EBF7EE] text-[#147D4A]', label: 'System' }
};

const PAGES: AppPage[] = ['dashboard', 'directory', 'divisions', 'profile', 'contracts', 'reports', 'register', 'settings'];

const timeAgo = (iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    employees,
    markNotificationRead,
    clearAllNotifications,
    deleteNotification,
    deleteAllNotifications,
    navigateToProfile,
    setActivePage
  } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const shown = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  // Open what the notification is about: the staff profile if it names one, otherwise its page
  const open = (n: HRAlertNotification) => {
    markNotificationRead(n.id);
    if (n.employeeId && employees.some(e => e.id === n.employeeId)) {
      navigateToProfile(n.employeeId);
    } else if (n.actionUrl && PAGES.includes(n.actionUrl as AppPage)) {
      setActivePage(n.actionUrl as AppPage);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </span>
          <div>
            <h1 className="text-xl font-black text-[#192C21] tracking-tight">Notifications</h1>
            <p className="text-xs text-[#57685D] mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread of ${notifications.length}` : `${notifications.length} notifications, all read`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={clearAllNotifications}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#147D4A] bg-white hover:bg-[#EBF7EE] border border-[#C5E8D2] rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-white"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteAll(true)}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-white"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete all
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-1.5 shadow-xs inline-flex gap-1 text-xs">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`py-1.5 px-3.5 rounded-xl font-semibold transition-colors ${
              filter === f ? 'bg-[#147D4A] text-white shadow-sm' : 'text-[#57685D] hover:text-[#147D4A] hover:bg-[#F3F9F5]'
            }`}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl shadow-xs overflow-hidden">
        {shown.length === 0 ? (
          <div className="p-12 text-center">
            <span className="w-12 h-12 mx-auto rounded-2xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center">
              <BellOff className="w-6 h-6" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-[#192C21]">{filter === 'unread' ? 'No unread notifications' : 'No notifications'}</h3>
            <p className="text-xs text-[#57685D] mt-1">New staff, schools and contract renewals will show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#EEF3EF]">
            {shown.map(n => {
              const style = CATEGORY_STYLE[n.category] || { icon: Info, className: 'bg-slate-100 text-slate-600', label: 'Update' };
              const Icon = style.icon;
              return (
                <li key={n.id} className={`group flex items-start gap-3 px-4 sm:px-5 py-3.5 transition-colors hover:bg-[#F6FAF7] ${!n.read ? 'bg-[#F9FCFA]' : ''}`}>
                  <button type="button" onClick={() => open(n)} className="flex-1 min-w-0 flex items-start gap-3 text-left">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.className}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm truncate ${n.read ? 'font-medium text-[#384C3F]' : 'font-bold text-[#192C21]'}`}>{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#147D4A] shrink-0" aria-label="Unread" />}
                      </span>
                      <span className="block text-xs text-[#57685D] mt-0.5 leading-relaxed">{n.message}</span>
                      <span className="flex items-center gap-1.5 mt-1 text-[10px] text-[#798C80]">
                        <span className="font-semibold">{style.label}</span> · {timeAgo(n.timestamp)}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#147D4A] shrink-0 mt-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Delete notification"
                    aria-label={`Delete ${n.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirmDeleteAll && (
        <ConfirmDeleteDialog
          title="Delete all notifications?"
          message={`All ${notifications.length} notifications will be removed. This cannot be undone.`}
          confirmLabel="Delete all"
          onConfirm={() => {
            deleteAllNotifications();
            setConfirmDeleteAll(false);
          }}
          onCancel={() => setConfirmDeleteAll(false)}
        />
      )}
    </div>
  );
};
