import {
  addLine,
  calcSubtotal,
  countItems,
  EMPTY_CART,
  isDifferentRestaurant,
  removeLine,
  updateLineQuantity,
} from '../cart-rules';
import type {AddToCartInput} from '../types';

const input = (overrides: Partial<AddToCartInput> = {}): AddToCartInput => ({
  restaurantId: 'res_1',
  restaurantName: 'Phở Thìn',
  menuItemId: 'itm_pho',
  name: 'Phở bò',
  imageUrl: '',
  unitPrice: 65000,
  quantity: 1,
  optionIds: [],
  optionNames: [],
  note: '',
  ...overrides,
});

describe('addLine', () => {
  it('thêm món vào giỏ rỗng', () => {
    const cart = addLine(EMPTY_CART, input());
    expect(cart.lines).toHaveLength(1);
    expect(cart.restaurantId).toBe('res_1');
  });

  it('gộp số lượng khi thêm món giống hệt', () => {
    const cart = addLine(addLine(EMPTY_CART, input()), input({quantity: 2}));
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.quantity).toBe(3);
  });

  it('tạo dòng riêng khi tuỳ chọn khác nhau', () => {
    const cart = addLine(
      addLine(EMPTY_CART, input({optionIds: ['opt_l']})),
      input({optionIds: ['opt_s']}),
    );
    expect(cart.lines).toHaveLength(2);
  });

  it('coi là trùng dù thứ tự optionIds đảo ngược', () => {
    const cart = addLine(
      addLine(EMPTY_CART, input({optionIds: ['a', 'b']})),
      input({optionIds: ['b', 'a']}),
    );
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.quantity).toBe(2);
  });

  it('tạo dòng riêng khi ghi chú khác nhau', () => {
    const cart = addLine(
      addLine(EMPTY_CART, input({note: 'ít hành'})),
      input({note: 'nhiều hành'}),
    );
    expect(cart.lines).toHaveLength(2);
  });

  it('thay toàn bộ giỏ khi thêm món của nhà hàng khác', () => {
    const first = addLine(EMPTY_CART, input());
    const second = addLine(
      first,
      input({restaurantId: 'res_2', restaurantName: 'Bún Chả', menuItemId: 'itm_bun'}),
    );
    expect(second.lines).toHaveLength(1);
    expect(second.restaurantId).toBe('res_2');
    expect(second.lines[0]?.menuItemId).toBe('itm_bun');
  });
});

describe('isDifferentRestaurant', () => {
  it('giỏ rỗng thì không tính là khác nhà hàng', () => {
    expect(isDifferentRestaurant(EMPTY_CART, 'res_9')).toBe(false);
  });

  it('phát hiện đúng khi giỏ đang có món quán khác', () => {
    const cart = addLine(EMPTY_CART, input());
    expect(isDifferentRestaurant(cart, 'res_2')).toBe(true);
    expect(isDifferentRestaurant(cart, 'res_1')).toBe(false);
  });
});

describe('updateLineQuantity', () => {
  it('cập nhật số lượng', () => {
    const cart = addLine(EMPTY_CART, input());
    const lineId = cart.lines[0]!.id;
    expect(updateLineQuantity(cart, lineId, 5).lines[0]?.quantity).toBe(5);
  });

  it('giảm về 0 thì xoá dòng', () => {
    const cart = addLine(EMPTY_CART, input());
    const lineId = cart.lines[0]!.id;
    expect(updateLineQuantity(cart, lineId, 0).lines).toHaveLength(0);
  });
});

describe('removeLine', () => {
  it('xoá dòng cuối cùng thì reset luôn nhà hàng', () => {
    const cart = addLine(EMPTY_CART, input());
    const emptied = removeLine(cart, cart.lines[0]!.id);
    expect(emptied.restaurantId).toBeNull();
    expect(emptied.lines).toHaveLength(0);
  });

  it('giữ nguyên nhà hàng khi vẫn còn dòng khác', () => {
    const cart = addLine(
      addLine(EMPTY_CART, input()),
      input({menuItemId: 'itm_quay', name: 'Quẩy', unitPrice: 12000}),
    );
    const after = removeLine(cart, cart.lines[0]!.id);
    expect(after.restaurantId).toBe('res_1');
    expect(after.lines).toHaveLength(1);
  });
});

describe('calcSubtotal & countItems', () => {
  it('tính đúng tổng tiền và tổng số món', () => {
    const cart = addLine(
      addLine(EMPTY_CART, input({quantity: 2})), // 65.000 x 2
      input({menuItemId: 'itm_quay', unitPrice: 12000, quantity: 3}), // 12.000 x 3
    );
    expect(calcSubtotal(cart)).toBe(65000 * 2 + 12000 * 3);
    expect(countItems(cart)).toBe(5);
  });

  it('giỏ rỗng thì tổng bằng 0', () => {
    expect(calcSubtotal(EMPTY_CART)).toBe(0);
    expect(countItems(EMPTY_CART)).toBe(0);
  });
});
