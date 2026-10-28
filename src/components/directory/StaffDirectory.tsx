import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Download,
  Plus,
  Eye,
  FileText,
  MapPin,
  GraduationCap,
  LayoutGrid,
  List,
  AlertCircle,
  ArrowUpDown,
  Phone,
  Mail,
  RotateCcw
} from 'lucide-react';

export const StaffDirectory: React.FC = () => {
  const {
    employees,
    divisions,
    regionalScope,
    filters,
    setFilters,
    resetFilters,
    navigateToProfile,
    setIsRenewContractOpen,
    setContractRenewalTarget,
    setActivePage
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<'fullName' | 'id' | 'hireDate' | 'jobTitle'>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Regional scope from header
      if (regionalScope === 'hargeisa' && emp.campusLocation !== 'Hargeisa') return false;
      if (regionalScope === 'gabiley' && emp.campusLocation !== 'Gabiley') return false;

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = emp.fullName.toLowerCase().includes(q) || (emp.somaliName && emp.somaliName.toLowerCase().includes(q));
        const matchesId = emp.id.toLowerCase().includes(q);
        const matchesRole = emp.jobTitle.toLowerCase().includes(q);
        const matchesPhone = emp.phoneNumber.toLowerCase().includes(q);
        const matchesEmail = emp.email.toLowerCase().includes(q);
        const matchesArea = emp.residentialArea.toLowerCase().includes(q);
        const matchesSubjects = emp.teachingSubjects?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesRole && !matchesPhone && !matchesEmail && !matchesArea && !matchesSubjects) {
          return false;
        }
      }

      // City filter
      if (filters.campusLocation && emp.campusLocation !== filters.campusLocation) {
        return false;
      }

      // Division filter
      if (filters.divisionId && emp.divisionId !== filters.divisionId) {
        return false;
      }

      // Role filter
      if (filters.jobRole && emp.jobTitle !== filters.jobRole) {
        return false;
      }

      // School level filter
      if (filters.schoolLevel && emp.schoolLevel !== filters.schoolLevel) {
        return false;
      }

      // Gender division filter
      if (filters.genderDivision && emp.genderDivision !== filters.genderDivision) {
        return false;
      }

      // Contract status filter
      if (filters.contractStatus) {
        if (filters.contractStatus === 'expiring' && emp.contract.renewalStatus !== 'Approaching Renewal' && emp.contract.renewalStatus !== 'Renewal Pending Sign-off') {
          return false;
        }
        if (filters.contractStatus === 'active' && emp.contract.renewalStatus !== 'Not Due' && emp.contract.renewalStatus !== 'Renewed') {
          return false;
        }
      }

      // Employment status
      if (filters.employmentStatus && emp.employmentStatus !== filters.employmentStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, regionalScope, filters, sortField, sortOrder]);

  const handleSort = (field: 'fullName' | 'id' | 'hireDate' | 'jobTitle') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const exportFilteredCSV = () => {
    const csvRows = [
      ['ID', 'Full Name', 'Somali Name', 'Division', 'City', 'Level', 'Gender Wing', 'Role', 'Phone', 'Email', 'Residential Area', 'Qualifications', 'Contract Ref', 'Contract End Date', 'Status']
    ];

    filteredEmployees.forEach(e => {
      csvRows.push([
        e.id,
        `"${e.fullName}"`,
        `"${e.somaliName || ''}"`,
        `"${e.divisionName}"`,
        e.campusLocation,
        e.schoolLevel,
        e.genderDivision,
        `"${e.jobTitle}"`,
        e.phoneNumber,
        e.email,
        `"${e.residentialArea}"`,
        `"${e.qualifications.highestDegree}"`,
        e.contract.referenceNo,
        e.contract.endDate,
        e.employmentStatus
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DirectAid_Staff_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.divisionId ||
    filters.jobRole ||
    filters.campusLocation ||
    filters.schoolLevel ||
    filters.genderDivision ||
    filters.contractStatus ||
    filters.employmentStatus
  );

  return (
    <div className="space-y-5">
      {/* Directory Header Bar */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-[#192C21] tracking-tight">Staff Directory</h1>
            <span className="text-xs bg-[#EBF7EE] text-[#147D4A] font-bold px-2.5 py-0.5 rounded-full font-mono">
              {filteredEmployees.length} Staff
            </span>
          </div>
          <p className="text-xs text-[#57685D] mt-1">
            Search, filter, and inspect staff profiles across Hargeisa and Gabiley divisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-[#E2EAE4] rounded-xl p-0.5 bg-[#F6FAF7]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#147D4A] shadow-xs' : 'text-[#64776C] hover:text-[#192C21]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#147D4A] shadow-xs' : 'text-[#64776C] hover:text-[#192C21]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={exportFilteredCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#192C21] bg-white hover:bg-[#F3F7F4] border border-[#E2EAE4] rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#147D4A]" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setActivePage('register')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search name, ID, phone, area..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#147D4A]"
            />
          </div>

          {/* Division Selector */}
          <div>
            <select
              value={filters.divisionId}
              onChange={(e) => setFilters(prev => ({ ...prev, divisionId: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer"
            >
              <option value="">All Divisions</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Role Selector */}
          <div>
            <select
              value={filters.jobRole}
              onChange={(e) => setFilters(prev => ({ ...prev, jobRole: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Principal">Principal</option>
              <option value="Deputy Principal">Deputy Principal</option>
              <option value="Teacher">Teacher</option>
              <option value="Security Guard">Security Guard</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Driver">Driver</option>
              <option value="Secretary">Secretary</option>
              <option value="Finance Officer">Finance Officer</option>
              <option value="IT Support Officer">IT Support Officer</option>
              <option value="Human Resources Officer">HR Officer</option>
            </select>
          </div>

          {/* School Level */}
          <div>
            <select
              value={filters.schoolLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, schoolLevel: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Secondary">Secondary</option>
              <option value="Primary">Primary</option>
              <option value="Central Operations">Central HQ</option>
            </select>
          </div>

          {/* Gender Division */}
          <div>
            <select
              value={filters.genderDivision}
              onChange={(e) => setFilters(prev => ({ ...prev, genderDivision: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs text-[#192C21] focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer"
            >
              <option value="">All Wings</option>
              <option value="Boys">Boys Wing</option>
              <option value="Girls">Girls Wing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tags & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2EAE4] text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#57685D] text-[11px] font-semibold mr-1">Quick Filter:</span>
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, jobRole: prev.jobRole === 'Teacher' ? '' : 'Teacher' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.jobRole === 'Teacher'
                  ? 'bg-[#147D4A] text-white border-[#147D4A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Teachers ({employees.filter(e => e.jobTitle === 'Teacher').length})
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, jobRole: prev.jobRole === 'Principal' ? '' : 'Principal' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.jobRole === 'Principal'
                  ? 'bg-[#147D4A] text-white border-[#147D4A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Principals
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, jobRole: prev.jobRole === 'Security Guard' ? '' : 'Security Guard' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.jobRole === 'Security Guard'
                  ? 'bg-[#147D4A] text-white border-[#147D4A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Security
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, jobRole: prev.jobRole === 'Cleaner' ? '' : 'Cleaner' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.jobRole === 'Cleaner'
                  ? 'bg-[#147D4A] text-white border-[#147D4A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Cleaners
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, jobRole: prev.jobRole === 'Driver' ? '' : 'Driver' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.jobRole === 'Driver'
                  ? 'bg-[#147D4A] text-white border-[#147D4A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Drivers
            </button>

            <button
              onClick={() => setFilters(prev => ({ ...prev, contractStatus: prev.contractStatus === 'expiring' ? '' : 'expiring' }))}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                filters.contractStatus === 'expiring'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-300'
              }`}
            >
              Expiring Soon
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#147D4A] text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Employee Presentation: Grid vs Table */}
      {viewMode === 'grid' ? (
        /* Grid Card View - Beautiful & Attractive */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((emp) => {
            const isExpiring = emp.contract.renewalStatus === 'Approaching Renewal' || emp.contract.renewalStatus === 'Renewal Pending Sign-off';
            return (
              <div
                key={emp.id}
                onClick={() => navigateToProfile(emp.id)}
                className="bg-white border border-[#E2EAE4] hover:border-[#147D4A] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Card Header: ID & Location */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                      {emp.id}
                    </span>
                    <span className="text-[11px] font-semibold text-[#57685D] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#147D4A]" />
                      {emp.campusLocation}
                    </span>
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={emp.avatarUrl}
                        alt={emp.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#C5E8D2] shadow-2xs"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        emp.employmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-[#192C21] group-hover:text-[#147D4A] transition-colors truncate">
                        {emp.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-semibold text-[#147D4A] truncate">
                          {emp.jobTitle}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#57685D] truncate block mt-0.5">
                        {emp.divisionName}
                      </span>
                    </div>
                  </div>

                  {/* Contact & Meta */}
                  <div className="mt-3.5 pt-3 border-t border-[#E2EAE4] space-y-1 text-xs text-[#57685D]">
                    <div className="flex items-center gap-1.5 truncate text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700">{emp.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate text-[11px]">
                      <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{emp.qualifications.highestDegree}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status & Dossier CTA */}
                <div className="mt-3.5 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs">
                  <div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isExpiring
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {isExpiring ? 'Renewal Due' : 'Active'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#147D4A] group-hover:underline">
                    View Profile →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#E2EAE4] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E2EAE4] text-[#55675B] font-semibold select-none">
                  <th className="py-3 px-4 cursor-pointer hover:text-[#192C21]" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[#192C21]" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1">
                      <span>Staff Member</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[#192C21]" onClick={() => handleSort('jobTitle')}>
                    <div className="flex items-center gap-1">
                      <span>Role</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4">Completeness</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF1ED]">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-slate-700">No staff members found</span>
                        <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 text-xs text-[#147D4A] font-semibold underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isExpiring = emp.contract.renewalStatus === 'Approaching Renewal' || emp.contract.renewalStatus === 'Renewal Pending Sign-off';
                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-[#F8FCF9] transition-colors group cursor-pointer"
                        onClick={() => navigateToProfile(emp.id)}
                      >
                        {/* ID */}
                        <td className="py-3 px-4 font-mono font-medium text-[#147D4A]">
                          {emp.id}
                        </td>

                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={emp.avatarUrl}
                              alt={emp.fullName}
                              className="w-8 h-8 rounded-xl object-cover border border-[#C5E8D2] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-[#192C21] block truncate group-hover:text-[#147D4A]">
                                {emp.fullName}
                              </span>
                              {emp.somaliName && (
                                <span className="text-[10px] text-[#718478] truncate block">
                                  {emp.somaliName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Subject */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#192C21] block">
                            {emp.jobTitle}
                          </span>
                          <span className="text-[11px] text-[#57685D] truncate block">
                            {emp.qualifications.highestDegree}
                          </span>
                        </td>

                        {/* Division */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#192C21] block max-w-[180px] truncate" title={emp.divisionName}>
                            {emp.divisionName}
                          </span>
                          <span className="text-[10px] text-[#788C7F]">
                            {emp.genderDivision} Wing
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#192C21] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#147D4A]" />
                            {emp.campusLocation}
                          </span>
                          <span className="text-[11px] text-[#718478] truncate block">
                            {emp.residentialArea}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 text-[11px]">
                          <span className="text-[#192C21] block font-mono">{emp.phoneNumber}</span>
                          <span className="text-[#57685D] truncate block max-w-[140px]">{emp.email}</span>
                        </td>

                        {/* Contract status */}
                        <td className="py-3 px-4">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                            isExpiring
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {emp.contract.endDate}
                          </span>
                        </td>

                        {/* Completeness */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  emp.profileCompleteness === 100
                                    ? 'bg-emerald-500'
                                    : emp.profileCompleteness >= 80
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${emp.profileCompleteness}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-600 font-bold">
                              {emp.profileCompleteness}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigateToProfile(emp.id)}
                              className="p-1.5 rounded-lg hover:bg-[#EBF7EE] text-[#147D4A] transition-colors"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setContractRenewalTarget(emp);
                                setIsRenewContractOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors"
                              title="Renew Contract"
                            >
                              <FileText className="w-4 h-4" />
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
      )}
    </div>
  );
};
