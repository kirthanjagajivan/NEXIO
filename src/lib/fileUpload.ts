import { supabase } from './supabase';

export interface FileAttachment {
  name: string;
  path: string;
  type: string;
  size: number;
  url?: string;
}

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/webp': 'Image',
  'image/gif': 'Image',
  'application/msword': 'Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document',
  'text/plain': 'Text',
};

export function isAcceptedType(file: File): boolean {
  return file.type in ACCEPTED_TYPES;
}

export function getFileTypeLabel(mimeType: string): string {
  return ACCEPTED_TYPES[mimeType] ?? 'File';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): 'pdf' | 'image' | 'doc' | 'txt' {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'text/plain') return 'txt';
  return 'doc';
}

export async function uploadTaskAttachment(
  file: File,
  taskId: string
): Promise<FileAttachment> {
  const ext = file.name.split('.').pop();
  const path = `tasks/${taskId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('task-attachments')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { name: file.name, path, type: file.type, size: file.size };
}

export async function uploadSubmissionFile(
  file: File,
  userId: string,
  taskId: string
): Promise<FileAttachment> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${taskId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('task-submissions')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { name: file.name, path, type: file.type, size: file.size };
}

export function getTaskAttachmentUrl(path: string): string {
  const { data } = supabase.storage.from('task-attachments').getPublicUrl(path);
  return data.publicUrl;
}

export async function getSubmissionFileUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('task-submissions')
    .createSignedUrl(path, 3600);

  if (error) throw new Error(`Failed to get file URL: ${error.message}`);
  return data.signedUrl;
}

export async function deleteTaskAttachment(path: string): Promise<void> {
  const { error } = await supabase.storage.from('task-attachments').remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
