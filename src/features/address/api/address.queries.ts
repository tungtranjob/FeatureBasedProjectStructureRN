import {useQuery} from '@tanstack/react-query';
import {addressApi} from './address.api';

export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: addressApi.list,
    staleTime: 10 * 60_000, // the address book rarely changes
  });
}
