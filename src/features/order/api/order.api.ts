import {http} from '@core/api/http-client';
import type {
  FeeBreakdownDto,
  OrderDto,
  PlaceOrderRequestDto,
  PlaceOrderResponseDto,
  QuoteRequestDto,
} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {AddressId, OrderId} from '@shared/types/id';
import {money} from '@shared/types/money';
import type {PaymentIntent} from '@features/payment';
import type {FeeBreakdown, Order} from '../model/types';

/**
 * Mapper cho bảng kê phí — dùng lại ở cả báo giá (quote) lẫn đơn hàng.
 */
export const toFeeBreakdown = (dto: FeeBreakdownDto): FeeBreakdown => ({
  subtotal: money(dto.subtotal),
  deliveryFee: money(dto.deliveryFee),
  serviceFee: money(dto.serviceFee),
  discount: money(dto.discount),
  total: money(dto.total),
});

const toOrder = (dto: OrderDto): Order => ({
  id: asId<OrderId>(dto.id),
  code: dto.code,
  restaurant: dto.restaurant,
  items: dto.items.map(item => ({
    menuItemId: item.menuItemId,
    name: item.name,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrice: money(item.unitPrice),
    optionNames: item.optionNames,
    note: item.note,
    lineTotal: money(item.lineTotal),
  })),
  fees: toFeeBreakdown(dto.fees),
  status: dto.status,
  paymentMethod: dto.paymentMethod,
  paymentStatus: dto.paymentStatus,
  address: {
    id: asId<AddressId>(dto.address.id),
    label: dto.address.label,
    recipientName: dto.address.recipientName,
    phone: dto.address.phone,
    line: dto.address.line,
    ward: dto.address.ward,
    district: dto.address.district,
    city: dto.address.city,
    isDefault: dto.address.isDefault,
  },
  placedAt: dto.placedAt,
  etaMinutes: dto.etaMinutes,
  statusHistory: dto.statusHistory,
});

export interface PlaceOrderResult {
  order: Order;
  paymentIntent: PaymentIntent | null;
}

export const orderApi = {
  async list(): Promise<Order[]> {
    const dtos = await http.get<OrderDto[]>('/orders');
    return dtos.map(toOrder);
  },

  async detail(id: string): Promise<Order> {
    const dto = await http.get<OrderDto>(`/orders/${id}`);
    return toOrder(dto);
  },

  async cancel(id: string): Promise<Order> {
    const dto = await http.post<OrderDto>(`/orders/${id}/cancel`);
    return toOrder(dto);
  },

  /** Báo giá phí trước khi đặt — server là nguồn sự thật về tiền. */
  async quote(request: QuoteRequestDto): Promise<FeeBreakdown> {
    const dto = await http.post<FeeBreakdownDto>('/quote', request);
    return toFeeBreakdown(dto);
  },

  async place(request: PlaceOrderRequestDto): Promise<PlaceOrderResult> {
    const dto = await http.post<PlaceOrderResponseDto>('/orders', request);
    return {
      order: toOrder(dto.order),
      paymentIntent: dto.paymentIntent
        ? {
            id: asId(dto.paymentIntent.id),
            orderId: asId<OrderId>(dto.paymentIntent.orderId),
            method: dto.paymentIntent.method,
            amount: money(dto.paymentIntent.amount),
            status: dto.paymentIntent.status,
            redirectUrl: dto.paymentIntent.redirectUrl,
            expiresAt: dto.paymentIntent.expiresAt,
          }
        : null,
    };
  },
};
