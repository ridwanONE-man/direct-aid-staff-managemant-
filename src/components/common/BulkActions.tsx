import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

// Checkbox used on cards and table rows; clicks don't open the item underneath
export const SelectBox: React.FC<{ checked: boolean; onChange: () => void; label: string; className?: string }> = ({
  checked,
  onChange,
  label,
  className = ''
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    onClick={(e) => e.stopPropagation()}
    aria-label={label}
    className={`w-4 h-4 rounded border-[#C5E8D2] accent-[#147D4A] cursor-pointer shrink-0 ${className}`}
  />
);

interface BulkActionBarProps {
  noun: { one: string; many: string };
  visibleCount: number;
  selectedCount: number;
  onToggleAll: () => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
}

// Select-all, delete-selected and delete-all controls shown above a list
export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  noun,
  visibleCount,
  selectedCount,
  onToggleAll,
  onDeleteSelected,
  onDeleteAll
}) => {
  if (visibleCount === 0) return null;
  const allSelected = selectedCount === visibleCount;

  return (
    <div
      className={`rounded-2xl border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
        selectedCount > 0 ? 'bg-[#EBF7EE] border-[#C5E8D2]' : 'bg-white border-[#E2EAE4] shadow-xs'
      }`}
    >
      <label className="flex items-center gap-2.5 cursor-pointer select-none font-semibold text-[#384C3F]">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = selectedCount > 0 && !allSelected;
          }}
          onChange={onToggleAll}
          className="w-4 h-4 rounded border-[#C5E8D2] accent-[#147D4A] cursor-pointer"
        />
        {selectedCount > 0 ? (
          <span className="text-[#147D4A]">
            {selectedCount} of {visibleCount} selected
          </span>
        ) : (
          <span>
            Select all {visibleCount} {visibleCount === 1 ? noun.one : noun.many}
          </span>
        )}
      </label>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onDeleteSelected}
            className="px-3.5 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete selected ({selectedCount})
          </button>
        )}
        <button
          type="button"
          onClick={onDeleteAll}
          className="px-3.5 py-1.5 font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete all
        </button>
      </div>
    </div>
  );
};

interface ConfirmDeleteDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  title,
  message,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  onCancel,
  children
}) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2EAE4] shadow-2xl overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <span className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-[#192C21]">{title}</h3>
          <div className="text-sm text-[#57685D] mt-1">{message}</div>
          {children}
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={confirmDisabled}
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" /> {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
