import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

class FakeXMLHttpRequest {
  static latest: FakeXMLHttpRequest;

  method = '';
  url = '';
  status = 0;
  responseText = '';
  body: Document | XMLHttpRequestBodyInit | null = null;
  headers: Record<string, string> = {};
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    FakeXMLHttpRequest.latest = this;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  send(body: Document | XMLHttpRequestBodyInit | null) {
    this.body = body;
  }

  respond(status: number, payload: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(payload);
    this.onload?.();
  }
}

beforeEach(() => {
  storage.clear();
  vi.stubEnv('VITE_API_URL', 'http://api.test/api/v1');
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);
});

describe('uploadAdminImage', () => {
  it('uploads authenticated multipart data and reports percentage progress', async () => {
    const { setAccessToken } = await import('./token');
    const { uploadAdminImage } = await import('./uploads');
    setAccessToken('jwt-token');
    const progress: Array<number | null> = [];
    const file = new File(['image'], 'photo.png', { type: 'image/png' });

    const request = uploadAdminImage(file, 'projects', (value) => progress.push(value));
    const xhr = FakeXMLHttpRequest.latest;
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 } as ProgressEvent);
    xhr.respond(201, {
      url: '/uploads/projects/id.png',
      filename: 'id.png',
      content_type: 'image/png',
      size: 5,
    });

    await expect(request).resolves.toEqual(expect.objectContaining({ filename: 'id.png' }));
    expect(xhr.method).toBe('POST');
    expect(xhr.url).toBe('http://api.test/api/v1/admin/uploads/image');
    expect(xhr.headers.Authorization).toBe('Bearer jwt-token');
    expect((xhr.body as FormData).get('folder')).toBe('projects');
    expect((xhr.body as FormData).get('file')).toBe(file);
    expect(progress).toEqual([50]);
  });

  it('reports indeterminate progress when total size is not computable', async () => {
    const { uploadAdminImage } = await import('./uploads');
    const progress: Array<number | null> = [];
    const request = uploadAdminImage(
      new File(['image'], 'photo.png', { type: 'image/png' }),
      'gallery',
      (value) => progress.push(value),
    );
    const xhr = FakeXMLHttpRequest.latest;
    xhr.upload.onprogress?.({ lengthComputable: false } as ProgressEvent);
    xhr.respond(201, {
      url: '/uploads/gallery/id.png',
      filename: 'id.png',
      content_type: 'image/png',
      size: 5,
    });

    await request;
    expect(progress).toEqual([null]);
  });

  it('allows production project image uploads through the shared uploader', async () => {
    const { uploadAdminImage } = await import('./uploads');
    const request = uploadAdminImage(
      new File(['image'], 'production.webp', { type: 'image/webp' }),
      'production-projects',
    );
    const xhr = FakeXMLHttpRequest.latest;
    xhr.respond(201, {
      url: '/uploads/production-projects/id.webp',
      filename: 'id.webp',
      content_type: 'image/webp',
      size: 5,
    });

    await expect(request).resolves.toEqual(expect.objectContaining({ filename: 'id.webp' }));
    expect((xhr.body as FormData).get('folder')).toBe('production-projects');
  });

  it('rejects with the backend error message', async () => {
    const { uploadAdminImage } = await import('./uploads');
    const request = uploadAdminImage(
      new File(['bad'], 'photo.gif', { type: 'image/gif' }),
      'partners',
    );
    FakeXMLHttpRequest.latest.respond(400, { detail: 'Only supported images are allowed' });

    await expect(request).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        message: 'Only supported images are allowed',
      }),
    );
  });
});
