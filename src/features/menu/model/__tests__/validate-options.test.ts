import {money} from '@shared/types/money';
import {asId} from '@shared/types/id';
import type {MenuItemId, RestaurantId} from '@shared/types/id';
import {
  buildDefaultSelection,
  isSelectionValid,
  toggleOption,
  validateOptionSelection,
} from '../validate-options';
import type {MenuItem} from '../types';

const item: MenuItem = {
  id: asId<MenuItemId>('itm_test'),
  restaurantId: asId<RestaurantId>('res_test'),
  categoryId: 'cat',
  name: 'Trà sữa',
  description: '',
  imageUrl: '',
  basePrice: money(45000),
  isAvailable: true,
  soldCount: 0,
  optionGroups: [
    {
      id: 'grp_size',
      name: 'Size',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      options: [
        {id: 'opt_m', name: 'Vừa', priceDelta: money(0)},
        {id: 'opt_l', name: 'Lớn', priceDelta: money(8000)},
      ],
    },
    {
      id: 'grp_topping',
      name: 'Topping',
      required: false,
      minSelect: 0,
      maxSelect: 2,
      options: [
        {id: 'opt_tc', name: 'Trân châu', priceDelta: money(8000)},
        {id: 'opt_thach', name: 'Thạch', priceDelta: money(8000)},
        {id: 'opt_pudding', name: 'Pudding', priceDelta: money(10000)},
      ],
    },
  ],
};

describe('validateOptionSelection', () => {
  it('báo lỗi khi bỏ trống nhóm bắt buộc', () => {
    const errors = validateOptionSelection(item, {});
    expect(errors).toHaveLength(1);
    expect(errors[0]?.groupId).toBe('grp_size');
  });

  it('hợp lệ khi nhóm bắt buộc đã có lựa chọn', () => {
    expect(isSelectionValid(item, {grp_size: ['opt_m']})).toBe(true);
  });

  it('báo lỗi khi vượt quá maxSelect', () => {
    const errors = validateOptionSelection(item, {
      grp_size: ['opt_m'],
      grp_topping: ['opt_tc', 'opt_thach', 'opt_pudding'],
    });
    expect(errors[0]?.groupId).toBe('grp_topping');
  });
});

describe('buildDefaultSelection', () => {
  it('tự chọn mục đầu tiên cho nhóm bắt buộc, để trống nhóm tuỳ chọn', () => {
    expect(buildDefaultSelection(item)).toEqual({
      grp_size: ['opt_m'],
      grp_topping: [],
    });
  });

  it('lựa chọn mặc định luôn hợp lệ', () => {
    expect(isSelectionValid(item, buildDefaultSelection(item))).toBe(true);
  });
});

describe('toggleOption', () => {
  const base = buildDefaultSelection(item);

  it('nhóm chọn-một: chọn cái mới thay thế cái cũ', () => {
    const next = toggleOption(item, base, 'grp_size', 'opt_l');
    expect(next.grp_size).toEqual(['opt_l']);
  });

  it('nhóm bắt buộc: không cho bỏ chọn mục cuối cùng', () => {
    const next = toggleOption(item, base, 'grp_size', 'opt_m');
    expect(next.grp_size).toEqual(['opt_m']);
  });

  it('nhóm chọn-nhiều: bật rồi tắt', () => {
    const added = toggleOption(item, base, 'grp_topping', 'opt_tc');
    expect(added.grp_topping).toEqual(['opt_tc']);

    const removed = toggleOption(item, added, 'grp_topping', 'opt_tc');
    expect(removed.grp_topping).toEqual([]);
  });

  it('bỏ qua thao tác khi đã đạt maxSelect', () => {
    const full = toggleOption(
      item,
      toggleOption(item, base, 'grp_topping', 'opt_tc'),
      'grp_topping',
      'opt_thach',
    );
    const overflow = toggleOption(item, full, 'grp_topping', 'opt_pudding');
    expect(overflow.grp_topping).toEqual(['opt_tc', 'opt_thach']);
  });

  it('không đột biến (mutate) object đầu vào', () => {
    const snapshot = JSON.stringify(base);
    toggleOption(item, base, 'grp_topping', 'opt_tc');
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});
