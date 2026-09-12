export const promotionKeys = {
  all: ['promotions'] as const,
  vouchers: (restaurantId: string | null) =>
    [...promotionKeys.all, 'vouchers', restaurantId ?? 'any'] as const,
};
