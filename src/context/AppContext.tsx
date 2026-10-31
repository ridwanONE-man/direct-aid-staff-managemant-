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
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { removeStaffFiles } from '../lib/storage';
import { REQUIRED_DOCUMENTS } from '../data/documentTypes';

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
  deleteDivision: (id: string) => string | null;
  addEmployee: (empData: Partial<EmployeeRecord>) => EmployeeRecord;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  deleteEmployee: (id: string) => void;
  renewContract: (employeeId: string, contractUpdates: Partial<EmployeeContract>) => void;
  addDocument: (
    employeeId: string,
    doc: Omit<DocumentAttachment, 'id' | 'uploadedAt'>,
    options?: { replaceId?: string; avatarUrl?: string }
  ) => void;
  deleteDocument: (employeeId: string, docId: string) => void;
  navigateToProfile: (employeeId: string) => void;
  navigateToDivisionStaff: (divisionId: string) => void;

  // Authentication & sync
  isAuthenticated: boolean;
  isAuthReady: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isDataLoading: boolean;
  syncError: string | null;
  clearSyncError: () => void;
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

// Remove data saved by earlier browser-only versions of the portal
['directaid_employees', 'directaid_divisions', 'directaid_notifications', 'directaid_compliance', 'directaid_auth', 'directaid_data_version']
  .forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable (private mode); nothing to clean up
    }
  });

type DbResult = PromiseLike<{ error: { message: string } | null }>;

const employeeRow = (emp: EmployeeRecord) => ({
  id: emp.id,
  division_id: emp.divisionId,
  data: emp,
  updated_at: new Date().toISOString()
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [divisions, setDivisions] = useState<SchoolDivisionCategory[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [regionalScope, setRegionalScope] = useState<'all' | 'hargeisa' | 'gabiley'>('all');
  const [currentRole, setCurrentRole] = useState<AppUserRole>('super_admin');
  const [filters, setFilters] = useState<DirectoryFilters>(defaultFilters);
  const [notifications, setNotifications] = useState<HRAlertNotification[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceAuditItem[]>([]);

  // Modal states
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isRenewContractOpen, setIsRenewContractOpen] = useState(false);
  const [contractRenewalTarget, setContractRenewalTarget] = useState<EmployeeRecord | null>(null);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // Authentication & sync state
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(!supabase);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  // Load all records from Supabase whenever a user signs in
  useEffect(() => {
    if (!supabase || !userId) {
      setEmployees([]);
      setDivisions([]);
      setNotifications([]);
      setComplianceItems([]);
      setSelectedEmployee(null);
      return;
    }

    let cancelled = false;
    setIsDataLoading(true);
    Promise.all([
      supabase.from('divisions').select('data').order('created_at', { ascending: true }),
      supabase.from('employees').select('data').order('created_at', { ascending: false }),
      supabase.from('notifications').select('data').order('created_at', { ascending: false }),
      supabase.from('compliance_items').select('data').order('created_at', { ascending: true })
    ]).then(([divRes, empRes, notifRes, compRes]) => {
      if (cancelled) return;
      const failed = [divRes, empRes, notifRes, compRes].find(r => r.error);
      if (failed?.error) {
        setSyncError(`Could not load data from Supabase: ${failed.error.message}`);
      }
      setDivisions((divRes.data || []).map(r => r.data as SchoolDivisionCategory));
      setEmployees((empRes.data || []).map(r => r.data as EmployeeRecord));
      setNotifications((notifRes.data || []).map(r => r.data as HRAlertNotification));
      setComplianceItems((compRes.data || []).map(r => r.data as ComplianceAuditItem));
      setIsDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Changes apply to the screen immediately; a failed save is reported in the sync banner
  const persist = (op: DbResult) => {
    Promise.resolve(op).then(({ error }) => {
      if (error) {
        console.error('Supabase save failed:', error);
        setSyncError(`Could not save to Supabase: ${error.message}`);
      }
    });
  };

  const saveNotification = (notif: HRAlertNotification) => {
    setNotifications(prev => [notif, ...prev]);
    if (supabase) persist(supabase.from('notifications').insert({ id: notif.id, data: notif }));
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) {
      return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.';
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? error.message : null;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setActivePage('dashboard');
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const markNotificationRead = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;
    const updated = { ...target, read: true };
    setNotifications(prev => prev.map(n => n.id === id ? updated : n));
    if (supabase) persist(supabase.from('notifications').update({ data: updated }).eq('id', id));
  };

  const clearAllNotifications = () => {
    const unread = notifications.filter(n => !n.read).map(n => ({ ...n, read: true }));
    if (unread.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (supabase) persist(supabase.from('notifications').upsert(unread.map(n => ({ id: n.id, data: n }))));
  };

  const toggleComplianceStatus = (id: string) => {
    const item = complianceItems.find(i => i.id === id);
    if (!item) return;
    const nextStatus: ComplianceAuditItem['status'] =
      item.status === 'Open' ? 'In Progress' : item.status === 'In Progress' ? 'Resolved' : 'Open';
    const updated = { ...item, status: nextStatus };
    setComplianceItems(prev => prev.map(i => i.id === id ? updated : i));
    if (supabase) persist(supabase.from('compliance_items').update({ data: updated }).eq('id', id));
  };

  // Helper to recalculate completeness
  const calculateCompleteness = (emp: Partial<EmployeeRecord>): { score: number; missing: string[] } => {
    const missing: string[] = [];
    if (!emp.phoneNumber) missing.push('Phone Number');
    if (!emp.residentialArea) missing.push('Residential District');
    if (!emp.emergencyContact?.name) missing.push('Next of Kin');
    if (!emp.paymentAccountNo) missing.push('Payment Account');

    const docs = emp.documents || [];
    REQUIRED_DOCUMENTS.forEach(req => {
      if (!docs.some(d => d.type === req.type)) missing.push(req.label);
    });

    const totalCheckpoints = 4 + REQUIRED_DOCUMENTS.length;
    const completed = totalCheckpoints - missing.length;
    const score = Math.round((completed / totalCheckpoints) * 100);
    return { score, missing };
  };

  const saveDivisions = (updated: SchoolDivisionCategory[]) => {
    if (updated.length === 0) return;
    setDivisions(prev => prev.map(d => updated.find(u => u.id === d.id) || d));
    if (supabase) {
      persist(supabase.from('divisions').upsert(updated.map(d => ({ id: d.id, code: d.code, data: d }))));
    }
  };

  const blankPrincipal = (div: SchoolDivisionCategory): SchoolDivisionCategory => ({
    ...div,
    principalName: '',
    principalPhone: '',
    principalAvatar: '',
    principalEmployeeId: undefined
  });

  // Returns an error message when the division still has staff assigned
  const deleteDivision = (id: string): string | null => {
    const div = divisions.find(d => d.id === id);
    if (!div) return null;
    const staffCount = employees.filter(e => e.divisionId === id).length;
    if (staffCount > 0) {
      return `${div.name} still has ${staffCount} staff ${staffCount === 1 ? 'member' : 'members'}. Delete or move them first.`;
    }
    setDivisions(prev => prev.filter(d => d.id !== id));
    if (filters.divisionId === id) setFilters(prev => ({ ...prev, divisionId: '' }));
    if (supabase) persist(supabase.from('divisions').delete().eq('id', id));
    return null;
  };

  const addDivision = (data: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>): SchoolDivisionCategory => {
    const newDivision: SchoolDivisionCategory = {
      ...data,
      id: `div-${Date.now()}`,
      canonicalIndex: divisions.reduce((max, d) => Math.max(max, d.canonicalIndex), 0) + 1
    };

    setDivisions(prev => [...prev, newDivision]);
    if (supabase) {
      persist(supabase.from('divisions').insert({ id: newDivision.id, code: newDivision.code, data: newDivision }));
    }

    saveNotification({
      id: `notif-${Date.now()}`,
      title: 'School Division Created',
      message: `${newDivision.name} (${newDivision.code}) was added in ${newDivision.city}.`,
      category: 'system',
      severity: 'low',
      divisionId: newDivision.id,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: 'divisions'
    });

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
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      residentialArea: data.residentialArea || '',
      nationalIdNumber: data.nationalIdNumber || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || 'Male',
      maritalStatus: data.maritalStatus || 'Single',
      bloodGroup: data.bloodGroup,
      emergencyContact: data.emergencyContact || {
        name: 'Family Contact',
        relationship: 'Relative',
        phone: '+252 63 4111111'
      },
      paymentMethod: data.paymentMethod || 'ZAAD (Telesom)',
      paymentAccountNo: data.paymentAccountNo || data.phoneNumber || '',
      policeClearanceStatus: data.policeClearanceStatus,
      policeClearanceRef: data.policeClearanceRef,
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
      documents: data.documents || [],
      profileCompleteness: score,
      missingRequirements: missing,
      notes: data.notes || ''
    };

    setEmployees(prev => [newRecord, ...prev]);
    if (supabase) persist(supabase.from('employees').insert(employeeRow(newRecord)));

    // A newly registered principal becomes the principal shown on their division
    if (newRecord.jobTitle === 'Principal') {
      saveDivisions([{
        ...divisionObj,
        principalName: newRecord.fullName,
        principalPhone: newRecord.phoneNumber,
        principalAvatar: newRecord.avatarUrl,
        principalEmployeeId: newRecord.id
      }]);
    }

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
    saveNotification(newNotif);

    return newRecord;
  };

  // Recalculate completeness, update local state, and save one employee record
  const commitEmployee = (emp: EmployeeRecord) => {
    const { score, missing } = calculateCompleteness(emp);
    const finalEmp = { ...emp, profileCompleteness: score, missingRequirements: missing };
    setEmployees(prev => prev.map(e => e.id === finalEmp.id ? finalEmp : e));
    if (selectedEmployee?.id === finalEmp.id) {
      setSelectedEmployee(finalEmp);
    }
    if (supabase) persist(supabase.from('employees').update(employeeRow(finalEmp)).eq('id', finalEmp.id));

    // Keep the division's principal details in step with the linked staff record
    saveDivisions(
      divisions
        .filter(d => d.principalEmployeeId === finalEmp.id)
        .map(d => ({
          ...d,
          principalName: finalEmp.fullName,
          principalPhone: finalEmp.phoneNumber,
          principalAvatar: finalEmp.avatarUrl
        }))
    );
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeRecord>) => {
    const emp = employees.find(e => e.id === id);
    if (emp) commitEmployee({ ...emp, ...updates });
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    removeStaffFiles((emp?.documents || []).map(d => d.storagePath).filter((p): p is string => !!p));
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(employees.find(e => e.id !== id) || null);
    }
    if (supabase) persist(supabase.from('employees').delete().eq('id', id));

    // Clear the principal on any division this person headed
    if (emp) {
      saveDivisions(
        divisions
          .filter(d =>
            d.principalEmployeeId === id ||
            (emp.jobTitle === 'Principal' && d.id === emp.divisionId && d.principalName.trim().toLowerCase() === emp.fullName.trim().toLowerCase())
          )
          .map(blankPrincipal)
      );
    }
  };

  const renewContract = (employeeId: string, contractUpdates: Partial<EmployeeContract>) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const updatedContract: EmployeeContract = {
      ...emp.contract,
      ...contractUpdates,
      renewalStatus: 'Renewed'
    };

    // The new signed contract is uploaded from the staff profile's Documents tab
    commitEmployee({ ...emp, contract: updatedContract });

    // Add alert notification
    saveNotification({
      id: `notif-${Date.now()}`,
      title: 'Contract Renewal Completed',
      message: `Employment contract successfully renewed for ${emp.fullName}.`,
      category: 'contract',
      severity: 'low',
      employeeId,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: 'contracts'
    });
  };

  const addDocument = (
    employeeId: string,
    docData: Omit<DocumentAttachment, 'id' | 'uploadedAt'>,
    options: { replaceId?: string; avatarUrl?: string } = {}
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const newDoc: DocumentAttachment = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const replaced = options.replaceId ? emp.documents.find(d => d.id === options.replaceId) : undefined;
    commitEmployee({
      ...emp,
      avatarUrl: options.avatarUrl || emp.avatarUrl,
      documents: [newDoc, ...emp.documents.filter(d => d.id !== options.replaceId)]
    });
    if (replaced?.storagePath) removeStaffFiles([replaced.storagePath]);
  };

  const deleteDocument = (employeeId: string, docId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const doc = emp.documents.find(d => d.id === docId);
    commitEmployee({ ...emp, documents: emp.documents.filter(d => d.id !== docId) });
    if (doc?.storagePath) removeStaffFiles([doc.storagePath]);
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
        deleteDivision,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        renewContract,
        addDocument,
        deleteDocument,
        navigateToProfile,
        navigateToDivisionStaff,
        isAuthenticated: !!session,
        isAuthReady,
        userEmail: session?.user.email ?? null,
        login,
        logout,
        isDataLoading,
        syncError,
        clearSyncError: () => setSyncError(null)
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
