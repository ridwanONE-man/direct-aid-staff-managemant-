import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, Menu, UserPlus } from 'lucide-react';

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
    setIsAddEmployeeOpen
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

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
      case 'settings':
        return 'Settings';
      case 'notifications':
        return 'Notifications';
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

        {/* Notifications: opens the Notifications page */}
        <button
          onClick={() => setActivePage('notifications')}
          className={`relative p-2 rounded-xl transition-colors ${
            activePage === 'notifications'
              ? 'bg-[#EBF7EE] text-[#147D4A]'
              : 'text-[#57685D] hover:text-[#192C21] hover:bg-[#F3F7F4]'
          }`}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => setActivePage('register')}
          className="edit-only hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Staff</span>
        </button>
      </div>
    </header>
  );
};
