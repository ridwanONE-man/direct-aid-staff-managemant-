import React from 'react';
import { useApp, AppPage } from '../../context/AppContext';
import { needsRenewal } from '../../lib/contracts';
import { roleLabel } from '../../lib/roles';
import {
  Settings,
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
  onRequestLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onRequestLogout
}) => {
  const {
    activePage,
    setActivePage,
    setSelectedEmployee,
    scopedEmployees: employees,
    scopedDivisions: divisions,
    regionalScope,
    setRegionalScope,
    notifications,
    setIsAddEmployeeOpen,
    userEmail,
    userRole,
    canEdit
  } = useApp();

  const contractsDue = employees.filter(needsRenewal).length;

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
      badge: employees.length > 0 ? employees.length : undefined,
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    },
    {
      id: 'divisions',
      label: 'School Divisions',
      icon: <Building2 className="w-4.5 h-4.5 shrink-0" />,
      badge: divisions.length > 0 ? divisions.length : undefined,
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
      badge: contractsDue > 0 ? contractsDue : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold'
    },
    {
      id: 'reports',
      label: 'Audit & Reports',
      icon: <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4.5 h-4.5 shrink-0" />
    }
  ];

  const handleNavClick = (page: AppPage) => {
    if (page === 'profile') setSelectedEmployee(null);
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
        <div
          className={`relative h-16 flex items-center border-b border-[#E2EAE4] bg-linear-to-r from-[#F3FAF5] to-white ${
            isCollapsed ? 'justify-center px-2' : 'px-4'
          }`}
        >
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            onClick={() => handleNavClick('dashboard')}
            title="DirectAid · Dashboard"
          >
            <img
              src="/favicon-192.png"
              alt="DirectAid"
              className={`shrink-0 drop-shadow-sm transition-all duration-300 group-hover:scale-105 ${
                isCollapsed ? 'w-11 h-11' : 'w-10 h-10'
              }`}
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[#147D4A] text-base leading-tight tracking-tight">
                  DirectAid
                </span>
                <span className="text-[11px] font-medium text-[#6B7E72] truncate">
                  Somaliland HR Portal
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle sits on the sidebar edge so the logo keeps its space */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full border border-[#C5E8D2] bg-white text-[#57685D] hover:text-white hover:bg-[#147D4A] hover:border-[#147D4A] items-center justify-center shadow-sm transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="p-3 edit-only">
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

          {navItems.filter(item => canEdit || item.id !== 'register').map((item) => {
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
              <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] border border-[#C5E8D2] shadow-2xs flex items-center justify-center text-[#147D4A]">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#192C21] truncate">
                  {roleLabel(userRole)}
                </h4>
                <button
                  type="button"
                  onClick={onRequestLogout}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#6B7E72] truncate">
                {userEmail || 'DirectAid Staff Portal'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-bold text-[#147D4A] bg-[#EBF7EE] px-1.5 py-0.2 rounded-full">
                  {canEdit ? 'Can edit' : 'Read-only'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-9 group relative">
            <div className="relative cursor-pointer" onClick={() => setIsCollapsed(false)}>
              <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] border border-[#C5E8D2] shadow-2xs flex items-center justify-center text-[#147D4A]">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <button
              type="button"
              onClick={onRequestLogout}
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Collapsed Tooltip */}
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#192C21] text-white text-xs rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {roleLabel(userRole)}
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
