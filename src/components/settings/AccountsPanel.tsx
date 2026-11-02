import React, { useEffect, useState } from 'react';
import { AdminApiError, AdminUser, createUser, deleteUser, listUsers, resetPassword, updateUser } from '../../lib/adminApi';
import { roleLabel, USER_ROLES, UserRole } from '../../lib/roles';
import { ConfirmDeleteDialog } from '../common/BulkActions';
import { PasswordInput, settingsInputClass as inputClass } from './PasswordInput';
import { Edit, KeyRound, Loader2, Lock, Mail, RefreshCw, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react';

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-[#EBF7EE] text-[#147D4A] border-[#C5E8D2]',
  hr: 'bg-sky-50 text-sky-700 border-sky-200',
  staff: 'bg-slate-100 text-slate-600 border-slate-200'
};

const RolePicker: React.FC<{ value: UserRole; onChange: (r: UserRole) => void }> = ({ value, onChange }) => (
  <div className="space-y-1.5">
    {USER_ROLES.map(r => (
      <label
        key={r.value}
        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
          value === r.value ? 'border-[#147D4A] bg-[#EBF7EE]' : 'border-[#E2EAE4] hover:border-[#C5E8D2]'
        }`}
      >
        <input
          type="radio"
          name="account-role"
          checked={value === r.value}
          onChange={() => onChange(r.value)}
          className="mt-0.5 accent-[#147D4A]"
        />
        <span>
          <span className="block text-xs font-bold text-[#192C21]">{r.label}</span>
          <span className="block text-[11px] text-[#57685D]">{r.description}</span>
        </span>
      </label>
    ))}
  </div>
);

// Admin-only: portal logins, their roles and linked staff records, via the server-side admin function
export const AccountsPanel: React.FC = () => {

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ message: string; status: number } | null>(null);
  const [notice, setNotice] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetValue, setResetValue] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortUsers = (list: AdminUser[]) => [...list].sort((a, b) => a.email.localeCompare(b.email));

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listUsers();
      setUsers(sortUsers(data.users));
      setCurrentUserId(data.currentUserId);
    } catch (err) {
      setLoadError({
        message: err instanceof Error ? err.message : 'Could not load accounts.',
        status: err instanceof AdminApiError ? err.status : 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setCreateError('');
    setIsCreating(true);
    try {
      const { user } = await createUser(newEmail, newPassword, newRole, null);
      setUsers(prev => sortUsers([...prev, user]));
      setNotice(`${roleLabel(user.role)} login created for ${user.email}. Share the password with them privately.`);
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setEditRole(u.role ?? 'staff');
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editTarget || isSavingEdit) return;
    setEditError('');
    setIsSavingEdit(true);
    try {
      const { user } = await updateUser(editTarget.id, editRole, editTarget.employeeId);
      setUsers(prev => sortUsers(prev.map(u => (u.id === user.id ? user : u))));
      setNotice(`${user.email} is now ${roleLabel(user.role)}. The change applies the next time they sign in.`);
      setEditTarget(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update the account.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleReset = async () => {
    if (!resetTarget || isResetting) return;
    setResetError('');
    setIsResetting(true);
    try {
      await resetPassword(resetTarget.id, resetValue);
      setNotice(`Password changed for ${resetTarget.email}.`);
      setResetTarget(null);
      setResetValue('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setNotice(`${deleteTarget.email} can no longer sign in.`);
    } catch (err) {
      setLoadError({ message: err instanceof Error ? err.message : 'Could not remove the account.', status: 0 });
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div className="p-3 bg-[#EBF7EE] border border-[#C5E8D2] text-[#147D4A] rounded-xl text-xs font-semibold flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-white border border-rose-200 rounded-2xl flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Lock className="w-4.5 h-4.5" />
          </span>
          <div className="text-sm">
            <p className="font-bold text-[#192C21]">{loadError.status === 403 ? 'Admins only' : 'Could not reach the admin service'}</p>
            <p className="text-xs text-[#57685D] mt-0.5">{loadError.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Create account */}
        <form onSubmit={handleCreate} className="xl:col-span-2 bg-white border border-[#E2EAE4] rounded-2xl p-5 shadow-xs space-y-3 self-start">
          <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#147D4A]" /> Create Account
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">Role</label>
            <RolePicker value={newRole} onChange={setNewRole} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@directaid.org"
                autoComplete="off"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#384C3F] mb-1.5">Password</label>
            <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" />
          </div>
          {createError && <p className="text-xs text-rose-600 font-medium">{createError}</p>}
          <button
            type="submit"
            disabled={isCreating || !newEmail.trim() || !newPassword || !!loadError}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#147D4A] hover:bg-[#0E6139] text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isCreating ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-[11px] text-[#57685D]">They can sign in straight away with this email and password.</p>
        </form>

        {/* Accounts list */}
        <div className="xl:col-span-3 bg-white border border-[#E2EAE4] rounded-2xl shadow-xs overflow-hidden self-start">
          <div className="px-5 py-3.5 border-b border-[#E2EAE4] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#192C21] flex items-center gap-2">
              Accounts
              <span className="text-[11px] bg-[#EBF7EE] text-[#147D4A] font-bold px-2 py-0.5 rounded-full font-mono">{users.length}</span>
            </h2>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#147D4A] hover:bg-[#EBF7EE] transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {isLoading && users.length === 0 ? (
            <div className="p-10 flex justify-center text-[#147D4A]"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <ul className="divide-y divide-[#EEF3EF]">
              {users.map(u => {
                const isSelf = u.id === currentUserId;
                return (
                  <li key={u.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#147D4A] font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                      {u.email.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold text-[#192C21] truncate">{u.email}</span>
                        {isSelf && <span className="text-[10px] text-[#57685D]">(you)</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {u.role ? (
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold border px-1.5 rounded-full ${roleBadgeClass[u.role]}`}>
                            {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />} {roleLabel(u.role)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold border px-1.5 rounded-full bg-amber-50 text-amber-800 border-amber-200">
                            No role · read-only
                          </span>
                        )}
                        <span className="text-[10px] text-[#798C80]">· Last sign-in {formatDate(u.lastSignInAt)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="p-2 rounded-lg text-slate-400 hover:text-[#147D4A] hover:bg-[#EBF7EE] transition-colors"
                      title="Change role"
                      aria-label={`Change role for ${u.email}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetTarget(u);
                        setResetValue('');
                        setResetError('');
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-[#147D4A] hover:bg-[#EBF7EE] transition-colors"
                      title="Change password"
                      aria-label={`Change password for ${u.email}`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(u)}
                      disabled={isSelf}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      title={isSelf ? 'You cannot remove your own account' : 'Remove account'}
                      aria-label={`Remove ${u.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
              {!isLoading && users.length === 0 && (
                <li className="px-5 py-8 text-center text-xs text-[#57685D]">No accounts yet.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Change role */}
      {editTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2EAE4] shadow-2xl overflow-hidden">
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-base text-[#192C21] flex items-center gap-2">
                <Edit className="w-4.5 h-4.5 text-[#147D4A]" /> Edit Account
              </h3>
              <p className="text-sm text-[#57685D] truncate">{editTarget.email}</p>
              <RolePicker value={editRole} onChange={setEditRole} />
              {editError && <p className="text-xs text-rose-600 font-medium">{editError}</p>}
            </div>
            <div className="px-5 py-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-end gap-2">
              <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change password */}
      {resetTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2EAE4] shadow-2xl overflow-hidden">
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-base text-[#192C21] flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-[#147D4A]" /> Change Password
              </h3>
              <p className="text-sm text-[#57685D]">Set a new password for <span className="font-semibold text-[#192C21]">{resetTarget.email}</span>.</p>
              <PasswordInput value={resetValue} onChange={setResetValue} placeholder="New password (at least 8 characters)" autoFocus />
              {resetError && <p className="text-xs text-rose-600 font-medium">{resetError}</p>}
            </div>
            <div className="px-5 py-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-end gap-2">
              <button type="button" onClick={() => setResetTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting || !resetValue}
                className="px-4 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
              >
                {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title="Remove account?"
          message={
            <>
              <span className="font-semibold text-[#192C21]">{deleteTarget.email}</span> will no longer be able to sign in. Staff records are not affected.
            </>
          }
          confirmLabel={isDeleting ? 'Removing...' : 'Remove Account'}
          confirmDisabled={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
