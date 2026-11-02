import React from 'react';
import { useApp } from '../../context/AppContext';
import { needsRenewal } from '../../lib/contracts';
import { isHeadquarters, leaderTitleFor } from '../../lib/divisions';
import { divisionColor } from '../../data/divisionColors';
import { roleTheme } from '../../data/roleTheme';
import {
  Users,
  Building2,
  AlertTriangle,
  FileWarning,
  ArrowRight,
  Printer,
  Download,
  UserPlus,
  Clock,
  CheckCircle2,
  MapPin,
  ChevronRight,
  PieChart
} from 'lucide-react';

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(minutes)) return '';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days} d ago` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

// One shared colour per staff type for the "Staff by type" bar
const GROUP_COLORS: Record<string, string> = {
  Leadership: '#0E6139',
  Teaching: '#2D9A48',
  Security: '#256663',
  Facilities: '#13838C',
  Transport: '#B7791F',
  Office: '#3B6386',
  Other: '#798C80'
};

export const ExecutiveDashboard: React.FC = () => {
  const {
    scopedEmployees,
    scopedDivisions: divisions,
    employees,
    notifications,
    regionalScope,
    setActivePage,
    navigateToDivisionStaff,
    navigateToProfile
  } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const scopeLabel = regionalScope === 'all' ? 'All Campuses' : `${regionalScope[0].toUpperCase()}${regionalScope.slice(1)} Campus`;

  const renewalsDue = scopedEmployees.filter(needsRenewal);
  const incomplete = scopedEmployees.filter(e => e.missingRequirements.length > 0);
  const needingAttention = scopedEmployees
    .filter(e => needsRenewal(e) || e.missingRequirements.length > 0)
    .sort((a, b) => Number(needsRenewal(b)) - Number(needsRenewal(a)));
  const attention = needingAttention.slice(0, 5);

  // Staff by type (Leadership, Teaching, ...)
  const groups = new Map<string, number>();
  scopedEmployees.forEach(e => {
    const g = roleTheme(e).group;
    groups.set(g, (groups.get(g) || 0) + 1);
  });
  const groupList = [...groups.entries()].sort((a, b) => b[1] - a[1]);

  const handleExport = () => {
    const rows = [['ID', 'Name', 'Division', 'City', 'Job Title', 'Salary (USD)', 'Status']];
    scopedEmployees.forEach(e => {
      rows.push([e.id, `"${e.fullName}"`, `"${e.divisionName}"`, e.campusLocation, `"${e.jobTitle}"`, String(e.contract.monthlyBaseSalary), e.employmentStatus]);
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n'));
    link.download = `DirectAid_Staff_${regionalScope}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = [
    { label: 'Total Staff', value: scopedEmployees.length, hint: 'View directory', icon: Users, color: '#147D4A', page: 'directory' as const },
    { label: 'School Divisions', value: divisions.length, hint: 'View divisions', icon: Building2, color: '#13838C', page: 'divisions' as const },
    { label: 'Renewals Due', value: renewalsDue.length, hint: 'Next 60 days', icon: AlertTriangle, color: '#B7791F', page: 'contracts' as const },
    { label: 'Incomplete Profiles', value: incomplete.length, hint: 'Missing details', icon: FileWarning, color: '#BE2B5A', page: 'reports' as const }
  ];

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] p-6 shadow-[0_20px_50px_-20px_rgba(20,125,74,0.55)]">
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full border-[28px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-28 right-40 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src="/directaid-logo-white.png"
              alt="DirectAid - العون المباشر"
              className="h-12 w-auto object-contain shrink-0 self-start sm:self-auto sm:pr-5 sm:border-r sm:border-white/25"
            />
            <div className="text-white">
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/85">
                <span className="w-2 h-2 rounded-full bg-[#B8F5CF] animate-pulse" />
                {today} <span className="text-white/40">·</span> {scopeLabel}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">{greeting}</h1>
              <p className="mt-0.5 text-sm text-white/80">Here's how your staff and schools look today.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => setActivePage('register')}
              className="edit-only inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#147D4A] bg-white hover:bg-[#EBF7EE] rounded-xl shadow-md transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Staff
            </button>
          </div>
        </div>
      </div>

      {/* Key numbers */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(stat => (
          <button
            key={stat.label}
            type="button"
            onClick={() => setActivePage(stat.page)}
            className="group text-left bg-white border border-[#E2EAE4] hover:border-[#C5E8D2] rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: stat.color }}>
                <stat.icon className="w-5 h-5" />
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#147D4A] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="mt-3 text-3xl font-black text-[#192C21] font-mono leading-none">{stat.value}</p>
            <p className="mt-1.5 text-xs font-bold text-[#384C3F]">{stat.label}</p>
            <p className="text-[11px] text-[#798C80]">{stat.hint}</p>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* School divisions */}
        <section className="lg:col-span-2 bg-white border border-[#E2EAE4] rounded-2xl shadow-xs overflow-hidden self-start">
          <div className="px-5 py-4 border-b border-[#E2EAE4] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#147D4A]" /> School Divisions
              </h2>
              <p className="text-[11px] text-[#57685D]">Staff and students per division</p>
            </div>
            <button type="button" onClick={() => setActivePage('divisions')} className="text-xs font-bold text-[#147D4A] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {divisions.length === 0 ? (
            <div className="p-10 text-center">
              <Building2 className="w-8 h-8 text-[#C5E8D2] mx-auto" />
              <p className="mt-2 text-sm font-bold text-[#192C21]">No divisions yet</p>
              <button
                type="button"
                onClick={() => setActivePage('divisions')}
                className="edit-only mt-3 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl"
              >
                Create a division
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#EEF3EF]">
              {divisions.map(div => {
                const color = divisionColor(div);
                const staff = employees.filter(e => e.divisionId === div.id);
                const due = staff.filter(needsRenewal).length;
                const hq = isHeadquarters(div);
                return (
                  <li key={div.id}>
                    <button
                      type="button"
                      onClick={() => navigateToDivisionStaff(div.id)}
                      className="group w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#F6FAF7] transition-colors"
                    >
                      <span className={`w-1.5 self-stretch rounded-full bg-linear-to-b ${color.band}`} />
                      {div.principalAvatar ? (
                        <img src={div.principalAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border-2 shrink-0" style={{ borderColor: color.swatch }} />
                      ) : (
                        <span className="w-10 h-10 rounded-xl border-2 border-dashed shrink-0 flex items-center justify-center" style={{ borderColor: color.swatch, color: color.swatch }}>
                          <Building2 className="w-4 h-4" />
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-[#192C21] truncate group-hover:text-[#147D4A]">{div.name}</span>
                        <span className="block text-[11px] text-[#57685D] truncate">
                          {leaderTitleFor(div.level)}: {div.principalName || 'Not assigned'}
                          <span className="hidden sm:inline"> · <MapPin className="inline w-3 h-3 -mt-0.5" /> {div.city}</span>
                        </span>
                      </span>
                      <span className="hidden sm:flex items-center gap-4 shrink-0 text-center">
                        <span>
                          <span className="block text-sm font-black text-[#192C21] font-mono">{staff.length}</span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-[#798C80]">Staff</span>
                        </span>
                        {!hq && (
                          <span>
                            <span className="block text-sm font-black text-[#192C21] font-mono">{div.studentCount}</span>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#798C80]">Students</span>
                          </span>
                        )}
                      </span>
                      {due > 0 && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          {due} due
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#147D4A] shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          {/* Needs attention */}
          <section className="bg-white border border-[#E2EAE4] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2EAE4] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Needs Attention
              </h2>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                {needingAttention.length}
              </span>
            </div>
            {attention.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <CheckCircle2 className="w-7 h-7 text-[#147D4A] mx-auto" />
                <p className="mt-1.5 text-xs font-semibold text-[#192C21]">All staff records are in order</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#EEF3EF]">
                {attention.map(emp => (
                  <li key={emp.id}>
                    <button
                      type="button"
                      onClick={() => navigateToProfile(emp.id)}
                      className="group w-full flex items-center gap-2.5 px-5 py-2.5 text-left hover:bg-[#F6FAF7] transition-colors"
                    >
                      <img src={emp.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#E2EAE4] shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-[#192C21] truncate group-hover:text-[#147D4A]">{emp.fullName}</span>
                        <span className="block text-[10px] truncate">
                          {needsRenewal(emp) ? (
                            <span className="text-amber-700 font-semibold">Contract renewal due</span>
                          ) : (
                            <span className="text-rose-600 font-semibold">Missing: {emp.missingRequirements[0]}</span>
                          )}
                        </span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#147D4A] shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Staff by type */}
          <section className="bg-white border border-[#E2EAE4] rounded-2xl shadow-xs p-5">
            <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#147D4A]" /> Staff by Type
            </h2>
            {groupList.length === 0 ? (
              <p className="mt-3 text-xs text-[#57685D]">No staff registered yet.</p>
            ) : (
              <>
                <div className="mt-3 h-3 rounded-full overflow-hidden flex bg-[#F6FAF7]">
                  {groupList.map(([group, count]) => (
                    <span
                      key={group}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${(count / scopedEmployees.length) * 100}%`, backgroundColor: GROUP_COLORS[group] || '#798C80' }}
                      title={`${group}: ${count}`}
                    />
                  ))}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {groupList.map(([group, count]) => (
                    <li key={group} className="flex items-center gap-1.5 text-xs min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GROUP_COLORS[group] || '#798C80' }} />
                      <span className="text-[#384C3F] truncate">{group}</span>
                      <span className="ml-auto font-mono font-bold text-[#192C21]">{count}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* Recent activity */}
          <section className="bg-white border border-[#E2EAE4] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2EAE4] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#147D4A]" /> Recent Activity
              </h2>
              <button type="button" onClick={() => setActivePage('notifications')} className="text-[11px] font-bold text-[#147D4A] hover:underline">
                See all
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="px-5 py-5 text-xs text-[#57685D]">No activity yet.</p>
            ) : (
              <ul className="px-5 py-3 space-y-3">
                {notifications.slice(0, 4).map(n => (
                  <li key={n.id} className="flex gap-2.5">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#147D4A] shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#192C21] truncate">{n.title}</span>
                        <span className="text-[10px] text-[#798C80] shrink-0">{timeAgo(n.timestamp)}</span>
                      </span>
                      <span className="block text-[11px] text-[#57685D] truncate">{n.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
