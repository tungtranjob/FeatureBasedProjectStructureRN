# FoodGo — a React Native food ordering app (Feature-First architecture)

A codebase that **runs, has tests, and enforces its own boundaries automatically**, meant as a reference for feature-first architecture on React Native.

The whole business flow is implemented end to end: **browse restaurants → view the menu → customise an item → cart → pick address & voucher → pay online → track the order**.

| | |
|---|---|
| TypeScript files | 156 |
| Lines of code | ~9,700 |
| Features | 9 |
| Tests | 74 (8 suites) |
| `tsc --noEmit` | ✅ clean (`strict` + `noUncheckedIndexedAccess`) |
| `depcruise` | ✅ no boundary violations |
| Backend | An in-app mock server; switch to a real API with **one flag** |

---

## Table of contents

1. [Running it](#1-running-it)
2. [Directory map](#2-directory-map)
3. [The four layers and the dependency rules](#3-the-four-layers-and-the-dependency-rules)
4. [Anatomy of a feature](#4-anatomy-of-a-feature)
5. [State management](#5-state-management--the-most-important-part)
6. [Mock API & dummy data](#6-mock-api--dummy-data)
7. [How features talk to each other](#7-how-features-talk-to-each-other)
8. [The payment flow](#8-the-payment-flow--the-hardest-part-on-mobile)
9. [Adding a new feature](#9-adding-a-new-feature)
10. [Testing](#10-testing)
11. [What is deliberately missing](#11-what-is-deliberately-missing)

---

## 1. Running it

This repo contains **`src/` + configuration** only, without the `android/` and `ios/` folders (they are CLI output — large and machine-specific). To graft it onto a fresh RN project:

```bash
# 1. Create an empty RN 0.76.5 project
npx @react-native-community/cli@latest init FoodGo --version 0.76.5
cd FoodGo

# 2. Copy the code and configuration from this repo over it
cp -R /path/to/foodgo-app/src              ./
cp    /path/to/foodgo-app/index.js         ./
cp    /path/to/foodgo-app/babel.config.js  ./
cp    /path/to/foodgo-app/tsconfig.json    ./
cp    /path/to/foodgo-app/jest.config.js   ./
cp    /path/to/foodgo-app/.dependency-cruiser.js ./

# 3. Install dependencies
npm i @react-navigation/native @react-navigation/native-stack \
      @react-navigation/bottom-tabs react-native-screens \
      react-native-safe-area-context react-native-gesture-handler \
      @tanstack/react-query zustand react-native-mmkv
npm i -D babel-plugin-module-resolver dependency-cruiser

# 4. iOS
cd ios && pod install && cd ..

# 5. Run
npm run ios      # or npm run android
```

The quality checks run **directly in this repo**, with no native build required:

```bash
npm run typecheck   # tsc --noEmit
npm test            # 74 tests
npm run arch:check  # feature boundary checks
```

### Demo login

Any phone number (valid VN format; `0901234567` is pre-filled) and any 6-digit OTP. Enter `000000` to see the failure branch.

### Simulating network errors

In [`src/core/config/env.ts`](src/core/config/env.ts), set `mock.failureRate` to `0.3` so 30% of requests fail — useful for exercising `ErrorView`, the retry button, and TanStack Query's retry behaviour.

---

## 2. Directory map

```
src/
├── app/                       # ⭐ Composition root — the ONLY place that knows every feature
│   ├── App.tsx
│   ├── bootstrap/
│   │   ├── index.ts                      # startup, plugs the token into http-client
│   │   └── register-event-handlers.ts    # ⭐ the ONLY place features are wired together
│   ├── navigation/
│   │   ├── RootNavigator.tsx             # registers every screen
│   │   ├── MainTabNavigator.tsx
│   │   ├── types.ts                      # merged ParamList + global augmentation
│   │   ├── linking.config.ts             # gathers deep links from the features
│   │   └── navigation.service.ts         # navigating outside the React tree
│   └── providers/
│       ├── AppProviders.tsx
│       └── AppErrorBoundary.tsx
│
├── core/                      # Technical infrastructure — NO business logic
│   ├── api/
│   │   ├── contracts.ts                  # the server's JSON types (wire DTOs)
│   │   ├── http-client.ts                # the only door to the network
│   │   ├── query-client.ts               # TanStack Query cache configuration
│   │   ├── auth-token.ts                 # the token bridge (dependency inversion)
│   │   └── mock/
│   │       ├── db.ts                     # all of the dummy data
│   │       ├── handlers.ts               # the fake backend's "business logic"
│   │       └── mock-server.ts            # router + latency + simulated failures
│   ├── events/{app-events.ts, app-event-bus.ts, use-app-event.ts}
│   ├── storage/{kv.ts, zustand-persist.ts}
│   ├── config/env.ts
│   └── logger/logger.ts
│
├── shared/                    # Shared code — knows about NO feature
│   ├── ui/                    # design system: Button, Card, Screen, Skeleton, ...
│   ├── theme/                 # colors, spacing, typography
│   ├── types/                 # Money (branded), branded IDs, Paginated
│   ├── lib/                   # money/distance/time formatting
│   ├── hooks/                 # useDebounce, useAppState
│   └── errors/app-error.ts
│
└── features/                  # ⭐ THE HEART OF THE APP
    ├── auth/                  # OTP login, session, profile
    ├── address/               # address book, currently selected delivery address
    ├── restaurant/            # restaurant list + detail, opening hours
    ├── menu/                  # menu, item options, price calculation
    ├── cart/                  # the cart (offline, persisted)
    ├── promotion/             # vouchers + discount rules
    ├── checkout/              # ⭐ the meeting point — joins 6 features
    ├── payment/               # payment gateways, deep links, returning to the app
    └── order/                 # placing, listing, detail, tracking
```

---

## 3. The four layers and the dependency rules

```
app/  ──────►  features/*  ──────►  shared/
                    │                  ▲
                    └──►  core/  ──────┘
```

| Rule | Why |
|---|---|
| Feature A imports feature B only through `@features/b` (its public API) | This is **rule number 1**. Without it, feature-first degrades into "nicely named folders" within a few sprints. |
| `model/` does not import React / React Native / navigation | So business logic can be tested in milliseconds, with no rendering and no OS mocking. |
| `shared/` and `core/` do not import `features/` | Keeps the dependency graph acyclic; `core/` stays reusable in another app. |
| `features/` does not import `app/` | `app/` knows every feature; the reverse is not allowed. |
| No circular imports | A circular import is almost always a sign the boundary was drawn in the wrong place. |

### Enforced by a tool, not by good intentions

All five rules above are encoded in [`.dependency-cruiser.js`](.dependency-cruiser.js):

```bash
npm run arch:check
```

> **This is not theoretical.** While writing this repo, the `model-must-be-pure` rule caught a real violation: [`payment/model/payment-method.registry.ts`](src/features/payment/model/payment-method.registry.ts) had imported `Platform` from React Native. The fix was to move the platform lookup into [`payment/lib/current-platform.ts`](src/features/payment/lib/current-platform.ts) and have the model take `platform` as a **required parameter** — which is what makes the iOS branch testable on an Android machine.

Wire this command into a pre-commit hook and CI. Nobody remembers the architecture rules in a hurry at 6pm on a Friday.

---

## 4. Anatomy of a feature

Every feature follows the same shape. Take [`features/checkout/`](src/features/checkout/):

```
features/checkout/
├── model/           # ❶ Pure TS logic — NO React, testable in 1ms
│   ├── calc-order-total.ts
│   ├── validate-checkout.ts
│   └── __tests__/
├── api/             # ❷ Network calls + translating DTOs into domain models
├── store/           # ❸ The feature's client state (zustand)
├── hooks/           # ❹ The bridge between model ↔ UI, flow orchestration
├── components/      # ❺ Small UI pieces used inside the feature
├── screens/         # ❻ Screens — composition ONLY, no logic
├── navigation/      # ❼ The feature's own routes + ParamList
└── index.ts         # ⭐ PUBLIC API — the only way in from outside
```

### `index.ts` is what decides whether this works

```ts
// features/cart/index.ts
export {CartFab} from './components/CartFab';
export {useCart, useCartBadge, useAddToCart} from './hooks/use-cart';
export type {Cart, CartLine, AddToCartInput} from './model/types';

// ⚠️ useCartStore is NOT exported.
```

If another feature could reach the store, sooner or later somebody would call `useCartStore.setState(...)` from the checkout screen as a "quick little fix". At that point every rule in `cart-rules.ts` is bypassed, and nobody can claim the cart is always in a valid state any more.

### Screens must stay thin

The yardstick: **if a screen has complicated `if`s or arithmetic about money, that logic is in the wrong place.**

```tsx
// features/checkout/screens/CheckoutScreen.tsx — almost no logic
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

## 5. State management — the most important part

This app runs **two parallel state systems, one for each kind of data**. It is the single most important architectural decision here, and the place most RN codebases get it wrong.

### How to classify

| | **Server state** | **Client state** |
|---|---|---|
| Tool | TanStack Query | Zustand |
| Traits | The app **does not own it**; it can go stale | The app **owns it outright** |
| Examples in this repo | restaurants, menus, orders, vouchers, addresses | cart, session, checkout draft, pending transaction |
| What it needs | cache, refetch, retry, dedupe, invalidate | fast writes, instant feedback, works offline |

> **The most common mistake:** putting the restaurant list into a Zustand store. You end up reimplementing loading/error/cache/refetch/dedupe by hand — i.e. rewriting TanStack Query, but buggy.

### Server state: TanStack Query

Configured centrally in [`core/api/query-client.ts`](src/core/api/query-client.ts). Three decisions worth noting:

```ts
// 1. Only retry network/server errors. Retrying a 422 is pointless.
retry: (failureCount, error) => {
  if (error instanceof AppError && !error.isRetryable) return false;
  return failureCount < 2;
},

// 2. Mobile has no "window focus" like the web.
refetchOnWindowFocus: false,

// 3. NEVER auto-retry a mutation — placing an order twice costs real money.
mutations: { retry: false },
```

**Query key factory** ([`order.keys.ts`](src/features/order/api/order.keys.ts)) — never type a key array by hand:

```ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
```

**Conditional polling** ([`order.queries.ts`](src/features/order/api/order.queries.ts)) — a very useful technique for an order tracking screen:

```ts
refetchInterval: query => {
  const order = query.state.data;
  // Order in progress -> re-ask every 10s. Order finished -> stop entirely.
  return order && isActiveOrder(order) ? 10_000 : false;
},
```

A fixed number would burn battery and mobile data re-asking about an order that completed last week.

### Client state: Zustand

There are four stores in the app, and **their persistence decisions differ** — which is the most instructive part:

| Store | Persisted? | Why |
|---|---|---|
| [`cart.store`](src/features/cart/store/cart.store.ts) | ✅ MMKV | Losing the cart means re-picking every item |
| [`auth.store`](src/features/auth/store/auth.store.ts) | ✅ **encrypted** MMKV | Tokens do not share a partition with the cart |
| [`payment.store`](src/features/payment/store/payment.store.ts) | ✅ **MANDATORY** | See [section 8](#8-the-payment-flow--the-hardest-part-on-mobile) — money is involved |
| [`checkout.store`](src/features/checkout/store/checkout.store.ts) | ❌ | The voucher may have expired and the payment method may no longer be valid. Restoring an old choice only causes confusion |

> **The rule of thumb:** only persist what would annoy the user to lose **or** what would corrupt data if lost. Persisting everything "just in case" creates its own class of stale-data bugs.

### The store contains almost no logic

```ts
// cart.store.ts — each action calls one pure function and saves the result
add: input => set({cart: rules.addLine(get().cart, input)}),
remove: lineId => set(state => ({cart: rules.removeLine(state.cart, lineId)})),
```

All of the rules live in [`cart-rules.ts`](src/features/cart/model/cart-rules.ts) — pure functions, which is why there are **15 tests** for the cart that run in milliseconds without standing up zustand or rendering anything.

### ⚠️ Primitive selectors — a small detail with a large effect

```ts
// ✅ RIGHT — returns a number. Object.is compares it correctly.
export const selectItemCount = (state: CartState): number => rules.countItems(state.cart);
useCartStore(selectItemCount);

// ❌ WRONG — builds a NEW object on every render
useCartStore(s => ({count: ..., total: ...}));
```

Zustand compares with `Object.is`. A selector returning a new object is always different ⇒ a re-render on **every** store change. With the cart badge visible on every screen, that mistake re-renders the whole app each time the user types a character into a note.

When you need several fields, use `useShallow` ([`use-auth.ts`](src/features/auth/hooks/use-auth.ts)).

### Joining the two kinds of state

A pattern used again and again — [`use-delivery-address.ts`](src/features/address/hooks/use-delivery-address.ts):

```ts
// Zustand holds "which id is selected", TanStack Query holds the real content
const {data: addresses} = useAddresses();                    // server state
const selectedId = useSelectedAddressStore(s => s.selectedAddressId); // client state

// Handles the case where the selected id no longer exists
return chosen ?? addresses.find(a => a.isDefault) ?? addresses[0] ?? null;
```

**Store only the ID, not the whole object.** If you stored the whole object, a user who edits the address on the web and comes back would see the old address forever — because nothing refreshes the copy in the store.

### Local state is still `useState`

Not everything needs a store. The text being typed into the search box, the toppings half-selected on the item detail screen — things that only live inside one screen belong in `useState`. Putting them in a global store just means remembering to clean them up, and they leak into the next time you open it.

---

## 6. Mock API & dummy data

The entire backend is simulated **inside the app**, in [`core/api/mock/`](src/core/api/mock/).

### Switching to a real backend = changing 1 line

```ts
// core/config/env.ts
useMockApi: false,   // ← done. No feature file changes.
```

A feature only knows `http.get('/restaurants')`. It has no idea where the data comes from.

### What the mock server has that a static JSON file does not

| | |
|---|---|
| **Network latency** | A random 250–700ms → skeletons and loading states get genuinely exercised |
| **HTTP error codes** | 404 / 409 / 422 → `ErrorView`, retry and the failure branches all run |
| **Mutable state** | Place an order and it shows up in the history |
| **Real business logic** | Idempotency, voucher checks, blocking sold-out items, minimum order |
| **Order lifecycle** | Orders advance themselves `CONFIRMED → PREPARING → DELIVERING → COMPLETED`, one step every 45 seconds |

### Sample data

6 restaurants (one of them **paused for new orders**), 11 dishes with required and optional option groups (one of them **sold out**), 4 vouchers (PERCENT with a cap / FIXED / FREESHIP / **expired**), 2 delivery addresses.

The edge cases are seeded on purpose — so you can see how the UI handles them without building the data yourself.

### The server is the source of truth for money

[`handlers.ts`](src/core/api/mock/handlers.ts) **recomputes every price** from `menuItemId` + `optionIds` and does not trust the numbers the client sends:

```ts
const unitPrice = menuItem.basePrice + selected.reduce((s, o) => s + o.priceDelta, 0);
```

If you trusted the client, anyone editing the request could buy a pizza for 0đ.

The client **still** computes in parallel in [`calc-order-total.ts`](src/features/checkout/model/calc-order-total.ts) — the duplication is **deliberate**, so the total updates the moment a voucher is toggled instead of waiting for a 300ms round trip. When the two disagree, **the server's numbers win** ([`use-checkout-draft.ts`](src/features/checkout/hooks/use-checkout-draft.ts)).

### DTO ≠ domain model

[`core/api/contracts.ts`](src/core/api/contracts.ts) declares the server's JSON shapes (in a real project this file would be generated from OpenAPI). Every feature has a mapper translating them into its own model:

```ts
// features/restaurant/api/restaurant.api.ts
const toRestaurant = (dto: RestaurantDto): Restaurant => ({
  id: asId<RestaurantId>(dto.id),          // string  -> branded RestaurantId
  deliveryFee: money(dto.deliveryFee),     // number  -> branded Money
  ...
});
```

It sounds like boilerplate, but it buys you three things: when the backend renames a field you fix **1 mapper** instead of 30 components; the app gets tighter types than the server; and you can merge or drop fields to suit the UI without asking backend to change the API.

### `Money` is a branded type

```ts
export type Money = number & {readonly __brand: 'Money'};
export const money = (amount: number): Money => {
  if (!Number.isInteger(amount)) throw new Error(...);  // fail-fast
  return amount as Money;
};
```

Money is stored as **integer VND**. `0.1 + 0.2 !== 0.3` in JS — with money, that rounding error turns into reconciliation mismatches and customer complaints. The branded type stops `Money` being mixed up with a plain `number` by accident, and it costs **0 bytes** at runtime (the type is erased at compile time).

---

## 7. How features talk to each other

### Option A — Synchronous, needs data: import through the public API

```ts
// features/checkout/hooks/use-checkout-draft.ts
import {useCart}            from '@features/cart';
import {useDeliveryAddress} from '@features/address';
import {useRestaurant}      from '@features/restaurant';
import {calcDiscount}       from '@features/promotion';
import {usePlaceOrder}      from '@features/order';
```

`checkout` depends on 5 features — **normal and correct**, because checkout exists precisely to join them together. The reverse is never allowed: `cart` must not import `checkout`.

### Option B — Asynchronous, several interested parties: the event bus

All of the wiring lives in **one single file**: [`app/bootstrap/register-event-handlers.ts`](src/app/bootstrap/register-event-handlers.ts).

```ts
appEventBus.on('order:placed', ({orderId, orderCode}) => {
  clearCart();              // ← the cart is cleared HERE
  resetCheckoutDraft();
  queryClient.invalidateQueries({queryKey: orderKeys.lists()});
});

appEventBus.on('auth:logged-out', () => {
  clearCart();
  resetCheckoutDraft();
  resetSelectedAddress();
  queryClient.clear();      // ← forget this and the next user sees the previous user's orders
});
```

Notice what does **NOT** happen inside the features:

- `payment` does not call `cart.clear()`. It only emits `'payment:succeeded'`.
- `auth` does not call `resetCheckoutDraft()`. It only emits `'auth:logged-out'`.
- `order` does not know who cares about a new order.

The result: any feature can be **deleted** without breaking the others. Want new behaviour when a payment succeeds (analytics, a rating prompt, loyalty points)? Add a line to this file. Do not touch `payment`.

**The trade-off to know about:** the flow is harder to trace than a direct call — you cannot "Go to definition" from the emitter to the handler. That is why the number of events must stay **small** (6 of them) and all of them live in one file.

Naming convention: `'<feature>:<what happened, in the past tense>'`. The past tense matters — an event describes **a fact that happened**, not a command. `'payment:succeeded'` is right; `'clearCart'` is wrong (that is a command, and it forces payment to know cart exists).

### Option C — Dependency inversion

`http-client` (core) needs the token, but **core may not import a feature**. The solution is in [`core/api/auth-token.ts`](src/core/api/auth-token.ts):

```ts
// core defines the "socket"
export const authTokenBridge = {
  setTokenProvider(next: () => string | null) { provider = next; },
  getToken: () => provider(),
};

// app/bootstrap plugs the feature in — only app/ is allowed to know about both
authTokenBridge.setTokenProvider(getAccessToken);
authTokenBridge.setUnauthorizedHandler(forceLogout);
```

### Avoiding dependency cycles

`restaurant` → `menu` (the restaurant detail screen embeds `<MenuSectionList/>`). So `menu` **must not** import `restaurant`. The restaurant name that `menu` needs is passed through a **route param**:

```ts
// features/menu/navigation/menu.routes.ts
[MENU_ROUTES.ItemDetail]: {
  itemId: string;
  restaurantId: string;
  restaurantName: string;  // ← passed in, not fetched from the restaurant feature
};
```

Likewise, the **voucher picker** screen belongs to `checkout` rather than `promotion` — because it writes into the checkout store. Putting it in `promotion` would create a backwards dependency.

### Navigation: each feature declares its own routes

```ts
// features/order/navigation/order.routes.ts
export type OrderStackParamList = {
  OrderDetail: {orderId: string; highlightPayment?: boolean};
};

// app/navigation/types.ts — only JOINS them
export type RootStackParamList =
  & AuthStackParamList & RestaurantStackParamList & MenuStackParamList
  & CartStackParamList & CheckoutStackParamList & AddressStackParamList
  & PaymentStackParamList & OrderStackParamList;
```

Adding a new screen **requires no edit to a central type file** — declare it in the feature and it shows up here automatically.

**Global type augmentation** unties the "a feature may not import app/" knot:

```ts
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

Thanks to it, `useNavigation()` **with no type argument** is still fully typed everywhere inside a feature.

---

## 8. The payment flow — the hardest part on mobile

This is why `payment` has to be its own feature with a persisted store, rather than a few lines inside `CheckoutScreen`.

### The problem

When the user taps pay with MoMo, **the app is pushed to the background**. Android on a low-RAM device **kills the app** while they are away fairly often. When they come back, the app starts **from scratch** — all in-memory state is gone.

Without persistence: the app opens blank, unaware that a transaction is pending. The user has been charged but the app shows the cart as if nothing happened.

### Three ways back into the app

[`use-payment-return.ts`](src/features/payment/hooks/use-payment-return.ts) handles all three. Missing any one of them leaves a group of users stuck on the "processing" screen forever:

| # | Route | When | Signal |
|---|---|---|---|
| 1 | **Deep link** | The user taps "Quay lại ứng dụng" inside MoMo | `foodgo://payment/return` |
| 2 | **Foreground** | The user presses Back themselves, or switches apps via the multitasker | `AppState → 'active'` |
| 3 | **Cold start** | The OS killed the app while it was backgrounded | `pendingIntentId` read from disk |

### The order that must not change

```ts
// use-pay.ts
setPending({intentId, orderId});   // ⭐ WRITE TO DISK FIRST
const result = await provider.pay(intent);   // ← may leave the app IMMEDIATELY
```

`provider.pay()` calls `Linking.openURL()` and the app leaves right away. Written afterwards, that line may never run.

> **The general rule:** anything that has to survive leaving the app must be written to disk **before** leaving.

### The server is the source of truth, always

```ts
// Never trust the deep link's parameters —
// anyone can type foodgo://payment/return?status=success into a browser.
for (let attempt = 0; attempt < 8; attempt++) {
  const intent = await paymentApi.getIntent(intentId);
  if (intent.status === 'PAID') { ... }
  await sleep(1500);
}
```

Ask **repeatedly**: the gateway's webhook to the backend can arrive a few seconds later than the user returns to the app. Asking once and concluding "failed" is the classic mistake.

Out of attempts and still `PENDING`? **Do not clear** `pendingIntentId` — keep it so the next app launch can ask again. Better to ask redundantly than to lose track of someone's money.

### Blocking back during payment

[`use-back-handler-guard.ts`](src/features/payment/hooks/use-back-handler-guard.ts) blocks **both** mechanisms — forget one and the user can still escape:

```ts
BackHandler.addEventListener('hardwareBackPress', () => true);  // Android
navigation.addListener('beforeRemove', e => e.preventDefault()); // swipe/header
```

### Adding a new gateway = adding 1 folder

```
providers/
├── provider.types.ts    # ⭐ the shared interface
├── momo/                # redirects to another app
├── vnpay/               # opens a browser
├── card/                # a sheet inside the app (Stripe)
└── cod/                 # Null Object — nothing to open
```

```ts
const PROVIDERS: Record<PaymentMethod, PaymentProvider> = {...};
```

`Record` rather than a plain object: add a value to the `PaymentMethod` union and forget to write its provider and **TypeScript fails the build**. The compiler does the review for you.

Note `cod.provider.ts` — an "empty provider". Cash has no gateway at all, but we still give it a provider instead of writing `if (method === 'COD')` in the checkout screen. The result: **every method goes down the same code path**, with no special branch left unhandled.

### Trying the flow in the demo

The `PaymentProcessing` screen has a **🧪 simulation** area with "succeed" / "fail" buttons. They stand in for confirming inside the MoMo app. In production the result reaches the backend via a webhook — the app has **no** endpoint for telling it "I have paid".

Testing a real deep link without a payment gateway:

```bash
xcrun simctl openurl booted "foodgo://payment/return"                  # iOS
adb shell am start -a android.intent.action.VIEW -d "foodgo://payment/return"  # Android
```

---

## 9. Adding a new feature

Say you are adding `review` (rating an order):

```bash
mkdir -p src/features/review/{model/__tests__,api,components,screens,navigation}
```

1. **`model/`** first — types + business rules, with tests written alongside.
   ```ts
   export const canReviewOrder = (order: {status: string; reviewedAt: string | null}) =>
     order.status === 'COMPLETED' && order.reviewedAt === null;
   ```
2. **`api/`** — add the DTO to `core/api/contracts.ts` and the route to `mock/handlers.ts`, then write the mapper + query key factory + query hook.
3. **`navigation/review.routes.ts`** — route names + `ReviewStackParamList`.
4. **`components/` + `screens/`** — thin UI.
5. **`index.ts`** — export **as little as possible**. The default is to export nothing; open it up only when another feature genuinely needs something.
6. Add `ReviewStackParamList` to `app/navigation/types.ts` and register the screen in `RootNavigator`.
7. If it needs to react to events: add a handler to `app/bootstrap/register-event-handlers.ts`.
8. `npm run arch:check && npm run typecheck && npm test`.

### Code review checklist

- [ ] Any business `if` or money arithmetic sitting in `screens/`? → move it into `model/`
- [ ] Does `model/` import React/RN? → `npm run arch:check` will catch it
- [ ] Does `index.ts` export a store? → almost always wrong
- [ ] Any `@features/x/...` (deep path) imports? → they must go through `@features/x`
- [ ] Is the new store persisted? If so, does it set `version` + `migrate`?
- [ ] Does a selector return a new object on every render? → use a primitive selector or `useShallow`

---

## 10. Testing

```bash
npm test
```

**74 tests, 8 suites, running in ~0.4 seconds** — because they all test pure functions in `model/` and render no components.

| Suite | Tests | Covers |
|---|---|---|
| `cart-rules` | 15 | merging duplicate lines, option order, switching restaurant, removing the last line |
| `voucher-rules` | 13 | the discount cap, expiry, wrong restaurant, never discounting past the item total |
| `validate-options` | 11 | required groups, maxSelect, not mutating the input |
| `checkout` | 10 | non-negative totals, blocker priority order, the shortfall amount |
| `order-rules` | 9 | cancellation rules, order classification, estimated delivery time |
| `availability` | 9 | overnight opening, the open/close boundaries, being paused |
| `calc-item-price` | 8 | adding toppings, unknown options, invalid quantities |
| `payment-method.registry` | 5 | the COD limit, switching method automatically when it is exceeded |

### The trick that keeps tests from being flaky

Every time-dependent function takes `now` as a **parameter** instead of calling `Date.now()` inside:

```ts
export const getAvailability = (restaurant, now: Date = new Date()) => {...}
```

That lets the tests cover "open overnight, at 1am" without mocking the system clock, and keeps them from turning red after a holiday.

---

## 11. What is deliberately missing

This repo focuses on **architecture and business flows**, so the following are intentionally left out:

| Missing | Notes |
|---|---|
| The `android/` and `ios/` folders | See [section 1](#1-running-it) for grafting it onto a fresh RN project. **Never run on a real device or simulator** — verified with `tsc`, `jest` and `depcruise` |
| Real-time driver tracking | Would be its own `order-tracking` feature: WebSocket + a map. Kept out of `order` because its nature is completely different |
| Push notifications | A `notification` feature with `services/push-handler.ts`; the **routing by payload** part belongs to the feature, not to `core` |
| Advanced search | Currently filtered on the client. A separate `search` feature is warranted once there are suggestions + history |
| Reviews, wallet, loyalty points | Same template — see [section 9](#9-adding-a-new-feature) |
| An offline mutation queue | `core/network/offline-queue.ts`. Today `cart` already works fully offline, but placing an order needs the network |
| Dark mode | The colour tokens are already centralised in `shared/theme/colors.ts`, so it only needs a second palette |
| Component tests | Deliberate: `model/` tests give the most value per second of runtime. The sensible next step is E2E with Maestro for the ordering flow |

---

## If your app is still small

**Do not build all 7 subfolders for every feature on day one.** Start lean:

```
features/cart/
├── api.ts
├── cart.store.ts
├── use-cart.ts
├── CartScreen.tsx
└── index.ts
```

and split things out as the feature grows. The folder structure should **keep up with** complexity, not run ahead of it.

The one thing to take seriously from day one is **`index.ts` + a rule blocking cross-feature deep imports**. With it, every later split is just moving files inside one folder; without it, in six months you will have a tangle of imports nobody can unpick.
