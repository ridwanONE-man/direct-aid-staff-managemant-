import React, { useRef, useState } from 'react';
import { Loader2, Paperclip, Plus } from 'lucide-react';
import { OTHER_DOCUMENT_ACCEPT } from '../../data/documentTypes';

interface AddOtherDocumentProps {
  busy?: boolean;
  onAdd: (name: string, file: File) => boolean | Promise<boolean>;
}

// Name a document of any kind, attach its file, and add it to the list
export const AddOtherDocument: React.FC<AddOtherDocumentProps> = ({ busy, onAdd }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hint, setHint] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) {
      setHint('Give the document a name.');
      return;
    }
    if (!file) {
      setHint('Choose a file to attach.');
      return;
    }
    setHint('');
    if (await onAdd(name.trim(), file)) {
      setName('');
      setFile(null);
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-[#C5E8D2] bg-linear-to-br from-[#F6FBF7] to-white">
      <span className="text-xs font-bold text-[#147D4A] flex items-center gap-1.5 mb-2.5">
        <Plus className="w-3.5 h-3.5" /> Add another document
      </span>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Document name, e.g. Medical Certificate"
          className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-[#E2EAE4] rounded-xl text-sm text-[#192C21] placeholder:text-slate-400 focus:outline-none focus:border-[#147D4A] focus:ring-2 focus:ring-[#147D4A]/15 transition-all"
        />
        <input
          ref={inputRef}
          type="file"
          accept={OTHER_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3.5 py-2.5 text-xs font-semibold text-[#384C3F] bg-white border border-[#E2EAE4] hover:bg-[#F3F7F4] rounded-xl flex items-center justify-center gap-1.5 sm:max-w-[200px] transition-colors"
        >
          <Paperclip className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{file ? file.name : 'Choose file'}</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleAdd}
          className="px-4 py-2.5 text-xs font-bold text-white bg-[#147D4A] hover:bg-[#0E6139] rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add
        </button>
      </div>
      {hint && <p className="mt-2 text-[11px] font-semibold text-rose-600">{hint}</p>}
    </div>
  );
};
