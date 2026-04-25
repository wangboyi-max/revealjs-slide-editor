import { describe, it, expect } from 'vitest';
import { validateImageFile, fileToBase64 } from '../../../src/renderer/utils/imageUtils';

describe('imageUtils', () => {
  describe('validateImageFile', () => {
    it('validateImageFile should reject non-image files', () => {
      const file = new File([], 'test.txt', { type: 'text/plain' });
      expect(validateImageFile(file).valid).toBe(false);
      expect(validateImageFile(file).error).toBe('不支持的图片格式');
    });

    it('validateImageFile should accept valid image types', () => {
      const file = new File([], 'test.png', { type: 'image/png' });
      expect(validateImageFile(file).valid).toBe(true);
    });

    it('validateImageFile should reject files exceeding 10MB', () => {
      const file = new File([], 'large.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('图片大小超过10MB');
    });
  });

  describe('fileToBase64', () => {
    it('fileToBase64 should resolve with base64 string on success', async () => {
      const content = 'hello world';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await fileToBase64(file);
      expect(result).toContain('data:text/plain;base64,aGVsbG8gd29ybGQ=');
    });
  });
});
