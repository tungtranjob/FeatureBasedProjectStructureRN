import type {NavigatorScreenParams} from '@react-navigation/native';
import type {AuthStackParamList} from '@features/auth';
import type {RestaurantStackParamList} from '@features/restaurant';
import type {MenuStackParamList} from '@features/menu';
import type {CartStackParamList} from '@features/cart';
import type {CheckoutStackParamList} from '@features/checkout';
import type {AddressStackParamList} from '@features/address';
import type {PaymentStackParamList} from '@features/payment';
import type {OrderStackParamList} from '@features/order';

/**
 * ⭐ HỢP NHẤT PARAM LIST CỦA TẤT CẢ FEATURE.
 *
 * Mỗi feature khai báo ParamList của riêng nó, ngay cạnh màn hình mà nó sở
 * hữu. File này chỉ GHÉP lại bằng phép giao (&).
 *
 * Lợi ích: thêm một màn hình mới KHÔNG cần sửa file type tập trung nào cả.
 * Bạn khai báo trong feature, và nó tự có mặt ở đây. Đây là khác biệt lớn
 * so với cách gõ tay toàn bộ ParamList vào một file — cách đó biến file
 * type thành điểm nghẽn merge conflict cho cả team.
 */
export type MainTabParamList = {
  Home: undefined;
  OrderList: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
} & AuthStackParamList &
  RestaurantStackParamList &
  MenuStackParamList &
  CartStackParamList &
  CheckoutStackParamList &
  AddressStackParamList &
  PaymentStackParamList &
  OrderStackParamList;

/**
 * ⭐ GLOBAL TYPE AUGMENTATION — mẹo quan trọng cho feature-first.
 *
 * Khai báo này khiến `useNavigation()` KHÔNG THAM SỐ cũng có kiểu đầy đủ ở
 * mọi nơi trong app.
 *
 * Vì sao cần: feature KHÔNG được import từ app/ (dependency-cruiser chặn).
 * Nếu không có augmentation, mỗi màn hình trong feature sẽ phải viết
 * `useNavigation<NativeStackNavigationProp<RootStackParamList>>()` — mà
 * RootStackParamList thì nằm trong app/. Bế tắc.
 *
 * Augmentation gỡ nút thắt đó: kiểu được "tiêm" vào toàn cục, feature chỉ
 * cần gọi `useNavigation()` và vẫn được kiểm tra kiểu đầy đủ.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
