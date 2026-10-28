import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobRole, DegreeLevel, EmploymentType, DocumentAttachment } from '../../types';
import {
  UserPlus,
  Camera,
  FileText,
  ShieldCheck,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const RegisterEmployeePage: React.FC = () => {
  const { divisions, addEmployee, navigateToProfile, setActivePage } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Personal & Photo
  const [fullName, setFullName] = useState('');
  const [somaliName, setSomaliName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1990-05-15');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Married');
  const [phoneNumber, setPhoneNumber] = useState('+252 63 ');
  const [email, setEmail] = useState('');
  const [residentialArea, setResidentialArea] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80');

  // Emergency & Payment
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+252 63 ');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [paymentMethod, setPaymentMethod] = useState<'ZAAD (Telesom)' | 'e-Dahab (Dahabshiil)' | 'Dahabshiil Bank'>('ZAAD (Telesom)');
  const [paymentAccountNo, setPaymentAccountNo] = useState('');

  // 2. Division & Role
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || 'div-sec-boys-hrg');
  const [jobTitle, setJobTitle] = useState<JobRole>('Teacher');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Fixed-Term Contract');
  const [shiftSchedule, setShiftSchedule] = useState('Morning Duty (07:15 - 13:45)');
  const [teachingSubject, setTeachingSubject] = useState('Mathematics');

  // 3. Qualifications & Degree Assignment
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('Bachelor');
  const [highestDegree, setHighestDegree] = useState('Bachelor of Education');
  const [institution, setInstitution] = useState('University of Hargeisa');
  const [fieldOfStudy, setFieldOfStudy] = useState('Secondary Education & Pedagogy');
  const [graduationYear, setGraduationYear] = useState(2019);
  const [yearsOfExperience, setYearsOfExperience] = useState(4);
  const [teachingLicenseNo, setTeachingLicenseNo] = useState('');
  const [univCertFileName] = useState('University_Degree_Certificate.pdf');

  // 4. Contract & Documents
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState(600);
  const [contractYears, setContractYears] = useState(2);
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractRefNo] = useState(`CTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  
  // Compliance Files
  const [cvFileName] = useState('Staff_Resume_CV.pdf');
  const [contractFileName] = useState('Signed_DirectAid_Contract.pdf');
  const [policeCertFileName] = useState('CID_Criminal_Record_Check.pdf');
  const [policeRefNo] = useState(`CID-SL-${Math.floor(10000 + Math.random() * 90000)}`);

  // Quick preset avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDiv = divisions.find(d => d.id === divisionId) || divisions[0];

    const endDate = new Date(new Date(startDate).getTime() + contractYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Build documents array
    const documents: DocumentAttachment[] = [
      {
        id: `doc-cv-${Date.now()}`,
        name: 'Curriculum Vitae (CV)',
        type: 'cv',
        fileName: cvFileName,
        fileSize: '1.2 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-ctr-${Date.now()}`,
        name: 'Signed Employment Contract',
        type: 'contract',
        fileName: contractFileName,
        fileSize: '2.5 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-deg-${Date.now()}`,
        name: `${degreeLevel} Certificate (${institution})`,
        type: 'academic_degree',
        fileName: univCertFileName,
        fileSize: '3.1 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-pol-${Date.now()}`,
        name: `Police Clearance CID Certificate (${policeRefNo})`,
        type: 'police_clearance',
        fileName: policeCertFileName,
        fileSize: '950 KB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      }
    ];

    const newEmp = addEmployee({
      fullName,
      somaliName,
      avatarUrl,
      gender,
      dateOfBirth,
      bloodGroup,
      maritalStatus,
      phoneNumber,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@directaid.org`,
      residentialArea,
      nationalIdNumber: nationalIdNumber || `SL-ID-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod,
      paymentAccountNo: paymentAccountNo || phoneNumber,
      policeClearanceStatus: 'Verified',
      policeClearanceRef: policeRefNo,
      emergencyContact: {
        name: emergencyName || 'Family Relative',
        relationship: emergencyRelation,
        phone: emergencyPhone
      },
      divisionId: selectedDiv.id,
      divisionName: selectedDiv.name,
      campusLocation: selectedDiv.city,
      schoolLevel: selectedDiv.level,
      genderDivision: selectedDiv.gender,
      jobTitle,
      customJobTitle: customJobTitle || undefined,
      employmentType,
      shiftSchedule,
      teachingSubjects: teachingSubject ? [teachingSubject] : undefined,
      qualifications: {
        degreeLevel,
        highestDegree,
        institution,
        fieldOfStudy,
        graduationYear: Number(graduationYear),
        yearsOfExperience: Number(yearsOfExperience),
        teachingLicenseNo: teachingLicenseNo || undefined
      },
      contract: {
        referenceNo: contractRefNo,
        contractType: employmentType,
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
      {/* Top Banner */}
      <div className="bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#147D4A] bg-[#EBF7EE] px-2.5 py-0.5 rounded-full">
                Onboarding
              </span>
              <span className="text-xs text-[#57685D]">Hargeisa &amp; Gabiley</span>
            </div>
            <h1 className="text-xl font-black text-[#192C21] mt-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#147D4A]" />
              Staff Registration
            </h1>
            <p className="text-xs text-[#57685D] mt-0.5">
              Enroll staff members into verified school divisions.
            </p>
          </div>

          <button
            onClick={() => setActivePage('directory')}
            className="text-xs font-semibold text-[#57685D] hover:text-[#192C21] flex items-center gap-1 self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </button>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-[#E2EAE4] text-xs">
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Division & Role' },
            { num: 3, label: 'Credentials' },
            { num: 4, label: 'Contract' }
          ].map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`p-2 rounded-xl text-left transition-all ${
                step === s.num
                  ? 'bg-[#147D4A] text-white shadow-xs font-bold'
                  : step > s.num
                  ? 'bg-[#EBF7EE] text-[#147D4A] font-semibold'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80">Step {s.num}</div>
              <div className="truncate text-xs">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2EAE4] rounded-2xl p-6 shadow-xs space-y-6 text-xs">
        {/* STEP 1: PERSONAL PHOTO & DETAILS */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#147D4A]" />
                1. Personal Photo &amp; Details
              </h2>
              <p className="text-[#57685D] text-xs">Staff photograph and basic personal records.</p>
            </div>

            {/* Photo Picker */}
            <div className="p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt="Staff Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#147D4A] shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#147D4A] text-white p-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="font-semibold text-[#192C21] block">Profile Photograph</span>
                <p className="text-[11px] text-[#57685D]">
                  Select an avatar preset:
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {avatarPresets.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                        avatarUrl === url ? 'border-[#147D4A] ring-2 ring-[#35B86B]/30 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mahad Jama Warsame"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#147D4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Somali Name</label>
                <input
                  type="text"
                  value={somaliName}
                  onChange={(e) => setSomaliName(e.target.value)}
                  placeholder="e.g. Mahad Jaamac Warsame"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#147D4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telephone Number *</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+252 63 4421098"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-1 focus:ring-[#147D4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. m.jama@directaid.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#147D4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Residential District *</label>
                <input
                  type="text"
                  value={residentialArea}
                  onChange={(e) => setResidentialArea(e.target.value)}
                  placeholder="e.g. 26 June, Hargeisa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#147D4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DIVISION & ROLE */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#147D4A]" />
                2. Division &amp; Role Placement
              </h2>
              <p className="text-[#57685D] text-xs">Assign the employee to a campus division and role.</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">School Division *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {divisions.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setDivisionId(d.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      divisionId === d.id
                        ? 'border-[#147D4A] bg-[#EBF7EE] shadow-xs ring-1 ring-[#147D4A]'
                        : 'border-[#E2EAE4] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#192C21]">{d.canonicalIndex}. {d.name}</span>
                      <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold text-[#147D4A]">
                        {d.city}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#57685D] block mt-0.5">
                      {d.gender} Wing · {d.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Role *</label>
                <select
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-[#147D4A]"
                >
                  <option value="Principal">Principal / Headmaster</option>
                  <option value="Deputy Principal">Deputy Principal</option>
                  <option value="Teacher">Teacher / Instructor</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Driver">Bus Driver</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Finance Officer">Finance Officer</option>
                  <option value="IT Support Officer">IT Support Officer</option>
                  <option value="Administrative Officer">Administrative Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Employment Type *</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Fixed-Term Contract">Fixed-Term Contract</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Probationary">Probationary (3 Months)</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
            </div>

            {jobTitle === 'Teacher' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Teaching Subject</label>
                <select
                  value={teachingSubject}
                  onChange={(e) => setTeachingSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="Pure Mathematics & Calculus">Pure Mathematics</option>
                  <option value="Physics & Physical Sciences">Physics</option>
                  <option value="Chemistry & Laboratory">Chemistry</option>
                  <option value="Biology & Life Sciences">Biology</option>
                  <option value="Arabic Language & Grammar">Arabic Language</option>
                  <option value="Islamic Studies & Sharia">Islamic Studies</option>
                  <option value="Somali Literature & History">Somali Literature</option>
                  <option value="English Language & Composition">English Language</option>
                  <option value="Primary Numeracy & Literacy">Primary Numeracy & Literacy</option>
                  <option value="ICT & Computer Science">ICT</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: QUALIFICATIONS */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#147D4A]" />
                3. Qualifications &amp; Degree Tier
              </h2>
              <p className="text-[#57685D] text-xs">Academic qualifications and certifications.</p>
            </div>

            {/* Degree Tier Selection Buttons */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Degree Tier *</label>
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
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      degreeLevel === tier
                        ? 'border-[#147D4A] bg-[#147D4A] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Degree Title *</label>
                <input
                  type="text"
                  value={highestDegree}
                  onChange={(e) => setHighestDegree(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Awarding Institution *</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of Hargeisa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Field of Study *</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Science Education"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONTRACT & VAULT */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#147D4A]" />
                4. Contract &amp; Document Vault
              </h2>
              <p className="text-[#57685D] text-xs">Remuneration and required documents.</p>
            </div>

            <div className="p-4 bg-[#EBF7EE] border border-[#C5E8D2] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#147D4A] uppercase tracking-wider block">Contract Ref</span>
                <span className="font-mono font-bold text-[#192C21] text-xs">{contractRefNo}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#147D4A] uppercase tracking-wider block">Monthly Base</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={monthlyBaseSalary}
                    onChange={(e) => setMonthlyBaseSalary(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                    required
                  />
                  <span className="text-xs text-slate-500 font-semibold">USD</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#147D4A] uppercase tracking-wider block">Duration</span>
                <select
                  value={contractYears}
                  onChange={(e) => setContractYears(Number(e.target.value))}
                  className="mt-0.5 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                </select>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[#192C21]">Mandatory Document Pack</h3>

              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-[#192C21] block">Curriculum Vitae (CV)</span>
                    <span className="font-mono text-[11px] text-slate-500">{cvFileName}</span>
                  </div>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  ✓ Attached
                </span>
              </div>

              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#147D4A]" />
                  <div>
                    <span className="font-bold text-[#192C21] block">Signed Contract</span>
                    <span className="font-mono text-[11px] text-slate-500">{contractFileName}</span>
                  </div>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  ✓ Attached
                </span>
              </div>

              <div className="p-3 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-[#192C21] block">Somaliland CID Clearance</span>
                    <span className="font-mono text-[11px] text-slate-500">{policeCertFileName}</span>
                  </div>
                </div>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-[#E2EAE4] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && (!fullName || !phoneNumber || !residentialArea)) {
                  alert('Please enter required Full Name, Phone, and Residential Area.');
                  return;
                }
                setStep((step + 1) as any);
              }}
              className="px-5 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
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
