import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ImageUploadField } from './ImageUploadField';

describe('ImageUploadField', () => {
  it('renders an image picker and the normalized current preview', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/api/v1');
    const html = renderToStaticMarkup(
      <ImageUploadField
        label="Project image"
        folder="projects"
        value="/uploads/projects/image.webp"
        onUploaded={() => undefined}
      />,
    );

    expect(html).toContain('type="file"');
    expect(html).toContain('.webp');
    expect(html).toContain('https://api.example.com/uploads/projects/image.webp');
  });
});
