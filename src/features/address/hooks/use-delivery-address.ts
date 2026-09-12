import {useMemo} from 'react';
import {useAddresses} from '../api/address.queries';
import {useSelectedAddressStore} from '../store/selected-address.store';
import type {DeliveryAddress} from '../model/types';

/**
 * ⭐ GHÉP CLIENT STATE VỚI SERVER STATE — mẫu hình dùng đi dùng lại.
 *
 * Zustand giữ "id đang chọn"; TanStack Query giữ danh sách địa chỉ thật.
 * Hook này ghép hai thứ lại và xử lý mọi trường hợp biên:
 *   - Chưa chọn gì -> lấy địa chỉ mặc định.
 *   - Id đã chọn không còn tồn tại (user xoá trên web) -> quay về mặc định
 *     thay vì trả về undefined làm hỏng màn checkout.
 */
export function useDeliveryAddress() {
  const {data: addresses, isPending, error, refetch} = useAddresses();
  const selectedId = useSelectedAddressStore(state => state.selectedAddressId);
  const select = useSelectedAddressStore(state => state.select);

  const address = useMemo<DeliveryAddress | null>(() => {
    if (!addresses || addresses.length === 0) {
      return null;
    }
    const chosen = selectedId
      ? addresses.find(item => item.id === selectedId)
      : undefined;
    // Fallback: địa chỉ mặc định, rồi mới tới địa chỉ đầu tiên.
    return chosen ?? addresses.find(item => item.isDefault) ?? addresses[0] ?? null;
  }, [addresses, selectedId]);

  return {address, addresses: addresses ?? [], isPending, error, refetch, select};
}
