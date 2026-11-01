import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface RoleFilterProps {
  roles: { role: string; count: number }[];
  value: string;
  onChange: (role: string) => void;
}

// Role picker for the directory: lists only roles held by registered staff, with a search box
export const RoleFilter: React.FC<RoleFilterProps> = ({ roles, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus();
    const closeOnOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const q = query.trim().toLowerCase();
  const matches = q ? roles.filter(r => r.role.toLowerCase().includes(q)) : roles;

  const pick = (role: string) => {
    onChange(role);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-[#F6FAF7] border rounded-xl text-xs text-left focus:outline-none focus:ring-1 focus:ring-[#147D4A] cursor-pointer ${
          value ? 'border-[#147D4A] text-[#147D4A] font-semibold' : 'border-[#E2EAE4] text-[#192C21]'
        }`}
      >
        <span className="truncate">{value || 'All Roles'}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full min-w-[220px] bg-white border border-[#E2EAE4] rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#E2EAE4]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && matches.length > 0) pick(matches[0].role);
                }}
                placeholder="Search roles..."
                className="w-full pl-7 pr-7 py-1.5 bg-[#F6FAF7] border border-[#E2EAE4] rounded-lg text-xs text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#147D4A]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-60 overflow-y-auto py-1 text-xs">
            {!q && (
              <li>
                <button
                  type="button"
                  onClick={() => pick('')}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#F3F9F5] text-[#192C21]"
                >
                  <span className="font-semibold">All Roles</span>
                  {!value && <Check className="w-3.5 h-3.5 text-[#147D4A]" />}
                </button>
              </li>
            )}
            {matches.map(({ role, count }) => (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => pick(role)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-[#F3F9F5] ${
                    value === role ? 'text-[#147D4A] font-semibold' : 'text-[#192C21]'
                  }`}
                >
                  <span className="truncate">{role}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-[#57685D] bg-[#EBF7EE] px-1.5 rounded-full">{count}</span>
                    {value === role && <Check className="w-3.5 h-3.5 text-[#147D4A]" />}
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="px-3 py-3 text-center text-[#57685D]">
                {roles.length === 0 ? 'No staff registered yet.' : `No role matches "${query.trim()}".`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
