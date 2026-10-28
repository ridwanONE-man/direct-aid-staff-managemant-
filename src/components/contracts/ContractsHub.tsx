import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Building,
  RefreshCw,
  Search
} from 'lucide-react';

export const ContractsHub: React.FC = () => {
  const {
    employees,
    divisions,
    regionalScope,
    navigateToProfile,
    setContractRenewalTarget,
    setIsRenewContractOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'expiring' | 'pending' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  // Scoped employees
  const scopedEmployees = employees.filter(emp => {
    if (regionalScope === 'hargeisa' && emp.campusLocation !== 'Hargeisa') return false;
    if (regionalScope === 'gabiley' && emp.campusLocation !== 'Gabiley') return false;
    return true;
  });

  const expiringList = scopedEmployees.filter(e => 
    e.contract.renewalStatus === 'Approaching Renewal' || e.contract.renewalStatus === 'Renewal Pending Sign-off'
  );

  const pendingList = scopedEmployees.filter(e => e.contract.renewalStatus === 'Renewal Pending Sign-off');
  const activeList = scopedEmployees.filter(e => e.contract.renewalStatus === 'Not Due' || e.contract.renewalStatus === 'Renewed');

  const displayedList = scopedEmployees.filter(emp => {
    if (activeTab === 'expiring' && !expiringList.some(e => e.id === emp.id)) return false;
    if (activeTab === 'pending' && !pendingList.some(e => e.id === emp.id)) return false;
    if (activeTab === 'active' && !activeList.some(e => e.id === emp.id)) return false;

    if (selectedDivision && emp.divisionId !== selectedDivision) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return emp.fullName.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q) || emp.contract.referenceNo.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPayrollUSD = scopedEmployees.reduce((acc, e) => acc + (e.contract.monthlyBaseSalary || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-[#192C21] tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#147D4A]" />
              Contracts &amp; HR
            </h1>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              {expiringList.length} Due Soon
            </span>
          </div>
          <p className="text-xs text-[#57685D] mt-1">
            Contract lifecycles, renewal approvals, and salary baselines.
          </p>
        </div>

        <div className="flex items-center gap-4 border-l border-slate-100 pl-4 shrink-0 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Monthly Payroll</span>
            <span className="text-base font-black text-[#147D4A] font-mono">${totalPayrollUSD.toLocaleString()} USD</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#57685D] mb-2 font-semibold">
            <span className="uppercase tracking-wider text-[11px]">Active</span>
            <CheckCircle2 className="w-4 h-4 text-[#147D4A]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#192C21]">{activeList.length}</div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Valid through Term 2024/25</span>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/15 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-2 font-semibold">
            <span className="uppercase tracking-wider text-[11px]">Due &lt; 60 Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-900">{expiringList.length}</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Requires Renewal Notice</span>
        </div>

        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#57685D] mb-2 font-semibold">
            <span className="uppercase tracking-wider text-[11px]">Pending Sign-off</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-[#192C21]">{pendingList.length}</div>
          <span className="text-[11px] text-blue-700 mt-1 block">Awaiting Approval</span>
        </div>

        <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#57685D] mb-2 font-semibold">
            <span className="uppercase tracking-wider text-[11px]">Permanent Staff</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-[#192C21]">
            {scopedEmployees.filter(e => e.employmentType === 'Permanent').length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tenured Educational Posts</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap p-0.5 bg-slate-100 rounded-xl">
            {[
              { id: 'all', label: `All (${scopedEmployees.length})` },
              { id: 'expiring', label: `Expiring (${expiringList.length})` },
              { id: 'pending', label: `Pending (${pendingList.length})` },
              { id: 'active', label: `Active (${activeList.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#147D4A] shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search & Division Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, ref..."
                className="pl-8 pr-3 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs"
              />
            </div>

            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs"
            >
              <option value="">All Divisions</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="border border-[#E2EAE4] rounded-xl overflow-hidden mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E2EAE4] text-[#55675B] font-semibold">
                <th className="py-2.5 px-3.5">Reference</th>
                <th className="py-2.5 px-3.5">Employee</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Division</th>
                <th className="py-2.5 px-3.5">Salary</th>
                <th className="py-2.5 px-3.5">Dates</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF1ED]">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No contracts match the selected status filter.
                  </td>
                </tr>
              ) : (
                displayedList.map((emp) => {
                  const isExpiring = emp.contract.renewalStatus === 'Approaching Renewal' || emp.contract.renewalStatus === 'Renewal Pending Sign-off';
                  return (
                    <tr key={emp.id} className="hover:bg-[#F9FBFA] transition-colors">
                      <td className="py-3 px-3.5 font-mono font-medium text-[#147D4A]">
                        {emp.contract.referenceNo}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            className="w-7 h-7 rounded-xl object-cover border border-[#C5E8D2]"
                          />
                          <div>
                            <span className="font-bold text-[#192C21] block">{emp.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-800">
                        {emp.jobTitle}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        <span className="block truncate max-w-[160px] font-medium text-[#192C21]">{emp.divisionName}</span>
                        <span className="text-[10px] text-[#788C7F]">{emp.campusLocation}</span>
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">
                        ${emp.contract.monthlyBaseSalary} {emp.contract.currency}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="block font-medium text-slate-800">{emp.contract.startDate} → {emp.contract.endDate}</span>
                        <span className="text-[10px] text-slate-500">{emp.contract.contractType}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isExpiring ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {emp.contract.renewalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigateToProfile(emp.id)}
                            className="px-2 py-1 text-xs text-[#147D4A] hover:bg-[#EBF7EE] rounded-lg font-semibold transition-colors"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              setContractRenewalTarget(emp);
                              setIsRenewContractOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-lg font-semibold transition-colors shadow-2xs"
                          >
                            Renew
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
