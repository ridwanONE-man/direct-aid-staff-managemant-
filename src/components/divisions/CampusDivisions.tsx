import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolDivisionCategory, LocationCity, SchoolLevel, GenderDivision } from '../../types';
import { BulkActionBar, ConfirmDeleteDialog, SelectBox } from '../common/BulkActions';
import { HQ_LEVEL, isHeadquarters, leaderRoleFor, leaderTitleFor } from '../../lib/divisions';
import { DIVISION_COLORS, divisionColor, nextDivisionColor } from '../../data/divisionColors';
import { roleTheme } from '../../data/roleTheme';
import { EmployeeRecord } from '../../types';
import {
  Building2,
  MapPin,
  ArrowRight,
  Phone,
  Filter,
  X,
  Plus,
  UserCheck,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  Landmark,
  School,
  ArrowLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Check,
  Palette
} from 'lucide-react';

// Staff of a division grouped by type (Leadership, Teaching, ...), with the same icons as the staff cards
const staffGroups = (staff: EmployeeRecord[]) => {
  const groups = new Map<string, { count: number; icon: React.ElementType }>();
  staff.forEach(emp => {
    const theme = roleTheme(emp);
    const entry = groups.get(theme.group);
    if (entry) entry.count += 1;
    else groups.set(theme.group, { count: 1, icon: theme.icon });
  });
  return [...groups.entries()].sort((a, b) => b[1].count - a[1].count);
};

const emptyDivisionForm = {
  name: '',
  code: '',
  city: 'Hargeisa' as LocationCity,
  level: 'Secondary' as SchoolLevel,
  gender: 'Boys' as GenderDivision,
  principalEmployeeId: '',
  studentCount: '',
  description: '',
  campusAddress: '',
  color: ''
};

export const CampusDivisions: React.FC = () => {
  const {
    divisions: allDivisions,
    scopedDivisions: divisions,
    employees,
    scopedEmployees,
    regionalScope,
    setRegionalScope,
    deleteDivisions,
    navigateToDivisionStaff,
    navigateToProfile,
    addDivision,
    deleteDivision,
    updateDivision,
    setActivePage
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDelete, setBulkDelete] = useState<{ ids: string[]; all: boolean } | null>(null);
  const [bulkResult, setBulkResult] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'Secondary' | 'Primary'>('all');
  const [modalDivision, setModalDivision] = useState<SchoolDivisionCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [unlinkedPrincipal, setUnlinkedPrincipal] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SchoolDivisionCategory | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const pendingDeleteStaff = pendingDelete ? employees.filter(e => e.divisionId === pendingDelete.id).length : 0;
  const [divisionForm, setDivisionForm] = useState(emptyDivisionForm);
  // School or headquarters; null while the create box is still asking which one
  const [divisionKind, setDivisionKind] = useState<'school' | 'hq' | null>(null);
  const staffWithLeaderRole = (level: SchoolLevel) => employees.filter(e => e.jobTitle === leaderRoleFor(level));
  const principalStaff = staffWithLeaderRole(divisionForm.level);
  const leaderTitle = leaderTitleFor(divisionForm.level);
  const selectedPrincipal = principalStaff.find(e => e.id === divisionForm.principalEmployeeId);
  const principalOfOther = (employeeId: string) =>
    allDivisions.find(d => d.id !== editingId && d.principalEmployeeId === employeeId);
  const [formError, setFormError] = useState('');

  const isOperations = divisionForm.level === 'Central Operations';

  const updateForm = (field: keyof typeof emptyDivisionForm, value: string) => {
    setDivisionForm(prev => ({ ...prev, [field]: value }));
  };

  const chooseKind = (kind: 'school' | 'hq') => {
    setDivisionKind(kind);
    setFormError('');
    setDivisionForm(prev => ({
      ...prev,
      level: kind === 'hq' ? HQ_LEVEL : prev.level === HQ_LEVEL ? 'Secondary' : prev.level,
      gender: kind === 'hq' ? 'Operations' : prev.gender === 'Operations' ? 'Boys' : prev.gender,
      principalEmployeeId: '',
      color: prev.color || nextDivisionColor(allDivisions)
    }));
  };

  const openEditModal = (div: SchoolDivisionCategory) => {
    setDivisionForm({
      name: div.name,
      code: div.code,
      city: div.city,
      level: div.level,
      gender: div.gender,
      principalEmployeeId: staffWithLeaderRole(div.level).some(e => e.id === div.principalEmployeeId) ? div.principalEmployeeId! : '',
      studentCount: div.studentCount ? String(div.studentCount) : '',
      description: div.description,
      campusAddress: div.campusAddress,
      color: divisionColor(div).key
    });
    setFormError('');
    setUnlinkedPrincipal(
      div.principalName && !staffWithLeaderRole(div.level).some(e => e.id === div.principalEmployeeId) ? div.principalName : ''
    );
    setDivisionKind(isHeadquarters(div) ? 'hq' : 'school');
    setEditingId(div.id);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setDivisionKind(null);
    setEditingId(null);
    setUnlinkedPrincipal('');
    setDivisionForm(emptyDivisionForm);
    setFormError('');
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const name = divisionForm.name.trim();
    const code = divisionForm.code.trim().toUpperCase();

    if (!name || !code) {
      setFormError(`${isOperations ? 'Office' : 'School'} name and code are required.`);
      return;
    }
    if (allDivisions.some(d => d.id !== editingId && d.code.toUpperCase() === code)) {
      setFormError(`A division with code ${code} already exists.`);
      return;
    }

    const details = {
      name,
      code,
      city: divisionForm.city,
      level: divisionForm.level,
      gender: isOperations ? 'Operations' : divisionForm.gender,
      principalName: selectedPrincipal?.fullName || '',
      principalAvatar: selectedPrincipal?.avatarUrl || '',
      principalPhone: selectedPrincipal?.phoneNumber || '',
      principalEmployeeId: selectedPrincipal?.id,
      studentCount: isOperations ? 0 : Number(divisionForm.studentCount) || 0,
      description: divisionForm.description.trim(),
      campusAddress: divisionForm.campusAddress.trim(),
      color: divisionForm.color || nextDivisionColor(allDivisions)
    };

    if (editingId) {
      updateDivision(editingId, details);
      if (modalDivision?.id === editingId) setModalDivision(null);
      closeCreateModal();
      return;
    }

    addDivision(details);

    // Reset filters so the new division is visible
    setRegionalScope('all');
    setSelectedLevel('all');
    closeCreateModal();
  };

  // Filter divisions
  const filteredDivisions = divisions.filter(div => {
    if (selectedLevel !== 'all' && div.level !== selectedLevel && div.level !== 'Central Operations') return false;
    return true;
  });

  const totalStudents = divisions.reduce((acc, d) => acc + d.studentCount, 0);
  const totalSchoolTeachers = scopedEmployees.filter(e => e.jobTitle === 'Teacher').length;

  // Only cards currently on screen count as selected
  const visibleSelected = selectedIds.filter(id => filteredDivisions.some(d => d.id === id));
  const isSelected = (id: string) => visibleSelected.includes(id);
  const toggleSelected = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const bulkBlocked = bulkDelete
    ? bulkDelete.ids.filter(id => employees.some(e => e.divisionId === id))
    : [];
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
              {divisions.length} {divisions.length === 1 ? 'Division' : 'Divisions'}
            </span>
          </div>
          <p className="text-xs text-[#57685D] mt-1 max-w-2xl">
            {regionalScope === 'all'
              ? 'Campus divisions across Hargeisa and Gabiley organized by school level and wing.'
              : `Showing ${regionalScope === 'hargeisa' ? 'Hargeisa' : 'Gabiley'} divisions only (regional scope).`}
          </p>
        </div>

        {/* Global Network Metrics */}
        <div className="flex flex-wrap items-center gap-5 md:border-l border-slate-100 md:pl-4 shrink-0 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Students</span>
            <span className="text-base font-black text-[#192C21] font-mono">{totalStudents.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Teacher Ratio</span>
            <span className="text-base font-black text-[#147D4A] font-mono">1:{avgRatio}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="edit-only px-3.5 py-2 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Division</span>
          </button>
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
            {(['all', 'hargeisa', 'gabiley'] as const).map(city => (
              <button
                key={city}
                onClick={() => setRegionalScope(city)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  regionalScope === city
                    ? 'bg-white text-[#147D4A] shadow-xs'
                    : 'text-[#57685D] hover:text-[#192C21]'
                }`}
              >
                {city === 'all' ? 'All' : city === 'hargeisa' ? 'Hargeisa' : 'Gabiley'}
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

      {bulkResult && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-start justify-between gap-3">
          <span>{bulkResult}</span>
          <button onClick={() => setBulkResult('')} className="shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <BulkActionBar
        noun={{ one: 'division', many: 'divisions' }}
        visibleCount={filteredDivisions.length}
        selectedCount={visibleSelected.length}
        onToggleAll={() =>
          setSelectedIds(visibleSelected.length === filteredDivisions.length ? [] : filteredDivisions.map(d => d.id))
        }
        onDeleteSelected={() => setBulkDelete({ ids: visibleSelected, all: false })}
        onDeleteAll={() => setBulkDelete({ ids: filteredDivisions.map(d => d.id), all: true })}
      />

      {/* Empty State */}
      {filteredDivisions.length === 0 && (
        <div className="bg-white border border-dashed border-[#C5E8D2] rounded-2xl p-12 text-center shadow-xs">
          <Building2 className="w-8 h-8 text-[#147D4A] mx-auto" />
          <h3 className="text-base font-bold text-[#192C21] mt-3">
            {allDivisions.length === 0 ? 'No School Divisions Yet' : 'No Divisions Match These Filters'}
          </h3>
          <p className="text-xs text-[#57685D] mt-1">
            {allDivisions.length === 0
              ? 'Create your first school division to start assigning staff.'
              : 'Try a different city or school level.'}
          </p>
          {allDivisions.length === 0 && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="edit-only mt-4 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Division
            </button>
          )}
        </div>
      )}

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredDivisions.map((div) => {
          const divStaff = employees.filter(e => e.divisionId === div.id);
          const teachers = divStaff.filter(e => e.jobTitle === 'Teacher').length;
          const isHQ = isHeadquarters(div);
          const color = divisionColor(div);
          const TypeIcon = isHQ ? Landmark : School;

          return (
            <div
              key={div.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 ${
                isSelected(div.id) ? 'border-[#147D4A] ring-2 ring-[#147D4A]/20' : 'border-[#E2EAE4]'
              }`}
            >
              {/* Colour band with the division name */}
              <div className={`relative bg-linear-to-br ${color.band} px-4 pt-3 pb-4 text-white overflow-hidden`}>
                <span className="absolute -top-10 -right-8 w-32 h-32 rounded-full border-[16px] border-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <SelectBox
                      checked={isSelected(div.id)}
                      onChange={() => toggleSelected(div.id)}
                      label={`Select ${div.name}`}
                    />
                    <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center font-mono shrink-0" style={{ color: color.swatch }}>
                      {div.canonicalIndex}
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md truncate">
                      {div.code}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full shrink-0">
                    <TypeIcon className="w-3 h-3" /> {isHQ ? 'Office' : div.level}
                  </span>
                </div>
                <h3 className="relative mt-3 text-base font-extrabold leading-snug line-clamp-2">{div.name}</h3>
                <p className="relative mt-1 text-[11px] text-white/85 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {div.city}</span>
                  {!isHQ && div.gender && <span>· {div.gender} wing</span>}
                </p>
              </div>

              <div className="px-4 py-3.5 flex-1 flex flex-col">
                {/* Head of the division */}
                <div className="flex items-center gap-2.5">
                  {div.principalAvatar ? (
                    <img
                      src={div.principalAvatar}
                      alt={div.principalName}
                      className="w-16 h-16 rounded-2xl shadow-sm object-cover border-2 shrink-0"
                      style={{ borderColor: color.swatch }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#F6FAF7] border-2 border-dashed shrink-0 flex items-center justify-center" style={{ borderColor: color.swatch, color: color.swatch }}>
                      <UserCheck className="w-7 h-7" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#798C80] block">
                      {leaderTitleFor(div.level)}
                    </span>
                    <span className={`text-xs block truncate ${div.principalName ? 'font-bold text-[#192C21]' : 'italic text-[#798C80]'}`}>
                      {div.principalName || 'Not assigned'}
                    </span>
                    {div.principalPhone && (
                      <span className="text-[10px] text-[#57685D] flex items-center gap-1 font-mono">
                        <Phone className="w-2.5 h-2.5" style={{ color: color.swatch }} /> {div.principalPhone}
                      </span>
                    )}
                  </div>
                </div>

                {div.description && (
                  <p className="text-[11px] text-[#57685D] mt-2.5 line-clamp-2 leading-relaxed">{div.description}</p>
                )}

                {/* Key numbers */}
                <div className={`mt-3 grid gap-2 ${isHQ ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {[
                    { icon: Users, value: divStaff.length, label: 'Staff' },
                    ...(isHQ
                      ? []
                      : [
                          { icon: GraduationCap, value: teachers, label: 'Teachers' },
                          { icon: School, value: div.studentCount, label: 'Students' }
                        ])
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl bg-[#F6FAF7] border border-[#E2EAE4] px-2 py-2 text-center">
                      <stat.icon className="w-3.5 h-3.5 mx-auto" style={{ color: color.swatch }} />
                      <span className="block text-base font-black text-[#192C21] font-mono leading-tight mt-0.5">{stat.value}</span>
                      <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#798C80]">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Staff by type */}
                {divStaff.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {staffGroups(divStaff).map(([group, { count, icon: GroupIcon }]) => (
                      <span key={group} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#384C3F] bg-[#F6FAF7] border border-[#E2EAE4] px-2 py-0.5 rounded-md">
                        <GroupIcon className="w-3 h-3" style={{ color: color.swatch }} /> {count} {group}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="mt-auto pt-3">
                  <div className="pt-2.5 border-t border-[#E2EAE4] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModalDivision(div)}
                        className="font-semibold text-[#57685D] hover:text-[#192C21] mr-1"
                      >
                        Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(div)}
                        className="edit-only p-1.5 rounded-lg text-slate-400 hover:text-[#147D4A] hover:bg-[#EBF7EE] transition-colors"
                        title="Edit division"
                        aria-label={`Edit ${div.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError('');
                          setPendingDelete(div);
                        }}
                        className="edit-only p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete division"
                        aria-label={`Delete ${div.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateToDivisionStaff(div.id)}
                      className="inline-flex items-center gap-1 font-bold hover:underline"
                      style={{ color: color.swatch }}
                    >
                      <span>Staff Roster</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
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
                  <MapPin className="w-3.5 h-3.5 text-[#147D4A]" /> {modalDivision.campusAddress || modalDivision.city}
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
      {bulkDelete && (
        <ConfirmDeleteDialog
          title={bulkDelete.all ? 'Delete all divisions shown?' : `Delete ${bulkDelete.ids.length} selected divisions?`}
          message={
            bulkBlocked.length === bulkDelete.ids.length ? (
              <>None of these divisions can be deleted because they all still have staff. Delete or move their staff first.</>
            ) : (
              <>
                This permanently removes <strong className="text-[#192C21]">{bulkDelete.ids.length - bulkBlocked.length}</strong>{' '}
                {bulkDelete.ids.length - bulkBlocked.length === 1 ? 'division' : 'divisions'}. This cannot be undone.
              </>
            )
          }
          confirmLabel={`Delete ${bulkDelete.ids.length - bulkBlocked.length}`}
          confirmDisabled={bulkBlocked.length === bulkDelete.ids.length}
          onCancel={() => setBulkDelete(null)}
          onConfirm={() => {
            const { blocked } = deleteDivisions(bulkDelete.ids);
            setBulkResult(
              blocked.length > 0
                ? `Skipped ${blocked.length} ${blocked.length === 1 ? 'division' : 'divisions'} that still have staff: ${blocked.join(', ')}.`
                : ''
            );
            setSelectedIds([]);
            setBulkDelete(null);
          }}
        >
          {bulkBlocked.length > 0 && bulkBlocked.length < bulkDelete.ids.length && (
            <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              {bulkBlocked.length} {bulkBlocked.length === 1 ? 'division has' : 'divisions have'} staff and will be skipped.
            </p>
          )}
          {bulkDelete.all && regionalScope !== 'all' && (
            <p className="mt-2 text-xs text-[#57685D]">Only divisions in the current regional scope are included.</p>
          )}
        </ConfirmDeleteDialog>
      )}

      {/* Delete Division Confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2EAE4] shadow-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <span className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-[#192C21]">Delete school division?</h3>
                <div className="mt-3 p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                  <span className="font-mono text-[11px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    {pendingDelete.code}
                  </span>
                  <span className="font-bold text-sm text-[#192C21] block mt-1.5">{pendingDelete.name}</span>
                  <span className="text-xs text-[#57685D]">
                    {pendingDelete.city} · {pendingDeleteStaff} {pendingDeleteStaff === 1 ? 'staff member' : 'staff members'}
                  </span>
                </div>
                {pendingDeleteStaff > 0 ? (
                  <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    This division still has staff assigned. Delete or move them first, then delete the division.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[#57685D]">This permanently removes the division. This cannot be undone.</p>
                )}
                {deleteError && <p className="mt-2 text-xs font-semibold text-rose-600">{deleteError}</p>}
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-end gap-2">
              {pendingDeleteStaff > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const divId = pendingDelete.id;
                    setPendingDelete(null);
                    navigateToDivisionStaff(divId);
                  }}
                  className="mr-auto px-3 py-2 text-sm font-semibold text-[#147D4A] hover:underline"
                >
                  View staff
                </button>
              )}
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pendingDeleteStaff > 0}
                onClick={() => {
                  const err = deleteDivision(pendingDelete.id);
                  if (err) {
                    setDeleteError(err);
                    return;
                  }
                  if (modalDivision?.id === pendingDelete.id) setModalDivision(null);
                  setPendingDelete(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Division Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDivision}
            className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95"
          >
            <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#192C21] flex items-center gap-2">
                  {divisionKind === 'hq' ? (
                    <Landmark className="w-4.5 h-4.5 text-[#147D4A]" />
                  ) : divisionKind === 'school' ? (
                    <School className="w-4.5 h-4.5 text-[#147D4A]" />
                  ) : (
                    <Building2 className="w-4.5 h-4.5 text-[#147D4A]" />
                  )}
                  {!divisionKind
                    ? 'Create Division'
                    : `${editingId ? 'Edit' : 'Create'} ${divisionKind === 'hq' ? 'Office' : 'School'}`}
                </h3>
                <p className="text-xs text-[#57685D] mt-0.5">
                  {!divisionKind
                    ? 'What would you like to add?'
                    : editingId
                      ? 'Changes also update the division shown on its staff records.'
                      : divisionKind === 'hq'
                        ? 'An office for central operations, led by a General Director.'
                        : 'A school campus, led by a Principal.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!divisionKind ? (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  {
                    kind: 'school' as const,
                    icon: School,
                    title: 'School',
                    text: 'A primary or secondary campus with its own Principal, wing and students.',
                    band: 'from-[#147D4A] via-[#2D9A48] to-[#35B86B]'
                  },
                  {
                    kind: 'hq' as const,
                    icon: Landmark,
                    title: 'Office',
                    text: 'An office for central operations, led by a General Director.',
                    band: 'from-[#0B4F2E] via-[#0E6139] to-[#147D4A]'
                  }
                ]).map(option => (
                  <button
                    key={option.kind}
                    type="button"
                    onClick={() => chooseKind(option.kind)}
                    className="group text-left bg-white border border-[#E2EAE4] hover:border-[#147D4A] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className={`relative h-20 bg-linear-to-br ${option.band} flex items-center justify-center`}>
                      <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full border-[12px] border-white/10" />
                      <span className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center">
                        <option.icon className="w-6 h-6" />
                      </span>
                    </div>
                    <div className="p-4">
                      <span className="flex items-center justify-between text-sm font-bold text-[#192C21] group-hover:text-[#147D4A]">
                        {option.title}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#147D4A]" />
                      </span>
                      <span className="block text-xs text-[#57685D] mt-1 leading-relaxed">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3 text-xs">
              {!editingId && (
                <button
                  type="button"
                  onClick={() => setDivisionKind(null)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#57685D] hover:text-[#147D4A]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change type
                </button>
              )}
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">{isOperations ? 'Office Name' : 'School Name'}</label>
                  <input
                    type="text"
                    value={divisionForm.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder={isOperations ? 'e.g. DirectAid Hargeisa Office' : 'e.g. Boys Secondary School - Hargeisa'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    value={divisionForm.code}
                    onChange={(e) => updateForm('code', e.target.value)}
                    placeholder={isOperations ? 'e.g. HQ-HRG' : 'e.g. HRG-SEC-B'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className={`grid grid-cols-1 gap-3 ${isOperations ? '' : 'sm:grid-cols-3'}`}>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <select
                    value={divisionForm.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                  >
                    <option value="Hargeisa">Hargeisa</option>
                    <option value="Gabiley">Gabiley</option>
                  </select>
                </div>
                {!isOperations && (
                <>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">School Level</label>
                  <select
                    value={divisionForm.level}
                    onChange={(e) => updateForm('level', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                  >
                    <option value="Secondary">Secondary</option>
                    <option value="Primary">Primary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Wing</label>
                  <select
                    value={isOperations ? 'Operations' : divisionForm.gender}
                    onChange={(e) => updateForm('gender', e.target.value)}
                    disabled={isOperations}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] disabled:bg-slate-100"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-educational">Co-educational</option>
                  </select>
                </div>
                </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={isOperations ? 'sm:col-span-3' : 'sm:col-span-2'}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">{leaderTitle}</label>
                    {(selectedPrincipal || unlinkedPrincipal) && (
                      <button
                        type="button"
                        onClick={() => {
                          updateForm('principalEmployeeId', '');
                          setUnlinkedPrincipal('');
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Set as not assigned
                      </button>
                    )}
                  </div>
                  <select
                    value={divisionForm.principalEmployeeId}
                    onChange={(e) => updateForm('principalEmployeeId', e.target.value)}
                    disabled={principalStaff.length === 0}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] bg-white disabled:bg-slate-100"
                  >
                    <option value="">Not assigned</option>
                    {principalStaff.map(p => {
                      const other = principalOfOther(p.id);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.fullName}{p.phoneNumber ? ` · ${p.phoneNumber}` : ''}{other ? ` (now at ${other.name})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {principalStaff.length === 0 ? (
                    <p className="mt-1.5 text-[11px] text-amber-700">
                      No staff with the {leaderTitle} role yet.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          closeCreateModal();
                          setActivePage('register');
                        }}
                        className="font-bold underline"
                      >
                        Register a {leaderTitle.toLowerCase()}
                      </button>
                    </p>
                  ) : selectedPrincipal && principalOfOther(selectedPrincipal.id) ? (
                    <p className="mt-1.5 text-[11px] text-amber-700">
                      {selectedPrincipal.fullName} will be removed as {leaderTitle.toLowerCase()} of {principalOfOther(selectedPrincipal.id)!.name}.
                    </p>
                  ) : unlinkedPrincipal && !selectedPrincipal ? (
                    <p className="mt-1.5 text-[11px] text-amber-700">
                      &quot;{unlinkedPrincipal}&quot; was typed in by hand and isn&apos;t a staff record. Choose a {leaderTitle.toLowerCase()} from the list; saving without one leaves it unassigned.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-slate-500">Only staff registered with the {leaderTitle} role are listed.</p>
                  )}
                </div>
                {!isOperations && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Count</label>
                  <input
                    type="number"
                    min="0"
                    value={isOperations ? '' : divisionForm.studentCount}
                    onChange={(e) => updateForm('studentCount', e.target.value)}
                    disabled={isOperations}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] font-mono disabled:bg-slate-100"
                  />
                </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{isOperations ? 'Office Address' : 'Campus Address'}</label>
                <input
                  type="text"
                  value={divisionForm.campusAddress}
                  onChange={(e) => updateForm('campusAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                />
              </div>

              <div>
                <span className="block text-slate-700 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#147D4A]" /> Card Colour
                  <span className="font-normal text-slate-500">· its staff cards use this colour too</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {DIVISION_COLORS.map(c => {
                    const active = divisionForm.color === c.key;
                    const takenBy = allDivisions.find(d => d.id !== editingId && divisionColor(d).key === c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => updateForm('color', c.key)}
                        title={takenBy ? `${c.label} (also used by ${takenBy.name})` : c.label}
                        aria-label={c.label}
                        aria-pressed={active}
                        className={`relative w-9 h-9 rounded-xl bg-linear-to-br ${c.band} shadow-sm transition-transform hover:scale-110 ${
                          active ? 'ring-2 ring-offset-2 ring-[#192C21] scale-110' : ''
                        }`}
                      >
                        {active && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                        {takenBy && !active && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  value={divisionForm.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] resize-none"
                />
              </div>
            </div>
            )}

            <div className="p-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              {divisionKind && (
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingId ? 'Save Changes' : `Create ${divisionKind === 'hq' ? 'Office' : 'School'}`}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
