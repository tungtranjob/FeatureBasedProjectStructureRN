# FoodGo — React Native app đặt món ăn (kiến trúc Feature-First)

Một codebase **chạy được, có test, có kiểm tra ranh giới tự động**, dùng làm tham chiếu cho kiến trúc feature-first trên React Native.

Toàn bộ luồng nghiệp vụ được cài đặt đầy đủ: **duyệt nhà hàng → xem menu → tuỳ chỉnh món → giỏ hàng → chọn địa chỉ & voucher → thanh toán online → theo dõi đơn**.

| | |
|---|---|
| File TypeScript | 156 |
| Dòng code | ~9.700 |
| Feature | 9 |
| Test | 74 (8 suite) |
| `tsc --noEmit` | ✅ sạch (`strict` + `noUncheckedIndexedAccess`) |
| `depcruise` | ✅ không vi phạm ranh giới |
| Backend | Mock server chạy trong app, đổi sang API thật bằng **1 cờ** |

---

## Mục lục

1. [Chạy thử](#1-chạy-thử)
2. [Bản đồ thư mục](#2-bản-đồ-thư-mục)
3. [Bốn tầng và luật phụ thuộc](#3-bốn-tầng-và-luật-phụ-thuộc)
4. [Giải phẫu một feature](#4-giải-phẫu-một-feature)
5. [Quản lý state](#5-quản-lý-state--phần-quan-trọng-nhất)
6. [Mock API & dummy data](#6-mock-api--dummy-data)
7. [Các feature nói chuyện với nhau](#7-các-feature-nói-chuyện-với-nhau)
8. [Luồng thanh toán](#8-luồng-thanh-toán--phần-khó-nhất-trên-mobile)
9. [Thêm một feature mới](#9-thêm-một-feature-mới)
10. [Kiểm thử](#10-kiểm-thử)
11. [Những gì chưa làm](#11-những-gì-chưa-làm)

---

## 1. Chạy thử

Repo này chứa **`src/` + cấu hình**, không kèm thư mục `android/` và `ios/` (chúng là output của CLI, nặng và phụ thuộc máy). Ghép vào một project RN mới:

```bash
# 1. Tạo project RN 0.76.5 trống
npx @react-native-community/cli@latest init FoodGo --version 0.76.5
cd FoodGo

# 2. Chép code và cấu hình từ repo này đè lên
cp -R /đường/dẫn/foodgo-app/src              ./
cp    /đường/dẫn/foodgo-app/index.js         ./
cp    /đường/dẫn/foodgo-app/babel.config.js  ./
cp    /đường/dẫn/foodgo-app/tsconfig.json    ./
cp    /đường/dẫn/foodgo-app/jest.config.js   ./
cp    /đường/dẫn/foodgo-app/.dependency-cruiser.js ./

# 3. Cài dependency
npm i @react-navigation/native @react-navigation/native-stack \
      @react-navigation/bottom-tabs react-native-screens \
      react-native-safe-area-context react-native-gesture-handler \
      @tanstack/react-query zustand react-native-mmkv
npm i -D babel-plugin-module-resolver dependency-cruiser

# 4. iOS
cd ios && pod install && cd ..

# 5. Chạy
npm run ios      # hoặc npm run android
```

Kiểm tra chất lượng — chạy được **ngay trong repo này**, không cần native:

```bash
npm run typecheck   # tsc --noEmit
npm test            # 74 test
npm run arch:check  # kiểm tra ranh giới feature
```

### Đăng nhập demo

Số điện thoại bất kỳ (hợp lệ VN, mặc định điền sẵn `0901234567`), OTP bất kỳ 6 số. Gõ `000000` để xem nhánh lỗi.

### Bật lỗi mạng giả lập

Trong [`src/core/config/env.ts`](src/core/config/env.ts), đổi `mock.failureRate` thành `0.3` để 30% request thất bại — dùng để kiểm chứng `ErrorView`, nút "Thử lại", và retry của TanStack Query.

---

## 2. Bản đồ thư mục

```
src/
├── app/                       # ⭐ Composition root — nơi DUY NHẤT biết mọi feature
│   ├── App.tsx
│   ├── bootstrap/
│   │   ├── index.ts                      # khởi tạo, nối token vào http-client
│   │   └── register-event-handlers.ts    # ⭐ nơi DUY NHẤT nối feature với nhau
│   ├── navigation/
│   │   ├── RootNavigator.tsx             # đăng ký mọi màn hình
│   │   ├── MainTabNavigator.tsx
│   │   ├── types.ts                      # hợp nhất ParamList + global augmentation
│   │   ├── linking.config.ts             # gom deep link từ các feature
│   │   └── navigation.service.ts         # điều hướng ngoài React tree
│   └── providers/
│       ├── AppProviders.tsx
│       └── AppErrorBoundary.tsx
│
├── core/                      # Hạ tầng kỹ thuật — KHÔNG chứa nghiệp vụ
│   ├── api/
│   │   ├── contracts.ts                  # kiểu JSON của server (wire DTO)
│   │   ├── http-client.ts                # cửa duy nhất ra mạng
│   │   ├── query-client.ts               # cấu hình cache TanStack Query
│   │   ├── auth-token.ts                 # cầu nối token (dependency inversion)
│   │   └── mock/
│   │       ├── db.ts                     # toàn bộ dummy data
│   │       ├── handlers.ts               # "nghiệp vụ" của backend giả
│   │       └── mock-server.ts            # router + độ trễ + lỗi giả lập
│   ├── events/{app-events.ts, app-event-bus.ts, use-app-event.ts}
│   ├── storage/{kv.ts, zustand-persist.ts}
│   ├── config/env.ts
│   └── logger/logger.ts
│
├── shared/                    # Dùng chung — KHÔNG biết feature nào tồn tại
│   ├── ui/                    # design system: Button, Card, Screen, Skeleton...
│   ├── theme/                 # colors, spacing, typography
│   ├── types/                 # Money (branded), branded ID, Paginated
│   ├── lib/                   # format tiền/khoảng cách/thời gian
│   ├── hooks/                 # useDebounce, useAppState
│   └── errors/app-error.ts
│
└── features/                  # ⭐ TRÁI TIM CỦA APP
    ├── auth/                  # đăng nhập OTP, session, hồ sơ
    ├── address/               # sổ địa chỉ, địa chỉ giao hàng đang chọn
    ├── restaurant/            # danh sách + chi tiết nhà hàng, giờ mở cửa
    ├── menu/                  # menu, tuỳ chọn món, tính giá
    ├── cart/                  # giỏ hàng (offline, persist)
    ├── promotion/             # voucher + quy tắc giảm giá
    ├── checkout/              # ⭐ điểm hội tụ — ghép 6 feature lại
    ├── payment/               # cổng thanh toán, deep link, quay lại app
    └── order/                 # đặt đơn, danh sách, chi tiết, theo dõi
```

---

## 3. Bốn tầng và luật phụ thuộc

```
app/  ──────►  features/*  ──────►  shared/
                    │                  ▲
                    └──►  core/  ──────┘
```

| Luật | Vì sao |
|---|---|
| Feature A chỉ import feature B qua `@features/b` (public API) | Đây là **luật số 1**. Không có nó, feature-first thoái hoá thành "thư mục đặt tên đẹp" sau vài sprint. |
| `model/` không import React / React Native / navigation | Để test logic nghiệp vụ trong mili-giây, không cần render, không cần mock hệ điều hành. |
| `shared/` và `core/` không import `features/` | Giữ đồ thị phụ thuộc không có chu trình; `core/` tái dùng được cho app khác. |
| `features/` không import `app/` | `app/` biết mọi feature; chiều ngược lại thì không. |
| Không import vòng | Import vòng gần như luôn là dấu hiệu ranh giới cắt sai chỗ. |

### Ép bằng máy, không bằng niềm tin

Toàn bộ 5 luật trên được cài trong [`.dependency-cruiser.js`](.dependency-cruiser.js):

```bash
npm run arch:check
```

> **Đây không phải lý thuyết.** Trong lúc viết repo này, rule `model-must-be-pure` đã bắt được một vi phạm thật: [`payment/model/payment-method.registry.ts`](src/features/payment/model/payment-method.registry.ts) lỡ import `Platform` từ React Native. Nó được sửa bằng cách chuyển việc đọc nền tảng sang [`payment/lib/current-platform.ts`](src/features/payment/lib/current-platform.ts), còn model nhận `platform` làm **tham số bắt buộc** — nhờ vậy test kiểm được nhánh iOS trên máy Android.

Nên gắn lệnh này vào pre-commit hook và CI. Không ai nhớ nổi luật kiến trúc khi đang vội lúc 6h chiều thứ Sáu.

---

## 4. Giải phẫu một feature

Mọi feature đều theo cùng một khuôn. Ví dụ [`features/checkout/`](src/features/checkout/):

```
features/checkout/
├── model/           # ❶ Logic thuần TS — KHÔNG React, test được trong 1ms
│   ├── calc-order-total.ts
│   ├── validate-checkout.ts
│   └── __tests__/
├── api/             # ❷ Gọi mạng + dịch DTO sang domain model
├── store/           # ❸ Client state của feature (zustand)
├── hooks/           # ❹ Cầu nối model ↔ UI, điều phối luồng
├── components/      # ❺ UI mảnh, dùng trong feature
├── screens/         # ❻ Màn hình — CHỈ compose, không chứa logic
├── navigation/      # ❼ Route + ParamList của riêng feature
└── index.ts         # ⭐ PUBLIC API — cửa duy nhất ra ngoài
```

### `index.ts` là thứ quyết định thành bại

```ts
// features/cart/index.ts
export {CartFab} from './components/CartFab';
export {useCart, useCartBadge, useAddToCart} from './hooks/use-cart';
export type {Cart, CartLine, AddToCartInput} from './model/types';

// ⚠️ useCartStore KHÔNG được export.
```

Nếu feature khác chạm được vào store, sớm muộn sẽ có người gọi `useCartStore.setState(...)` từ màn checkout để "sửa nhanh một chút". Lúc đó mọi quy tắc trong `cart-rules.ts` bị đi vòng, và không ai còn dám khẳng định giỏ hàng luôn ở trạng thái hợp lệ.

### Màn hình phải mỏng

Tiêu chuẩn tự đánh giá: **nếu một screen có `if` phức tạp hoặc phép tính về tiền, logic đó đang ở sai chỗ.**

```tsx
// features/checkout/screens/CheckoutScreen.tsx — gần như không có logic
const flow = useCheckoutFlow();
const firstBlocker = flow.blockers[0];

<Button
  title={`Đặt hàng · ${formatCurrency(flow.fees.total)}`}
  onPress={flow.submit}
  disabled={!flow.canPlaceOrder}
  loading={flow.isSubmitting}
/>
```

---

## 5. Quản lý state — phần quan trọng nhất

App này dùng **hai hệ thống state song song, mỗi hệ cho một loại dữ liệu khác nhau**. Đây là quyết định kiến trúc quan trọng nhất, và cũng là chỗ hầu hết codebase RN làm sai.

### Nguyên tắc phân loại

| | **Server state** | **Client state** |
|---|---|---|
| Công cụ | TanStack Query | Zustand |
| Đặc điểm | App **không sở hữu**, có thể cũ đi | App **sở hữu hoàn toàn** |
| Ví dụ trong repo | nhà hàng, menu, đơn hàng, voucher, địa chỉ | giỏ hàng, phiên đăng nhập, nháp checkout, giao dịch đang chờ |
| Cần gì | cache, refetch, retry, dedupe, invalidate | ghi nhanh, phản hồi tức thì, hoạt động offline |

> **Sai lầm phổ biến nhất:** nhét danh sách nhà hàng vào một Zustand store. Bạn sẽ phải tự viết lại loading/error/cache/refetch/dedupe — tức là viết lại TanStack Query, nhưng đầy bug.

### Server state: TanStack Query

Cấu hình tập trung ở [`core/api/query-client.ts`](src/core/api/query-client.ts). Ba quyết định đáng chú ý:

```ts
// 1. Chỉ retry lỗi mạng/server. Retry lỗi 422 là vô nghĩa.
retry: (failureCount, error) => {
  if (error instanceof AppError && !error.isRetryable) return false;
  return failureCount < 2;
},

// 2. Mobile không có "focus cửa sổ" như web.
refetchOnWindowFocus: false,

// 3. KHÔNG BAO GIỜ tự retry mutation — đặt đơn 2 lần là mất tiền thật.
mutations: { retry: false },
```

**Query key factory** ([`order.keys.ts`](src/features/order/api/order.keys.ts)) — không bao giờ gõ tay mảng key:

```ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
```

**Polling có điều kiện** ([`order.queries.ts`](src/features/order/api/order.queries.ts)) — kỹ thuật rất hữu ích cho màn theo dõi đơn:

```ts
refetchInterval: query => {
  const order = query.state.data;
  // Đơn đang chạy -> hỏi lại mỗi 10s. Đơn đã xong -> ngừng hẳn.
  return order && isActiveOrder(order) ? 10_000 : false;
},
```

Để một con số cố định sẽ ngốn pin và 4G để hỏi lại mãi một đơn đã hoàn tất từ tuần trước.

### Client state: Zustand

Bốn store trong app, và **quyết định persist của chúng khác nhau** — đây là điểm đáng học nhất:

| Store | Persist? | Vì sao |
|---|---|---|
| [`cart.store`](src/features/cart/store/cart.store.ts) | ✅ MMKV | Mất giỏ hàng là mất công chọn món |
| [`auth.store`](src/features/auth/store/auth.store.ts) | ✅ MMKV **mã hoá** | Token không nằm chung vùng với giỏ hàng |
| [`payment.store`](src/features/payment/store/payment.store.ts) | ✅ **BẮT BUỘC** | Xem [mục 8](#8-luồng-thanh-toán--phần-khó-nhất-trên-mobile) — liên quan tới tiền |
| [`checkout.store`](src/features/checkout/store/checkout.store.ts) | ❌ | Voucher có thể hết hạn, hình thức thanh toán có thể không còn hợp lệ. Khôi phục lựa chọn cũ chỉ gây nhầm lẫn |

> **Quy tắc rút ra:** chỉ persist thứ mà mất đi sẽ làm người dùng khó chịu **hoặc** gây sai lệch dữ liệu. Persist mọi thứ "cho chắc" tạo ra một lớp bug riêng về dữ liệu cũ.

### Store gần như không chứa logic

```ts
// cart.store.ts — mỗi action chỉ gọi một hàm thuần rồi lưu kết quả
add: input => set({cart: rules.addLine(get().cart, input)}),
remove: lineId => set(state => ({cart: rules.removeLine(state.cart, lineId)})),
```

Toàn bộ quy tắc nằm trong [`cart-rules.ts`](src/features/cart/model/cart-rules.ts) — hàm thuần, và đó là lý do có **15 test** cho giỏ hàng chạy trong vài mili-giây mà không cần dựng zustand hay render gì cả.

### ⚠️ Selector nguyên thuỷ — chi tiết nhỏ, ảnh hưởng lớn

```ts
// ✅ ĐÚNG — trả về một con số. Object.is so sánh chính xác.
export const selectItemCount = (state: CartState): number => rules.countItems(state.cart);
useCartStore(selectItemCount);

// ❌ SAI — tạo object MỚI mỗi lần render
useCartStore(s => ({count: ..., total: ...}));
```

Zustand so sánh bằng `Object.is`. Selector trả về object mới ⇒ luôn khác ⇒ re-render ở **mọi** thay đổi của store. Với badge giỏ hàng hiện ở mọi màn hình, sai lầm này khiến cả app render lại mỗi lần user gõ một ký tự ghi chú.

Khi cần nhiều field, dùng `useShallow` ([`use-auth.ts`](src/features/auth/hooks/use-auth.ts)).

### Ghép hai loại state với nhau

Mẫu hình dùng đi dùng lại — [`use-delivery-address.ts`](src/features/address/hooks/use-delivery-address.ts):

```ts
// Zustand giữ "id đang chọn", TanStack Query giữ nội dung thật
const {data: addresses} = useAddresses();                    // server state
const selectedId = useSelectedAddressStore(s => s.selectedAddressId); // client state

// Xử lý cả trường hợp id đã chọn không còn tồn tại
return chosen ?? addresses.find(a => a.isDefault) ?? addresses[0] ?? null;
```

**Chỉ lưu ID, không lưu cả object.** Nếu lưu cả object, người dùng sửa địa chỉ trên web xong quay lại app sẽ thấy địa chỉ cũ mãi mãi — vì bản sao trong store không ai làm mới cả.

### State cục bộ vẫn là `useState`

Không phải mọi thứ đều cần store. Chữ đang gõ trong ô tìm kiếm, topping đang chọn dở trong màn chi tiết món — những thứ chỉ sống trong một màn hình thì `useState` là đúng chỗ. Đưa vào store toàn cục chỉ tổ phải nhớ dọn dẹp và sẽ rò rỉ sang lần mở sau.

---

## 6. Mock API & dummy data

Toàn bộ backend được giả lập **trong app**, tại [`core/api/mock/`](src/core/api/mock/).

### Đổi sang backend thật = đổi 1 dòng

```ts
// core/config/env.ts
useMockApi: false,   // ← xong. Không file feature nào phải sửa.
```

Feature chỉ biết `http.get('/restaurants')`. Nó không biết dữ liệu đến từ đâu.

### Mock server có gì mà file JSON tĩnh không có

| | |
|---|---|
| **Độ trễ mạng** | 250–700ms ngẫu nhiên → skeleton và trạng thái loading được kiểm chứng thật |
| **Mã lỗi HTTP** | 404 / 409 / 422 → `ErrorView`, retry, các nhánh thất bại đều chạy được |
| **Trạng thái thay đổi** | Đặt đơn xong, đơn xuất hiện trong lịch sử |
| **Nghiệp vụ thật** | Idempotency, kiểm tra voucher, chặn món hết hàng, đơn tối thiểu |
| **Vòng đời đơn hàng** | Đơn tự chạy `CONFIRMED → PREPARING → DELIVERING → COMPLETED`, mỗi bước 45 giây |

### Dữ liệu mẫu

6 nhà hàng (có 1 quán **tạm ngưng nhận đơn**), 11 món ăn với các nhóm tuỳ chọn bắt buộc/tuỳ chọn (có 1 món **hết hàng**), 4 voucher (PERCENT có trần / FIXED / FREESHIP / **đã hết hạn**), 2 địa chỉ giao hàng.

Các trường hợp biên được cài sẵn có chủ đích — để bạn thấy UI xử lý chúng ra sao mà không phải tự dựng dữ liệu.

### Server là nguồn sự thật về tiền

[`handlers.ts`](src/core/api/mock/handlers.ts) **tính lại toàn bộ giá** từ `menuItemId` + `optionIds`, không tin con số client gửi lên:

```ts
const unitPrice = menuItem.basePrice + selected.reduce((s, o) => s + o.priceDelta, 0);
```

Nếu tin client, ai đó sửa request là mua được pizza giá 0đ.

Client **vẫn** tính song song ở [`calc-order-total.ts`](src/features/checkout/model/calc-order-total.ts) — trùng lặp **có chủ đích**, để tổng tiền đổi ngay khi bật/tắt voucher thay vì chờ 300ms round-trip. Khi hai bên lệch nhau, **số của server thắng** ([`use-checkout-draft.ts`](src/features/checkout/hooks/use-checkout-draft.ts)).

### DTO ≠ Domain model

[`core/api/contracts.ts`](src/core/api/contracts.ts) khai báo hình dạng JSON của server (trong dự án thật thì file này được sinh từ OpenAPI). Mỗi feature có một mapper dịch sang model của mình:

```ts
// features/restaurant/api/restaurant.api.ts
const toRestaurant = (dto: RestaurantDto): Restaurant => ({
  id: asId<RestaurantId>(dto.id),          // string  -> branded RestaurantId
  deliveryFee: money(dto.deliveryFee),     // number  -> branded Money
  ...
});
```

Nghe có vẻ thừa, nhưng nó mua cho bạn ba thứ: backend đổi tên field thì sửa **1 mapper** thay vì 30 component; app có kiểu chặt hơn server; và ghép/bỏ field tuỳ nhu cầu UI mà không phải xin backend đổi API.

### `Money` là branded type

```ts
export type Money = number & {readonly __brand: 'Money'};
export const money = (amount: number): Money => {
  if (!Number.isInteger(amount)) throw new Error(...);  // fail-fast
  return amount as Money;
};
```

Tiền lưu bằng **số nguyên VND**. `0.1 + 0.2 !== 0.3` trong JS — với tiền, sai số đó biến thành lệch đối soát và khiếu nại của khách. Branded type khiến `Money` không thể vô tình trộn với `number` thường, và chi phí lúc runtime là **0 byte** (kiểu bị xoá khi compile).

---

## 7. Các feature nói chuyện với nhau

### Cách A — Đồng bộ, cần dữ liệu: import qua public API

```ts
// features/checkout/hooks/use-checkout-draft.ts
import {useCart}            from '@features/cart';
import {useDeliveryAddress} from '@features/address';
import {useRestaurant}      from '@features/restaurant';
import {calcDiscount}       from '@features/promotion';
import {usePlaceOrder}      from '@features/order';
```

`checkout` phụ thuộc 5 feature — **bình thường và đúng**, vì checkout tồn tại chính là để ghép chúng lại. Chiều ngược lại thì tuyệt đối không: `cart` không được import `checkout`.

### Cách B — Bất đồng bộ, nhiều bên quan tâm: event bus

Toàn bộ việc nối dây nằm ở **một file duy nhất**: [`app/bootstrap/register-event-handlers.ts`](src/app/bootstrap/register-event-handlers.ts).

```ts
appEventBus.on('order:placed', ({orderId, orderCode}) => {
  clearCart();              // ← giỏ hàng được xoá TẠI ĐÂY
  resetCheckoutDraft();
  queryClient.invalidateQueries({queryKey: orderKeys.lists()});
});

appEventBus.on('auth:logged-out', () => {
  clearCart();
  resetCheckoutDraft();
  resetSelectedAddress();
  queryClient.clear();      // ← nếu quên, user tiếp theo thấy đơn của user trước
});
```

Hãy để ý điều **KHÔNG** xảy ra trong các feature:

- `payment` không gọi `cart.clear()`. Nó chỉ phát `'payment:succeeded'`.
- `auth` không gọi `resetCheckoutDraft()`. Nó chỉ phát `'auth:logged-out'`.
- `order` không biết ai quan tâm tới đơn hàng mới.

Kết quả: mỗi feature **xoá đi được** mà không làm vỡ feature khác. Muốn thêm hành vi khi thanh toán thành công (analytics, hiện popup đánh giá, cộng điểm)? Thêm một dòng ở file này. Không đụng vào `payment`.

**Đánh đổi cần biết:** luồng chạy khó lần dấu hơn gọi hàm trực tiếp — bạn không "Go to definition" từ nơi phát sang nơi nhận được. Đó là lý do số lượng event phải **ít** (6 event) và tập trung hết ở một file.

Quy ước đặt tên: `'<feature>:<chuyện đã xảy ra ở thì quá khứ>'`. Thì quá khứ rất quan trọng — event mô tả **sự thật đã xảy ra**, không phải mệnh lệnh. `'payment:succeeded'` đúng; `'clearCart'` sai (đó là lệnh, và nó buộc payment phải biết cart tồn tại).

### Cách C — Đảo ngược phụ thuộc

`http-client` (core) cần token, nhưng **core không được import feature**. Giải pháp ở [`core/api/auth-token.ts`](src/core/api/auth-token.ts):

```ts
// core định nghĩa "khe cắm"
export const authTokenBridge = {
  setTokenProvider(next: () => string | null) { provider = next; },
  getToken: () => provider(),
};

// app/bootstrap cắm feature vào — chỉ app/ được phép biết cả hai
authTokenBridge.setTokenProvider(getAccessToken);
authTokenBridge.setUnauthorizedHandler(forceLogout);
```

### Tránh phụ thuộc vòng

`restaurant` → `menu` (màn chi tiết nhà hàng nhúng `<MenuSectionList/>`). Nên `menu` **không được** import `restaurant`. Tên nhà hàng mà `menu` cần được truyền qua **route param**:

```ts
// features/menu/navigation/menu.routes.ts
[MENU_ROUTES.ItemDetail]: {
  itemId: string;
  restaurantId: string;
  restaurantName: string;  // ← truyền vào, không đi hỏi feature restaurant
};
```

Tương tự, màn **chọn voucher** thuộc `checkout` chứ không thuộc `promotion` — vì nó ghi vào checkout store. Đặt ở `promotion` sẽ tạo phụ thuộc ngược.

### Navigation: mỗi feature tự khai báo route của mình

```ts
// features/order/navigation/order.routes.ts
export type OrderStackParamList = {
  OrderDetail: {orderId: string; highlightPayment?: boolean};
};

// app/navigation/types.ts — chỉ GHÉP lại
export type RootStackParamList =
  & AuthStackParamList & RestaurantStackParamList & MenuStackParamList
  & CartStackParamList & CheckoutStackParamList & AddressStackParamList
  & PaymentStackParamList & OrderStackParamList;
```

Thêm màn hình mới **không cần sửa file type tập trung** — khai báo trong feature là nó tự có mặt.

**Global type augmentation** gỡ nút thắt "feature không được import app/":

```ts
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

Nhờ nó, `useNavigation()` **không tham số** vẫn có kiểu đầy đủ ở mọi nơi trong feature.

---

## 8. Luồng thanh toán — phần khó nhất trên mobile

Đây là lý do `payment` phải là một feature riêng có store persist, chứ không phải vài dòng trong `CheckoutScreen`.

### Vấn đề

Khi người dùng bấm thanh toán MoMo, **app bị đẩy ra nền**. Android trên máy RAM thấp **giết app** trong lúc đó khá thường xuyên. Khi họ quay lại, app khởi động **lại từ đầu** — mọi state trong RAM đã mất.

Nếu không persist: app mở lên sạch trơn, không biết có giao dịch nào đang chờ. Người dùng đã bị trừ tiền nhưng app hiển thị giỏ hàng như chưa có gì xảy ra.

### Ba đường quay lại app

[`use-payment-return.ts`](src/features/payment/hooks/use-payment-return.ts) xử lý cả ba. Bỏ sót đường nào cũng để lại một nhóm người dùng mắc kẹt ở màn "đang xử lý" vĩnh viễn:

| # | Đường | Khi nào | Tín hiệu |
|---|---|---|---|
| 1 | **Deep link** | User bấm "Quay lại ứng dụng" trong MoMo | `foodgo://payment/return` |
| 2 | **Foreground** | User tự bấm Back, hoặc chuyển app bằng multitask | `AppState → 'active'` |
| 3 | **Cold start** | Hệ điều hành đã giết app khi ở nền | `pendingIntentId` đọc từ đĩa |

### Thứ tự không được phép đổi

```ts
// use-pay.ts
setPending({intentId, orderId});   // ⭐ GHI XUỐNG ĐĨA TRƯỚC
const result = await provider.pay(intent);   // ← có thể rời app NGAY LẬP TỨC
```

`provider.pay()` gọi `Linking.openURL()` và app rời đi ngay. Nếu ghi sau, dòng code đó có thể không bao giờ chạy.

> **Quy tắc tổng quát:** mọi thứ cần sống sót qua việc rời app phải được ghi xuống đĩa **trước khi** rời đi.

### Server là nguồn sự thật, luôn luôn

```ts
// Không bao giờ tin tham số trên deep link —
// ai cũng gõ được foodgo://payment/return?status=success vào trình duyệt.
for (let attempt = 0; attempt < 8; attempt++) {
  const intent = await paymentApi.getIntent(intentId);
  if (intent.status === 'PAID') { ... }
  await sleep(1500);
}
```

Hỏi **nhiều lần**: webhook từ cổng thanh toán tới backend có thể chậm hơn việc người dùng quay lại app vài giây. Hỏi một lần rồi kết luận "thất bại" là sai lầm kinh điển.

Hết lượt hỏi mà vẫn `PENDING`? **Không xoá** `pendingIntentId` — giữ lại để lần sau mở app còn hỏi tiếp. Thà hỏi thừa còn hơn mất dấu một khoản tiền.

### Chặn back khi đang thanh toán

[`use-back-handler-guard.ts`](src/features/payment/hooks/use-back-handler-guard.ts) chặn **cả hai** cơ chế — quên một cái là user vẫn thoát được:

```ts
BackHandler.addEventListener('hardwareBackPress', () => true);  // Android
navigation.addListener('beforeRemove', e => e.preventDefault()); // vuốt/header
```

### Thêm cổng thanh toán mới = thêm 1 thư mục

```
providers/
├── provider.types.ts    # ⭐ interface chung
├── momo/                # chuyển sang app khác
├── vnpay/               # mở trình duyệt
├── card/                # sheet ngay trong app (Stripe)
└── cod/                 # Null Object — không có gì để mở
```

```ts
const PROVIDERS: Record<PaymentMethod, PaymentProvider> = {...};
```

Dùng `Record` chứ không phải object thường: thêm giá trị vào union `PaymentMethod` mà quên viết provider thì **TypeScript báo lỗi biên dịch ngay**. Compiler làm thay việc review.

Chú ý `cod.provider.ts` — một "provider rỗng". Tiền mặt chẳng có cổng thanh toán nào, nhưng ta vẫn tạo provider cho nó thay vì viết `if (method === 'COD')` trong màn checkout. Kết quả: **mọi phương thức đi qua cùng một đường dẫn code**, không có nhánh đặc biệt nào để quên xử lý.

### Thử luồng trong bản demo

Màn `PaymentProcessing` có khu vực **🧪 Mô phỏng** với hai nút "thành công" / "thất bại". Chúng thay cho việc bạn bấm xác nhận bên trong app MoMo. Ở production, kết quả về backend qua webhook — app **không có** endpoint nào để tự nói "tôi đã trả tiền rồi".

Thử deep link thật không cần cổng thanh toán:

```bash
xcrun simctl openurl booted "foodgo://payment/return"                  # iOS
adb shell am start -a android.intent.action.VIEW -d "foodgo://payment/return"  # Android
```

---

## 9. Thêm một feature mới

Ví dụ thêm `review` (đánh giá đơn hàng):

```bash
mkdir -p src/features/review/{model/__tests__,api,components,screens,navigation}
```

1. **`model/`** trước — kiểu dữ liệu + quy tắc nghiệp vụ, viết test luôn.
   ```ts
   export const canReviewOrder = (order: {status: string; reviewedAt: string | null}) =>
     order.status === 'COMPLETED' && order.reviewedAt === null;
   ```
2. **`api/`** — thêm DTO vào `core/api/contracts.ts`, route vào `mock/handlers.ts`, viết mapper + query key factory + hook query.
3. **`navigation/review.routes.ts`** — route name + `ReviewStackParamList`.
4. **`components/` + `screens/`** — UI mỏng.
5. **`index.ts`** — export **tối thiểu**. Mặc định là không export; chỉ mở ra khi có feature khác thật sự cần.
6. Thêm `ReviewStackParamList` vào `app/navigation/types.ts` và đăng ký screen trong `RootNavigator`.
7. Nếu cần phản ứng với event: thêm handler vào `app/bootstrap/register-event-handlers.ts`.
8. `npm run arch:check && npm run typecheck && npm test`.

### Checklist review code

- [ ] Có `if` nghiệp vụ hoặc phép tính tiền nào nằm trong `screens/` không? → đưa về `model/`
- [ ] `model/` có import React/RN không? → `npm run arch:check` sẽ bắt
- [ ] `index.ts` có export store không? → gần như luôn là sai
- [ ] Có import `@features/x/...` (đường dẫn sâu) không? → phải qua `@features/x`
- [ ] Store mới có persist không? Nếu có, đã đặt `version` + `migrate` chưa?
- [ ] Selector có trả về object mới mỗi lần render không? → dùng selector nguyên thuỷ hoặc `useShallow`

---

## 10. Kiểm thử

```bash
npm test
```

**74 test, 8 suite, chạy trong ~0,4 giây** — vì tất cả đều test hàm thuần trong `model/`, không render component nào.

| Suite | Test | Nội dung |
|---|---|---|
| `cart-rules` | 15 | gộp dòng trùng, đảo thứ tự option, đổi nhà hàng, xoá dòng cuối |
| `voucher-rules` | 13 | trần giảm giá, hết hạn, sai nhà hàng, không giảm quá tiền hàng |
| `validate-options` | 11 | nhóm bắt buộc, maxSelect, không mutate đầu vào |
| `checkout` | 10 | tổng không âm, thứ tự ưu tiên lỗi, số tiền còn thiếu |
| `order-rules` | 9 | quy tắc huỷ đơn, phân loại đơn, giờ giao dự kiến |
| `availability` | 9 | quán mở xuyên đêm, biên giờ mở/đóng, tạm ngưng |
| `calc-item-price` | 8 | cộng topping, option không tồn tại, số lượng không hợp lệ |
| `payment-method.registry` | 5 | hạn mức COD, tự chuyển phương thức khi vượt hạn mức |

### Mẹo khiến test không mong manh

Mọi hàm phụ thuộc thời gian đều nhận `now` làm **tham số**, không gọi `Date.now()` bên trong:

```ts
export const getAvailability = (restaurant, now: Date = new Date()) => {...}
```

Nhờ vậy test kiểm được ca "quán mở xuyên đêm lúc 1 giờ sáng" mà không cần mock đồng hồ hệ thống, và test không đỏ sau Tết.

---

## 11. Những gì chưa làm

Repo này tập trung vào **kiến trúc và luồng nghiệp vụ**, nên các phần sau cố tình để trống:

| Chưa có | Ghi chú |
|---|---|
| Thư mục `android/` và `ios/` | Xem [mục 1](#1-chạy-thử) để ghép vào project RN mới. **Chưa từng chạy trên máy thật/giả lập** — đã kiểm chứng bằng `tsc`, `jest`, `depcruise` |
| Theo dõi tài xế realtime | Sẽ là feature `order-tracking` riêng: WebSocket + bản đồ. Tách khỏi `order` vì bản chất khác hẳn |
| Push notification | Feature `notification` với `services/push-handler.ts`; phần **route theo payload** thuộc về feature, không phải `core` |
| Tìm kiếm nâng cao | Hiện lọc ở client. Cần feature `search` riêng khi có gợi ý + lịch sử |
| Đánh giá, ví, điểm thưởng | Cùng khuôn mẫu, xem [mục 9](#9-thêm-một-feature-mới) |
| Hàng đợi offline cho mutation | `core/network/offline-queue.ts`. Hiện `cart` đã chạy offline hoàn toàn, nhưng đặt đơn thì cần mạng |
| Dark mode | Token màu đã tập trung ở `shared/theme/colors.ts`, nên chỉ cần thêm một bảng màu tối |
| Test component | Chủ ý: test `model/` cho giá trị cao nhất trên mỗi giây chạy. Bước tiếp theo hợp lý là E2E bằng Maestro cho luồng đặt hàng |

---

## Nếu app của bạn còn nhỏ

**Đừng dựng đủ 7 thư mục con cho mỗi feature ngay từ đầu.** Khởi động gọn:

```
features/cart/
├── api.ts
├── cart.store.ts
├── use-cart.ts
├── CartScreen.tsx
└── index.ts
```

rồi tách dần khi feature phình ra. Cấu trúc thư mục phải **theo kịp** độ phức tạp, chứ không đi trước nó.

Điều duy nhất phải làm nghiêm ngay từ ngày đầu là **`index.ts` + rule chặn import xuyên feature**. Có nó thì mọi bước tách sau này chỉ là di chuyển file trong một thư mục; thiếu nó thì 6 tháng sau bạn sẽ có một đống import chằng chịt không gỡ nổi.
