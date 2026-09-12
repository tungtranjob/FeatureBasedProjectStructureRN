import type {
  AddressDto,
  MenuItemDto,
  OrderDto,
  PaymentIntentDto,
  RestaurantDto,
  UserDto,
  VoucherDto,
} from '../contracts';

/**
 * "CƠ SỞ DỮ LIỆU" GIẢ LẬP.
 *
 * Đây là toàn bộ dummy data của app. Nó nằm trong core/api/mock/ chứ không
 * rải rác trong từng feature — có chủ đích:
 *  - Xoá cả thư mục mock/ là app sạch bóng dữ liệu giả.
 *  - Feature không biết mock tồn tại; nó chỉ gọi http.get() như bình thường.
 *
 * Các bảng `orders` và `paymentIntents` là MUTABLE vì đặt đơn/thanh toán
 * thực sự làm thay đổi trạng thái — nhờ vậy demo chạy được cả vòng đời
 * đặt món -> thanh toán -> theo dõi đơn.
 */

const img = (seed: string) => `https://picsum.photos/seed/${seed}/640/420`;

/* ------------------------------ Người dùng ------------------------------- */

export const mockUser: UserDto = {
  id: 'usr_01',
  name: 'Trần Thanh Tùng',
  phone: '0901234567',
  email: 'tung@example.com',
  avatarUrl: img('avatar-tung'),
};

export const mockAddresses: AddressDto[] = [
  {
    id: 'addr_home',
    label: 'Nhà',
    recipientName: 'Trần Thanh Tùng',
    phone: '0901234567',
    line: '25 Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 'addr_office',
    label: 'Công ty',
    recipientName: 'Trần Thanh Tùng',
    phone: '0901234567',
    line: 'Toà nhà Bitexco, 2 Hải Triều',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];

/* -------------------------------- Nhà hàng ------------------------------- */

export const mockRestaurants: RestaurantDto[] = [
  {
    id: 'res_pho_thin',
    name: 'Phở Thìn Lò Đúc',
    coverImageUrl: img('pho-thin'),
    cuisines: ['Phở', 'Món Việt'],
    rating: 4.7,
    ratingCount: 2841,
    distanceKm: 1.2,
    deliveryFee: 15000,
    minOrderAmount: 50000,
    etaMinutes: 25,
    openHour: 6,
    closeHour: 22,
    isPaused: false,
    promoLabel: 'Giảm 20k',
  },
  {
    id: 'res_bun_cha_huong',
    name: 'Bún Chả Hương Liên',
    coverImageUrl: img('bun-cha'),
    cuisines: ['Bún', 'Món Việt'],
    rating: 4.5,
    ratingCount: 1620,
    distanceKm: 2.8,
    deliveryFee: 20000,
    minOrderAmount: 60000,
    etaMinutes: 35,
    openHour: 9,
    closeHour: 21,
    isPaused: false,
    promoLabel: 'Freeship',
  },
  {
    id: 'res_com_tam_ba_ghien',
    name: 'Cơm Tấm Ba Ghiền',
    coverImageUrl: img('com-tam'),
    cuisines: ['Cơm', 'Món Việt'],
    rating: 4.8,
    ratingCount: 5210,
    distanceKm: 0.6,
    deliveryFee: 12000,
    minOrderAmount: 40000,
    etaMinutes: 20,
    openHour: 7,
    closeHour: 23,
    isPaused: false,
    promoLabel: null,
  },
  {
    id: 'res_pizza_4ps',
    name: "Pizza 4P's",
    coverImageUrl: img('pizza-4ps'),
    cuisines: ['Pizza', 'Ý'],
    rating: 4.9,
    ratingCount: 8930,
    distanceKm: 3.4,
    deliveryFee: 25000,
    minOrderAmount: 150000,
    etaMinutes: 45,
    openHour: 10,
    closeHour: 22,
    isPaused: false,
    promoLabel: 'Giảm 15%',
  },
  {
    id: 'res_tra_sua_phuc_long',
    name: 'Phúc Long Coffee & Tea',
    coverImageUrl: img('phuc-long'),
    cuisines: ['Trà sữa', 'Cà phê'],
    rating: 4.4,
    ratingCount: 12400,
    distanceKm: 0.9,
    deliveryFee: 14000,
    minOrderAmount: 30000,
    etaMinutes: 18,
    openHour: 7,
    closeHour: 22,
    isPaused: false,
    promoLabel: 'Mua 2 tặng 1',
  },
  {
    id: 'res_banh_mi_huynh_hoa',
    name: 'Bánh Mì Huỳnh Hoa',
    coverImageUrl: img('banh-mi'),
    cuisines: ['Bánh mì', 'Ăn sáng'],
    rating: 4.6,
    ratingCount: 3310,
    distanceKm: 1.8,
    deliveryFee: 16000,
    minOrderAmount: 35000,
    etaMinutes: 22,
    // Quán này ĐANG TẠM NGƯNG — để demo trạng thái "không đặt được".
    openHour: 14,
    closeHour: 23,
    isPaused: true,
    promoLabel: null,
  },
];

/* --------------------------------- Menu ---------------------------------- */

/** Nhóm tuỳ chọn hay dùng lại — khai báo 1 lần cho gọn. */
const sizeGroup = (deltas: [number, number, number]) => ({
  id: 'grp_size',
  name: 'Chọn size',
  required: true,
  minSelect: 1,
  maxSelect: 1,
  options: [
    {id: 'opt_size_s', name: 'Nhỏ', priceDelta: deltas[0]},
    {id: 'opt_size_m', name: 'Vừa', priceDelta: deltas[1]},
    {id: 'opt_size_l', name: 'Lớn', priceDelta: deltas[2]},
  ],
});

const spiceGroup = {
  id: 'grp_spice',
  name: 'Độ cay',
  required: true,
  minSelect: 1,
  maxSelect: 1,
  options: [
    {id: 'opt_spice_none', name: 'Không cay', priceDelta: 0},
    {id: 'opt_spice_mild', name: 'Cay nhẹ', priceDelta: 0},
    {id: 'opt_spice_hot', name: 'Cay nhiều', priceDelta: 0},
  ],
};

export const mockMenuItems: MenuItemDto[] = [
  /* ---- Phở Thìn ---- */
  {
    id: 'itm_pho_bo_tai',
    restaurantId: 'res_pho_thin',
    categoryId: 'cat_pho',
    name: 'Phở bò tái lăn',
    description: 'Bánh phở mềm, bò tái lăn đặc trưng, hành lá thái nhỏ.',
    imageUrl: img('pho-bo-tai'),
    basePrice: 65000,
    isAvailable: true,
    soldCount: 1280,
    optionGroups: [
      sizeGroup([0, 10000, 20000]),
      {
        id: 'grp_topping_pho',
        name: 'Thêm topping',
        required: false,
        minSelect: 0,
        maxSelect: 4,
        options: [
          {id: 'opt_trung', name: 'Trứng chần', priceDelta: 10000},
          {id: 'opt_gau', name: 'Gầu bò', priceDelta: 25000},
          {id: 'opt_quay', name: 'Quẩy', priceDelta: 8000},
          {id: 'opt_banh_them', name: 'Thêm bánh phở', priceDelta: 12000},
        ],
      },
    ],
  },
  {
    id: 'itm_pho_ga',
    restaurantId: 'res_pho_thin',
    categoryId: 'cat_pho',
    name: 'Phở gà xé',
    description: 'Gà ta xé phay, nước dùng trong, thanh ngọt.',
    imageUrl: img('pho-ga'),
    basePrice: 58000,
    isAvailable: true,
    soldCount: 640,
    optionGroups: [sizeGroup([0, 10000, 20000])],
  },
  {
    id: 'itm_quay',
    restaurantId: 'res_pho_thin',
    categoryId: 'cat_them',
    name: 'Quẩy giòn',
    description: 'Phần 4 cái.',
    imageUrl: img('quay'),
    basePrice: 12000,
    isAvailable: true,
    soldCount: 2100,
    optionGroups: [],
  },
  {
    id: 'itm_tra_da',
    restaurantId: 'res_pho_thin',
    categoryId: 'cat_do_uong',
    name: 'Trà đá',
    description: 'Ly 350ml.',
    imageUrl: img('tra-da'),
    basePrice: 5000,
    // Món HẾT HÀNG — demo trạng thái disabled trong UI.
    isAvailable: false,
    soldCount: 5400,
    optionGroups: [],
  },

  /* ---- Bún Chả Hương Liên ---- */
  {
    id: 'itm_bun_cha',
    restaurantId: 'res_bun_cha_huong',
    categoryId: 'cat_bun',
    name: 'Bún chả Hà Nội',
    description: 'Chả viên + chả miếng nướng than hoa, nước mắm chua ngọt.',
    imageUrl: img('bun-cha-ha-noi'),
    basePrice: 70000,
    isAvailable: true,
    soldCount: 980,
    optionGroups: [
      spiceGroup,
      {
        id: 'grp_topping_bun',
        name: 'Thêm',
        required: false,
        minSelect: 0,
        maxSelect: 3,
        options: [
          {id: 'opt_nem', name: 'Nem cua bể', priceDelta: 30000},
          {id: 'opt_cha_them', name: 'Thêm chả', priceDelta: 25000},
          {id: 'opt_bun_them', name: 'Thêm bún', priceDelta: 10000},
        ],
      },
    ],
  },

  /* ---- Cơm Tấm Ba Ghiền ---- */
  {
    id: 'itm_com_suon',
    restaurantId: 'res_com_tam_ba_ghien',
    categoryId: 'cat_com',
    name: 'Cơm tấm sườn nướng',
    description: 'Sườn cốt lết nướng mật ong, mỡ hành, đồ chua.',
    imageUrl: img('com-suon'),
    basePrice: 55000,
    isAvailable: true,
    soldCount: 4200,
    optionGroups: [
      {
        id: 'grp_them_com',
        name: 'Món thêm',
        required: false,
        minSelect: 0,
        maxSelect: 4,
        options: [
          {id: 'opt_trung_op', name: 'Trứng ốp la', priceDelta: 10000},
          {id: 'opt_bi', name: 'Bì', priceDelta: 12000},
          {id: 'opt_cha_trung', name: 'Chả trứng', priceDelta: 15000},
          {id: 'opt_canh', name: 'Canh rong biển', priceDelta: 8000},
        ],
      },
    ],
  },
  {
    id: 'itm_com_ga',
    restaurantId: 'res_com_tam_ba_ghien',
    categoryId: 'cat_com',
    name: 'Cơm tấm gà nướng',
    description: 'Đùi gà nướng sả, cơm tấm thơm.',
    imageUrl: img('com-ga'),
    basePrice: 52000,
    isAvailable: true,
    soldCount: 1850,
    optionGroups: [],
  },

  /* ---- Pizza 4P's ---- */
  {
    id: 'itm_pizza_margherita',
    restaurantId: 'res_pizza_4ps',
    categoryId: 'cat_pizza',
    name: 'Pizza Margherita',
    description: 'Phô mai burrata nhà làm, cà chua San Marzano, húng quế.',
    imageUrl: img('margherita'),
    basePrice: 180000,
    isAvailable: true,
    soldCount: 3100,
    optionGroups: [
      sizeGroup([0, 60000, 120000]),
      {
        id: 'grp_de_banh',
        name: 'Đế bánh',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          {id: 'opt_de_mong', name: 'Đế mỏng', priceDelta: 0},
          {id: 'opt_de_day', name: 'Đế dày', priceDelta: 15000},
        ],
      },
    ],
  },

  /* ---- Phúc Long ---- */
  {
    id: 'itm_tra_sua_tran_chau',
    restaurantId: 'res_tra_sua_phuc_long',
    categoryId: 'cat_tra_sua',
    name: 'Trà sữa trân châu',
    description: 'Trà ô long, sữa tươi, trân châu đường đen.',
    imageUrl: img('tra-sua'),
    basePrice: 45000,
    isAvailable: true,
    soldCount: 9800,
    optionGroups: [
      sizeGroup([0, 8000, 15000]),
      {
        id: 'grp_duong',
        name: 'Mức đường',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: [
          {id: 'opt_duong_0', name: '0%', priceDelta: 0},
          {id: 'opt_duong_50', name: '50%', priceDelta: 0},
          {id: 'opt_duong_100', name: '100%', priceDelta: 0},
        ],
      },
      {
        id: 'grp_topping_tra',
        name: 'Topping',
        required: false,
        minSelect: 0,
        maxSelect: 3,
        options: [
          {id: 'opt_tran_chau', name: 'Trân châu đen', priceDelta: 8000},
          {id: 'opt_thach', name: 'Thạch trái cây', priceDelta: 8000},
          {id: 'opt_pudding', name: 'Pudding trứng', priceDelta: 10000},
        ],
      },
    ],
  },
  {
    id: 'itm_ca_phe_sua',
    restaurantId: 'res_tra_sua_phuc_long',
    categoryId: 'cat_ca_phe',
    name: 'Cà phê sữa đá',
    description: 'Cà phê robusta rang đậm, sữa đặc.',
    imageUrl: img('ca-phe-sua'),
    basePrice: 39000,
    isAvailable: true,
    soldCount: 7200,
    optionGroups: [sizeGroup([0, 8000, 15000])],
  },

  /* ---- Bánh Mì Huỳnh Hoa ---- */
  {
    id: 'itm_banh_mi_dac_biet',
    restaurantId: 'res_banh_mi_huynh_hoa',
    categoryId: 'cat_banh_mi',
    name: 'Bánh mì đặc biệt',
    description: 'Đầy đủ pate, chả lụa, thịt nguội, bơ trứng.',
    imageUrl: img('banh-mi-dac-biet'),
    basePrice: 62000,
    isAvailable: true,
    soldCount: 6100,
    optionGroups: [spiceGroup],
  },
];

/** Tên hiển thị của danh mục. Server thật sẽ có bảng riêng. */
export const mockCategoryNames: Record<string, string> = {
  cat_pho: 'Phở',
  cat_bun: 'Bún',
  cat_com: 'Cơm',
  cat_pizza: 'Pizza',
  cat_tra_sua: 'Trà sữa',
  cat_ca_phe: 'Cà phê',
  cat_banh_mi: 'Bánh mì',
  cat_them: 'Món thêm',
  cat_do_uong: 'Đồ uống',
};

/* ------------------------------ Khuyến mãi ------------------------------- */

const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

export const mockVouchers: VoucherDto[] = [
  {
    id: 'vch_welcome20',
    code: 'WELCOME20',
    title: 'Giảm 20% tối đa 30k',
    description: 'Cho đơn từ 100.000đ. Áp dụng mọi nhà hàng.',
    discountType: 'PERCENT',
    value: 20,
    maxDiscount: 30000,
    minOrderAmount: 100000,
    restaurantId: null,
    expiresAt: inDays(7),
  },
  {
    id: 'vch_freeship',
    code: 'FREESHIP',
    title: 'Miễn phí giao hàng',
    description: 'Cho đơn từ 80.000đ.',
    discountType: 'FREESHIP',
    value: 0,
    maxDiscount: null,
    minOrderAmount: 80000,
    restaurantId: null,
    expiresAt: inDays(3),
  },
  {
    id: 'vch_pho50',
    code: 'PHO50',
    title: 'Giảm 50.000đ',
    description: 'Chỉ áp dụng tại Phở Thìn Lò Đúc, đơn từ 200.000đ.',
    discountType: 'FIXED',
    value: 50000,
    maxDiscount: null,
    minOrderAmount: 200000,
    // Voucher GIỚI HẠN nhà hàng — demo logic kiểm tra điều kiện.
    restaurantId: 'res_pho_thin',
    expiresAt: inDays(14),
  },
  {
    id: 'vch_expired',
    code: 'OLDPROMO',
    title: 'Giảm 100.000đ',
    description: 'Voucher đã hết hạn (dùng để demo trạng thái không hợp lệ).',
    discountType: 'FIXED',
    value: 100000,
    maxDiscount: null,
    minOrderAmount: 0,
    restaurantId: null,
    expiresAt: inDays(-2),
  },
];

/* ------------------ Bảng có thể thay đổi lúc chạy ------------------------ */

/**
 * Đơn hàng và payment intent được TẠO MỚI khi bạn bấm đặt hàng, nên hai
 * mảng này mutable. Đây là lý do mock server này hữu ích hơn file JSON tĩnh:
 * nó giữ được trạng thái, cho phép chạy hết vòng đời nghiệp vụ.
 */
export const mockDb = {
  orders: [] as OrderDto[],
  paymentIntents: [] as PaymentIntentDto[],
  /** Ánh xạ idempotencyKey -> orderId, để retry không tạo đơn trùng. */
  idempotency: new Map<string, string>(),
  /** Số thứ tự sinh mã đơn dạng FG-0001. */
  orderSeq: 0,
};
