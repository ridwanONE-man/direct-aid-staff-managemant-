import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, RefreshCw } from 'lucide-react';

// Small pill at the bottom of the screen confirming that changes reached the database
export const SaveNotice: React.FC = () => {
  const { saveStatus } = useApp();
  if (saveStatus === 'idle') return null;

  const saving = saveStatus === 'saving';
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none" role="status" aria-live="polite">
      <div
        key={saveStatus}
        className="save-notice-enter flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full bg-white border border-[#C5E8D2] shadow-lg text-xs font-semibold text-[#192C21]"
      >
        <span className="w-6 h-6 rounded-full bg-[#147D4A] text-white flex items-center justify-center">
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        </span>
        {saving ? 'Saving changes...' : 'Changes saved · system updated'}
      </div>
    </div>
  );
};
