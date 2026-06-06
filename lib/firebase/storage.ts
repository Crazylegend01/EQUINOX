import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from '@/types';

export async function uploadFile(
  file: File,
  userId: string,
  chatId: string,
  onProgress?: (progress: number) => void
): Promise<Attachment> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const fileId = uuidv4();
  const storagePath = `uploads/${userId}/${chatId}/${fileId}.${ext}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        const mimeType = file.type;
        let type: Attachment['type'] = 'file';
        if (mimeType.startsWith('image/')) type = 'image';
        else if (mimeType === 'application/pdf') type = 'pdf';
        else if (mimeType === 'text/plain') type = 'txt';
        else if (
          mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
          type = 'docx';

        resolve({
          id: fileId,
          name: file.name,
          type,
          url,
          storagePath,
          size: file.size,
          mimeType,
        });
      }
    );
  });
}

export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
