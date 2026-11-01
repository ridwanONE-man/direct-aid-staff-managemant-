import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DegreeLevel, DocumentAttachment, EmployeeRecord, EmploymentStatus, EmploymentType, JobRole } from '../../types';
import { EMPLOYMENT_TYPES, JOB_ROLES, PAYMENT_METHODS, SHIFT_SCHEDULES, TEACHING_SUBJECTS } from '../../data/staffOptions';
import { formatFileSize, removeStaffFiles, uploadStaffFile, validateFile } from '../../lib/storage';
import { initialsAvatar, resizePhoto } from '../../lib/photo';
import { Briefcase, Camera, Edit, FileText, GraduationCap, Loader2, StickyNote, Trash2, Upload, User, X } from 'lucide-react';

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#F9FBFA] border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all';
const labelClass = 'block text-xs font-semibold text-[#384C3F] mb-1.5';

const STATUSES: EmploymentStatus[] = ['Active', 'On Leave', 'Suspended', 'Terminated', 'Archived'];
const DEGREE_LEVELS: DegreeLevel[] = ['Diploma', 'Bachelor', 'Master', 'PhD', 'Vocational'];

type SectionId = 'personal' | 'employment' | 'qualifications' | 'contract' | 'notes';

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
  { id: 'contract', label: 'Contract & Pay', icon: FileText },
  { id: 'notes', label: 'Notes', icon: StickyNote }
];

const splitList = (value: string) =>
  value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);

interface EditEmployeeModalProps {
  employee: EmployeeRecord;
  onClose: () => void;
}

// Edits every part of a staff record except documents, which are managed in the Documents tab
export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose }) => {
  const { divisions, updateEmployee } = useApp();

  const [section, setSection] = useState<SectionId>('personal');
  const [error, setError] = useState('');
  const [form, setForm] = useState<EmployeeRecord>(() => ({
    ...employee,
    emergencyContact: { ...employee.emergencyContact },
    qualifications: { ...employee.qualifications },
    contract: { ...employee.contract }
  }));
  const [customRole, setCustomRole] = useState(employee.customJobTitle || '');
  const [subjects, setSubjects] = useState((employee.teachingSubjects || []).join(', '));
  const [benefits, setBenefits] = useState((employee.contract.benefits || []).join(', '));

  // Profile photo: also stored as the "Personal Photo" document
  const hasInitialsAvatar = employee.avatarUrl.startsWith('data:image/svg+xml');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(hasInitialsAvatar ? '' : employee.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const shownAvatar = photoPreview || initialsAvatar(form.fullName);

  const pickPhoto = async (file: File) => {
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      setPhotoPreview(await resizePhoto(file));
      setPhotoFile(file);
      setError('');
    } catch {
      setError('That photo could not be read. Please try a JPG or PNG image.');
    }
  };

  const set = <K extends keyof EmployeeRecord>(key: K, value: EmployeeRecord[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));
  const setQual = <K extends keyof EmployeeRecord['qualifications']>(key: K, value: EmployeeRecord['qualifications'][K]) =>
    setForm(prev => ({ ...prev, qualifications: { ...prev.qualifications, [key]: value } }));
  const setContract = <K extends keyof EmployeeRecord['contract']>(key: K, value: EmployeeRecord['contract'][K]) =>
    setForm(prev => ({ ...prev, contract: { ...prev.contract, [key]: value } }));
  const setKin = (key: 'name' | 'phone', value: string) =>
    setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: prev.emergencyContact.relationship || 'Next of Kin', [key]: value } }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.fullName.trim()) {
      setSection('personal');
      setError('Full name is required.');
      return;
    }
    if (form.jobTitle === 'Other' && !customRole.trim()) {
      setSection('employment');
      setError('Type the job role, or choose one from the list.');
      return;
    }
    if (form.contract.startDate && form.contract.endDate && form.contract.endDate < form.contract.startDate) {
      setSection('contract');
      setError('The contract end date must be after the start date.');
      return;
    }

    // Upload a new photo, or drop the old one if it was removed
    const oldPhotoDoc = employee.documents.find(d => d.type === 'photo');
    let documents = employee.documents;
    let avatarUrl = photoPreview || initialsAvatar(form.fullName.trim());
    if (photoFile) {
      setIsSaving(true);
      try {
        const { path } = await uploadStaffFile(photoFile);
        const photoDoc: DocumentAttachment = {
          id: `doc-photo-${Date.now()}`,
          name: 'Personal Photo',
          type: 'photo',
          fileName: photoFile.name,
          fileSize: formatFileSize(photoFile.size),
          uploadedAt: new Date().toISOString().split('T')[0],
          verified: false,
          storagePath: path,
          mimeType: photoFile.type
        };
        documents = [photoDoc, ...employee.documents.filter(d => d.type !== 'photo')];
      } catch (err) {
        setIsSaving(false);
        setSection('personal');
        setError(err instanceof Error ? err.message : 'Photo upload failed. Please try again.');
        return;
      }
    } else if (!photoPreview && oldPhotoDoc) {
      documents = employee.documents.filter(d => d.type !== 'photo');
    }
    if (documents !== employee.documents && oldPhotoDoc?.storagePath) {
      removeStaffFiles([oldPhotoDoc.storagePath]);
    }
    if (!photoPreview) avatarUrl = initialsAvatar(form.fullName.trim());

    const division = divisions.find(d => d.id === form.divisionId);
    const employmentType = (form.employmentType.trim() || employee.employmentType) as EmploymentType;
    updateEmployee(employee.id, {
      ...form,
      fullName: form.fullName.trim(),
      avatarUrl,
      documents,
      ...(division && {
        divisionName: division.name,
        campusLocation: division.city,
        schoolLevel: division.level,
        genderDivision: division.gender
      }),
      customJobTitle: form.jobTitle === 'Other' ? customRole.trim() : undefined,
      employmentType,
      teachingSubjects: splitList(subjects),
      qualifications: {
        ...form.qualifications,
        graduationYear: Number(form.qualifications.graduationYear) || 0,
        yearsOfExperience: Number(form.qualifications.yearsOfExperience) || 0
      },
      contract: {
        ...form.contract,
        contractType: employmentType,
        monthlyBaseSalary: Number(form.contract.monthlyBaseSalary) || 0,
        noticePeriodDays: Number(form.contract.noticePeriodDays) || 0,
        benefits: splitList(benefits)
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSave} className="bg-white rounded-2xl max-w-3xl w-full border border-[#E2EAE4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={shownAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#C5E8D2]" />
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[#192C21] flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#147D4A]" /> Edit Staff Information
              </h3>
              <p className="text-xs text-[#57685D] truncate">{employee.fullName} · {employee.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section tabs */}
        <div className="px-4 pt-3 flex gap-1 overflow-x-auto border-b border-[#E2EAE4]">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                section === s.id ? 'border-[#147D4A] text-[#147D4A]' : 'border-transparent text-[#57685D] hover:text-[#192C21]'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">{error}</div>
          )}

          {section === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-4 bg-[#F9FBFA] border border-[#E2EAE4] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={shownAvatar}
                  alt="Profile photo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <span className="font-semibold text-sm text-[#192C21] flex items-center justify-center sm:justify-start gap-1.5">
                    <Camera className="w-4 h-4 text-[#147D4A]" /> Profile Photo
                  </span>
                  <p className="text-xs text-[#57685D] mt-0.5">Also saved as the Personal Photo document. Initials are shown without a photo.</p>
                  <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#147D4A] bg-white border border-[#C5E8D2] hover:bg-[#EBF7EE] rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) pickPhoto(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview('');
                          setPhotoFile(null);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Full Name
                </label>
                <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value as 'Male' | 'Female')} className={inputClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Marital Status</label>
                <select
                  value={form.maritalStatus || 'Single'}
                  onChange={(e) => set('maritalStatus', e.target.value as EmployeeRecord['maritalStatus'])}
                  className={inputClass}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  {form.maritalStatus === 'Divorced' && <option value="Divorced">Divorced</option>}
                  {form.maritalStatus === 'Widowed' && <option value="Widowed">Widowed</option>}
                </select>
              </div>
              <div>
                <label className={labelClass}>Telephone</label>
                <input type="tel" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Residential District</label>
                <input type="text" value={form.residentialArea} onChange={(e) => set('residentialArea', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Next of Kin</label>
                <input type="text" value={form.emergencyContact.name} onChange={(e) => setKin('name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Next of Kin Phone</label>
                <input type="tel" value={form.emergencyContact.phone} onChange={(e) => setKin('phone', e.target.value)} className={`${inputClass} font-mono`} />
              </div>
            </div>
          )}

          {section === 'employment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>School Division</label>
                <select value={form.divisionId} onChange={(e) => set('divisionId', e.target.value)} className={inputClass}>
                  {!divisions.some(d => d.id === form.divisionId) && <option value={form.divisionId}>{form.divisionName}</option>}
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Job Role</label>
                <select value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value as JobRole)} className={inputClass}>
                  {JOB_ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                  <option value="Other">Other (type below)</option>
                </select>
                {form.jobTitle === 'Other' && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Type the job role"
                    className={`${inputClass} mt-2 bg-white`}
                  />
                )}
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <input
                  type="text"
                  list="edit-employment-types"
                  value={form.employmentType}
                  onChange={(e) => set('employmentType', e.target.value as EmploymentType)}
                  className={inputClass}
                />
                <datalist id="edit-employment-types">
                  {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value as EmploymentStatus)} className={inputClass}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Shift Schedule</label>
                <input
                  type="text"
                  list="edit-shifts"
                  value={form.shiftSchedule}
                  onChange={(e) => set('shiftSchedule', e.target.value)}
                  className={inputClass}
                />
                <datalist id="edit-shifts">
                  {SHIFT_SCHEDULES.map(t => <option key={t.value} value={t.value} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Direct Supervisor</label>
                <input type="text" value={form.directSupervisor} onChange={(e) => set('directSupervisor', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hire Date</label>
                <input type="date" value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Teaching Subjects</label>
                <input
                  type="text"
                  list="edit-subjects"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Separate several subjects with commas"
                  className={inputClass}
                />
                <datalist id="edit-subjects">
                  {TEACHING_SUBJECTS.map(t => <option key={t.value} value={t.value} />)}
                </datalist>
              </div>
            </div>
          )}

          {section === 'qualifications' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Degree Level</label>
                <select value={form.qualifications.degreeLevel} onChange={(e) => setQual('degreeLevel', e.target.value as DegreeLevel)} className={inputClass}>
                  {DEGREE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Degree Title</label>
                <input type="text" value={form.qualifications.highestDegree} onChange={(e) => setQual('highestDegree', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Awarding Institution</label>
                <input type="text" value={form.qualifications.institution} onChange={(e) => setQual('institution', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Field of Study</label>
                <input type="text" value={form.qualifications.fieldOfStudy} onChange={(e) => setQual('fieldOfStudy', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Graduation Year</label>
                <input
                  type="number"
                  value={form.qualifications.graduationYear || ''}
                  onChange={(e) => setQual('graduationYear', Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  value={form.qualifications.yearsOfExperience ?? ''}
                  onChange={(e) => setQual('yearsOfExperience', Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          )}

          {section === 'contract' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contract Reference</label>
                <input type="text" value={form.contract.referenceNo} onChange={(e) => setContract('referenceNo', e.target.value)} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Salary Grade</label>
                <input type="text" value={form.contract.salaryGrade} onChange={(e) => setContract('salaryGrade', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={form.contract.startDate} onChange={(e) => setContract('startDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={form.contract.endDate} onChange={(e) => setContract('endDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Monthly Salary (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    value={form.contract.monthlyBaseSalary}
                    onChange={(e) => setContract('monthlyBaseSalary', Number(e.target.value))}
                    className={`${inputClass} pl-7 font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Notice Period (days)</label>
                <input
                  type="number"
                  min={0}
                  value={form.contract.noticePeriodDays}
                  onChange={(e) => setContract('noticePeriodDays', Number(e.target.value))}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Benefits</label>
                <input
                  type="text"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Separate several benefits with commas"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <input
                  type="text"
                  list="edit-payment-methods"
                  value={form.paymentMethod || ''}
                  onChange={(e) => set('paymentMethod', e.target.value)}
                  className={inputClass}
                />
                <datalist id="edit-payment-methods">
                  {PAYMENT_METHODS.map(t => <option key={t.value} value={t.value} />)}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Payment Account Number</label>
                <input
                  type="text"
                  value={form.paymentAccountNo || ''}
                  onChange={(e) => set('paymentAccountNo', e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          )}

          {section === 'notes' && (
            <div>
              <label className={labelClass}>Notes</label>
              <textarea rows={6} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Documents are managed in the Documents tab.</span>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
