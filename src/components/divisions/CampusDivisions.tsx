import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolDivisionCategory } from '../../types';
import {
  Building2,
  MapPin,
  ArrowRight,
  Phone,
  Filter,
  X
} from 'lucide-react';

export const CampusDivisions: React.FC = () => {
  const {
    divisions,
    employees,
    navigateToDivisionStaff,
    navigateToProfile
  } = useApp();

  const [selectedCity, setSelectedCity] = useState<'all' | 'Hargeisa' | 'Gabiley'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Secondary' | 'Primary'>('all');
  const [modalDivision, setModalDivision] = useState<SchoolDivisionCategory | null>(null);

  // Filter divisions
  const filteredDivisions = divisions.filter(div => {
    if (selectedCity !== 'all' && div.city !== selectedCity) return false;
    if (selectedLevel !== 'all' && div.level !== selectedLevel && div.level !== 'Central Operations') return false;
    return true;
  });

  const totalStudents = divisions.reduce((acc, d) => acc + d.studentCount, 0);
  const totalSchoolTeachers = employees.filter(e => e.jobTitle === 'Teacher').length;
  const avgRatio = totalSchoolTeachers > 0 ? Math.round(totalStudents / totalSchoolTeachers) : 0;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-[#192C21] tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#147D4A]" />
              School Divisions
            </h1>
            <span className="text-xs bg-[#EBF7EE] text-[#147D4A] font-bold px-2.5 py-0.5 rounded-full font-mono">
              8 Divisions
            </span>
          </div>
          <p className="text-xs text-[#57685D] mt-1 max-w-2xl">
            Campus divisions across Hargeisa and Gabiley organized by school level and wing.
          </p>
        </div>

        {/* Global Network Metrics */}
        <div className="flex items-center gap-5 border-l border-slate-100 pl-4 shrink-0 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Students</span>
            <span className="text-base font-black text-[#192C21] font-mono">{totalStudents.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Teacher Ratio</span>
            <span className="text-base font-black text-[#147D4A] font-mono">1:{avgRatio}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#57685D] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Campus City:
          </span>
          <div className="flex p-0.5 bg-slate-100 rounded-xl">
            {(['all', 'Hargeisa', 'Gabiley'] as const).map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCity === city
                    ? 'bg-white text-[#147D4A] shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21]'
                }`}
              >
                {city === 'all' ? 'All' : city}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#57685D] font-semibold">School Level:</span>
          <div className="flex p-0.5 bg-slate-100 rounded-xl">
            {(['all', 'Secondary', 'Primary'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-white text-[#147D4A] shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21]'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredDivisions.map((div) => {
          const divStaff = employees.filter(e => e.divisionId === div.id);
          const teachers = divStaff.filter(e => e.jobTitle === 'Teacher').length;
          const securities = divStaff.filter(e => e.jobTitle === 'Security Guard').length;
          const cleaners = divStaff.filter(e => e.jobTitle === 'Cleaner').length;
          const drivers = divStaff.filter(e => e.jobTitle === 'Driver').length;
          const isHQ = div.id === 'div-hq-admin-hrg';

          return (
            <div
              key={div.id}
              className={`bg-white border rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 ${
                isHQ ? 'border-indigo-200 bg-indigo-50/15' : 'border-[#E2EAE4] hover:border-[#147D4A]'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#147D4A] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      {div.canonicalIndex}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                      {div.code}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#57685D] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#147D4A]" />
                    {div.city}
                  </span>
                </div>

                {/* Division Title */}
                <h3 className="text-sm font-bold text-[#192C21] group-hover:text-[#147D4A] transition-colors leading-snug">
                  {div.name}
                </h3>
                <p className="text-[11px] text-[#57685D] mt-1 line-clamp-2 leading-relaxed">
                  {div.description}
                </p>

                {/* Principal / Campus Head */}
                <div className="mt-3 p-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center gap-2.5">
                  <img
                    src={div.principalAvatar}
                    alt={div.principalName}
                    className="w-9 h-9 rounded-xl object-cover border border-[#C5E8D2] shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#798C80] block">
                      {isHQ ? 'Director' : 'Principal'}
                    </span>
                    <span className="font-bold text-xs text-[#192C21] block truncate">{div.principalName}</span>
                    <span className="text-[10px] text-[#57685D] flex items-center gap-1 font-mono mt-0.5">
                      <Phone className="w-2.5 h-2.5 text-[#147D4A]" /> {div.principalPhone}
                    </span>
                  </div>
                </div>

                {/* Staff Breakdown */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#384C3F]">
                    <span className="text-[#57685D]">Assigned Staff:</span>
                    <span className="font-bold font-mono text-xs text-[#192C21]">{divStaff.length} Staff</span>
                  </div>

                  {!isHQ && (
                    <div className="flex items-center justify-between text-[#57685D]">
                      <span>Students:</span>
                      <span className="font-semibold font-mono text-[#192C21]">{div.studentCount}</span>
                    </div>
                  )}

                  {/* Role composition chips */}
                  <div className="pt-1.5 flex flex-wrap gap-1 text-[10px]">
                    {teachers > 0 && (
                      <span className="bg-[#EBF7EE] text-[#147D4A] font-semibold px-2 py-0.5 rounded-md">
                        {teachers} Teachers
                      </span>
                    )}
                    {securities > 0 && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {securities} Security
                      </span>
                    )}
                    {cleaners > 0 && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {cleaners} Cleaners
                      </span>
                    )}
                    {drivers > 0 && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {drivers} Drivers
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setModalDivision(div)}
                  className="font-semibold text-[#57685D] hover:text-[#192C21]"
                >
                  Overview
                </button>

                <button
                  type="button"
                  onClick={() => navigateToDivisionStaff(div.id)}
                  className="inline-flex items-center gap-1 font-bold text-[#147D4A] hover:underline"
                >
                  <span>Staff Roster</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Division Staff Details Modal */}
      {modalDivision && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    {modalDivision.code}
                  </span>
                  <span className="text-xs text-[#57685D]">Division #{modalDivision.canonicalIndex}</span>
                </div>
                <h3 className="text-base font-bold text-[#192C21] mt-1">{modalDivision.name}</h3>
                <p className="text-xs text-[#57685D] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#147D4A]" /> {modalDivision.campusAddress}
                </p>
              </div>

              <button
                onClick={() => setModalDivision(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80] mb-2">
                  Assigned Staff ({employees.filter(e => e.divisionId === modalDivision.id).length})
                </h4>

                <div className="divide-y divide-slate-100 border border-[#E2EAE4] rounded-xl overflow-hidden">
                  {employees
                    .filter(e => e.divisionId === modalDivision.id)
                    .map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setModalDivision(null);
                          navigateToProfile(emp.id);
                        }}
                        className="p-3 hover:bg-[#F9FBFA] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-[#C5E8D2]"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#192C21] hover:text-[#147D4A] block">
                              {emp.fullName}
                            </span>
                            <span className="text-[11px] text-[#57685D]">
                              {emp.jobTitle} · <span className="font-mono">{emp.id}</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="font-semibold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md text-[10px]">
                            {emp.employmentStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Contract: {emp.contract.endDate}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <button
                onClick={() => setModalDivision(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const divId = modalDivision.id;
                  setModalDivision(null);
                  navigateToDivisionStaff(divId);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>View Directory Roster</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
