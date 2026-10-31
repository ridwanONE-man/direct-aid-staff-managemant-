import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeeRecord, DocumentAttachment } from '../../types';
import {
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  Trash2,
  Printer,
  Edit,
  ArrowLeft,
  X,
  Eye,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  HeartPulse,
  Clock,
  Briefcase,
  GraduationCap,
  Calendar,
  Award
} from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
  const {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    setActivePage,
    updateEmployee,
    setIsRenewContractOpen,
    setContractRenewalTarget,
    setIsUploadDocOpen,
    deleteDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'assignment' | 'qualifications' | 'contract' | 'documents'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmployeeRecord>>({});
  const [viewingDocument, setViewingDocument] = useState<DocumentAttachment | null>(null);

  // Fallback to first employee if none selected
  const employee = selectedEmployee || employees[0];

  if (!employee) {
    return (
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-12 text-center shadow-xs">
        <h3 className="text-base font-bold text-[#192C21]">No Employee Selected</h3>
        <p className="text-xs text-[#57685D] mt-1">Please select an employee from the staff directory.</p>
        <button
          onClick={() => setActivePage('directory')}
          className="mt-4 px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl"
        >
          Go to Staff Directory
        </button>
      </div>
    );
  }

  const startEditing = () => {
    setEditForm({
      fullName: employee.fullName,
      somaliName: employee.somaliName || '',
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      residentialArea: employee.residentialArea,
      jobTitle: employee.jobTitle,
      shiftSchedule: employee.shiftSchedule,
      qualifications: { ...employee.qualifications },
      notes: employee.notes || ''
    });
    setIsEditingProfile(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(employee.id, editForm);
    setIsEditingProfile(false);
  };

  const isContractExpiring = employee.contract.renewalStatus === 'Approaching Renewal' || employee.contract.renewalStatus === 'Renewal Pending Sign-off';

  return (
    <div className="space-y-5">
      {/* Top Navigation & Staff Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E2EAE4] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('directory')}
            className="p-1.5 rounded-xl border border-[#E2EAE4] hover:bg-[#F3F7F4] text-[#57685D] transition-colors"
            title="Back to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#798C80] block">
              Staff Dossier
            </span>
            <span className="text-xs font-semibold text-[#192C21]">{employee.divisionName}</span>
          </div>
        </div>

        {/* Employee Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#57685D] font-medium hidden md:inline">Inspect:</span>
          <select
            value={employee.id}
            onChange={(e) => {
              const emp = employees.find(x => x.id === e.target.value);
              if (emp) setSelectedEmployee(emp);
            }}
            className="px-3 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-xl text-xs font-semibold text-[#192C21] focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.id} — {emp.fullName} ({emp.jobTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={employee.avatarUrl}
                alt={employee.fullName}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-[#C5E8D2] shadow-sm"
              />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                employee.employmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} title={employee.employmentStatus} />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2.5 py-0.5 rounded-md">
                  {employee.id}
                </span>
                <span className="text-xs text-[#57685D] font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#147D4A]" />
                  {employee.campusLocation}
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {employee.employmentStatus}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#192C21] tracking-tight">
                {employee.fullName}
              </h1>

              {employee.somaliName && (
                <p className="text-xs text-[#6B7E72] font-medium">
                  Magaca: <span className="text-[#192C21] font-semibold">{employee.somaliName}</span>
                </p>
              )}

              <p className="text-xs text-[#57685D]">
                <strong className="text-[#147D4A]">{employee.jobTitle}</strong> · {employee.divisionName}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#192C21] bg-white hover:bg-[#F3F7F4] border border-[#E2EAE4] rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#57685D]" />
              <span>Print</span>
            </button>

            <button
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#147D4A] bg-[#EBF7EE] hover:bg-[#DDF3E4] border border-[#C5E8D2] rounded-xl transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                setContractRenewalTarget(employee);
                setIsRenewContractOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl transition-all shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Renew</span>
            </button>
          </div>
        </div>

        {/* Profile Completeness Tracker */}
        <div className="mt-5 pt-4 border-t border-[#E2EAE4] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center font-bold font-mono text-xs">
              {employee.profileCompleteness}%
            </div>
            <div>
              <span className="text-xs font-bold text-[#192C21] block">Completeness</span>
              <span className="text-[11px] text-[#57685D]">
                {employee.documents.length} verified documents
              </span>
            </div>
          </div>

          {employee.missingRequirements.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Missing:
              </span>
              {employee.missingRequirements.map((req, i) => (
                <span key={i} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px]">
                  {req}
                </span>
              ))}
              <button
                onClick={() => setIsUploadDocOpen(true)}
                className="text-xs font-semibold text-[#147D4A] underline ml-2"
              >
                Upload Now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>All mandatory credentials on file</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-white border border-[#E2EAE4] rounded-2xl p-1.5 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'personal', label: 'Personal' },
          { id: 'assignment', label: 'Assignment' },
          { id: 'qualifications', label: 'Qualifications' },
          { id: 'contract', label: 'Contract' },
          { id: 'documents', label: `Documents (${employee.documents.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#147D4A] text-white shadow-xs'
                : 'text-[#57685D] hover:text-[#192C21] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-6 shadow-xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Identifiers */}
              <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#147D4A]" />
                  Identification
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#64776C] text-[11px] block">DirectAid ID</span>
                    <span className="font-mono font-bold text-[#147D4A]">{employee.id}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">National ID / Passport</span>
                    <span className="font-mono font-medium text-[#192C21]">{employee.nationalIdNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Birth &amp; Gender</span>
                    <span className="text-[#192C21] font-medium">{employee.dateOfBirth} ({employee.gender})</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Blood &amp; Marital</span>
                    <span className="text-[#192C21] font-medium">{employee.bloodGroup || 'O+'} · {employee.maritalStatus || 'Married'}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Hire Date</span>
                    <span className="text-[#192C21] font-medium">{employee.hireDate}</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#147D4A]" />
                  Contact &amp; Residence
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Telephone</span>
                    <span className="font-mono font-semibold text-[#192C21]">{employee.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Email</span>
                    <span className="text-[#147D4A] font-medium">{employee.email}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">District &amp; Campus</span>
                    <span className="text-[#192C21] font-medium">{employee.residentialArea}, {employee.campusLocation}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Emergency Contact</span>
                    <span className="text-[#192C21] font-medium">
                      {employee.emergencyContact.name} ({employee.emergencyContact.relationship}) - {employee.emergencyContact.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Payment Account</span>
                    <span className="text-[#192C21] font-medium">{employee.paymentMethod || 'ZAAD'} ({employee.paymentAccountNo || employee.phoneNumber})</span>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#147D4A]" />
                  Campus Assignment
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Division</span>
                    <span className="font-bold text-[#147D4A]">{employee.divisionName}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Role &amp; Category</span>
                    <span className="text-[#192C21] font-semibold">{employee.jobTitle} · {employee.roleCategory}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Direct Supervisor</span>
                    <span className="text-[#192C21] font-medium">{employee.directSupervisor}</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Employment &amp; Status</span>
                    <span className="text-[#192C21] font-medium">{employee.employmentType} ({employee.employmentStatus})</span>
                  </div>
                  <div>
                    <span className="text-[#64776C] text-[11px] block">Schedule</span>
                    <span className="text-[#192C21] font-medium">{employee.shiftSchedule}</span>
                  </div>
                </div>
              </div>
            </div>

            {employee.notes && (
              <div className="p-4 bg-[#EBF7EE] border border-[#C5E8D2] rounded-2xl">
                <h4 className="text-xs font-bold text-[#147D4A] mb-1">Administrative Notes</h4>
                <p className="text-xs text-[#2A4334] leading-relaxed">{employee.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERSONAL */}
        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-[#192C21]">Personal &amp; Demographic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Full Legal Name</span>
                <span className="text-[#192C21] font-bold text-sm">{employee.fullName}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Somali Name</span>
                <span className="text-[#192C21] font-bold text-sm">{employee.somaliName || 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">National ID / Passport #</span>
                <span className="text-[#192C21] font-mono font-semibold">{employee.nationalIdNumber}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Date of Birth &amp; Gender</span>
                <span className="text-[#192C21] font-medium">{employee.dateOfBirth} · {employee.gender}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Blood Group</span>
                <span className="text-[#192C21] font-bold font-mono">{employee.bloodGroup || 'O+'}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Marital Status</span>
                <span className="text-[#192C21] font-medium">{employee.maritalStatus || 'Married'}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Phone Number</span>
                <span className="text-[#192C21] font-mono font-medium">{employee.phoneNumber}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-[#192C21] font-medium">{employee.email}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Residential District</span>
                <span className="text-[#192C21] font-medium">{employee.residentialArea}, {employee.campusLocation}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Emergency Contact</span>
                <span className="text-[#192C21] font-medium">
                  {employee.emergencyContact.name} ({employee.emergencyContact.relationship}) · {employee.emergencyContact.phone}
                </span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#147D4A] uppercase tracking-wider block">Remuneration Account</span>
                  <span className="text-[#192C21] font-semibold">{employee.paymentMethod || 'ZAAD (Telesom)'} — {employee.paymentAccountNo || employee.phoneNumber}</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#147D4A] uppercase tracking-wider block">Somaliland CID Clearance</span>
                  <span className="text-[#192C21] font-semibold">{employee.policeClearanceStatus || 'Verified'} ({employee.policeClearanceRef || 'CID-SL-VERIFIED'})</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Certified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSIGNMENT */}
        {activeTab === 'assignment' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-[#192C21]">Assignment &amp; Campus Placement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">School Division</span>
                <span className="text-[#147D4A] font-bold text-sm">{employee.divisionName}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Campus City</span>
                <span className="text-[#192C21] font-medium">{employee.campusLocation} Complex</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Job Role</span>
                <span className="text-[#192C21] font-bold">{employee.jobTitle === 'Other' && employee.customJobTitle
                    ? employee.customJobTitle
                    : `${employee.jobTitle}${employee.customJobTitle ? ` (${employee.customJobTitle})` : ''}`}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Role Category</span>
                <span className="text-[#192C21] font-semibold">{employee.roleCategory}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Wing &amp; Level</span>
                <span className="text-[#192C21] font-medium">{employee.schoolLevel} · {employee.genderDivision} Wing</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Direct Supervisor</span>
                <span className="text-[#192C21] font-medium">{employee.directSupervisor}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Employment Type &amp; Status</span>
                <span className="text-[#192C21] font-medium">{employee.employmentType} ({employee.employmentStatus})</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Shift Schedule</span>
                <span className="text-[#192C21] font-medium">{employee.shiftSchedule}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl sm:col-span-2">
                <span className="text-slate-500 block">Hire / Effective Date</span>
                <span className="text-[#192C21] font-medium">{employee.hireDate}</span>
              </div>
            </div>

            {employee.teachingSubjects && employee.teachingSubjects.length > 0 && (
              <div className="pt-3 border-t border-[#E2EAE4]">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Teaching Subjects</h4>
                <div className="flex flex-wrap gap-1.5">
                  {employee.teachingSubjects.map((sub, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#EBF7EE] text-[#147D4A] rounded-lg font-bold text-xs">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUALIFICATIONS */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-bold text-[#192C21]">Academic Credentials &amp; Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EBF7EE] border border-[#C5E8D2] rounded-xl sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#147D4A] block">Degree Tier</span>
                  <span className="text-[#147D4A] font-extrabold text-base">{employee.qualifications.degreeLevel || 'Bachelor'}</span>
                </div>
                <span className="bg-[#147D4A] text-white px-3 py-1 rounded-full text-xs font-bold">
                  {employee.qualifications.degreeLevel || 'Bachelor'} Level
                </span>
              </div>

              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl sm:col-span-2">
                <span className="text-slate-500 block">Degree Title</span>
                <span className="text-[#192C21] font-bold text-sm">{employee.qualifications.highestDegree}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Awarding Institution</span>
                <span className="text-[#192C21] font-semibold">{employee.qualifications.institution}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Field of Study</span>
                <span className="text-[#192C21] font-medium">{employee.qualifications.fieldOfStudy}</span>
              </div>
              {employee.qualifications.specialization && (
                <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl sm:col-span-2">
                  <span className="text-slate-500 block">Specialization</span>
                  <span className="text-[#192C21] font-medium">{employee.qualifications.specialization}</span>
                </div>
              )}
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Graduation Year</span>
                <span className="text-[#192C21] font-mono font-semibold">{employee.qualifications.graduationYear}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Years of Experience</span>
                <span className="text-[#192C21] font-semibold">{employee.qualifications.yearsOfExperience || 4} Years</span>
              </div>
              {employee.qualifications.teachingLicenseNo && (
                <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl sm:col-span-2">
                  <span className="text-slate-500 block">Ministry Teaching License / CID Registration</span>
                  <span className="text-[#147D4A] font-mono font-bold">{employee.qualifications.teachingLicenseNo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CONTRACT */}
        {activeTab === 'contract' && (
          <div className="space-y-5 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    {employee.contract.referenceNo}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isContractExpiring ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {employee.contract.renewalStatus}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#192C21] mt-1">DirectAid Employment Agreement</h3>
              </div>

              <button
                onClick={() => {
                  setContractRenewalTarget(employee);
                  setIsRenewContractOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Initiate Renewal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Contract Type</span>
                <span className="text-[#192C21] font-semibold">{employee.contract.contractType}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Salary Grade</span>
                <span className="text-[#147D4A] font-bold">{employee.contract.salaryGrade || 'Grade Standard'}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Start Date</span>
                <span className="text-[#192C21] font-semibold">{employee.contract.startDate}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">End Date</span>
                <span className={`font-semibold ${isContractExpiring ? 'text-amber-700' : 'text-[#192C21]'}`}>
                  {employee.contract.endDate}
                </span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Monthly Base Salary</span>
                <span className="text-[#192C21] font-bold font-mono text-sm">${employee.contract.monthlyBaseSalary} {employee.contract.currency}</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl">
                <span className="text-slate-500 block">Notice Period</span>
                <span className="text-[#192C21] font-medium">{employee.contract.noticePeriodDays} Days</span>
              </div>
              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl sm:col-span-2">
                <span className="text-slate-500 block mb-1">Contract Benefits &amp; Allowances</span>
                <div className="flex flex-wrap gap-1.5">
                  {(employee.contract.benefits || ['Medical Insurance']).map((b, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#EBF7EE] text-[#147D4A] border border-[#C5E8D2] rounded-md text-[11px] font-semibold">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21]">Document Vault</h3>
                <p className="text-xs text-[#57685D]">
                  Certified employee documents and credentials.
                </p>
              </div>

              <button
                onClick={() => setIsUploadDocOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="divide-y divide-[#E2EAE4] border border-[#E2EAE4] rounded-2xl overflow-hidden">
              {employee.documents.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FBFA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#192C21]">{doc.name}</span>
                        {doc.verified && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-md font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#57685D] flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{doc.fileName}</span>
                        <span>·</span>
                        <span>{doc.fileSize}</span>
                        <span>·</span>
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Actions: OPEN next to DOWNLOAD */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setViewingDocument(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#192C21] bg-white hover:bg-[#F3F7F4] border border-[#E2EAE4] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Open Document Preview"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#57685D]" />
                      <span>Open</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([`DirectAid Official HR Document Vault\nDocument: ${doc.name}\nEmployee: ${employee.fullName} (${employee.id})\nDivision: ${employee.divisionName}\nFile Name: ${doc.fileName}\nVerification Status: Verified`], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = doc.fileName;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#147D4A] hover:bg-[#EBF7EE] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteDocument(employee.id, doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#192C21]">Edit Profile: {employee.fullName}</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Somali Name</label>
                <input
                  type="text"
                  value={editForm.somaliName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, somaliName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Telephone</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Residential Area</label>
                <input
                  type="text"
                  value={editForm.residentialArea || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, residentialArea: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#147D4A] hover:bg-[#0E6139] text-white font-semibold rounded-xl"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
