import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolDivisionCategory, LocationCity, SchoolLevel, GenderDivision } from '../../types';
import { BulkActionBar, ConfirmDeleteDialog, SelectBox } from '../common/BulkActions';
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
  Save
} from 'lucide-react';

const emptyDivisionForm = {
  name: '',
  code: '',
  city: 'Hargeisa' as LocationCity,
  level: 'Secondary' as SchoolLevel,
  gender: 'Boys' as GenderDivision,
  principalEmployeeId: '',
  studentCount: '',
  description: '',
  campusAddress: ''
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
    clearDivisionPrincipal,
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
  const principalStaff = employees.filter(e => e.jobTitle === 'Principal');
  const selectedPrincipal = principalStaff.find(e => e.id === divisionForm.principalEmployeeId);
  const principalOfOther = (employeeId: string) =>
    allDivisions.find(d => d.id !== editingId && d.principalEmployeeId === employeeId);
  const [formError, setFormError] = useState('');

  const isOperations = divisionForm.level === 'Central Operations';

  const updateForm = (field: keyof typeof emptyDivisionForm, value: string) => {
    setDivisionForm(prev => ({ ...prev, [field]: value }));
  };

  const openEditModal = (div: SchoolDivisionCategory) => {
    setDivisionForm({
      name: div.name,
      code: div.code,
      city: div.city,
      level: div.level,
      gender: div.gender,
      principalEmployeeId: principalStaff.some(e => e.id === div.principalEmployeeId) ? div.principalEmployeeId! : '',
      studentCount: div.studentCount ? String(div.studentCount) : '',
      description: div.description,
      campusAddress: div.campusAddress
    });
    setFormError('');
    setUnlinkedPrincipal(
      div.principalName && !principalStaff.some(e => e.id === div.principalEmployeeId) ? div.principalName : ''
    );
    setEditingId(div.id);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
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
      setFormError('Division name and code are required.');
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
      campusAddress: divisionForm.campusAddress.trim()
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
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-colors flex items-center gap-1.5"
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
              className="mt-4 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
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
          const securities = divStaff.filter(e => e.jobTitle === 'Security Guard').length;
          const cleaners = divStaff.filter(e => e.jobTitle === 'Cleaner').length;
          const drivers = divStaff.filter(e => e.jobTitle === 'Driver').length;
          const isHQ = div.level === 'Central Operations';

          return (
            <div
              key={div.id}
              className={`bg-white border rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 ${
                isSelected(div.id)
                  ? 'border-[#147D4A] ring-2 ring-[#147D4A]/20'
                  : isHQ
                  ? 'border-indigo-200 bg-indigo-50/15'
                  : 'border-[#E2EAE4] hover:border-[#147D4A]'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <SelectBox
                      checked={isSelected(div.id)}
                      onChange={() => toggleSelected(div.id)}
                      label={`Select ${div.name}`}
                      className="mr-0.5"
                    />
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
                  {div.principalAvatar ? (
                    <img
                      src={div.principalAvatar}
                      alt={div.principalName}
                      className="w-9 h-9 rounded-xl object-cover border border-[#C5E8D2] shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#EBF7EE] border border-[#C5E8D2] shrink-0 flex items-center justify-center text-[#147D4A]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#798C80] block">
                      {isHQ ? 'Director' : 'Principal'}
                    </span>
                    <span className="font-bold text-xs text-[#192C21] block truncate">{div.principalName || 'Not assigned'}</span>
                    {div.principalPhone && (
                      <span className="text-[10px] text-[#57685D] flex items-center gap-1 font-mono mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-[#147D4A]" /> {div.principalPhone}
                      </span>
                    )}
                  </div>
                  {div.principalName && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove ${div.principalName} as ${isHQ ? 'director' : 'principal'} of ${div.name}?`)) {
                          clearDivisionPrincipal(div.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors self-start shrink-0"
                      title={`Remove ${isHQ ? 'director' : 'principal'}`}
                      aria-label={`Remove ${isHQ ? 'director' : 'principal'}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalDivision(div)}
                    className="font-semibold text-[#57685D] hover:text-[#192C21]"
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(div)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#147D4A] hover:bg-[#EBF7EE] transition-colors"
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete division"
                    aria-label={`Delete ${div.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

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
                  <Building2 className="w-4.5 h-4.5 text-[#147D4A]" />
                  {editingId ? 'Edit School Division' : 'Create School Division'}
                </h3>
                <p className="text-xs text-[#57685D] mt-0.5">
                  {editingId
                    ? 'Changes also update the division shown on its staff records.'
                    : 'Add a campus division so staff can be assigned to it.'}
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

            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Division Name *</label>
                  <input
                    type="text"
                    value={divisionForm.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g. Boys Secondary Staff - Hargeisa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Division Code *</label>
                  <input
                    type="text"
                    value={divisionForm.code}
                    onChange={(e) => updateForm('code', e.target.value)}
                    placeholder="e.g. HRG-SEC-B"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City *</label>
                  <select
                    value={divisionForm.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                  >
                    <option value="Hargeisa">Hargeisa</option>
                    <option value="Gabiley">Gabiley</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">School Level *</label>
                  <select
                    value={divisionForm.level}
                    onChange={(e) => updateForm('level', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                  >
                    <option value="Secondary">Secondary</option>
                    <option value="Primary">Primary</option>
                    <option value="Central Operations">Central Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Wing *</label>
                  <select
                    value={isOperations ? 'Operations' : divisionForm.gender}
                    onChange={(e) => updateForm('gender', e.target.value)}
                    disabled={isOperations}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] disabled:bg-slate-100"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-educational">Co-educational</option>
                    {isOperations && <option value="Operations">Operations</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">{isOperations ? 'Director' : 'Principal'}</label>
                  <select
                    value={divisionForm.principalEmployeeId}
                    onChange={(e) => updateForm('principalEmployeeId', e.target.value)}
                    disabled={principalStaff.length === 0}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A] bg-white disabled:bg-slate-100"
                  >
                    <option value="">No {isOperations ? 'director' : 'principal'} assigned</option>
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
                      No staff with the Principal role yet.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          closeCreateModal();
                          setActivePage('register');
                        }}
                        className="font-bold underline"
                      >
                        Register a principal
                      </button>
                    </p>
                  ) : selectedPrincipal && principalOfOther(selectedPrincipal.id) ? (
                    <p className="mt-1.5 text-[11px] text-amber-700">
                      {selectedPrincipal.fullName} will be removed as principal of {principalOfOther(selectedPrincipal.id)!.name}.
                    </p>
                  ) : unlinkedPrincipal && !selectedPrincipal ? (
                    <p className="mt-1.5 text-[11px] text-amber-700">
                      &quot;{unlinkedPrincipal}&quot; was typed in by hand and isn&apos;t a staff record. Choose a principal from the list; saving without one leaves the school unassigned.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-slate-500">Only staff registered with the Principal role are listed.</p>
                  )}
                </div>
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
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Campus Address</label>
                <input
                  type="text"
                  value={divisionForm.campusAddress}
                  onChange={(e) => updateForm('campusAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#147D4A] focus:border-[#147D4A]"
                />
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

            <div className="p-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-colors flex items-center gap-1.5"
              >
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Save Changes' : 'Create Division'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
