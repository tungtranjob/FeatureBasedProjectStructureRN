import {Platform} from 'react-native';

/**
 * Đọc nền tảng hiện tại.
 *
 * File này nằm ở lib/ chứ KHÔNG nằm ở model/, và đó là cả một bài học:
 * dependency-cruiser đã bắt được lỗi khi Platform bị import thẳng vào
 * model/payment-method.registry.ts (rule "model-must-be-pure").
 *
 * Vì sao đáng bận tâm: model/ phải là hàm thuần, nhận mọi thứ qua tham số.
 * Một khi nó đọc trạng thái toàn cục như Platform.OS, bạn không còn test
 * được nhánh iOS trên máy chạy Android nữa — và test đó chính là thứ bắt
 * được lỗi "Apple Pay hiện trên Android".
 *
 * Giải pháp: model nhận `platform` làm THAM SỐ BẮT BUỘC; tầng gọi (hook,
 * component) mới là nơi đọc giá trị thật từ hệ điều hành.
 */
export type AppPlatform = 'ios' | 'android';

export const getCurrentPlatform = (): AppPlatform =>
  Platform.OS === 'ios' ? 'ios' : 'android';
