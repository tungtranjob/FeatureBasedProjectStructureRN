import {useMemo} from 'react';
import {useAddresses} from '../api/address.queries';
import {useSelectedAddressStore} from '../store/selected-address.store';
import type {DeliveryAddress} from '../model/types';

/**
 * ⭐ JOINING CLIENT STATE WITH SERVER STATE — a pattern used again and again.
 *
 * Zustand holds "which id is selected"; TanStack Query holds the real address list.
 * This hook joins the two and handles every edge case:
 *   - Nothing selected yet -> use the default address.
 *   - The selected id no longer exists (deleted on the web) -> fall back to the default
 *     instead of returning undefined and breaking checkout.
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
    // Fallback: the default address first, then the first one in the list.
    return chosen ?? addresses.find(item => item.isDefault) ?? addresses[0] ?? null;
  }, [addresses, selectedId]);

  return {address, addresses: addresses ?? [], isPending, error, refetch, select};
}
