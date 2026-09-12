export const MENU_ROUTES = {
  ItemDetail: 'ItemDetail',
} as const;

export type MenuStackParamList = {
  [MENU_ROUTES.ItemDetail]: {
    itemId: string;
    /**
     * Tên nhà hàng được TRUYỀN QUA PARAM thay vì để menu tự đi hỏi feature
     * restaurant.
     *
     * Lý do kiến trúc: restaurant đã import MenuSectionList rồi. Nếu menu
     * quay lại import restaurant thì hai feature phụ thuộc vòng tròn —
     * dependency-cruiser sẽ chặn, và đúng là nên chặn.
     */
    restaurantId: string;
    restaurantName: string;
  };
};
