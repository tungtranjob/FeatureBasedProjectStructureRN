import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';

/**
 * Địa chỉ giao hàng đang chọn.
 *
 * Chỉ lưu ID, KHÔNG lưu cả object địa chỉ. Đây là nguyên tắc quan trọng khi
 * trộn client state với server state:
 *
 *   Client state giữ "người dùng đã CHỌN cái nào" (id).
 *   Server state giữ "cái đó có nội dung gì" (TanStack Query).
 *
 * Nếu lưu cả object, người dùng sửa địa chỉ trên web xong quay lại app sẽ
 * thấy địa chỉ cũ mãi mãi — vì bản sao trong store không ai làm mới cả.
 */
interface SelectedAddressState {
  selectedAddressId: string | null;
  select: (id: string) => void;
  reset: () => void;
}

export const useSelectedAddressStore = create<SelectedAddressState>()(
  persist(
    set => ({
      selectedAddressId: null,
      select: id => set({selectedAddressId: id}),
      reset: () => set({selectedAddressId: null}),
    }),
    {
      name: 'foodgo.selected-address',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);
