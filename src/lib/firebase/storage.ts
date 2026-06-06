import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment } from '@/types';

export async function uploadFile(
  file: File,
  userId: string,
  chatId: string,
  onProgress?: (pct: number) => void
): Promise<Attachment> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const fileId = uuidv4();
  const storagePath = `uploads/${userId}/${chatId}/${fileId}.${ext}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    task.on('state_changed',
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        let type: Attachment['type'] = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type === 'application/pdf') type = 'pdf';
        else if (file.type === 'text/plain') type = 'txt';
        else if (file.type.includes('wordprocessingml')) type = 'docx';
        resolve({ id: fileId, name: file.name, type, url, storagePath, size: file.size, mimeType: file.type });
      }
    );
  });
}

export async function deleteFile(storagePath: string) {
  await deleteObject(ref(storage, storagePath));
}
