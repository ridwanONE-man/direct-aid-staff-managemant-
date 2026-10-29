import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EmployeeRecord,
  SchoolDivisionCategory,
  AppUserRole,
  LocationCity,
  HRAlertNotification,
  ComplianceAuditItem,
  EmployeeContract,
  DocumentAttachment
} from '../types';
import { CANONICAL_DIVISIONS, INITIAL_EMPLOYEES, INITIAL_NOTIFICATIONS, INITIAL_COMPLIANCE_ITEMS } from '../data/initialData';

export type AppPage = 'dashboard' | 'directory' | 'divisions' | 'profile' | 'contracts' | 'reports' | 'register';

export interface DirectoryFilters {
  searchQuery: string;
  divisionId: string;
  jobRole: string;
  campusLocation: string;
  schoolLevel: string;
  genderDivision: string;
  contractStatus: string;
  employmentStatus: string;
}

interface AppContextType {
  employees: EmployeeRecord[];
  divisions: SchoolDivisionCategory[];
  selectedEmployee: EmployeeRecord | null;
  setSelectedEmployee: (emp: EmployeeRecord | null) => void;
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  regionalScope: 'all' | 'hargeisa' | 'gabiley';
  setRegionalScope: (scope: 'all' | 'hargeisa' | 'gabiley') => void;
  currentRole: AppUserRole;
  setCurrentRole: (role: AppUserRole) => void;
  filters: DirectoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<DirectoryFilters>>;
  resetFilters: () => void;
  notifications: HRAlertNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  complianceItems: ComplianceAuditItem[];
  toggleComplianceStatus: (id: string) => void;
  
  // Modals
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  isRenewContractOpen: boolean;
  setIsRenewContractOpen: (open: boolean) => void;
  contractRenewalTarget: EmployeeRecord | null;
  setContractRenewalTarget: (emp: EmployeeRecord | null) => void;
  isUploadDocOpen: boolean;
  setIsUploadDocOpen: (open: boolean) => void;

  // Actions
  addDivision: (divData: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>) => SchoolDivisionCategory;
  addEmployee: (empData: Partial<EmployeeRecord>) => EmployeeRecord;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  deleteEmployee: (id: string) => void;
  renewContract: (employeeId: string, contractUpdates: Partial<EmployeeContract>) => void;
  addDocument: (employeeId: string, doc: Omit<DocumentAttachment, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (employeeId: string, docId: string) => void;
  navigateToProfile: (employeeId: string) => void;
  navigateToDivisionStaff: (divisionId: string) => void;

  // Authentication
  isAuthenticated: boolean;
  login: (usernameOrEmail?: string, password?: string) => boolean;
  logout: () => void;
}

const defaultFilters: DirectoryFilters = {
  searchQuery: '',
  divisionId: '',
  jobRole: '',
  campusLocation: '',
  schoolLevel: '',
  genderDivision: '',
  contractStatus: '',
  employmentStatus: ''
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Bump to discard demo data previously persisted in the browser
const DATA_VERSION = '2';
try {
  if (localStorage.getItem('directaid_data_version') !== DATA_VERSION) {
    localStorage.removeItem('directaid_employees');
    localStorage.removeItem('directaid_notifications');
    localStorage.removeItem('directaid_compliance');
    localStorage.setItem('directaid_data_version', DATA_VERSION);
  }
} catch (e) {
  console.error('Failed to reset stored data:', e);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => {
    const saved = localStorage.getItem('directaid_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved employees:', e);
      }
    }
    return INITIAL_EMPLOYEES;
  });

  const [divisions, setDivisions] = useState<SchoolDivisionCategory[]>(() => {
    const saved = localStorage.getItem('directaid_divisions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved divisions:', e);
      }
    }
    return CANONICAL_DIVISIONS;
  });
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(() => employees[0] || null);
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [regionalScope, setRegionalScope] = useState<'all' | 'hargeisa' | 'gabiley'>('all');
  const [currentRole, setCurrentRole] = useState<AppUserRole>('super_admin');
  const [filters, setFilters] = useState<DirectoryFilters>(defaultFilters);

  const [notifications, setNotifications] = useState<HRAlertNotification[]>(() => {
    const saved = localStorage.getItem('directaid_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [complianceItems, setComplianceItems] = useState<ComplianceAuditItem[]>(() => {
    const saved = localStorage.getItem('directaid_compliance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMPLIANCE_ITEMS;
  });

  // Modal states
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isRenewContractOpen, setIsRenewContractOpen] = useState(false);
  const [contractRenewalTarget, setContractRenewalTarget] = useState<EmployeeRecord | null>(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('directaid_auth') === 'true';
  });

  const login = (_usernameOrEmail?: string, _password?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('directaid_auth', 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('directaid_auth');
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('directaid_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('directaid_divisions', JSON.stringify(divisions));
  }, [divisions]);

  useEffect(() => {
    localStorage.setItem('directaid_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('directaid_compliance', JSON.stringify(complianceItems));
  }, [complianceItems]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleComplianceStatus = (id: string) => {
    setComplianceItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Open' ? 'In Progress' : item.status === 'In Progress' ? 'Resolved' : 'Open';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Helper to recalculate completeness
  const calculateCompleteness = (emp: Partial<EmployeeRecord>): { score: number; missing: string[] } => {
    const missing: string[] = [];
    if (!emp.nationalIdNumber) missing.push('National ID / Passport Number');
    if (!emp.phoneNumber) missing.push('Phone Number');
    if (!emp.email) missing.push('Email Address');
    if (!emp.residentialArea) missing.push('Residential Area');
    if (!emp.qualifications?.highestDegree) missing.push('Highest Qualification Certificate');
    if (!emp.contract?.referenceNo) missing.push('Signed Employment Contract');
    
    const docs = emp.documents || [];
    const hasCv = docs.some(d => d.type === 'cv');
    const hasContract = docs.some(d => d.type === 'contract');
    const hasPolice = docs.some(d => d.type === 'police_clearance');

    if (!hasCv) missing.push('CV / Resume');
    if (!hasContract) missing.push('Signed Contract PDF');
    if (!hasPolice) missing.push('Police Clearance Check (CID)');

    const totalCheckpoints = 9;
    const completed = totalCheckpoints - missing.length;
    const score = Math.round((completed / totalCheckpoints) * 100);
    return { score, missing };
  };

  const addDivision = (data: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>): SchoolDivisionCategory => {
    const newDivision: SchoolDivisionCategory = {
      ...data,
      id: `div-${Date.now()}`,
      canonicalIndex: divisions.reduce((max, d) => Math.max(max, d.canonicalIndex), 0) + 1
    };

    setDivisions(prev => [...prev, newDivision]);

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: 'School Division Created',
      message: `${newDivision.name} (${newDivision.code}) was added in ${newDivision.city}.`,
      category: 'system',
      severity: 'low',
      divisionId: newDivision.id,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: 'divisions'
    }, ...prev]);

    return newDivision;
  };

  const addEmployee = (data: Partial<EmployeeRecord>): EmployeeRecord => {
    const cityCode = data.campusLocation === 'Gabiley' ? 'GBL' : 'HRG';
    const randomSuffix = Math.floor(2000 + Math.random() * 8000);
    const newId = `DA-${cityCode}-${randomSuffix}`;

    const divisionObj = divisions.find(d => d.id === data.divisionId) || divisions[0];
    if (!divisionObj) {
      throw new Error('Create a school division before registering employees.');
    }

    const { score, missing } = calculateCompleteness({ ...data, id: newId });

    const newRecord: EmployeeRecord = {
      id: newId,
      fullName: data.fullName || 'Unnamed Employee',
      somaliName: data.somaliName || '',
      arabicName: data.arabicName || '',
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      jobTitle: data.jobTitle || 'Teacher',
      customJobTitle: data.customJobTitle,
      roleCategory: data.roleCategory || 'Teaching',
      divisionId: divisionObj.id,
      divisionName: divisionObj.name,
      campusLocation: divisionObj.city,
      schoolLevel: divisionObj.level,
      genderDivision: divisionObj.gender,
      email: data.email || `${newId.toLowerCase()}@directaid.org.so`,
      phoneNumber: data.phoneNumber || '+252 63 4000000',
      residentialArea: data.residentialArea || 'Hargeisa',
      nationalIdNumber: data.nationalIdNumber || `SOM-${cityCode}-${Math.floor(100000 + Math.random() * 900000)}`,
      dateOfBirth: data.dateOfBirth || '1990-01-01',
      gender: data.gender || 'Male',
      maritalStatus: data.maritalStatus || 'Single',
      bloodGroup: data.bloodGroup || 'O+',
      emergencyContact: data.emergencyContact || {
        name: 'Family Contact',
        relationship: 'Relative',
        phone: '+252 63 4111111'
      },
      paymentMethod: data.paymentMethod || 'ZAAD (Telesom)',
      paymentAccountNo: data.paymentAccountNo || data.phoneNumber || '+252 63 4000000',
      policeClearanceStatus: data.policeClearanceStatus || 'Verified',
      policeClearanceRef: data.policeClearanceRef || `CID-SL-${Math.floor(10000 + Math.random() * 90000)}`,
      hireDate: data.hireDate || new Date().toISOString().split('T')[0],
      employmentType: data.employmentType || 'Fixed-Term Contract',
      employmentStatus: data.employmentStatus || 'Active',
      directSupervisor: data.directSupervisor || divisionObj.principalName,
      shiftSchedule: data.shiftSchedule || 'Standard Day Shift (07:15 - 14:00)',
      teachingSubjects: data.teachingSubjects || [],
      qualifications: data.qualifications || {
        degreeLevel: 'Bachelor',
        highestDegree: 'Bachelor of Education',
        institution: 'University of Hargeisa',
        fieldOfStudy: 'General Education',
        graduationYear: 2020
      },
      contract: data.contract || {
        referenceNo: `CTR-${cityCode}-2024-${Math.floor(100 + Math.random() * 900)}`,
        contractType: 'Fixed-Term Contract',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        renewalStatus: 'Not Due',
        salaryGrade: 'Grade Standard',
        monthlyBaseSalary: 550,
        currency: 'USD',
        benefits: ['Medical Insurance'],
        noticePeriodDays: 30
      },
      documents: data.documents || [
        {
          id: `doc-${Date.now()}`,
          name: 'Employment Offer Letter',
          type: 'appointment_letter',
          fileName: 'DirectAid_Appointment_Signed.pdf',
          fileSize: '1.2 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          verified: true
        }
      ],
      profileCompleteness: score,
      missingRequirements: missing,
      notes: data.notes || 'Newly registered employee in portal.'
    };

    setEmployees(prev => [newRecord, ...prev]);

    // Add alert notification
    const newNotif: HRAlertNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Staff Profile Created',
      message: `${newRecord.fullName} was enrolled into ${newRecord.divisionName}.`,
      category: 'onboarding',
      severity: 'low',
      employeeId: newRecord.id,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: 'directory'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newRecord;
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeRecord>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const merged = { ...emp, ...updates };
        const { score, missing } = calculateCompleteness(merged);
        const updated = { ...merged, profileCompleteness: score, missingRequirements: missing };
        if (selectedEmployee?.id === id) {
          setSelectedEmployee(updated);
        }
        return updated;
      }
      return emp;
    }));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(employees.find(e => e.id !== id) || null);
    }
  };

  const renewContract = (employeeId: string, contractUpdates: Partial<EmployeeContract>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updatedContract: EmployeeContract = {
          ...emp.contract,
          ...contractUpdates,
          renewalStatus: 'Renewed'
        };

        const renewedDoc: DocumentAttachment = {
          id: `doc-renew-${Date.now()}`,
          name: `Renewed Employment Contract (${contractUpdates.startDate || '2025'} - ${contractUpdates.endDate || '2027'})`,
          type: 'contract',
          fileName: `CTR_RENEWED_${emp.id}_${Date.now()}.pdf`,
          fileSize: '2.4 MB',
          uploadedAt: new Date().toISOString().split('T')[0],
          verified: true
        };

        const updatedDocs = [renewedDoc, ...emp.documents];
        const updatedEmp = {
          ...emp,
          contract: updatedContract,
          documents: updatedDocs
        };

        const { score, missing } = calculateCompleteness(updatedEmp);
        const finalEmp = { ...updatedEmp, profileCompleteness: score, missingRequirements: missing };

        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(finalEmp);
        }
        return finalEmp;
      }
      return emp;
    }));

    // Add alert notification
    const emp = employees.find(e => e.id === employeeId);
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: 'Contract Renewal Completed',
      message: `Employment contract successfully renewed for ${emp?.fullName || employeeId}.`,
      category: 'contract',
      severity: 'low',
      employeeId,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: 'contracts'
    }, ...prev]);
  };

  const addDocument = (employeeId: string, docData: Omit<DocumentAttachment, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentAttachment = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updatedDocs = [newDoc, ...emp.documents];
        const updated = { ...emp, documents: updatedDocs };
        const { score, missing } = calculateCompleteness(updated);
        const finalEmp = { ...updated, profileCompleteness: score, missingRequirements: missing };
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(finalEmp);
        }
        return finalEmp;
      }
      return emp;
    }));
  };

  const deleteDocument = (employeeId: string, docId: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updatedDocs = emp.documents.filter(d => d.id !== docId);
        const updated = { ...emp, documents: updatedDocs };
        const { score, missing } = calculateCompleteness(updated);
        const finalEmp = { ...updated, profileCompleteness: score, missingRequirements: missing };
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(finalEmp);
        }
        return finalEmp;
      }
      return emp;
    }));
  };

  const navigateToProfile = (employeeId: string) => {
    const found = employees.find(e => e.id === employeeId);
    if (found) {
      setSelectedEmployee(found);
      setActivePage('profile');
    }
  };

  const navigateToDivisionStaff = (divisionId: string) => {
    setFilters(prev => ({ ...prev, divisionId }));
    setActivePage('directory');
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        divisions,
        selectedEmployee,
        setSelectedEmployee,
        activePage,
        setActivePage,
        regionalScope,
        setRegionalScope,
        currentRole,
        setCurrentRole,
        filters,
        setFilters,
        resetFilters,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        complianceItems,
        toggleComplianceStatus,
        isAddEmployeeOpen,
        setIsAddEmployeeOpen,
        isRenewContractOpen,
        setIsRenewContractOpen,
        contractRenewalTarget,
        setContractRenewalTarget,
        isUploadDocOpen,
        setIsUploadDocOpen,
        addDivision,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        renewContract,
        addDocument,
        deleteDocument,
        navigateToProfile,
        navigateToDivisionStaff,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
