import { sniffImageType } from '../src/services/upload.service.js';

const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

describe('sniffImageType', () => {
  test('recognises JPEG, PNG and WebP by their bytes', () => {
    expect(sniffImageType(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(8)]);
    expect(sniffImageType(webp)).toBe('image/webp');
  });

  test('rejects files that only claim to be images', () => {
    expect(sniffImageType(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
    expect(sniffImageType(pad([0x4d, 0x5a, 0x90, 0x00]))).toBeNull(); // Windows executable
    expect(sniffImageType(pad([0x25, 0x50, 0x44, 0x46]))).toBeNull(); // PDF
    expect(sniffImageType(Buffer.alloc(0))).toBeNull();
    expect(sniffImageType(null)).toBeNull();
  });
});
