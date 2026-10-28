import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Menu,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  UserPlus,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  isCollapsed: boolean;
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, onOpenMobileNav }) => {
  const {
    activePage,
    setActivePage,
    regionalScope,
    setRegionalScope,
    filters,
    setFilters,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setIsAddEmployeeOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle outside click to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Executive Dashboard';
      case 'directory':
        return 'Staff Directory';
      case 'divisions':
        return 'School Divisions';
      case 'profile':
        return 'Employee Profile';
      case 'contracts':
        return 'Contracts & HR';
      case 'reports':
        return 'Audit & Reports';
      case 'register':
        return 'Staff Registration';
      default:
        return 'Portal';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, searchQuery: val }));
    if (activePage !== 'directory' && val.trim().length > 0) {
      setActivePage('directory');
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-[#E2EAE4] z-30 px-4 md:px-6 flex items-center justify-between transition-all duration-300 ${
        isCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      }`}
    >
      {/* Left: Mobile menu & concise breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-[#57685D] hover:bg-[#F3F7F4] hover:text-[#192C21] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span
            className="hidden sm:inline font-medium text-[#6B7E72] hover:text-[#147D4A] cursor-pointer transition-colors"
            onClick={() => setActivePage('dashboard')}
          >
            DirectAid
          </span>
          <span className="hidden sm:inline text-slate-300 font-normal">/</span>
          <span className="font-bold text-[#192C21] tracking-tight">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Middle: Clean Live Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E9185]" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search staff, ID (#DA-...), role, subject..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] placeholder:text-[#8D9F94] focus:outline-none focus:ring-2 focus:ring-[#147D4A]/20 focus:border-[#147D4A] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Scope pill, Notifications, Quick Action */}
      <div className="flex items-center gap-2.5">
        {/* Campus Quick Scope Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-[#F6FAF7] border border-[#E2EAE4] px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
          <select
            value={regionalScope}
            onChange={(e) => setRegionalScope(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-[#192C21] focus:outline-none cursor-pointer"
          >
            <option value="all">All Campuses</option>
            <option value="hargeisa">Hargeisa</option>
            <option value="gabiley">Gabiley</option>
          </select>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-[#57685D] hover:text-[#192C21] hover:bg-[#F3F7F4] transition-colors"
            aria-label="View HR Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2EAE4] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
              <div className="p-3.5 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#192C21]">Alerts</h4>
                  <p className="text-[11px] text-[#6B7E72]">{unreadCount} requiring attention</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-[#147D4A] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B7E72]">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.actionUrl) {
                          setActivePage(notif.actionUrl as any);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-[#F6FAF7] flex gap-2.5 items-start ${
                        !notif.read ? 'bg-[#F9FCFA]' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.category === 'contract' ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : notif.category === 'document' ? (
                          <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#147D4A] flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${notif.read ? 'text-[#44564B]' : 'text-[#192C21]'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#147D4A]"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#57685D] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-[#E2EAE4] bg-[#F9FBFA] text-center">
                <button
                  onClick={() => {
                    setActivePage('reports');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs text-[#147D4A] font-semibold hover:underline"
                >
                  View Reports Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => setActivePage('register')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Staff</span>
        </button>
      </div>
    </header>
  );
};
