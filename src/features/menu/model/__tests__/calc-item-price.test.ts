import {money} from '@shared/types/money';
import {asId} from '@shared/types/id';
import type {MenuItemId, RestaurantId} from '@shared/types/id';
import {calcLinePrice, calcUnitPrice, resolveSelectedOptions} from '../calc-item-price';
import type {MenuItem} from '../types';

/**
 * Fixtures are built by hand rather than imported from the mock db: model tests must be
 * independent of the demo data. Changing a price in db.ts must not turn this test red.
 */
const item: MenuItem = {
  id: asId<MenuItemId>('itm_test'),
  restaurantId: asId<RestaurantId>('res_test'),
  categoryId: 'cat_test',
  name: 'Phở bò',
  description: '',
  imageUrl: '',
  basePrice: money(65000),
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
        {id: 'opt_s', name: 'Nhỏ', priceDelta: money(0)},
        {id: 'opt_l', name: 'Lớn', priceDelta: money(20000)},
      ],
    },
    {
      id: 'grp_topping',
      name: 'Topping',
      required: false,
      minSelect: 0,
      maxSelect: 3,
      options: [
        {id: 'opt_trung', name: 'Trứng', priceDelta: money(10000)},
        {id: 'opt_gau', name: 'Gầu', priceDelta: money(25000)},
      ],
    },
  ],
};

describe('calcUnitPrice', () => {
  it('không chọn gì thì bằng giá gốc', () => {
    expect(calcUnitPrice(item, {})).toBe(65000);
  });

  it('cộng chênh lệch của tuỳ chọn', () => {
    expect(calcUnitPrice(item, {grp_size: ['opt_l']})).toBe(85000);
  });

  it('cộng dồn nhiều topping', () => {
    const price = calcUnitPrice(item, {
      grp_size: ['opt_l'],
      grp_topping: ['opt_trung', 'opt_gau'],
    });
    expect(price).toBe(65000 + 20000 + 10000 + 25000);
  });

  it('bỏ qua option id không tồn tại thay vì ném lỗi', () => {
    // A real scenario: the restaurant removed a topping while the app still holds an old cart.
    expect(calcUnitPrice(item, {grp_topping: ['opt_da_bi_go']})).toBe(65000);
  });
});

describe('calcLinePrice', () => {
  it('nhân với số lượng', () => {
    expect(calcLinePrice(item, {grp_size: ['opt_l']}, 3)).toBe(85000 * 3);
  });

  it('số lượng 0 thì bằng 0', () => {
    expect(calcLinePrice(item, {}, 0)).toBe(0);
  });

  it('chặn số lượng âm hoặc không nguyên', () => {
    expect(() => calcLinePrice(item, {}, -1)).toThrow();
    expect(() => calcLinePrice(item, {}, 1.5)).toThrow();
  });
});

describe('resolveSelectedOptions', () => {
  it('trả về option theo đúng thứ tự nhóm', () => {
    const options = resolveSelectedOptions(item, {
      grp_topping: ['opt_gau'],
      grp_size: ['opt_l'],
    });
    expect(options.map(o => o.id)).toEqual(['opt_l', 'opt_gau']);
  });
});
