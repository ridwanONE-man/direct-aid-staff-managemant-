import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { needsRenewal } from '../../lib/contracts';
import { EmployeeRecord } from '../../types';
import { ChevronRight, MapPin, Phone, Search, User, UserCheck, X } from 'lucide-react';

const roleLabel = (emp: EmployeeRecord) =>
  emp.jobTitle === 'Other' && emp.customJobTitle ? emp.customJobTitle : emp.jobTitle;

const contractBadge = (emp: EmployeeRecord) => {
  if (emp.contract.renewalStatus === 'Expired') return { label: 'Expired', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (needsRenewal(emp)) return { label: 'Renewal due', className: 'bg-amber-50 text-amber-800 border-amber-200' };
  return { label: 'Active', className: 'bg-[#EBF7EE] text-[#147D4A] border-[#C5E8D2]' };
};

// Compact list of staff shown on the Staff Profile page; clicking a row opens the full profile
export const StaffProfileList: React.FC = () => {
  const { scopedEmployees: employees, navigateToProfile, setActivePage } = useApp();
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees
      .filter(emp =>
        !q ||
        [emp.fullName, emp.id, roleLabel(emp), emp.divisionName, emp.phoneNumber].some(v => v?.toLowerCase().includes(q))
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [employees, query]);

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-12 text-center shadow-xs">
        <User className="w-8 h-8 text-[#147D4A] mx-auto" />
        <h3 className="text-base font-bold text-[#192C21] mt-3">No Staff Yet</h3>
        <p className="text-xs text-[#57685D] mt-1">Register a staff member and they will appear here.</p>
        <button
          onClick={() => setActivePage('register')}
          className="edit-only mt-4 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl"
        >
          Register Staff
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center">
            <UserCheck className="w-4.5 h-4.5" />
          </span>
          <div>
            <h1 className="text-base font-black text-[#192C21] tracking-tight">Staff Profiles</h1>
            <p className="text-[11px] text-[#57685D]">Pick a staff member to open their full profile.</p>
          </div>
          <span className="text-[11px] bg-[#EBF7EE] text-[#147D4A] font-bold px-2 py-0.5 rounded-full font-mono">{shown.length}</span>
        </div>
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ID, role, phone..."
            className="w-full pl-8 pr-8 py-2 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#147D4A]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#E2EAE4] rounded-2xl shadow-xs divide-y divide-[#EEF3EF] overflow-hidden">
        {shown.map(emp => {
          const badge = contractBadge(emp);
          return (
            <button
              key={emp.id}
              type="button"
              onClick={() => navigateToProfile(emp.id)}
              className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F6FAF7] transition-colors"
            >
              <img
                src={emp.avatarUrl}
                alt=""
                className="w-11 h-11 rounded-xl object-cover border border-[#E2EAE4] bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-[#192C21] truncate group-hover:text-[#147D4A]">{emp.fullName}</span>
                  <span className="text-[10px] font-mono text-[#57685D] shrink-0 hidden sm:inline">{emp.id}</span>
                </div>
                <p className="text-[11px] text-[#57685D] truncate">
                  {roleLabel(emp)} · {emp.divisionName}
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-0.5 text-[11px] text-[#57685D] shrink-0 w-36">
                {emp.phoneNumber && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {emp.phoneNumber}</span>
                )}
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {emp.campusLocation}</span>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-24">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>{badge.label}</span>
                <span className="text-[10px] text-[#57685D]">{emp.profileCompleteness}% complete</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#147D4A] shrink-0" />
            </button>
          );
        })}
        {shown.length === 0 && (
          <p className="px-4 py-8 text-center text-xs text-[#57685D]">No staff match "{query.trim()}".</p>
        )}
      </div>
    </div>
  );
};
