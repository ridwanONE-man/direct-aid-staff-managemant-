import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { JobRole, DegreeLevel, EmploymentType, DocumentAttachment, DocumentType, EmployeeRecord } from '../../types';
import { REQUIRED_DOCUMENTS } from '../../data/documentTypes';
import { JOB_ROLES, EMPLOYMENT_TYPES, TEACHING_SUBJECTS, SHIFT_SCHEDULES, PAYMENT_METHODS } from '../../data/staffOptions';
import { formatFileSize, removeStaffFiles, uploadStaffFile, validateFile } from '../../lib/storage';
import { initialsAvatar, resizePhoto } from '../../lib/photo';
import { DocumentRow } from '../documents/DocumentRow';
import { AddOtherDocument } from '../documents/AddOtherDocument';
import {
  Camera,
  FileText,
  GraduationCap,
  Loader2,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  User,
  X
} from 'lucide-react';

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all';
const labelClass = 'block text-xs font-semibold text-[#384C3F] mb-1.5';

const OTHER = '__other__';

const STEPS = [
  { num: 1, label: 'Personal', icon: User },
  { num: 2, label: 'Division & Role', icon: Building2 },
  { num: 3, label: 'Credentials', icon: GraduationCap },
  { num: 4, label: 'Contract', icon: FileText }
] as const;

const DEGREE_TITLE_HINTS: Record<DegreeLevel, string> = {
  Diploma: 'Diploma in Education',
  Bachelor: 'Bachelor of Education (B.Ed)',
  Master: 'Master of Science / Education',
  PhD: 'Doctor of Philosophy (PhD)',
  Vocational: 'Certified Technical License'
};

interface SelectWithOtherProps {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  extraValues?: string[];
  value: string;
  onChange: (value: string) => void;
  otherLabel: string;
  placeholder: string;
  inputType?: 'text' | 'number';
  formatLabel?: (value: string) => string;
}

// Dropdown whose last option lets the user type a new value, which is then added to the list
const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  id,
  label,
  options,
  extraValues = [],
  value,
  onChange,
  otherLabel,
  placeholder,
  inputType = 'text',
  formatLabel = (v) => v
}) => {
  const [addedValues, setAddedValues] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const allOptions = [...options];
  [...extraValues, ...addedValues, value].forEach(v => {
    const trimmed = v.trim();
    if (trimmed && !allOptions.some(o => o.value.toLowerCase() === trimmed.toLowerCase())) {
      allOptions.push({ value: trimmed, label: formatLabel(trimmed) });
    }
  });

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed || (inputType === 'number' && !(Number(trimmed) >= 1))) return;
    const existing = allOptions.find(o => o.value.toLowerCase() === trimmed.toLowerCase());
    if (!existing) setAddedValues(prev => [...prev, trimmed]);
    onChange(existing ? existing.value : trimmed);
    setDraft('');
    setIsAdding(false);
  };

  const cancel = () => {
    setDraft('');
    setIsAdding(false);
  };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {isAdding ? (
        <div className="relative">
          <input
            id={id}
            type={inputType}
            min={inputType === 'number' ? 1 : undefined}
            max={inputType === 'number' ? 30 : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                cancel();
              }
            }}
            onBlur={() => (draft.trim() ? commit() : cancel())}
            placeholder={placeholder}
            className={`${inputClass} pr-16 border-[#147D4A] ring-1 ring-[#147D4A]/30 bg-white`}
            autoFocus
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
              className="p-1.5 rounded-lg text-[#147D4A] hover:bg-[#EBF7EE]"
              title="Add"
              aria-label="Add"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Cancel"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <select
          id={id}
          value={value}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              setIsAdding(true);
            } else {
              onChange(e.target.value);
            }
          }}
          className={inputClass}
        >
          {allOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          <option value={OTHER}>{otherLabel}</option>
        </select>
      )}
    </div>
  );
};

const RegisterForm: React.FC<{ onRegistered: (emp: EmployeeRecord) => void }> = ({ onRegistered }) => {
  const { divisions, employees, addEmployee, setActivePage } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState('');

  // 1. Personal & Photo
  const [fullName, setFullName] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married'>('Single');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [residentialArea, setResidentialArea] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // 2. Division & Role
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [jobRole, setJobRole] = useState<string>('Teacher');
  const [employmentType, setEmploymentType] = useState('Fixed-Term Contract');
  const [teachingSubject, setTeachingSubject] = useState(TEACHING_SUBJECTS[0].value);
  const [shiftSchedule, setShiftSchedule] = useState(SHIFT_SCHEDULES[0].value);

  // 3. Qualifications & Degree Assignment
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('Bachelor');
  const [highestDegree, setHighestDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // 4. Contract & Documents
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState('');
  // Optional: years and/or months, e.g. 2 Y / 6 M
  const [durationYears, setDurationYears] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  // References count up within the year from 1 (CTR-2026-1, CTR-2026-2, ...), using the lowest free number
  // so older random references such as CTR-2026-936 don't push the count up
  const contractRefNo = useMemo(() => {
    const prefix = `CTR-${new Date().getFullYear()}-`;
    const taken = new Set(employees.map(e => e.contract?.referenceNo || '').filter(ref => ref.startsWith(prefix)));
    let n = 1;
    while (taken.has(`${prefix}${n}`)) n++;
    return `${prefix}${n}`;
  }, [employees]);

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [paymentAccountNo, setPaymentAccountNo] = useState('');

  // Documents are held locally and uploaded to storage when the form is submitted
  const [docFiles, setDocFiles] = useState<Partial<Record<DocumentType, File>>>({});
  const [otherDocs, setOtherDocs] = useState<{ id: string; name: string; file: File }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isKnownRole = JOB_ROLES.some(r => r.value === jobRole);

  // Values typed manually for earlier staff appear in the dropdowns for everyone
  const savedRoles = employees.filter(e => e.jobTitle === 'Other' && e.customJobTitle).map(e => e.customJobTitle as string);
  const savedEmploymentTypes = employees.map(e => e.employmentType);
  const savedSubjects = employees.flatMap(e => e.teachingSubjects || []);
  const savedShifts = employees.map(e => e.shiftSchedule).filter(Boolean);
  const savedPaymentMethods = employees.map(e => e.paymentMethod || '').filter(Boolean);
  const uploadedRequiredCount = REQUIRED_DOCUMENTS.filter(d => docFiles[d.type]).length;
  const isTeacher = jobRole === 'Teacher';
  const avatarPreview = photoUrl || initialsAvatar(fullName);

  const goToStep = (target: 1 | 2 | 3 | 4) => {
    if (target > 1 && !fullName.trim()) {
      setError('Please enter the full name to continue.');
      setStep(1);
      return;
    }
    setError('');
    setStep(target);
  };

  // The profile photo and the "Personal Photo" document are the same file
  const setPhotoFile = async (file: File | null) => {
    if (!file) {
      setPhotoUrl('');
      setDocFiles(prev => ({ ...prev, photo: undefined }));
      return;
    }
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      setPhotoUrl(await resizePhoto(file));
      setDocFiles(prev => ({ ...prev, photo: file }));
      setError('');
    } catch {
      setError('That photo could not be read. Please try a JPG or PNG image.');
    }
  };

  const pickDocument = (type: DocumentType, file: File) => {
    if (type === 'photo') {
      setPhotoFile(file);
      return;
    }
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    setDocFiles(prev => ({ ...prev, [type]: file }));
  };

  const previewFile = (file: File) => {
    window.open(URL.createObjectURL(file), '_blank', 'noopener');
  };

  const addOtherDocument = (name: string, file: File) => {
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return false;
    }
    setError('');
    setOtherDocs(prev => [...prev, { id: crypto.randomUUID(), name, file }]);
    return true;
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (step !== 4 || isSubmitting) return;

    const selectedDiv = divisions.find(d => d.id === divisionId) || divisions[0];
    if (!selectedDiv) return;

    if (!jobRole.trim() || !employmentType.trim()) {
      setError('Please choose or type the job role and employment type.');
      setStep(2);
      return;
    }

    // Duration is optional: with none given the contract has no end date yet (it can be set later in Edit)
    const years = Number(durationYears) || 0;
    const months = Number(durationMonths) || 0;
    let endDate = '';
    if (years + months > 0) {
      const end = new Date(startDate);
      end.setFullYear(end.getFullYear() + years);
      end.setMonth(end.getMonth() + months);
      endDate = end.toISOString().split('T')[0];
    }
    const today = new Date().toISOString().split('T')[0];

    // Upload every attached file, then record it on the employee
    const pending: { type: DocumentType; name: string; file: File }[] = [
      ...REQUIRED_DOCUMENTS.filter(d => docFiles[d.type]).map(d => ({ type: d.type, name: d.label, file: docFiles[d.type]! })),
      ...otherDocs.map(d => ({ type: 'other' as DocumentType, name: d.name, file: d.file }))
    ];

    setIsSubmitting(true);
    setError('');
    const uploadedPaths: string[] = [];
    const documents: DocumentAttachment[] = [];
    try {
      for (const [i, item] of pending.entries()) {
        const { path } = await uploadStaffFile(item.file);
        uploadedPaths.push(path);
        documents.push({
          id: `doc-${item.type}-${Date.now()}-${i}`,
          name: item.name,
          type: item.type,
          fileName: item.file.name,
          fileSize: formatFileSize(item.file.size),
          uploadedAt: today,
          verified: false,
          storagePath: path,
          mimeType: item.file.type
        });
      }
    } catch (err) {
      await removeStaffFiles(uploadedPaths);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const jobTitle: JobRole = isKnownRole ? (jobRole as JobRole) : 'Other';
    const contractType = employmentType.trim() as EmploymentType;

    const newEmp = addEmployee({
      fullName: fullName.trim(),
      avatarUrl: avatarPreview,
      gender,
      maritalStatus,
      emergencyContact: {
        name: nextOfKinName.trim(),
        relationship: 'Next of Kin',
        phone: nextOfKinPhone.trim()
      },
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      residentialArea: residentialArea.trim(),
      paymentMethod: paymentMethod.trim(),
      paymentAccountNo: paymentAccountNo.trim(),
      shiftSchedule: shiftSchedule.trim(),
      policeClearanceStatus: docFiles.police_clearance ? 'Verified' : undefined,
      divisionId: selectedDiv.id,
      divisionName: selectedDiv.name,
      campusLocation: selectedDiv.city,
      schoolLevel: selectedDiv.level,
      genderDivision: selectedDiv.gender,
      jobTitle,
      customJobTitle: isKnownRole ? undefined : jobRole.trim(),
      employmentType: contractType,
      teachingSubjects: isTeacher && teachingSubject.trim() ? [teachingSubject.trim()] : undefined,
      qualifications: {
        degreeLevel,
        highestDegree: highestDegree.trim(),
        institution: institution.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        graduationYear: Number(graduationYear) || 0,
        yearsOfExperience: Number(yearsOfExperience) || 0
      },
      contract: {
        referenceNo: contractRefNo,
        contractType,
        startDate,
        endDate,
        renewalStatus: 'Not Due',
        salaryGrade: `Grade ${jobTitle === 'Principal' ? 'E-1' : jobTitle === 'Teacher' ? 'T-2' : 'S-1'}`,
        monthlyBaseSalary: Number(monthlyBaseSalary) || 0,
        currency: 'USD',
        benefits: ['Medical Insurance', 'Housing Stipend'],
        noticePeriodDays: 30
      },
      documents
    });

    setIsSubmitting(false);
    onRegistered(newEmp);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header with logo */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] p-6 shadow-[0_20px_50px_-20px_rgba(20,125,74,0.55)]">
        <div className="absolute -top-20 -right-14 w-60 h-60 rounded-full border-[24px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src="/directaid-logo-white.png"
              alt="DirectAid - العون المباشر"
              className="h-11 sm:h-12 w-auto object-contain shrink-0 self-start sm:self-auto drop-shadow-sm sm:pr-4 sm:border-r sm:border-white/25"
            />
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Staff Register</h1>
              <p className="text-sm text-white/80 mt-0.5">Add a new staff member in four quick steps.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('directory')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl transition-all self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl px-4 py-4 sm:px-6 shadow-xs">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const isDone = step > s.num;
            const isActive = step === s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => goToStep(s.num)}
                  className="flex flex-col sm:flex-row items-center gap-2 group shrink-0"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#147D4A] text-white ring-4 ring-[#147D4A]/15'
                        : isDone
                        ? 'bg-[#EBF7EE] text-[#147D4A]'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.num}
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold ${
                      isActive ? 'text-[#147D4A]' : isDone ? 'text-[#384C3F]' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 sm:mx-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full bg-[#147D4A] transition-all duration-300 ${isDone ? 'w-full' : 'w-0'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-[#E2EAE4] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: PERSONAL */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#192C21] flex items-center gap-2">
                <Camera className="w-4.5 h-4.5 text-[#147D4A]" />
                Personal Details
              </h2>
              <p className="text-xs text-[#57685D] mt-0.5">Only the full name is required. Everything else can be added later.</p>
            </div>

            {/* Photo */}
            <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <img
                src={avatarPreview}
                alt="Staff photo preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <span className="font-semibold text-sm text-[#192C21] block">Profile Photo</span>
                <p className="text-xs text-[#57685D] mt-0.5">Optional. Also saved as the Personal Photo document.</p>
                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#147D4A] bg-white border border-[#C5E8D2] hover:bg-[#EBF7EE] rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {photoUrl ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPhotoFile(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoFile(null)}
                      className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-xl"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="reg-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="reg-gender" className={labelClass}>Gender</label>
                <select
                  id="reg-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className={inputClass}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-marital" className={labelClass}>Marital Status</label>
                <select
                  id="reg-marital"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as 'Single' | 'Married')}
                  className={inputClass}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-phone" className={labelClass}>Telephone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+252 63 ..."
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label htmlFor="reg-email" className={labelClass}>Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="reg-area" className={labelClass}>Residential District</label>
                <input
                  id="reg-area"
                  type="text"
                  value={residentialArea}
                  onChange={(e) => setResidentialArea(e.target.value)}
                  placeholder="e.g. 26 June, Hargeisa"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-kin" className={labelClass}>Next of Kin</label>
                <input
                  id="reg-kin"
                  type="text"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  placeholder="Name of closest relative"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-kin-phone" className={labelClass}>Next of Kin Phone</label>
                <input
                  id="reg-kin-phone"
                  type="tel"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  placeholder="+252 63 ..."
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DIVISION & ROLE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#192C21] flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-[#147D4A]" />
                Division &amp; Role
              </h2>
              <p className="text-xs text-[#57685D] mt-0.5">Choose where this person works and what they do.</p>
            </div>

            <div>
              <span className={labelClass}>
                School Division
              </span>
              {divisions.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                  No school divisions exist yet.{' '}
                  <button type="button" onClick={() => setActivePage('divisions')} className="font-bold underline">
                    Create a division first
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {divisions.map((d) => {
                  const isSelected = (divisionId || divisions[0]?.id) === d.id;
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setDivisionId(d.id)}
                      className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#147D4A] bg-[#EBF7EE]'
                          : 'border-[#E2EAE4] hover:border-[#C5E8D2] bg-white'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#147D4A] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <span className="font-bold text-sm text-[#192C21] block pr-6">{d.name}</span>
                      <span className="text-xs text-[#57685D] block mt-0.5">
                        {d.city} · {d.gender} · {d.level}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectWithOther
                id="reg-role"
                label="Job Role"
                options={JOB_ROLES}
                extraValues={savedRoles}
                value={jobRole}
                onChange={setJobRole}
                otherLabel="+ Add manually..."
                placeholder="Type the job role"
              />

              <SelectWithOther
                id="reg-employment"
                label="Employment Type"
                options={EMPLOYMENT_TYPES}
                extraValues={savedEmploymentTypes}
                value={employmentType}
                onChange={setEmploymentType}
                otherLabel="+ Add manually..."
                placeholder="Type the employment type"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectWithOther
                id="reg-shift"
                label="Shift Schedule"
                options={SHIFT_SCHEDULES}
                extraValues={savedShifts}
                value={shiftSchedule}
                onChange={setShiftSchedule}
                otherLabel="+ Add manually..."
                placeholder="e.g. Weekend Shift (08:00 - 14:00)"
              />

              {isTeacher && (
                <SelectWithOther
                  id="reg-subject"
                  label="Teaching Subject"
                  options={TEACHING_SUBJECTS}
                  extraValues={savedSubjects}
                  value={teachingSubject}
                  onChange={setTeachingSubject}
                  otherLabel="+ Add manually..."
                  placeholder="Type the subject"
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 3: QUALIFICATIONS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#192C21] flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-[#147D4A]" />
                Qualifications
              </h2>
              <p className="text-xs text-[#57685D] mt-0.5">Highest academic qualification and experience.</p>
            </div>

            <div>
              <span className={labelClass}>Degree Level</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Diploma', 'Bachelor', 'Master', 'PhD', 'Vocational'] as DegreeLevel[]).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setDegreeLevel(tier)}
                    className={`py-2.5 px-3 rounded-xl border text-sm text-center transition-all font-semibold ${
                      degreeLevel === tier
                        ? 'border-[#147D4A] bg-[#147D4A] text-white shadow-sm'
                        : 'border-[#E2EAE4] bg-white text-[#384C3F] hover:border-[#C5E8D2]'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-degree" className={labelClass}>Degree Title</label>
                <input
                  id="reg-degree"
                  type="text"
                  value={highestDegree}
                  onChange={(e) => setHighestDegree(e.target.value)}
                  placeholder={`e.g. ${DEGREE_TITLE_HINTS[degreeLevel]}`}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-institution" className={labelClass}>Awarding Institution</label>
                <input
                  id="reg-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of Hargeisa"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-field" className={labelClass}>Field of Study</label>
                <input
                  id="reg-field"
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Science Education"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-grad" className={labelClass}>Graduation Year</label>
                  <input
                    id="reg-grad"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 2019"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label htmlFor="reg-exp" className={labelClass}>Experience (Years)</label>
                  <input
                    id="reg-exp"
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
                    placeholder="0"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONTRACT */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#192C21] flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-[#147D4A]" />
                Contract
              </h2>
              <p className="text-xs text-[#57685D] mt-0.5">Salary, payment account, contract length, and documents.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className={labelClass}>Contract Reference</span>
                <div className="px-3.5 py-2.5 bg-[#EBF7EE] border border-[#C5E8D2] rounded-xl font-mono font-bold text-sm text-[#147D4A]">
                  {contractRefNo}
                </div>
              </div>

              <div>
                <label htmlFor="reg-salary" className={labelClass}>
                  Monthly Salary (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    id="reg-salary"
                    type="text"
                    inputMode="decimal"
                    value={monthlyBaseSalary}
                    onChange={(e) => setMonthlyBaseSalary(e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, ''))}
                    placeholder="600"
                    className={`${inputClass} pl-7 font-mono font-semibold`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-duration" className={labelClass}>
                  Contract Duration <span className="font-normal text-slate-400">(optional)</span>
                </label>
                {/* One box: years / months, either or both */}
                <div className="flex items-center bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl transition-all focus-within:bg-white focus-within:border-[#147D4A] focus-within:ring-2 focus-within:ring-[#147D4A]/15">
                  {([
                    { id: 'reg-duration', value: durationYears, set: setDurationYears, unit: 'Years', max: 30 },
                    { id: 'reg-duration-months', value: durationMonths, set: setDurationMonths, unit: 'Months', max: 11 }
                  ]).map((part, i) => (
                    <React.Fragment key={part.unit}>
                      {i > 0 && <span className="text-lg font-light text-slate-300 select-none">/</span>}
                      <label htmlFor={part.id} className="flex-1 min-w-0 flex items-center gap-1.5 px-3 cursor-text">
                        <input
                          id={part.id}
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          value={part.value}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                            part.set(digits && Number(digits) > part.max ? String(part.max) : digits);
                          }}
                          placeholder="0"
                          aria-label={`Contract ${part.unit.toLowerCase()}`}
                          className="w-full min-w-0 bg-transparent py-2.5 text-sm font-mono font-semibold text-[#192C21] placeholder:text-slate-400 focus:outline-none"
                        />
                        <span className="shrink-0 text-[11px] font-bold text-[#147D4A]">{part.unit}</span>
                      </label>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectWithOther
                id="reg-payment-method"
                label="Payment Method"
                options={PAYMENT_METHODS}
                extraValues={savedPaymentMethods}
                value={paymentMethod}
                onChange={setPaymentMethod}
                otherLabel="+ Add manually..."
                placeholder="e.g. Salaam Bank"
              />
              <div>
                <label htmlFor="reg-payment-account" className={labelClass}>Payment Account Number</label>
                <input
                  id="reg-payment-account"
                  type="text"
                  value={paymentAccountNo}
                  onChange={(e) => setPaymentAccountNo(e.target.value)}
                  placeholder="Mobile money number or bank account"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[#192C21]">
                    Documents <span className="text-xs font-medium text-slate-400">(optional)</span>
                  </h3>
                  <p className="text-xs text-[#57685D] mt-0.5">PDF, Word, or photo · up to 10 MB each. You can skip any of these and add them later from the staff profile.</p>
                </div>
                <span className="text-xs font-bold text-[#147D4A] bg-[#EBF7EE] px-2.5 py-1 rounded-full shrink-0">
                  {uploadedRequiredCount} of {REQUIRED_DOCUMENTS.length}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#147D4A] rounded-full transition-all duration-300"
                  style={{ width: `${(uploadedRequiredCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {REQUIRED_DOCUMENTS.map(doc => {
                  const file = docFiles[doc.type];
                  return (
                    <DocumentRow
                      key={doc.type}
                      label={doc.label}
                      hint={doc.hint}
                      isImage={doc.type === 'photo'}
                      accept={doc.accept}
                      fileName={file?.name}
                      meta={file ? formatFileSize(file.size) : undefined}
                      onPick={(f) => pickDocument(doc.type, f)}
                      onView={file ? () => previewFile(file) : undefined}
                      onRemove={() =>
                        doc.type === 'photo' ? setPhotoFile(null) : setDocFiles(prev => ({ ...prev, [doc.type]: undefined }))
                      }
                    />
                  );
                })}
              </div>

              {otherDocs.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#798C80]">Other Documents</h4>
                  {otherDocs.map(doc => (
                    <DocumentRow
                      key={doc.id}
                      label={doc.name}
                      accept="*"
                      fileName={doc.file.name}
                      meta={formatFileSize(doc.file.size)}
                      onPick={(f) => {
                        const invalid = validateFile(f);
                        if (invalid) return setError(invalid);
                        setOtherDocs(prev => prev.map(d => (d.id === doc.id ? { ...d, file: f } : d)));
                      }}
                      onView={() => previewFile(doc.file)}
                      onRemove={() => setOtherDocs(prev => prev.filter(d => d.id !== doc.id))}
                    />
                  ))}
                </div>
              )}

              <AddOtherDocument onAdd={addOtherDocument} />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-5 border-t border-[#E2EAE4] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goToStep((step - 1) as 1 | 2 | 3)}
              className="px-4 py-2.5 border border-[#E2EAE4] rounded-xl text-sm font-semibold text-[#57685D] hover:bg-[#F9FBFA] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <span className="text-xs text-slate-400">Step 1 of 4</span>
          )}

          {step < 4 ? (
            <button
              key="next-step"
              type="button"
              onClick={() => goToStep((step + 1) as 2 | 3 | 4)}
              className="px-6 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              key="complete-registration"
              type="button"
              onClick={handleSubmit}
              disabled={divisions.length === 0 || isSubmitting}
              className="px-6 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isSubmitting ? 'Uploading documents...' : 'Complete Registration'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const roleLabel = (emp: EmployeeRecord) =>
  emp.jobTitle === 'Other' && emp.customJobTitle ? emp.customJobTitle : emp.jobTitle;

// Short summary of the staff member just registered, shown above a fresh form
const RegisteredNotice: React.FC<{ employee: EmployeeRecord; onClose: () => void; onView: () => void }> = ({
  employee,
  onClose,
  onView
}) => {
  // Close automatically shortly after it appears
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2000);
    return () => window.clearTimeout(timer);
  }, [employee.id, onClose]);

  const docCount = employee.documents.length;

  return (
    <div
      role="status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md login-card-enter"
    >
      <div className="relative overflow-hidden bg-white border border-[#C5E8D2] rounded-2xl shadow-[0_20px_50px_-15px_rgba(20,125,74,0.45)]">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#147D4A]" />
        <div className="p-4 pl-5 flex items-start gap-3">
          <span className="register-tick w-12 h-12 rounded-full bg-[#147D4A] text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-[#EBF7EE]">
            <Check className="w-6 h-6" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-[#147D4A] block">Staff registered</span>
            <span className="font-bold text-sm text-[#192C21] block truncate">{employee.fullName}</span>
            <span className="text-xs text-[#57685D] block truncate">
              {roleLabel(employee)} · {employee.divisionName}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              <span className="font-mono">{employee.id}</span> · {docCount} {docCount === 1 ? 'document' : 'documents'} uploaded
            </span>
            <button type="button" onClick={onView} className="mt-1.5 text-xs font-bold text-[#147D4A] hover:underline">
              View profile →
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterEmployeePage: React.FC = () => {
  const { navigateToProfile } = useApp();
  const [formKey, setFormKey] = useState(0);
  const [lastRegistered, setLastRegistered] = useState<EmployeeRecord | null>(null);
  const closeNotice = React.useCallback(() => setLastRegistered(null), []);

  return (
    <>
      {lastRegistered && (
        <RegisteredNotice
          key={lastRegistered.id}
          employee={lastRegistered}
          onClose={closeNotice}
          onView={() => navigateToProfile(lastRegistered.id)}
        />
      )}
      <RegisterForm
        key={formKey}
        onRegistered={(emp) => {
          setLastRegistered(emp);
          setFormKey(k => k + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
};
