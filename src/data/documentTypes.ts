import { DocumentType } from '../types';

// Documents every staff member should have on file, in display order
export const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; hint: string; accept: string }[] = [
  { type: 'cv', label: 'Curriculum Vitae (CV)', hint: 'PDF or Word document', accept: '.pdf,.doc,.docx,image/*' },
  { type: 'contract', label: 'Signed Contract', hint: 'Scanned signed agreement', accept: '.pdf,image/*' },
  { type: 'police_clearance', label: 'Somaliland CID Clearance', hint: 'Police clearance certificate', accept: '.pdf,image/*' },
  { type: 'national_id', label: 'Somaliland National ID', hint: 'Front and back scan', accept: '.pdf,image/*' },
  { type: 'academic_degree', label: 'University Certificate', hint: 'Degree or diploma', accept: '.pdf,image/*' },
  { type: 'photo', label: 'Personal Photo', hint: 'Passport-style photo', accept: 'image/*' }
];

export const OTHER_DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,image/*';

export const documentLabel = (type: DocumentType) =>
  REQUIRED_DOCUMENTS.find(d => d.type === type)?.label ?? 'Other Document';
