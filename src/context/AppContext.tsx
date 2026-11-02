import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
import { withLiveContractStatus } from '../lib/contracts';
import { REQUIRED_DOCUMENTS } from '../data/documentTypes';
import { isUserRole, UserRole } from '../lib/roles';
import { syncOwnRole } from '../lib/adminApi';
import { leaderRoleFor } from '../lib/divisions';
import { divisionColor } from '../data/divisionColors';
import { claimSession, fetchActiveSessionId, sessionIdOf, SIGNED_IN_ELSEWHERE } from '../lib/singleSession';

export type AppPage = 'dashboard' | 'directory' | 'divisions' | 'profile' | 'contracts' | 'reports' | 'register' | 'settings' | 'notifications';

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
  // Staff and divisions limited to the selected regional scope
  scopedEmployees: EmployeeRecord[];
  scopedDivisions: SchoolDivisionCategory[];
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
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
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
  clearDivisionPrincipal: (id: string) => void;
  updateDivision: (id: string, updates: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>) => void;
  reorderDivisions: (orderedIds: string[]) => void;
  addEmployee: (empData: Partial<EmployeeRecord>) => EmployeeRecord;
  updateEmployee: (id: string, updates: Partial<EmployeeRecord>) => void;
  deleteEmployee: (id: string) => void;
  deleteEmployees: (ids: string[]) => void;
  deleteDivisions: (ids: string[]) => { deleted: number; blocked: string[] };
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
  userRole: UserRole | null;
  canEdit: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  confirmPassword: (password: string) => Promise<boolean>;
  logoutReason: string | null;
  isDataLoading: boolean;
  syncError: string | null;
  saveStatus: 'idle' | 'saving' | 'saved';
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const pendingSaves = useRef(0);
  const saveFailed = useRef(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Role comes from app_metadata (set only by the server); accounts without one are read-only
  const metaRole = session?.user.app_metadata?.role;
  const userRole: UserRole | null = isUserRole(metaRole) ? metaRole : null;
  const canEdit = userRole === 'admin' || userRole === 'hr';
  const isAdmin = userRole === 'admin';

  // ---- One device per account ----
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const isClaimingSession = useRef(false);
  const mySessionId = sessionIdOf(session);

  // Sign in and make this device the active one; checks are paused until the claim is recorded
  const signInAndClaim = async (email: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.';
    isClaimingSession.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return error.message;
      if (data.session) await claimSession(data.session);
      return null;
    } finally {
      isClaimingSession.current = false;
    }
  };

  // Log out here if the account's active session belongs to another device
  useEffect(() => {
    if (!supabase || !userId || !mySessionId) return;
    let stopped = false;

    const check = async () => {
      if (stopped || isClaimingSession.current) return;
      const activeId = await fetchActiveSessionId(userId);
      if (stopped || isClaimingSession.current || !activeId || activeId === mySessionId) return;
      stopped = true;
      setLogoutReason(SIGNED_IN_ELSEWHERE);
      await supabase?.auth.signOut({ scope: 'local' });
    };

    check();
    const timer = setInterval(check, 15000);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    // Instant notice when another device signs in (needs active_sessions in the realtime publication)
    const channel = supabase
      .channel(`active-session-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions', filter: `user_id=eq.${userId}` }, check)
      .subscribe();

    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      supabase?.removeChannel(channel);
    };
  }, [userId, mySessionId]);

  // Accounts listed in ADMIN_EMAILS get the admin role on first sign-in; refresh so the token carries it
  useEffect(() => {
    if (!supabase || !userId || userRole) return;
    let cancelled = false;
    syncOwnRole()
      .then(({ changed }) => {
        if (changed && !cancelled) supabase?.auth.refreshSession();
      })
      .catch(() => {
        // Admin service unavailable (e.g. local dev); the account stays read-only
      });
    return () => {
      cancelled = true;
    };
  }, [userId, userRole]);

  // Every change goes through here first; read-only accounts are stopped (the database refuses them too)
  const blockReadOnly = () => {
    if (canEdit) return false;
    setSyncError('Your account is read-only. Ask an admin if you need to make changes.');
    return true;
  };

  const inScope = (city: LocationCity) =>
    regionalScope === 'all' || city.toLowerCase() === regionalScope;
  const scopedEmployees = employees.filter(e => inScope(e.campusLocation));
  const scopedDivisions = divisions.filter(d => inScope(d.city));

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
      const loadedEmployees = (empRes.data || []).map(r => withLiveContractStatus(r.data as EmployeeRecord));
      let loadedDivisions = (divRes.data || []).map(r => r.data as SchoolDivisionCategory);

      // Clear principals whose linked staff record was deleted
      if (!divRes.error && !empRes.error) {
        const orphaned = loadedDivisions.filter(
          d => d.principalEmployeeId && !loadedEmployees.some(e => e.id === d.principalEmployeeId)
        );
        if (orphaned.length > 0) {
          const cleared = orphaned.map(d => ({
            ...d,
            principalName: '',
            principalPhone: '',
            principalAvatar: '',
            principalEmployeeId: undefined
          }));
          loadedDivisions = loadedDivisions.map(d => cleared.find(c => c.id === d.id) || d);
          supabase?.from('divisions').upsert(cleared.map(d => ({ id: d.id, code: d.code, data: d }))).then(({ error }) => {
            if (error) console.error('Failed to clear deleted principals:', error);
          });
        }
      }

      setDivisions([...loadedDivisions].sort((a, b) => a.canonicalIndex - b.canonicalIndex));
      setEmployees(loadedEmployees);
      setNotifications((notifRes.data || []).map(r => r.data as HRAlertNotification));
      setComplianceItems((compRes.data || []).map(r => r.data as ComplianceAuditItem));
      setIsDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Changes apply to the screen immediately; a failed save is reported in the sync banner
  // The bottom notice shows "Saving..." while writes are in flight, then "saved" for 2 seconds
  const persist = (op: DbResult) => {
    pendingSaves.current += 1;
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaveStatus('saving');
    Promise.resolve(op)
      .then(({ error }) => {
        if (error) {
          console.error('Supabase save failed:', error);
          saveFailed.current = true;
          setSyncError(`Could not save to Supabase: ${error.message}`);
        }
      })
      .catch((err: unknown) => {
        saveFailed.current = true;
        setSyncError(`Could not save to Supabase: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        pendingSaves.current -= 1;
        if (pendingSaves.current > 0) return;
        if (saveFailed.current) {
          saveFailed.current = false;
          setSaveStatus('idle');
          return;
        }
        setSaveStatus('saved');
        savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
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
    setLogoutReason(null);
    return signInAndClaim(email, password);
  };

  // Re-checks the signed-in user's password (signing in again replaces this device's session, so it is re-claimed)
  const confirmPassword = async (password: string) => {
    if (!session?.user.email) return false;
    return (await signInAndClaim(session.user.email, password)) === null;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut({ scope: 'local' });
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

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (supabase) persist(supabase.from('notifications').delete().eq('id', id));
  };

  const deleteAllNotifications = () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;
    setNotifications([]);
    if (supabase) persist(supabase.from('notifications').delete().in('id', ids));
  };

  const toggleComplianceStatus = (id: string) => {
    if (blockReadOnly()) return;
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

  // A principal heads one school: clear them from any other division
  const releasePrincipalElsewhere = (employeeId: string | undefined, keepDivisionId: string) =>
    employeeId
      ? divisions.filter(d => d.id !== keepDivisionId && d.principalEmployeeId === employeeId).map(blankPrincipal)
      : [];

  // Drag-and-drop order: `orderedIds` is the new order of the cards on screen (it may be a filtered subset);
  // the others keep their places, then every division is renumbered 1..n
  const reorderDivisions = (orderedIds: string[]) => {
    if (blockReadOnly()) return;
    const sorted = [...divisions].sort((a, b) => a.canonicalIndex - b.canonicalIndex);
    const moving = new Set(orderedIds);
    const queue = orderedIds.map(id => sorted.find(d => d.id === id)).filter((d): d is SchoolDivisionCategory => !!d);
    const merged = sorted.map(d => (moving.has(d.id) ? queue.shift() ?? d : d));
    // Save each card's current colour first: older divisions take their colour from their number,
    // so renumbering would otherwise change it
    const renumbered = merged.map((d, i) => ({ ...d, color: divisionColor(d).key, canonicalIndex: i + 1 }));
    const changed = renumbered.filter(d => {
      const before = divisions.find(o => o.id === d.id);
      return before?.canonicalIndex !== d.canonicalIndex || before?.color !== d.color;
    });
    setDivisions(renumbered);
    if (supabase && changed.length > 0) {
      persist(supabase.from('divisions').upsert(changed.map(d => ({ id: d.id, code: d.code, data: d }))));
    }
  };

  const updateDivision = (id: string, updates: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>) => {
    if (blockReadOnly()) return;
    const div = divisions.find(d => d.id === id);
    if (!div) return;

    const updated: SchoolDivisionCategory = { ...div, ...updates };
    saveDivisions([updated, ...releasePrincipalElsewhere(updated.principalEmployeeId, id)]);

    // Staff records keep a copy of their division's details
    const affected = employees
      .filter(e => e.divisionId === id)
      .map(e => ({
        ...e,
        divisionName: updated.name,
        campusLocation: updated.city,
        schoolLevel: updated.level,
        genderDivision: updated.gender
      }));
    if (affected.length === 0) return;
    setEmployees(prev => prev.map(e => affected.find(a => a.id === e.id) || e));
    const selected = affected.find(a => a.id === selectedEmployee?.id);
    if (selected) setSelectedEmployee(selected);
    if (supabase) persist(supabase.from('employees').upsert(affected.map(employeeRow)));
  };

  const clearDivisionPrincipal = (id: string) => {
    if (blockReadOnly()) return;
    const div = divisions.find(d => d.id === id);
    if (div) saveDivisions([blankPrincipal(div)]);
  };

  // Divisions that still have staff are skipped and reported back
  const deleteDivisions = (ids: string[]): { deleted: number; blocked: string[] } => {
    if (blockReadOnly()) return { deleted: 0, blocked: [] };
    const targets = divisions.filter(d => ids.includes(d.id));
    const blocked = targets.filter(d => employees.some(e => e.divisionId === d.id));
    const deletable = targets.filter(d => !blocked.includes(d)).map(d => d.id);
    if (deletable.length > 0) {
      setDivisions(prev => prev.filter(d => !deletable.includes(d.id)));
      if (deletable.includes(filters.divisionId)) setFilters(prev => ({ ...prev, divisionId: '' }));
      if (supabase) persist(supabase.from('divisions').delete().in('id', deletable));
    }
    return { deleted: deletable.length, blocked: blocked.map(d => d.name) };
  };

  // Returns an error message when the division still has staff assigned
  const deleteDivision = (id: string): string | null => {
    if (blockReadOnly()) return 'Your account is read-only.';
    const div = divisions.find(d => d.id === id);
    if (!div) return null;
    const staffCount = employees.filter(e => e.divisionId === id).length;
    if (staffCount > 0) {
      return `${div.name} still has ${staffCount} staff ${staffCount === 1 ? 'member' : 'members'}. Delete or move them first.`;
    }
    deleteDivisions([id]);
    return null;
  };

  const addDivision = (data: Omit<SchoolDivisionCategory, 'id' | 'canonicalIndex'>): SchoolDivisionCategory => {
    if (blockReadOnly()) throw new Error('Your account is read-only.');
    const newDivision: SchoolDivisionCategory = {
      ...data,
      id: `div-${Date.now()}`,
      canonicalIndex: divisions.reduce((max, d) => Math.max(max, d.canonicalIndex), 0) + 1
    };

    setDivisions(prev => [...prev, newDivision]);
    if (supabase) {
      persist(supabase.from('divisions').insert({ id: newDivision.id, code: newDivision.code, data: newDivision }));
    }
    saveDivisions(releasePrincipalElsewhere(newDivision.principalEmployeeId, newDivision.id));

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
    if (blockReadOnly()) throw new Error('Your account is read-only.');
    const cityCode = data.campusLocation === 'Gabiley' ? 'GBL' : 'HRG';
    const randomSuffix = Math.floor(2000 + Math.random() * 8000);
    const newId = `DA-${cityCode}-${randomSuffix}`;

    const divisionObj = divisions.find(d => d.id === data.divisionId) || divisions[0];
    if (!divisionObj) {
      throw new Error('Create a school division before registering employees.');
    }

    const { score, missing } = calculateCompleteness({ ...data, id: newId });

    const draftRecord: EmployeeRecord = {
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

    const newRecord = withLiveContractStatus(draftRecord);
    setEmployees(prev => [newRecord, ...prev]);
    if (supabase) persist(supabase.from('employees').insert(employeeRow(newRecord)));

    // A newly registered principal (school) or general director (headquarters) becomes the head shown on their division
    if (newRecord.jobTitle === leaderRoleFor(divisionObj.level)) {
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
    if (blockReadOnly()) return;
    const { score, missing } = calculateCompleteness(emp);
    const finalEmp = withLiveContractStatus({ ...emp, profileCompleteness: score, missingRequirements: missing });
    setEmployees(prev => prev.map(e => e.id === finalEmp.id ? finalEmp : e));
    if (selectedEmployee?.id === finalEmp.id) {
      setSelectedEmployee(finalEmp);
    }
    if (supabase) persist(supabase.from('employees').update(employeeRow(finalEmp)).eq('id', finalEmp.id));

    // Keep the division's head details in step with the linked staff record,
    // and release the division if this person no longer holds its head role
    saveDivisions(
      divisions
        .filter(d => d.principalEmployeeId === finalEmp.id)
        .map(d =>
          finalEmp.jobTitle === leaderRoleFor(d.level)
            ? {
                ...d,
                principalName: finalEmp.fullName,
                principalPhone: finalEmp.phoneNumber,
                principalAvatar: finalEmp.avatarUrl
              }
            : blankPrincipal(d)
        )
    );
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeRecord>) => {
    const emp = employees.find(e => e.id === id);
    if (emp) commitEmployee({ ...emp, ...updates });
  };

  const deleteEmployees = (ids: string[]) => {
    if (blockReadOnly()) return;
    const removed = employees.filter(e => ids.includes(e.id));
    if (removed.length === 0) return;
    removeStaffFiles(removed.flatMap(e => e.documents.map(d => d.storagePath)).filter((p): p is string => !!p));
    setEmployees(prev => prev.filter(e => !ids.includes(e.id)));
    if (selectedEmployee && ids.includes(selectedEmployee.id)) {
      setSelectedEmployee(null);
    }
    if (supabase) persist(supabase.from('employees').delete().in('id', ids));

    // Clear the principal on any division these people headed
    saveDivisions(
      divisions
        .filter(d =>
          removed.some(emp =>
            d.principalEmployeeId === emp.id ||
            (d.id === emp.divisionId && !!d.principalName && d.principalName.trim().toLowerCase() === emp.fullName.trim().toLowerCase())
          )
        )
        .map(blankPrincipal)
    );
  };

  const deleteEmployee = (id: string) => deleteEmployees([id]);

  const renewContract = (employeeId: string, contractUpdates: Partial<EmployeeContract>) => {
    if (blockReadOnly()) return;
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
    if (blockReadOnly()) return;
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
    if (blockReadOnly()) return;
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
        scopedEmployees,
        scopedDivisions,
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
        deleteNotification,
        deleteAllNotifications,
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
        clearDivisionPrincipal,
        reorderDivisions,
        updateDivision,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        deleteEmployees,
        deleteDivisions,
        renewContract,
        addDocument,
        deleteDocument,
        navigateToProfile,
        navigateToDivisionStaff,
        isAuthenticated: !!session,
        isAuthReady,
        userEmail: session?.user.email ?? null,
        userRole,
        canEdit,
        isAdmin,
        login,
        logout,
        confirmPassword,
        logoutReason,
        isDataLoading,
        syncError,
        saveStatus,
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
