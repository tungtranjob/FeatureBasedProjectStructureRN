/**
 * Design token — nguồn sự thật DUY NHẤT về màu.
 *
 * Không bao giờ hardcode '#FF5722' trong component. Lý do không phải là
 * "cho đẹp": khi cần đổi brand color hoặc thêm dark mode, bạn chỉ sửa file
 * này thay vì grep 300 chỗ và bỏ sót 20 chỗ.
 */
export const colors = {
  primary: '#EE4D2D',
  primaryDark: '#D23F20',
  primarySoft: '#FFF1EE',

  success: '#12B76A',
  warning: '#F79009',
  danger: '#F04438',
  info: '#2E90FA',

  text: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  border: '#E5E7EB',

  overlay: 'rgba(17, 24, 39, 0.45)',
  skeleton: '#E5E7EB',
} as const;

export type ColorToken = keyof typeof colors;
