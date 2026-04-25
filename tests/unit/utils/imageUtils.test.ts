import { describe, it, expect } from 'vitest';
import { validateImageFile } from '../../../src/renderer/utils/imageUtils';

describe('imageUtils', () => {
  it('validateImageFile should reject non-image files', () => {
    const file = new File([], 'test.txt', { type: 'text/plain' });
    expect(validateImageFile(file).valid).toBe(false);
  });

  it('validateImageFile should accept valid image types', () => {
    const file = new File([], 'test.png', { type: 'image/png' });
    expect(validateImageFile(file).valid).toBe(true);
  });
});
