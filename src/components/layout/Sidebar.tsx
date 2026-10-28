import React from 'react';
import { useApp, AppPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  UserPlus,
  ShieldAlert,
  Shield,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const {
    activePage,
    setActivePage,
    employees,
    regionalScope,
    setRegionalScope,
    notifications,
    setIsAddEmployeeOpen,
    logout
  } = useApp();

  const unreadAlerts = notifications.filter(n => !n.read).length;

  const navItems: { id: AppPage; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
    },
    {
      id: 'directory',
      label: 'Staff Directory',
      icon: <Users className="w-4.5 h-4.5 shrink-0" />,
      badge: employees.length,
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    },
    {
      id: 'divisions',
      label: 'School Divisions',
      icon: <Building2 className="w-4.5 h-4.5 shrink-0" />,
      badge: '8',
      badgeColor: 'bg-emerald-100 text-emerald-900 font-bold'
    },
    {
      id: 'profile',
      label: 'Staff Profile',
      icon: <UserCheck className="w-4.5 h-4.5 shrink-0" />
    },
    {
      id: 'register',
      label: 'Register Staff',
      icon: <UserPlus className="w-4.5 h-4.5 shrink-0" />,
      badge: 'New',
      badgeColor: 'bg-[#DDF5E5] text-[#147D4A] font-bold'
    },
    {
      id: 'contracts',
      label: 'Contracts & HR',
      icon: <FileText className="w-4.5 h-4.5 shrink-0" />,
      badge: unreadAlerts > 0 ? `${unreadAlerts}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold'
    },
    {
      id: 'reports',
      label: 'Audit & Reports',
      icon: <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
    }
  ];

  const handleNavClick = (page: AppPage) => {
    setActivePage(page);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E2EAE4] transition-all duration-300 ease-in-out shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2EAE4] bg-[#F9FBFA]">
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-[#C5E8D2] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden p-0.5">
              <img
                src="/directaid-logo.png"
                alt="DirectAid"
                className="w-7 h-7 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#147D4A] text-sm leading-tight tracking-tight">
                  DirectAid
                </span>
                <span className="text-[11px] font-medium text-[#6B7E72] truncate">
                  Somaliland HR Portal
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-[#E2EAE4] bg-white text-[#57685D] hover:text-[#147D4A] hover:bg-[#EBF7EE] items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <button
            onClick={() => setActivePage('register')}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#147D4A] hover:bg-[#0E6139] text-white font-semibold text-xs transition-all shadow-xs ${
              isCollapsed ? 'px-2' : ''
            }`}
            title="Register Employee"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Register Employee</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#798C80] px-2 mb-1.5">
            {!isCollapsed ? 'Navigation' : 'Menu'}
          </div>

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#EBF7EE] text-[#147D4A] font-semibold border border-[#C6E8D3]'
                    : 'text-[#44564B] hover:bg-[#F3F7F4] hover:text-[#192C21]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={`${isActive ? 'text-[#147D4A]' : 'text-[#64776C] group-hover:text-[#192C21]'}`}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#192C21] text-white text-xs rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Regional Scope Filter Box */}
        {!isCollapsed ? (
          <div className="p-3 mx-3 mb-2 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#3B4D42]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#147D4A]" />
                Regional Scope
              </span>
              <span className="text-[10px] bg-[#EBF7EE] text-[#147D4A] px-1.5 py-0.5 rounded font-medium">
                Somaliland
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-0.5 bg-white border border-[#E2EAE4] rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setRegionalScope('all')}
                className={`py-1 text-center rounded font-semibold transition-colors ${
                  regionalScope === 'all'
                    ? 'bg-[#147D4A] text-white shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21] hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setRegionalScope('hargeisa')}
                className={`py-1 text-center rounded font-semibold transition-colors ${
                  regionalScope === 'hargeisa'
                    ? 'bg-[#147D4A] text-white shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21] hover:bg-slate-50'
                }`}
              >
                Hargeisa
              </button>
              <button
                type="button"
                onClick={() => setRegionalScope('gabiley')}
                className={`py-1 text-center rounded font-semibold transition-colors ${
                  regionalScope === 'gabiley'
                    ? 'bg-[#147D4A] text-white shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21] hover:bg-slate-50'
                }`}
              >
                Gabiley
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 flex justify-center mb-1">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center hover:bg-[#D7EFE0] transition-colors"
              title="Regional Scope"
            >
              <MapPin className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* ADMIN PROFILE CARD - MIGRATED BELOW REGIONAL SCOPE */}
        {!isCollapsed ? (
          <div className="mx-3 mb-2 p-2.5 bg-white border border-[#E2EAE4] hover:border-[#C5E8D2] rounded-xl shadow-xs transition-all flex items-center gap-3 group">
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
                alt="Dr. Fathia Omar"
                className="w-10 h-10 rounded-xl object-cover border border-[#C5E8D2] shadow-2xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#192C21] truncate">
                  Dr. Fathia Omar
                </h4>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#6B7E72] truncate">
                Regional HR Admin
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-bold text-[#147D4A] bg-[#EBF7EE] px-1.5 py-0.2 rounded-full">
                  Admin Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2 group relative">
            <div className="relative cursor-pointer" onClick={() => setIsCollapsed(false)}>
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
                alt="Dr. Fathia Omar"
                className="w-10 h-10 rounded-xl object-cover border border-[#C5E8D2] shadow-2xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Collapsed Tooltip */}
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#192C21] text-white text-xs rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Dr. Fathia Omar (Admin)
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between text-[11px] text-[#6B7E72]">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate font-medium">Term 2024/25</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">v2.5</span>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
