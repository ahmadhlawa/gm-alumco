import { ApiError } from './client';
import { clearAccessToken, getAccessToken } from './token';

export type UploadFolder = 'projects' | 'services' | 'partners' | 'gallery' | 'videos' | 'production-projects' | 'about';

export interface ImageUploadResult {
  url: string;
  filename: string;
  content_type: string;
  size: number;
}

export type UploadProgressHandler = (percentage: number | null) => void;

// Shared XHR uploader: streams a multipart POST and reports upload progress.
// Both image and video uploads go through here so progress/auth/error handling
// stay identical.
function postUpload(
  path: string,
  form: FormData,
  onProgress?: UploadProgressHandler,
): Promise<ImageUploadResult> {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!baseUrl) return Promise.reject(new ApiError(0, 'VITE_API_URL is not configured'));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}${path}`);
    xhr.setRequestHeader('Accept', 'application/json');

    const token = getAccessToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      onProgress?.(
        event.lengthComputable && event.total > 0
          ? Math.round((event.loaded / event.total) * 100)
          : null,
      );
    };

    xhr.onload = () => {
      let payload: Partial<ImageUploadResult> & { detail?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText) as typeof payload;
      } catch {
        // The status-based fallback below handles invalid response bodies.
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as ImageUploadResult);
        return;
      }
      if (xhr.status === 401) {
        clearAccessToken();
        globalThis.dispatchEvent?.(new Event('gm-auth-expired'));
      }
      reject(new ApiError(xhr.status, payload.detail ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new ApiError(0, 'Could not connect to the upload server'));

    xhr.send(form);
  });
}

export function uploadAdminImage(
  file: File,
  folder: UploadFolder,
  onProgress?: UploadProgressHandler,
): Promise<ImageUploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  return postUpload('/admin/uploads/image', form, onProgress);
}

export function uploadAdminVideo(
  file: File,
  onProgress?: UploadProgressHandler,
): Promise<ImageUploadResult> {
  const form = new FormData();
  form.append('file', file);
  return postUpload('/admin/uploads/video', form, onProgress);
}
