import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobRole, DegreeLevel, EmploymentType, DocumentAttachment } from '../../types';
import {
  Camera,
  FileText,
  ShieldCheck,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  User
} from 'lucide-react';

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all';
const labelClass = 'block text-xs font-semibold text-[#384C3F] mb-1.5';

const OTHER = '__other__';

const JOB_ROLES: { value: JobRole; label: string }[] = [
  { value: 'Principal', label: 'Principal / Headmaster' },
  { value: 'Deputy Principal', label: 'Deputy Principal' },
  { value: 'Teacher', label: 'Teacher / Instructor' },
  { value: 'Security Guard', label: 'Security Guard' },
  { value: 'Cleaner', label: 'Cleaner' },
  { value: 'Driver', label: 'Bus Driver' },
  { value: 'Secretary', label: 'Secretary' },
  { value: 'Finance Officer', label: 'Finance Officer' },
  { value: 'IT Support Officer', label: 'IT Support Officer' },
  { value: 'Administrative Officer', label: 'Administrative Officer' }
];

const EMPLOYMENT_TYPES = [
  { value: 'Fixed-Term Contract', label: 'Fixed-Term Contract' },
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Probationary', label: 'Probationary (3 Months)' },
  { value: 'Part-Time', label: 'Part-Time' }
];

const TEACHING_SUBJECTS = [
  { value: 'Pure Mathematics & Calculus', label: 'Pure Mathematics' },
  { value: 'Physics & Physical Sciences', label: 'Physics' },
  { value: 'Chemistry & Laboratory', label: 'Chemistry' },
  { value: 'Biology & Life Sciences', label: 'Biology' },
  { value: 'Arabic Language & Grammar', label: 'Arabic Language' },
  { value: 'Islamic Studies & Sharia', label: 'Islamic Studies' },
  { value: 'Somali Literature & History', label: 'Somali Literature' },
  { value: 'English Language & Composition', label: 'English Language' },
  { value: 'Primary Numeracy & Literacy', label: 'Primary Numeracy & Literacy' },
  { value: 'ICT & Computer Science', label: 'ICT' }
];

const CONTRACT_DURATIONS = [
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '3', label: '3 Years' }
];

const STEPS = [
  { num: 1, label: 'Personal', icon: User },
  { num: 2, label: 'Division & Role', icon: Building2 },
  { num: 3, label: 'Credentials', icon: GraduationCap },
  { num: 4, label: 'Contract', icon: FileText }
] as const;

// Green circle with the person's initials, used until a photo is uploaded
const initialsAvatar = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.match(/\p{L}/u)?.[0]?.toUpperCase() || '')
    .join('') || '?';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='#147D4A'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter,Arial,sans-serif' font-size='80' font-weight='700' fill='#ffffff'>${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Center-crop and shrink an uploaded photo so it stays small in the database
const resizePhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const size = 240;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas
          .getContext('2d')!
          .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

interface SelectWithOtherProps {
  id: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  otherLabel: string;
  placeholder: string;
  inputType?: 'text' | 'number';
}

// Dropdown whose last option switches to a free-text (or number) field
const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  id,
  label,
  required,
  options,
  value,
  onChange,
  otherLabel,
  placeholder,
  inputType = 'text'
}) => {
  const [isCustom, setIsCustom] = useState(() => value !== '' && !options.some(o => o.value === value));

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        id={id}
        value={isCustom ? OTHER : value}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setIsCustom(true);
            onChange('');
          } else {
            setIsCustom(false);
            onChange(e.target.value);
          }
        }}
        className={inputClass}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value={OTHER}>{otherLabel}</option>
      </select>
      {isCustom && (
        <input
          type={inputType}
          min={inputType === 'number' ? 1 : undefined}
          max={inputType === 'number' ? 30 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} mt-2 border-[#147D4A]/40 bg-white`}
          autoFocus
        />
      )}
    </div>
  );
};

export const RegisterEmployeePage: React.FC = () => {
  const { divisions, addEmployee, navigateToProfile, setActivePage } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState('');

  // 1. Personal & Photo
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [residentialArea, setResidentialArea] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // 2. Division & Role
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || '');
  const [jobRole, setJobRole] = useState<string>('Teacher');
  const [employmentType, setEmploymentType] = useState('Fixed-Term Contract');
  const [teachingSubject, setTeachingSubject] = useState(TEACHING_SUBJECTS[0].value);

  // 3. Qualifications & Degree Assignment
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('Bachelor');
  const [highestDegree, setHighestDegree] = useState('Bachelor of Education');
  const [institution, setInstitution] = useState('University of Hargeisa');
  const [fieldOfStudy, setFieldOfStudy] = useState('Secondary Education & Pedagogy');
  const [graduationYear, setGraduationYear] = useState(2019);
  const [yearsOfExperience, setYearsOfExperience] = useState(4);
  const [univCertFileName] = useState('University_Degree_Certificate.pdf');

  // 4. Contract & Documents
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState(600);
  const [contractYears, setContractYears] = useState('2');
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractRefNo] = useState(`CTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

  // Compliance Files
  const [cvFileName] = useState('Staff_Resume_CV.pdf');
  const [contractFileName] = useState('Signed_DirectAid_Contract.pdf');
  const [policeCertFileName] = useState('CID_Criminal_Record_Check.pdf');
  const [policeRefNo] = useState(`CID-SL-${Math.floor(10000 + Math.random() * 90000)}`);

  const isKnownRole = JOB_ROLES.some(r => r.value === jobRole);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoUrl(await resizePhoto(file));
    } catch {
      setError('That photo could not be read. Please try a JPG or PNG image.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4) return;

    const selectedDiv = divisions.find(d => d.id === divisionId) || divisions[0];
    if (!selectedDiv) return;

    const years = Number(contractYears);
    if (!jobRole.trim() || !employmentType.trim()) {
      setError('Please choose or type the job role and employment type.');
      setStep(2);
      return;
    }
    if (!Number.isFinite(years) || years < 1) {
      setError('Please enter a contract duration of at least 1 year.');
      return;
    }

    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + Math.round(years));
    const endDate = end.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Build documents array
    const documents: DocumentAttachment[] = [
      {
        id: `doc-cv-${Date.now()}`,
        name: 'Curriculum Vitae (CV)',
        type: 'cv',
        fileName: cvFileName,
        fileSize: '1.2 MB',
        uploadedAt: today,
        verified: true
      },
      {
        id: `doc-ctr-${Date.now()}`,
        name: 'Signed Employment Contract',
        type: 'contract',
        fileName: contractFileName,
        fileSize: '2.5 MB',
        uploadedAt: today,
        verified: true
      },
      {
        id: `doc-deg-${Date.now()}`,
        name: `${degreeLevel} Certificate (${institution})`,
        type: 'academic_degree',
        fileName: univCertFileName,
        fileSize: '3.1 MB',
        uploadedAt: today,
        verified: true
      },
      {
        id: `doc-pol-${Date.now()}`,
        name: `Police Clearance CID Certificate (${policeRefNo})`,
        type: 'police_clearance',
        fileName: policeCertFileName,
        fileSize: '950 KB',
        uploadedAt: today,
        verified: true
      }
    ];

    const jobTitle: JobRole = isKnownRole ? (jobRole as JobRole) : 'Other';
    const contractType = employmentType.trim() as EmploymentType;

    const newEmp = addEmployee({
      fullName: fullName.trim(),
      avatarUrl: avatarPreview,
      gender,
      dateOfBirth,
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      residentialArea: residentialArea.trim(),
      policeClearanceStatus: 'Verified',
      policeClearanceRef: policeRefNo,
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
        highestDegree,
        institution,
        fieldOfStudy,
        graduationYear: Number(graduationYear),
        yearsOfExperience: Number(yearsOfExperience)
      },
      contract: {
        referenceNo: contractRefNo,
        contractType,
        startDate,
        endDate,
        renewalStatus: 'Not Due',
        salaryGrade: `Grade ${jobTitle === 'Principal' ? 'E-1' : jobTitle === 'Teacher' ? 'T-2' : 'S-1'}`,
        monthlyBaseSalary: Number(monthlyBaseSalary),
        currency: 'USD',
        benefits: ['Medical Insurance', 'Housing Stipend'],
        noticePeriodDays: 30
      },
      documents
    });

    navigateToProfile(newEmp.id);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header with logo */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0E6139] via-[#147D4A] to-[#2D9A48] p-6 shadow-[0_20px_50px_-20px_rgba(20,125,74,0.55)]">
        <div className="absolute -top-20 -right-14 w-60 h-60 rounded-full border-[24px] border-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-white rounded-2xl px-3 py-1.5 shadow-lg self-start sm:self-auto">
              <img
                src="/directaid-logo-full.png"
                alt="DirectAid - العون المباشر"
                className="h-14 w-auto object-contain"
              />
            </div>
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
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2EAE4] rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
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
                <p className="text-xs text-[#57685D] mt-0.5">Optional. Initials are shown until a photo is added.</p>
                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#147D4A] bg-white border border-[#C5E8D2] hover:bg-[#EBF7EE] rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {photoUrl ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
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
                  Full Name <span className="text-rose-500">*</span>
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
                <label htmlFor="reg-dob" className={labelClass}>Date of Birth</label>
                <input
                  id="reg-dob"
                  type="date"
                  value={dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
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
                School Division <span className="text-rose-500">*</span>
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
                required
                options={JOB_ROLES}
                value={jobRole}
                onChange={setJobRole}
                otherLabel="+ Add manually..."
                placeholder="Type the job role"
              />

              <SelectWithOther
                id="reg-employment"
                label="Employment Type"
                required
                options={EMPLOYMENT_TYPES}
                value={employmentType}
                onChange={setEmploymentType}
                otherLabel="+ Add manually..."
                placeholder="Type the employment type"
              />
            </div>

            {isTeacher && (
              <SelectWithOther
                id="reg-subject"
                label="Teaching Subject"
                options={TEACHING_SUBJECTS}
                value={teachingSubject}
                onChange={setTeachingSubject}
                otherLabel="+ Add manually..."
                placeholder="Type the subject"
              />
            )}
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
                    onClick={() => {
                      setDegreeLevel(tier);
                      if (tier === 'PhD') setHighestDegree('Doctor of Philosophy (PhD)');
                      if (tier === 'Master') setHighestDegree('Master of Science / Education');
                      if (tier === 'Bachelor') setHighestDegree('Bachelor of Education (B.Ed)');
                      if (tier === 'Diploma') setHighestDegree('Diploma in Education');
                      if (tier === 'Vocational') setHighestDegree('Certified Technical License');
                    }}
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
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label htmlFor="reg-exp" className={labelClass}>Experience (Years)</label>
                  <input
                    id="reg-exp"
                    type="number"
                    min={0}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
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
              <p className="text-xs text-[#57685D] mt-0.5">Salary, contract length, and documents.</p>
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
                  Monthly Salary (USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    id="reg-salary"
                    type="number"
                    min={0}
                    value={monthlyBaseSalary}
                    onChange={(e) => setMonthlyBaseSalary(Number(e.target.value))}
                    className={`${inputClass} pl-7 font-mono font-semibold`}
                    required
                  />
                </div>
              </div>

              <SelectWithOther
                id="reg-duration"
                label="Contract Duration"
                required
                options={CONTRACT_DURATIONS}
                value={contractYears}
                onChange={setContractYears}
                otherLabel="+ Enter years manually..."
                placeholder="Number of years"
                inputType="number"
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm text-[#192C21]">Required Documents</h3>

              {[
                { icon: FileText, color: 'text-emerald-600', title: 'Curriculum Vitae (CV)', file: cvFileName, tag: 'Attached' },
                { icon: FileText, color: 'text-[#147D4A]', title: 'Signed Contract', file: contractFileName, tag: 'Attached' },
                { icon: ShieldCheck, color: 'text-blue-600', title: 'Somaliland CID Clearance', file: policeCertFileName, tag: 'Verified' }
              ].map(doc => (
                <div key={doc.title} className="p-3.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-white border border-[#E2EAE4] flex items-center justify-center shrink-0">
                      <doc.icon className={`w-4 h-4 ${doc.color}`} />
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-[#192C21] block">{doc.title}</span>
                      <span className="font-mono text-[11px] text-slate-500 truncate block">{doc.file}</span>
                    </div>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0">
                    ✓ {doc.tag}
                  </span>
                </div>
              ))}
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
              type="button"
              onClick={() => goToStep((step + 1) as 2 | 3 | 4)}
              className="px-6 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={divisions.length === 0}
              className="px-6 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Registration</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
