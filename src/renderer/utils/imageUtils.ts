export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '不支持的图片格式' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: '图片大小超过10MB' };
  }
  return { valid: true };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
