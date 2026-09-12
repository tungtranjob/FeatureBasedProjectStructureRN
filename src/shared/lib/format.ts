import type {Money} from '../types/money';

/** 45000 -> "45.000đ" */
export const formatCurrency = (amount: Money | number): string =>
  `${Math.round(amount).toLocaleString('vi-VN')}đ`;

/** Dùng cho phần chênh lệch của topping: +5.000đ / Miễn phí */
export const formatPriceDelta = (delta: number): string =>
  delta === 0 ? 'Miễn phí' : `+${formatCurrency(delta)}`;

/** 1.4 -> "1,4 km" | 0.35 -> "350 m" */
export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;

/** 25 -> "25 phút" | 75 -> "1 giờ 15 phút" */
export const formatEta = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} giờ` : `${hours} giờ ${rest} phút`;
};

/** ISO string -> "14:30 · 12/09" */
export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} · ${pad(
    date.getDate(),
  )}/${pad(date.getMonth() + 1)}`;
};

/** 4.75 -> "4.8" */
export const formatRating = (rating: number): string => rating.toFixed(1);
