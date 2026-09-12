/**
 * QUERY KEY FACTORY.
 *
 * A query key is the "address" of data in the TanStack Query cache. Typing the key
 * array by hand in each place is the shortest route to the "I invalidated but the
 * screen did not update" bug — because you invalidated ['restaurant'] while the
 * query registered itself under ['restaurants'].
 *
 * The hierarchy lets you invalidate at any level:
 *   invalidateQueries({queryKey: restaurantKeys.all})   -> everything
 *   invalidateQueries({queryKey: restaurantKeys.lists()}) -> just the lists
 */
export const restaurantKeys = {
  all: ['restaurants'] as const,

  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters: {search?: string; cuisine?: string}) =>
    [...restaurantKeys.lists(), filters] as const,

  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
};
