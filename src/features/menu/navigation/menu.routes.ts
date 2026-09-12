export const MENU_ROUTES = {
  ItemDetail: 'ItemDetail',
} as const;

export type MenuStackParamList = {
  [MENU_ROUTES.ItemDetail]: {
    itemId: string;
    /**
     * The restaurant name is PASSED AS A PARAM rather than having menu ask the
     * restaurant feature.
     *
     * The architectural reason: restaurant already imports MenuSectionList. If menu
     * imported restaurant back, the two features would depend on each other in a cycle —
     * dependency-cruiser would block it, and rightly so.
     */
    restaurantId: string;
    restaurantName: string;
  };
};
