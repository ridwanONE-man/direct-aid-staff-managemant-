import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { needsRenewal } from '../../lib/contracts';
import { EmployeeRecord, DocumentAttachment, DocumentType } from '../../types';
import { REQUIRED_DOCUMENTS } from '../../data/documentTypes';
import { formatFileSize, getStaffFileUrl, uploadStaffFile, validateFile } from '../../lib/storage';
import { resizePhoto } from '../../lib/photo';
import { DocumentRow } from '../documents/DocumentRow';
import { AddOtherDocument } from '../documents/AddOtherDocument';
import { EditEmployeeModal } from './EditEmployeeModal';
import {
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  Edit,
  ArrowLeft,
  X,
  Building2,
  Phone,
  Mail,
  Clock,
  Briefcase,
  GraduationCap,
  CalendarDays,
  Wallet,
  User,
  HeartHandshake,
  FolderOpen
} from 'lucide-react';

type TabId = 'overview' | 'personal' | 'employment' | 'qualifications' | 'contract' | 'documents';

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all';
const labelClass = 'block text-xs font-semibold text-[#384C3F] mb-1.5';

const roleLabel = (emp: EmployeeRecord) =>
  emp.jobTitle === 'Other' && emp.customJobTitle
    ? emp.customJobTitle
    : `${emp.jobTitle}${emp.customJobTitle ? ` (${emp.customJobTitle})` : ''}`;

// Label/value pair; shows a dash when the value is empty
const Field: React.FC<{ label: string; value?: React.ReactNode; mono?: boolean; wide?: boolean }> = ({ label, value, mono, wide }) => (
  <div className={`p-3.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="text-[11px] font-medium text-[#64776C] block">{label}</span>
    <span className={`text-sm font-semibold text-[#192C21] break-words ${mono ? 'font-mono' : ''}`}>
      {value === undefined || value === null || value === '' ? <span className="text-slate-300">—</span> : value}
    </span>
  </div>
);

const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl">
    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5 mb-3">
      <Icon className="w-3.5 h-3.5 text-[#147D4A]" />
      {title}
    </h4>
    <dl className="space-y-2.5 text-sm">{children}</dl>
  </div>
);

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-[11px] text-[#64776C]">{label}</dt>
    <dd className="font-semibold text-[#192C21] break-words">
      {value === undefined || value === null || value === '' ? <span className="text-slate-300">—</span> : value}
    </dd>
  </div>
);

export const EmployeeProfile: React.FC = () => {
  const {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    setActivePage,
    updateEmployee,
    setIsRenewContractOpen,
    setContractRenewalTarget,
    addDocument,
    deleteDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [docError, setDocError] = useState('');

  // Fallback to first employee if none selected
  const employee = selectedEmployee || employees[0];

  if (!employee) {
    return (
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-12 text-center shadow-xs">
        <User className="w-8 h-8 text-[#147D4A] mx-auto" />
        <h3 className="text-base font-bold text-[#192C21] mt-3">No Staff Selected</h3>
        <p className="text-xs text-[#57685D] mt-1">Register a staff member or pick one from the directory.</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setActivePage('register')}
            className="px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl"
          >
            Register Staff
          </button>
          <button
            onClick={() => setActivePage('directory')}
            className="px-4 py-2 border border-[#E2EAE4] hover:bg-[#F3F7F4] text-[#384C3F] text-xs font-semibold rounded-xl"
          >
            Staff Directory
          </button>
        </div>
      </div>
    );
  }

  const isContractExpiring =
    needsRenewal(employee);
  const requiredTypes = REQUIRED_DOCUMENTS.map(d => d.type);
  const requiredOnFile = REQUIRED_DOCUMENTS.filter(d => employee.documents.some(doc => doc.type === d.type)).length;
  const shownRequiredIds = REQUIRED_DOCUMENTS
    .map(d => employee.documents.find(doc => doc.type === d.type)?.id)
    .filter(Boolean);
  const otherDocuments = employee.documents.filter(doc => !shownRequiredIds.includes(doc.id));
  const nextOfKin = employee.emergencyContact;

  const startEditing = () => setIsEditingProfile(true);

  const uploadDocument = async (type: DocumentType, name: string, file: File, replace?: DocumentAttachment) => {
    const invalid = validateFile(file);
    if (invalid) {
      setDocError(invalid);
      return false;
    }
    setDocError('');
    setBusyKey(replace?.id || type);
    try {
      const { path } = await uploadStaffFile(file);
      const avatarUrl = type === 'photo' ? await resizePhoto(file).catch(() => undefined) : undefined;
      addDocument(
        employee.id,
        {
          name,
          type,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          verified: false,
          storagePath: path,
          mimeType: file.type
        },
        { replaceId: replace?.id, avatarUrl }
      );
      return true;
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const openDocument = async (doc: DocumentAttachment, download = false) => {
    if (!doc.storagePath) {
      setDocError(`"${doc.name}" was recorded without a file. Use the replace button to upload it.`);
      return;
    }
    // Open the tab synchronously so pop-up blockers allow it, then point it at the signed link
    const win = window.open('', '_blank');
    try {
      const url = await getStaffFileUrl(doc.storagePath, download ? doc.fileName : undefined);
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch (err) {
      win?.close();
      setDocError(err instanceof Error ? err.message : 'Could not open the file.');
    }
  };

  const removeDocument = (doc: DocumentAttachment) => {
    if (window.confirm(`Delete "${doc.name}"? The file will be removed permanently.`)) {
      deleteDocument(employee.id, doc.id);
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { id: 'contract', label: 'Contract', icon: FileText },
    { id: 'documents', label: `Documents (${requiredOnFile}/${REQUIRED_DOCUMENTS.length})`, icon: FolderOpen }
  ];

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => setActivePage('directory')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57685D] hover:text-[#192C21] self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#57685D] font-medium hidden md:inline">View staff:</span>
          <select
            value={employee.id}
            onChange={(e) => {
              const emp = employees.find(x => x.id === e.target.value);
              if (emp) {
                setSelectedEmployee(emp);
                setDocError('');
              }
            }}
            className="px-3 py-2 bg-white border border-[#E2EAE4] rounded-xl text-xs font-semibold text-[#192C21] focus:outline-none focus:ring-2 focus:ring-[#147D4A]/15 cursor-pointer max-w-[260px]"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} · {roleLabel(emp)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_-24px_rgba(20,125,74,0.55)] bg-white border border-[#E2EAE4]">
        <div className="relative bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] px-4 py-4 sm:px-5">
          <div className="absolute -top-20 -right-14 w-56 h-56 rounded-full border-[22px] border-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0 self-start">
                <img
                  src={employee.avatarUrl}
                  alt={employee.fullName}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-xl bg-white ring-4 ring-white/15"
                />
                <span
                  className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-white ${
                    employee.employmentStatus === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  title={employee.employmentStatus}
                />
              </div>

              <div className="text-white space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                  <span className="font-mono bg-white/15 border border-white/20 px-2 py-0.5 rounded-md">{employee.id}</span>
                  <span className="bg-white/15 border border-white/20 px-2 py-0.5 rounded-md">{employee.employmentStatus}</span>
                  <span className="inline-flex items-center gap-1 text-white/85">
                    <MapPin className="w-3 h-3" /> {employee.campusLocation}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight break-words">{employee.fullName}</h1>
                <p className="text-xs text-white/85">
                  <span className="font-bold text-white">{roleLabel(employee)}</span> · {employee.divisionName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-all"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  setContractRenewalTarget(employee);
                  setIsRenewContractOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#147D4A] bg-white hover:bg-[#EBF7EE] rounded-lg transition-all shadow-md"
              >
                <FileText className="w-3.5 h-3.5" /> Renew Contract
              </button>
            </div>
          </div>
        </div>

        {/* Completeness */}
        <div className="px-5 py-3.5 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-3 lg:w-64 shrink-0">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#192C21]">Profile completeness</span>
                <span className="font-mono font-bold text-[#147D4A]">{employee.profileCompleteness}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#147D4A] rounded-full transition-all" style={{ width: `${employee.profileCompleteness}%` }} />
              </div>
            </div>
          </div>

          {employee.missingRequirements.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs flex-1">
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Missing:
              </span>
              {employee.missingRequirements.map((req, i) => (
                <span key={i} className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-full text-[11px] font-medium">
                  {req}
                </span>
              ))}
              <button onClick={() => setActiveTab('documents')} className="text-xs font-bold text-[#147D4A] hover:underline ml-1">
                Complete now →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full self-start">
              <CheckCircle2 className="w-4 h-4" /> Profile complete, all required documents on file
            </div>
          )}
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: 'Telephone', value: employee.phoneNumber, mono: true },
          { icon: Mail, label: 'Email', value: employee.email },
          { icon: Clock, label: 'Shift', value: employee.shiftSchedule },
          {
            icon: CalendarDays,
            label: 'Contract ends',
            value: employee.contract.endDate,
            mono: true,
            warn: isContractExpiring
          }
        ].map(fact => (
          <div
            key={fact.label}
            className="bg-white border border-[#E2EAE4] hover:border-[#C5E8D2] rounded-2xl p-3.5 flex items-center gap-3 min-w-0 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-[#EBF7EE] to-[#DDF3E4] text-[#147D4A] flex items-center justify-center shrink-0">
              <fact.icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] text-[#64776C] block">{fact.label}</span>
              <span
                className={`text-sm font-semibold block truncate ${fact.mono ? 'font-mono' : ''} ${
                  fact.warn ? 'text-amber-700' : 'text-[#192C21]'
                }`}
              >
                {fact.value || <span className="text-slate-300">—</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-[#E2EAE4] rounded-2xl p-1.5 overflow-x-auto text-xs shadow-xs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id ? 'bg-[#147D4A] text-white shadow-sm' : 'text-[#57685D] hover:text-[#147D4A] hover:bg-[#F3F9F5]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SectionCard title="Personal" icon={User}>
                <Row label="Gender & Marital Status" value={[employee.gender, employee.maritalStatus].filter(Boolean).join(' · ')} />
                <Row label="Residential District" value={employee.residentialArea} />
                <Row label="Next of Kin" value={nextOfKin?.name} />
                <Row label="Next of Kin Phone" value={nextOfKin?.phone && <span className="font-mono">{nextOfKin.phone}</span>} />
              </SectionCard>

              <SectionCard title="Employment" icon={Briefcase}>
                <Row label="Division" value={<span className="text-[#147D4A]">{employee.divisionName}</span>} />
                <Row label="Job Role" value={roleLabel(employee)} />
                <Row label="Employment Type" value={employee.employmentType} />
                <Row label="Shift Schedule" value={employee.shiftSchedule} />
              </SectionCard>

              <SectionCard title="Pay & Contract" icon={Wallet}>
                <Row label="Monthly Salary" value={<span className="font-mono">${employee.contract.monthlyBaseSalary} USD</span>} />
                <Row label="Payment Method" value={employee.paymentMethod} />
                <Row label="Payment Account" value={employee.paymentAccountNo && <span className="font-mono">{employee.paymentAccountNo}</span>} />
                <Row label="Contract Period" value={`${employee.contract.startDate} → ${employee.contract.endDate}`} />
              </SectionCard>
            </div>

            {employee.notes && (
              <div className="p-4 bg-[#EBF7EE] border border-[#C5E8D2] rounded-2xl">
                <h4 className="text-xs font-bold text-[#147D4A] mb-1">Notes</h4>
                <p className="text-sm text-[#2A4334] leading-relaxed">{employee.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* PERSONAL */}
        {activeTab === 'personal' && (
          <div className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name" value={employee.fullName} wide />
              <Field label="Gender" value={employee.gender} />
              <Field label="Marital Status" value={employee.maritalStatus} />
              <Field label="Telephone" value={employee.phoneNumber} mono />
              <Field label="Email" value={employee.email} />
              <Field label="Residential District" value={employee.residentialArea} wide />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5 mb-2">
                <HeartHandshake className="w-3.5 h-3.5 text-[#147D4A]" /> Next of Kin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name" value={nextOfKin?.name} />
                <Field label="Phone" value={nextOfKin?.phone} mono />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80] flex items-center gap-1.5 mb-2">
                <Wallet className="w-3.5 h-3.5 text-[#147D4A]" /> Payment Account
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Payment Method" value={employee.paymentMethod} />
                <Field label="Account Number" value={employee.paymentAccountNo} mono />
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYMENT */}
        {activeTab === 'employment' && (
          <div className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="School Division" value={<span className="text-[#147D4A]">{employee.divisionName}</span>} wide />
              <Field label="Campus City" value={employee.campusLocation} />
              <Field label="Wing & Level" value={`${employee.genderDivision} · ${employee.schoolLevel}`} />
              <Field label="Job Role" value={roleLabel(employee)} />
              <Field label="Role Category" value={employee.roleCategory} />
              <Field label="Employment Type" value={employee.employmentType} />
              <Field label="Status" value={employee.employmentStatus} />
              <Field label="Shift Schedule" value={employee.shiftSchedule} />
              <Field label="Direct Supervisor" value={employee.directSupervisor} />
              <Field label="Hire Date" value={employee.hireDate} mono wide />
            </div>

            {employee.teachingSubjects && employee.teachingSubjects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80] mb-2">Teaching Subjects</h4>
                <div className="flex flex-wrap gap-1.5">
                  {employee.teachingSubjects.map((sub, i) => (
                    <span key={i} className="px-3 py-1 bg-[#EBF7EE] text-[#147D4A] border border-[#C5E8D2] rounded-full font-semibold text-xs">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUALIFICATIONS */}
        {activeTab === 'qualifications' && (
          <div className="space-y-4 max-w-3xl">
            <div className="p-4 bg-[#EBF7EE] border border-[#C5E8D2] rounded-2xl flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#147D4A] text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#147D4A] block">Degree Level</span>
                <span className="text-base font-extrabold text-[#192C21]">{employee.qualifications.degreeLevel}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Degree Title" value={employee.qualifications.highestDegree} wide />
              <Field label="Awarding Institution" value={employee.qualifications.institution} />
              <Field label="Field of Study" value={employee.qualifications.fieldOfStudy} />
              <Field label="Graduation Year" value={employee.qualifications.graduationYear || undefined} mono />
              <Field
                label="Years of Experience"
                value={employee.qualifications.yearsOfExperience !== undefined ? `${employee.qualifications.yearsOfExperience} years` : undefined}
              />
            </div>
          </div>
        )}

        {/* CONTRACT */}
        {activeTab === 'contract' && (
          <div className="space-y-5 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    {employee.contract.referenceNo}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isContractExpiring ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {employee.contract.renewalStatus}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#192C21] mt-1">Employment Agreement</h3>
              </div>
              <button
                onClick={() => {
                  setContractRenewalTarget(employee);
                  setIsRenewContractOpen(true);
                }}
                className="px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Renew Contract
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Contract Type" value={employee.contract.contractType} />
              <Field label="Salary Grade" value={employee.contract.salaryGrade} />
              <Field label="Start Date" value={employee.contract.startDate} mono />
              <Field
                label="End Date"
                value={<span className={isContractExpiring ? 'text-amber-700' : ''}>{employee.contract.endDate}</span>}
                mono
              />
              <Field label="Monthly Salary" value={`$${employee.contract.monthlyBaseSalary} ${employee.contract.currency}`} mono />
              <Field label="Notice Period" value={`${employee.contract.noticePeriodDays} days`} />
              <Field label="Payment Method" value={employee.paymentMethod} />
              <Field label="Payment Account" value={employee.paymentAccountNo} mono />
            </div>

            {employee.contract.benefits?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80] mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-1.5">
                  {employee.contract.benefits.map((b, i) => (
                    <span key={i} className="px-3 py-1 bg-[#EBF7EE] text-[#147D4A] border border-[#C5E8D2] rounded-full text-xs font-semibold">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#147D4A]" /> Documents
                </h3>
                <p className="text-xs text-[#57685D] mt-0.5">PDF, Word, or photo · up to 10 MB each. Files are stored securely in Supabase.</p>
              </div>
              <span className="text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2.5 py-1 rounded-full shrink-0">
                {requiredOnFile} of {REQUIRED_DOCUMENTS.length} uploaded
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#147D4A] rounded-full transition-all duration-300"
                style={{ width: `${(requiredOnFile / REQUIRED_DOCUMENTS.length) * 100}%` }}
              />
            </div>

            {docError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start justify-between gap-3">
                <span>{docError}</span>
                <button onClick={() => setDocError('')} className="shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {REQUIRED_DOCUMENTS.map(req => {
                const doc = employee.documents.find(d => d.type === req.type);
                return (
                  <DocumentRow
                    key={req.type}
                    label={req.label}
                    hint={req.hint}
                    isImage={req.type === 'photo'}
                    accept={req.accept}
                    busy={busyKey === req.type || (!!doc && busyKey === doc.id)}
                    fileName={doc?.fileName}
                    meta={doc ? `${doc.fileSize} · ${doc.uploadedAt}` : undefined}
                    onPick={(file) => uploadDocument(req.type, req.label, file, doc)}
                    onView={doc ? () => openDocument(doc) : undefined}
                    onDownload={doc ? () => openDocument(doc, true) : undefined}
                    onRemove={doc ? () => removeDocument(doc) : undefined}
                  />
                );
              })}
            </div>

            {otherDocuments.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80]">Other Documents</h4>
                {otherDocuments.map(doc => (
                  <DocumentRow
                    key={doc.id}
                    label={doc.name}
                    accept="*"
                    busy={busyKey === doc.id}
                    fileName={doc.fileName}
                    meta={`${doc.fileSize} · ${doc.uploadedAt}`}
                    onPick={(file) =>
                      uploadDocument(requiredTypes.includes(doc.type) ? doc.type : 'other', doc.name, file, doc)
                    }
                    onView={() => openDocument(doc)}
                    onDownload={() => openDocument(doc, true)}
                    onRemove={() => removeDocument(doc)}
                  />
                ))}
              </div>
            )}

            <AddOtherDocument busy={busyKey === 'other'} onAdd={(name, file) => uploadDocument('other', name, file)} />
          </div>
        )}
      </div>

      {isEditingProfile && <EditEmployeeModal employee={employee} onClose={() => setIsEditingProfile(false)} />}
    </div>
  );
};
