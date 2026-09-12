import React from 'react';
import {colors} from '@shared/theme';
import {Badge} from '@shared/ui';
import {ORDER_STATUS_EMOJI, ORDER_STATUS_LABEL} from '../model/order-rules';
import type {OrderStatus} from '../model/types';

/**
 * Màu theo trạng thái được khai báo thành BẢNG, không phải chuỗi if/else.
 * Thêm trạng thái mới vào union OrderStatus mà quên thêm màu -> TypeScript
 * báo lỗi ngay (vì Record đòi đủ mọi khoá).
 */
const STATUS_COLOR: Record<OrderStatus, {text: string; background: string}> = {
  PENDING_PAYMENT: {text: colors.warning, background: '#FEF3E2'},
  CONFIRMED: {text: colors.info, background: '#E8F1FE'},
  PREPARING: {text: colors.info, background: '#E8F1FE'},
  DELIVERING: {text: colors.primary, background: colors.primarySoft},
  COMPLETED: {text: colors.success, background: '#E8F8F0'},
  CANCELLED: {text: colors.danger, background: '#FDECEA'},
};

export function OrderStatusChip({status}: {status: OrderStatus}) {
  const palette = STATUS_COLOR[status];
  return (
    <Badge
      label={`${ORDER_STATUS_EMOJI[status]} ${ORDER_STATUS_LABEL[status]}`}
      color={palette.text}
      background={palette.background}
    />
  );
}
