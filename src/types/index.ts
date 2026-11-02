export type LocationCity = 'Hargeisa' | 'Gabiley';
export type SchoolLevel = 'Secondary' | 'Primary' | 'Central Operations';
export type GenderDivision = 'Boys' | 'Girls' | 'Co-educational' | 'Operations';

export type JobRole = 
  | 'General Director'
  | 'Principal'
  | 'Deputy Principal'
  | 'Head Teacher'
  | 'Teacher'
  | 'Security Guard'
  | 'Cleaner'
  | 'Driver'
  | 'Secretary'
  | 'Administrative Officer'
  | 'Human Resources Officer'
  | 'Finance Officer'
  | 'IT Support Officer'
  | 'Maintenance Worker'
  | 'Lab Technician'
  | 'Librarian'
  | 'Other';

export type EmploymentType = 'Permanent' | 'Fixed-Term Contract' | 'Probationary' | 'Part-Time';
export type EmploymentStatus = 'Active' | 'On Leave' | 'Suspended' | 'Terminated' | 'Archived';
export type ContractStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending Renewal' | 'Probationary';

export type AppUserRole = 'super_admin' | 'hr_admin' | 'division_manager' | 'employee';

export type DocumentType =
  | 'cv'
  | 'contract'
  | 'academic_degree'
  | 'national_id'
  | 'police_clearance'
  | 'photo'
  | 'appointment_letter'
  | 'medical_fitness'
  | 'other';

export interface DocumentAttachment {
  id: string;
  name: string;
  type: DocumentType;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  expiryDate?: string;
  verified: boolean;
  downloadUrl?: string;
  storagePath?: string; // path in the Supabase "staff-documents" bucket
  mimeType?: string;
}

export type DegreeLevel = 'Diploma' | 'Bachelor' | 'Master' | 'PhD' | 'Vocational';

export interface EmployeeQualification {
  degreeLevel: DegreeLevel;
  highestDegree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  specialization?: string;
  teachingLicenseNo?: string;
  yearsOfExperience?: number;
  additionalCertifications?: string[];
}

export interface EmployeeContract {
  referenceNo: string;
  contractType: EmploymentType;
  startDate: string;
  endDate: string;
  renewalStatus: 'Not Due' | 'Approaching Renewal' | 'Renewal Pending Sign-off' | 'Expired' | 'Renewed';
  salaryGrade: string;
  monthlyBaseSalary: number; // in USD
  currency: 'USD';
  benefits: string[];
  probationEndDate?: string;
  noticePeriodDays: number;
}

export interface EmployeeRecord {
  id: string; // e.g., DA-HRG-SEC-001
  fullName: string;
  somaliName?: string;
  arabicName?: string;
  avatarUrl: string;
  jobTitle: JobRole;
  customJobTitle?: string;
  roleCategory: 'Administrative' | 'Teaching' | 'Support' | 'Security & Facilities';
  divisionId: string;
  divisionName: string;
  campusLocation: LocationCity;
  schoolLevel: SchoolLevel;
  genderDivision: GenderDivision;
  
  // Personal Info
  email: string;
  phoneNumber: string;
  residentialArea: string; // Neighborhood / district in Hargeisa or Gabiley
  nationalIdNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  bloodGroup?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  paymentMethod?: string; // ZAAD (Telesom), e-Dahab, Bank
  paymentAccountNo?: string;
  policeClearanceStatus?: 'Verified' | 'Pending Renewal' | 'Exempt';
  policeClearanceRef?: string;

  // Employment
  hireDate: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  directSupervisor: string;
  shiftSchedule: string;
  teachingSubjects?: string[];

  // Credentials & Contracts
  qualifications: EmployeeQualification;
  contract: EmployeeContract;
  documents: DocumentAttachment[];

  // Completeness
  profileCompleteness: number; // percentage 0-100
  missingRequirements: string[];
  notes?: string;
}

export interface SchoolDivisionCategory {
  id: string;
  canonicalIndex: number;
  name: string;
  level: SchoolLevel;
  gender: GenderDivision;
  city: LocationCity;
  code: string;
  principalName: string;
  principalAvatar: string;
  principalPhone: string;
  principalEmployeeId?: string; // staff record linked as this division's principal
  color?: string; // card colour key (src/data/divisionColors.ts), shared by its staff cards
  studentCount: number;
  description: string;
  campusAddress: string;
}

export interface HRAlertNotification {
  id: string;
  title: string;
  message: string;
  category: 'contract' | 'document' | 'compliance' | 'system' | 'onboarding';
  severity: 'high' | 'medium' | 'low';
  employeeId?: string;
  divisionId?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface ComplianceAuditItem {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  category: 'Document Vault' | 'Teacher Licensing' | 'Safety & Security' | 'Contract Renewal' | 'Ratio Audit';
  severity: 'Critical' | 'Warning' | 'Satisfactory';
  affectedCount: number;
  description: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}
