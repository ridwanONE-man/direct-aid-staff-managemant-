import React, { useRef } from 'react';
import { CheckCircle2, Download, Eye, FileText, Image as ImageIcon, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';

interface DocumentRowProps {
  label: string;
  hint?: string;
  required?: boolean;
  isImage?: boolean;
  fileName?: string;
  meta?: string;
  accept: string;
  busy?: boolean;
  onPick: (file: File) => void;
  onRemove?: () => void;
  onView?: () => void;
  onDownload?: () => void;
}

// One document slot: shows an Upload button when empty, or the file with its actions when filled
export const DocumentRow: React.FC<DocumentRowProps> = ({
  label,
  hint,
  required,
  isImage,
  fileName,
  meta,
  accept,
  busy,
  onPick,
  onRemove,
  onView,
  onDownload
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!fileName;
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
        hasFile ? 'bg-white border-[#C5E8D2]' : 'bg-[#F9FBFA] border-dashed border-[#D5E0D8]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            hasFile ? 'bg-[#EBF7EE] text-[#147D4A]' : 'bg-white border border-[#E2EAE4] text-slate-400'
          }`}
        >
          {busy ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Icon className="w-4.5 h-4.5" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[#192C21]">{label}</span>
            {hasFile ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Uploaded
              </span>
            ) : required ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Required</span>
            ) : null}
          </div>
          <span className="text-[11px] text-slate-500 block truncate">
            {hasFile ? `${fileName}${meta ? ` · ${meta}` : ''}` : hint}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            e.target.value = '';
          }}
        />
        {hasFile ? (
          <>
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#192C21] bg-white hover:bg-[#F3F7F4] border border-[#E2EAE4] rounded-lg flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#57685D]" /> View
              </button>
            )}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#147D4A] hover:bg-[#EBF7EE] rounded-lg flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="edit-only p-1.5 text-slate-400 hover:text-[#147D4A] rounded-lg transition-colors disabled:opacity-50"
              title="Replace file"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onRemove && (
              <button
                type="button"
                disabled={busy}
                onClick={onRemove}
                className="edit-only p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-50"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="edit-only px-3.5 py-2 text-xs font-semibold text-[#147D4A] bg-white border border-[#C5E8D2] hover:bg-[#EBF7EE] rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
        )}
      </div>
    </div>
  );
};
