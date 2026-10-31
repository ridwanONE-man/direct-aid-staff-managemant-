import { supabase } from './supabase';

export const STAFF_DOCUMENTS_BUCKET = 'staff-documents';
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Returns an error message, or null when the file can be uploaded
export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than ${formatFileSize(MAX_FILE_BYTES)}.`;
  return null;
};

export const uploadStaffFile = async (file: File): Promise<{ path: string }> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const invalid = validateFile(file);
  if (invalid) throw new Error(invalid);

  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(-80);
  const path = `staff/${crypto.randomUUID()}/${safeName}`;
  const { error } = await supabase.storage
    .from(STAFF_DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) {
    throw new Error(
      error.message.toLowerCase().includes('bucket')
        ? 'File storage is not set up yet. Run supabase/schema.sql in the Supabase SQL Editor.'
        : `Upload failed for ${file.name}: ${error.message}`
    );
  }
  return { path };
};

// Short-lived link for viewing or downloading a private file
export const getStaffFileUrl = async (path: string, download?: string): Promise<string> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.storage
    .from(STAFF_DOCUMENTS_BUCKET)
    .createSignedUrl(path, 60 * 10, download ? { download } : undefined);
  if (error || !data) throw new Error(error?.message || 'Could not open file.');
  return data.signedUrl;
};

export const removeStaffFiles = async (paths: string[]) => {
  if (!supabase || paths.length === 0) return;
  const { error } = await supabase.storage.from(STAFF_DOCUMENTS_BUCKET).remove(paths);
  if (error) console.error('Failed to remove files:', error);
};
