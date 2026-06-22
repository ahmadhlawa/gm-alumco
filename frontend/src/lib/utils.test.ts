import { describe, expect, it } from 'vitest';
import { IMAGE_PLACEHOLDER_URL, normalizeImageUrl } from './utils';

describe('normalizeImageUrl', () => {
  it('converts a Google Drive sharing URL to a direct image URL', () => {
    expect(
      normalizeImageUrl(' https://drive.google.com/file/d/abc_123-XYZ/view?usp=sharing '),
    ).toBe('https://drive.google.com/uc?export=view&id=abc_123-XYZ');
  });

  it('returns absolute HTTP and HTTPS URLs unchanged after trimming', () => {
    expect(normalizeImageUrl(' https://example.com/image.jpg ')).toBe(
      'https://example.com/image.jpg',
    );
    expect(normalizeImageUrl('http://example.com/image.jpg')).toBe(
      'http://example.com/image.jpg',
    );
  });

  it('resolves /uploads paths to the backend origin, stripping /api/v1', () => {
    expect(normalizeImageUrl(' /uploads/image.jpg ', 'https://api.example.com/')).toBe(
      'https://api.example.com/uploads/image.jpg',
    );
    expect(
      normalizeImageUrl('/uploads/projects/image.jpg', 'https://api.example.com/api/v1'),
    ).toBe('https://api.example.com/uploads/projects/image.jpg');
    expect(
      normalizeImageUrl('/uploads/projects/a.jpg', 'http://localhost:8000/api/v1'),
    ).toBe('http://localhost:8000/uploads/projects/a.jpg');
  });

  it('leaves frontend static asset paths (/images/...) unchanged', () => {
    expect(normalizeImageUrl('/images/main.jpeg', 'http://localhost:8000/api/v1')).toBe(
      '/images/main.jpeg',
    );
  });

  it('returns the placeholder for empty values', () => {
    expect(normalizeImageUrl('  ')).toBe(IMAGE_PLACEHOLDER_URL);
    expect(normalizeImageUrl(null)).toBe(IMAGE_PLACEHOLDER_URL);
    expect(normalizeImageUrl(undefined)).toBe(IMAGE_PLACEHOLDER_URL);
  });
});
