import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobRole, DegreeLevel, EmploymentType, DocumentAttachment } from '../../types';
import { X, UserPlus, Check, ArrowRight, ArrowLeft, Camera, FileText, ShieldCheck, GraduationCap } from 'lucide-react';

export const AddEmployeeModal: React.FC = () => {
  const { isAddEmployeeOpen, setIsAddEmployeeOpen, divisions, addEmployee, navigateToProfile } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Personal & Photo
  const [fullName, setFullName] = useState('');
  const [somaliName, setSomaliName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+252 63 ');
  const [residentialArea, setResidentialArea] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1992-06-15');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Married');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80');

  // Emergency & Payment
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+252 63 ');
  const [paymentMethod, setPaymentMethod] = useState<'ZAAD (Telesom)' | 'e-Dahab (Dahabshiil)' | 'Dahabshiil Bank'>('ZAAD (Telesom)');
  const [paymentAccountNo, setPaymentAccountNo] = useState('');

  // 2. Division & Role
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || 'div-sec-boys-hrg');
  const [jobTitle, setJobTitle] = useState<JobRole>('Teacher');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Fixed-Term Contract');
  const [shiftSchedule, setShiftSchedule] = useState('Morning Shift (07:15 - 13:45)');
  const [teachingSubject, setTeachingSubject] = useState('Pure Mathematics');

  // 3. Qualifications & Degree Tier Assignment
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>('Bachelor');
  const [highestDegree, setHighestDegree] = useState('Bachelor of Education');
  const [institution, setInstitution] = useState('University of Hargeisa');
  const [fieldOfStudy, setFieldOfStudy] = useState('Secondary Education');
  const [graduationYear, setGraduationYear] = useState(2020);
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [teachingLicenseNo, setTeachingLicenseNo] = useState('');

  // 4. Contract & Documents
  const [monthlyBaseSalary, setMonthlyBaseSalary] = useState(580);
  const [contractYears, setContractYears] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [policeRefNo, setPoliceRefNo] = useState(`CID-SL-${Math.floor(10000 + Math.random() * 90000)}`);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  ];

  if (!isAddEmployeeOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDiv = divisions.find(d => d.id === divisionId) || divisions[0];

    const endDate = new Date(new Date(startDate).getTime() + contractYears * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const documents: DocumentAttachment[] = [
      {
        id: `doc-cv-${Date.now()}`,
        name: 'Curriculum Vitae (CV)',
        type: 'cv',
        fileName: `${fullName.replace(/\s+/g, '_')}_CV.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-ctr-${Date.now()}`,
        name: 'Signed Employment Contract',
        type: 'contract',
        fileName: `DirectAid_Contract_${selectedDiv.city}.pdf`,
        fileSize: '2.4 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-deg-${Date.now()}`,
        name: `${degreeLevel} Certificate (${institution})`,
        type: 'academic_degree',
        fileName: `Degree_Certificate_${degreeLevel}.pdf`,
        fileSize: '3.0 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      },
      {
        id: `doc-pol-${Date.now()}`,
        name: `Police Clearance (CID Ref #${policeRefNo})`,
        type: 'police_clearance',
        fileName: `CID_Clearance_${policeRefNo}.pdf`,
        fileSize: '890 KB',
        uploadedAt: new Date().toISOString().split('T')[0],
        verified: true
      }
    ];

    const newEmp = addEmployee({
      fullName,
      somaliName,
      avatarUrl,
      email,
      phoneNumber,
      residentialArea,
      nationalIdNumber,
      dateOfBirth,
      gender,
      maritalStatus,
      bloodGroup,
      paymentMethod,
      paymentAccountNo: paymentAccountNo || phoneNumber,
      policeClearanceStatus: 'Verified',
      policeClearanceRef: policeRefNo,
      emergencyContact: {
        name: emergencyName || 'Family Member',
        relationship: 'Relative',
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
        referenceNo: `CTR-${selectedDiv.city === 'Gabiley' ? 'GBL' : 'HRG'}-2024-${Math.floor(100 + Math.random() * 900)}`,
        contractType: employmentType,
        startDate,
        endDate,
        renewalStatus: 'Not Due',
        salaryGrade: `Grade ${jobTitle === 'Principal' ? 'E-1' : jobTitle === 'Teacher' ? 'T-2' : 'S-1'}`,
        monthlyBaseSalary: Number(monthlyBaseSalary),
        currency: 'USD',
        benefits: ['Medical Insurance', 'DirectAid Training Voucher'],
        noticePeriodDays: 30
      },
      documents
    });

    setIsAddEmployeeOpen(false);
    setStep(1);
    setFullName('');
    setSomaliName('');
    setEmail('');
    setResidentialArea('');

    navigateToProfile(newEmp.id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DDF5E5] text-[#147D4A] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#192C21]">Register New Employee</h3>
              <p className="text-[11px] text-[#57685D]">
                Step {step} of 4: {step === 1 ? 'Personal & Photo' : step === 2 ? 'Division & Role' : step === 3 ? 'Degree & Credentials' : 'Contract, CV & Clearance'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddEmployeeOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs">
            {/* STEP 1: PERSONAL & PHOTO */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Photo Preview & Selection */}
                <div className="flex items-center gap-4 p-3.5 bg-[#F8FAF9] border border-[#E2EAE4] rounded-xl">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-[#147D4A] shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800 block text-xs">Personal Photo</span>
                    <div className="flex items-center gap-2">
                      {avatarPresets.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-7 h-7 rounded-md overflow-hidden border ${avatarUrl === url ? 'ring-2 ring-[#147D4A]' : 'opacity-60'}`}
                        >
                          <img src={url} alt={`p${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mahad Jama Warsame"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Telephone Number *</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@directaid.org.so"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Residential Neighborhood *</label>
                    <input
                      type="text"
                      value={residentialArea}
                      onChange={(e) => setResidentialArea(e.target.value)}
                      placeholder="e.g. 26 June, Jigjiga Yar, Gabiley Central"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">National ID #</label>
                    <input
                      type="text"
                      value={nationalIdNumber}
                      onChange={(e) => setNationalIdNumber(e.target.value)}
                      placeholder="SOM-HRG-..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Married">Married</option>
                      <option value="Single">Single</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DIVISION & ROLE */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">School Division Assignment (The 8 Canonical Categories) *</label>
                  <select
                    value={divisionId}
                    onChange={(e) => setDivisionId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-[#147D4A]"
                    required
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.canonicalIndex}. {d.name} ({d.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Job Role *</label>
                    <select
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="Principal">Principal</option>
                      <option value="Deputy Principal">Deputy Principal</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Security Guard">Security Guard</option>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Driver">Driver</option>
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Fixed-Term Contract">Fixed-Term Contract</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Probationary">Probationary</option>
                    </select>
                  </div>
                </div>

                {jobTitle === 'Teacher' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assigned Subject</label>
                    <input
                      type="text"
                      value={teachingSubject}
                      onChange={(e) => setTeachingSubject(e.target.value)}
                      placeholder="e.g. Mathematics, Physics, Arabic Language"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duty Shift / Hours</label>
                  <input
                    type="text"
                    value={shiftSchedule}
                    onChange={(e) => setShiftSchedule(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: DEGREE & CREDENTIALS */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Assign Degree Level *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['Diploma', 'Bachelor', 'Master', 'PhD', 'Vocational'] as DegreeLevel[]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          setDegreeLevel(tier);
                          if (tier === 'PhD') setHighestDegree('Doctor of Philosophy (PhD)');
                          if (tier === 'Master') setHighestDegree('Master of Science / Education');
                          if (tier === 'Bachelor') setHighestDegree('Bachelor of Education');
                          if (tier === 'Diploma') setHighestDegree('Diploma in School Education');
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                          degreeLevel === tier
                            ? 'bg-[#147D4A] text-white border-[#147D4A]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Degree Title *</label>
                    <input
                      type="text"
                      value={highestDegree}
                      onChange={(e) => setHighestDegree(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">University / Institution *</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Field of Study</label>
                    <input
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAF9] border border-[#E2EAE4] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-5 h-5 text-[#147D4A]" />
                    <div>
                      <span className="font-bold text-slate-900 block">University Degree Certificate</span>
                      <span className="text-[11px] text-slate-500">Degree_Certificate_{degreeLevel}.pdf</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    ✓ Verified Document
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: CONTRACT, CV, POLICE CLEARANCE */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#DDF5E5]/40 border border-[#C5E8D2] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Monthly Salary (USD) *</label>
                    <input
                      type="number"
                      value={monthlyBaseSalary}
                      onChange={(e) => setMonthlyBaseSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contract Duration</label>
                    <select
                      value={contractYears}
                      onChange={(e) => setContractYears(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value={1}>1 Year (Academic 24/25)</option>
                      <option value={2}>2 Years (Standard)</option>
                      <option value={3}>3 Years</option>
                    </select>
                  </div>
                </div>

                {/* Document Packs */}
                <div className="space-y-2">
                  <span className="font-bold text-xs text-slate-800 block">Required Compliance Vault Attachments</span>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Curriculum Vitae (CV / Résumé)</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">✓ Ready</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#147D4A]" />
                      <span className="font-medium">DirectAid Employment Contract Document</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">✓ Ready</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-medium block">Police Clearance Certificate (Somaliland CID)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Ref #{policeRefNo}</span>
                      </div>
                    </div>
                    <span className="text-blue-700 font-bold text-[10px]">✓ Verified CID</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddEmployeeOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!fullName || !phoneNumber || !residentialArea)) {
                    alert('Please enter Full Name, Phone Number, and Residential Area.');
                    return;
                  }
                  setStep((step + 1) as any);
                }}
                className="px-5 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                Register Staff Member
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
