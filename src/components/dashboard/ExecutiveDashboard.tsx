import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  Building,
  ArrowRight,
  Printer,
  Download,
  ShieldAlert,
  Briefcase,
  MapPin,
  Clock,
  UserPlus
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    employees,
    divisions,
    notifications,
    regionalScope,
    setActivePage,
    navigateToDivisionStaff,
    navigateToProfile
  } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const scopedEmployees = employees.filter(emp => {
    if (regionalScope === 'hargeisa') return emp.campusLocation === 'Hargeisa';
    if (regionalScope === 'gabiley') return emp.campusLocation === 'Gabiley';
    return true;
  });

  const activeStaffCount = scopedEmployees.filter(e => e.employmentStatus === 'Active').length;
  const expiringContractsCount = scopedEmployees.filter(e => 
    e.contract.renewalStatus === 'Approaching Renewal' || e.contract.renewalStatus === 'Renewal Pending Sign-off'
  ).length;
  const missingDocsCount = scopedEmployees.filter(e => e.missingRequirements.length > 0).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPayrollReport = () => {
    const csvRows = [
      ['ID', 'Name', 'Division', 'City', 'Job Title', 'Salary (USD)', 'Status']
    ];

    scopedEmployees.forEach(e => {
      csvRows.push([
        e.id,
        `"${e.fullName}"`,
        `"${e.divisionName}"`,
        e.campusLocation,
        `"${e.jobTitle}"`,
        String(e.contract.monthlyBaseSalary),
        e.employmentStatus
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `DirectAid_Staff_${regionalScope}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] p-6 sm:p-7 shadow-[0_20px_50px_-20px_rgba(20,125,74,0.55)]">
        {/* Decorative rings echoing the logo's circle */}
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full border-[28px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-28 right-40 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-6 right-1/3 w-3 h-3 rounded-full bg-white/30 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-lg shrink-0 self-start sm:self-auto">
              <img
                src="/directaid-logo-full.png"
                alt="DirectAid - العون المباشر"
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </div>

            <div className="space-y-1.5 text-white">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/85">
                <span className="w-2 h-2 rounded-full bg-[#B8F5CF] animate-pulse" />
                <span>{today}</span>
                <span className="text-white/40">·</span>
                <span className="capitalize">
                  {regionalScope === 'all' ? 'All Campuses' : `${regionalScope} Campus`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {greeting}
              </h1>
              <p className="text-sm text-white/80 max-w-xl">
                Staff records, contract renewals, and school divisions across Somaliland, all in one place.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-all backdrop-blur-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleExportPayrollReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-all backdrop-blur-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('register')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#147D4A] bg-white hover:bg-[#EBF7EE] rounded-xl transition-all shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div
          onClick={() => setActivePage('directory')}
          className="bg-white border border-[#E2EAE4] hover:border-[#147D4A] rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#57685D] mb-2">
            <span className="uppercase tracking-wider text-[11px]">Total Staff</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#192C21] font-mono">
              {scopedEmployees.length}
            </span>
            <span className="text-[11px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-full">
              {regionalScope === 'all' ? 'All Wings' : regionalScope}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs text-[#57685D]">
            <span>Primary &amp; Secondary</span>
            <span className="font-bold text-[#147D4A] group-hover:translate-x-0.5 flex items-center gap-0.5 transition-transform">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Active on Duty */}
        <div
          onClick={() => setActivePage('directory')}
          className="bg-white border border-[#E2EAE4] hover:border-[#35B86B] rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#57685D] mb-2">
            <span className="uppercase tracking-wider text-[11px]">Active Staff</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#147D4A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#192C21] font-mono">
              {activeStaffCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((activeStaffCount / (scopedEmployees.length || 1)) * 100)}% On Duty
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs text-[#57685D]">
            <span>Teaching &amp; Admin</span>
            <span className="text-emerald-700 font-semibold">Active Status</span>
          </div>
        </div>

        {/* Expiring Contracts */}
        <div
          onClick={() => setActivePage('contracts')}
          className="bg-white border border-[#E2EAE4] hover:border-amber-400 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#57685D] mb-2">
            <span className="uppercase tracking-wider text-[11px]">Due for Renewal</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#192C21] font-mono">
              {expiringContractsCount}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              Next 60 Days
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs text-[#57685D]">
            <span>Pending Review</span>
            <span className="font-bold text-amber-700 group-hover:translate-x-0.5 flex items-center gap-0.5 transition-transform">
              Contracts Hub <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Missing Documents */}
        <div
          onClick={() => setActivePage('reports')}
          className="bg-white border border-[#E2EAE4] hover:border-rose-400 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#57685D] mb-2">
            <span className="uppercase tracking-wider text-[11px]">Audit Exceptions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#192C21] font-mono">
              {missingDocsCount}
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Incomplete Dossiers
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs text-[#57685D]">
            <span>CID &amp; Health Clearances</span>
            <span className="font-bold text-rose-700 group-hover:translate-x-0.5 flex items-center gap-0.5 transition-transform">
              Compliance <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* School Divisions Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#192C21] flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-[#147D4A]" />
              School Divisions
            </h2>
            <p className="text-xs text-[#57685D]">
              Canonical school divisions across Hargeisa and Gabiley.
            </p>
          </div>

          <button
            onClick={() => setActivePage('divisions')}
            className="text-xs font-bold text-[#147D4A] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {divisions.filter(d => d.level !== 'Central Operations').map((div) => {
            const divStaff = employees.filter(e => e.divisionId === div.id);
            const expiringInDiv = divStaff.filter(e => 
              e.contract.renewalStatus === 'Approaching Renewal' || e.contract.renewalStatus === 'Renewal Pending Sign-off'
            ).length;

            return (
              <div
                key={div.id}
                onClick={() => navigateToDivisionStaff(div.id)}
                className="bg-white border border-[#E2EAE4] hover:border-[#147D4A] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md font-mono">
                      {div.code}
                    </span>
                    <span className="text-[11px] text-[#57685D] flex items-center gap-1 font-semibold">
                      <MapPin className="w-3 h-3 text-[#147D4A]" />
                      {div.city}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-[#192C21] group-hover:text-[#147D4A] transition-colors leading-snug line-clamp-2">
                    {div.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#57685D]">
                    {div.principalAvatar ? (
                      <img
                        src={div.principalAvatar}
                        alt={div.principalName}
                        className="w-7 h-7 rounded-xl object-cover border border-[#C5E8D2]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-[#EBF7EE] border border-[#C5E8D2] shrink-0 flex items-center justify-center text-[#147D4A]">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="truncate">
                      <span className="block text-[9px] text-[#798C80] uppercase font-bold">Principal</span>
                      <span className="font-semibold text-[#192C21] text-xs truncate block">{div.principalName || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E2EAE4] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#57685D]">
                    <span>Staff:</span>
                    <span className="font-bold font-mono text-[#192C21]">{divStaff.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#57685D]">
                    <span>Students:</span>
                    <span className="font-semibold font-mono text-[#192C21]">{div.studentCount}</span>
                  </div>

                  {expiringInDiv > 0 && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold flex items-center justify-between">
                      <span>Expiring:</span>
                      <span>{expiringInDiv}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Column Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Staff by Role */}
        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#192C21] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#147D4A]" />
              Staff by Role
            </h3>
            <span className="text-[11px] text-[#57685D] font-mono font-bold">{scopedEmployees.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {[
              { role: 'Teachers', count: scopedEmployees.filter(e => e.jobTitle === 'Teacher').length, color: 'bg-[#147D4A]' },
              { role: 'Principals & Deputies', count: scopedEmployees.filter(e => e.jobTitle === 'Principal' || e.jobTitle === 'Deputy Principal').length, color: 'bg-[#35B86B]' },
              { role: 'Security Guards', count: scopedEmployees.filter(e => e.jobTitle === 'Security Guard').length, color: 'bg-amber-500' },
              { role: 'Cleaners & Support', count: scopedEmployees.filter(e => e.jobTitle === 'Cleaner').length, color: 'bg-teal-500' },
              { role: 'Drivers', count: scopedEmployees.filter(e => e.jobTitle === 'Driver').length, color: 'bg-blue-500' },
              { role: 'Office & Admin', count: scopedEmployees.filter(e => e.jobTitle === 'Secretary' || e.jobTitle === 'Administrative Officer' || e.jobTitle === 'Finance Officer' || e.jobTitle === 'IT Support Officer').length, color: 'bg-indigo-500' }
            ].map((item, idx) => {
              const pct = Math.round((item.count / (scopedEmployees.length || 1)) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#192C21]">{item.role}</span>
                    <span className="font-mono text-[#57685D] text-[11px]">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F6FAF7] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HR Attention Items */}
        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#192C21] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              HR Action Items
            </h3>
            <span className="text-[10px] text-amber-800 bg-amber-50 font-bold px-2 py-0.5 rounded-full">
              Attention
            </span>
          </div>

          <div className="space-y-2">
            {scopedEmployees
              .filter(e => e.missingRequirements.length > 0 || e.contract.renewalStatus === 'Approaching Renewal')
              .slice(0, 4)
              .map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => navigateToProfile(emp.id)}
                  className="p-2.5 bg-[#F9FBFA] hover:bg-[#EBF7EE] border border-[#E2EAE4] rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#192C21] group-hover:text-[#147D4A] truncate">
                      {emp.fullName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{emp.id}</span>
                  </div>
                  <div className="text-[11px] text-[#57685D] mt-0.5 truncate">
                    {emp.jobTitle} · {emp.divisionName}
                  </div>
                  {emp.missingRequirements.length > 0 && (
                    <span className="mt-1 inline-block text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                      Missing: {emp.missingRequirements[0]}
                    </span>
                  )}
                </div>
              ))}
          </div>

          <button
            onClick={() => setActivePage('contracts')}
            className="w-full py-1.5 text-center text-xs font-bold text-[#147D4A] hover:underline"
          >
            Review Contracts Hub →
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-[#192C21] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#147D4A]" />
              Recent Operations
            </h3>
            <span className="text-[11px] text-[#57685D]">Activity Log</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {notifications.length === 0 && (
              <p className="text-[11px] text-[#57685D]">No activity recorded yet.</p>
            )}
            {notifications.slice(0, 4).map((n) => ({
              title: n.title,
              desc: n.message,
              time: new Date(n.timestamp).toLocaleDateString()
            })).map((act, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-2 h-2 rounded-full bg-[#147D4A] mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#192C21] truncate">{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-[#57685D] mt-0.5 leading-snug truncate">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActivePage('reports')}
            className="w-full py-1.5 text-center text-xs font-bold text-[#147D4A] hover:underline"
          >
            Full Audit Center →
          </button>
        </div>
      </div>
    </div>
  );
};
