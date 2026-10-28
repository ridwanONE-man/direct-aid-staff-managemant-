import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const UploadDocumentModal: React.FC = () => {
  const { isUploadDocOpen, setIsUploadDocOpen, selectedEmployee, addDocument } = useApp();

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'cv' | 'contract' | 'academic_degree' | 'national_id' | 'police_clearance' | 'appointment_letter' | 'medical_fitness' | 'other'>('police_clearance');
  const [fileName, setFileName] = useState('');

  if (!isUploadDocOpen || !selectedEmployee) return null;

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    const finalFileName = fileName.trim() || `${docType.toUpperCase()}_${selectedEmployee.id}.pdf`;
    const finalDocName = docName.trim() || docType.replace('_', ' ').toUpperCase();

    addDocument(selectedEmployee.id, {
      name: finalDocName,
      type: docType,
      fileName: finalFileName,
      fileSize: '1.4 MB',
      verified: true
    });

    setIsUploadDocOpen(false);
    setDocName('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2EAE4] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="p-4 border-b border-[#E2EAE4] bg-[#F9FBFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF7EE] text-[#147D4A] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#192C21]">Upload to Document Vault</h3>
              <p className="text-[11px] text-[#57685D]">{selectedEmployee.fullName} ({selectedEmployee.id})</p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadDocOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Document Category *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="police_clearance">Police Clearance Certificate (Somaliland CID)</option>
              <option value="cv">Curriculum Vitae / Resume (CV)</option>
              <option value="contract">Signed Employment Agreement</option>
              <option value="academic_degree">University Degree / Diploma Certificate</option>
              <option value="national_id">National ID / Passport Scan</option>
              <option value="medical_fitness">Health &amp; Medical Fitness Form</option>
              <option value="appointment_letter">Official Letter of Appointment</option>
              <option value="other">Other Official Document</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Document Display Title</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Somaliland CID Background Check 2024"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Upload File (PDF, DOCX, JPG)</label>
            <div className="p-4 border-2 border-dashed border-[#C5E8D2] bg-[#F8FCF9] rounded-xl text-center cursor-pointer hover:border-[#147D4A] transition-colors">
              <Upload className="w-6 h-6 text-[#147D4A] mx-auto mb-1" />
              <span className="text-xs font-semibold text-[#147D4A] block">
                {fileName ? fileName : 'Click to select certified file or drop here'}
              </span>
              <span className="text-[10px] text-slate-400">PDF, scanned document up to 15MB</span>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
                className="hidden"
                id="vault-file-input"
              />
              <label
                htmlFor="vault-file-input"
                className="inline-block mt-2 px-3 py-1 bg-white border border-[#C5E8D2] text-[#147D4A] rounded-md text-[11px] font-semibold hover:bg-[#EBF7EE] cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2EAE4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadDocOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#147D4A] hover:bg-[#0E6139] text-white font-semibold rounded-lg shadow-xs"
            >
              Save to Digital Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
