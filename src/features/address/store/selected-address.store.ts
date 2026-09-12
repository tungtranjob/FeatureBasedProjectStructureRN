import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';

/**
 * The currently selected delivery address.
 *
 * It stores only the ID, NOT the whole address object. This is an important rule when
 * mixing client state with server state:
 *
 *   Client state holds "which one the user PICKED" (the id).
 *   Server state holds "what that one contains" (TanStack Query).
 *
 * If we stored the whole object, a user who edits the address on the web and comes back
 * would see the old address forever — because nothing refreshes the copy in the store.
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
