import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import {Button, Card, Screen, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {useBackHandlerGuard} from '../hooks/use-back-handler-guard';
import {usePaymentReturn} from '../hooks/use-payment-return';
import {paymentApi} from '../api/payment.api';
import type {PaymentStackParamList} from '../navigation/payment.routes';

type ProcessingRoute = RouteProp<PaymentStackParamList, 'PaymentProcessing'>;

/**
 * MÀN HÌNH CHỜ KẾT QUẢ THANH TOÁN.
 *
 * Màn hình này tồn tại chính là vì trên mobile, người dùng RỜI APP giữa
 * chừng. Nó phải xử lý được cả khi bị mở lại từ con số không sau khi hệ
 * điều hành giết app.
 *
 * Ba nguyên tắc:
 *  1. KHÔNG cho vuốt back / bấm back khi đang chờ — user thoát ra giữa
 *     chừng là mất dấu giao dịch.
 *  2. Luôn có lối thoát thủ công ("Tôi đã thanh toán xong") phòng khi
 *     webhook về chậm hoặc deep link không bắn.
 *  3. Không bao giờ tự kết luận thành công ở phía client.
 */
export function PaymentProcessingScreen() {
  const navigation = useNavigation();
  const {params} = useRoute<ProcessingRoute>();

  const {status, verifyNow, abandon} = usePaymentReturn({
    onResolved: ({success, orderId}) => {
      // Thay thế màn hình hiện tại để nút back không quay lại đây được nữa.
      navigation.reset({
        index: 0,
        routes: [
          {name: 'MainTabs'},
          {name: 'OrderDetail', params: {orderId, highlightPayment: !success}},
        ],
      });
    },
  });

  const isWaiting = status === 'redirected' || status === 'verifying' || status === 'idle';
  useBackHandlerGuard(isWaiting);

  return (
    <Screen>
      <View style={styles.root}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Txt variant="h2" style={styles.title}>
          {status === 'verifying' ? 'Đang xác minh giao dịch' : 'Đang chờ thanh toán'}
        </Txt>

        <Txt variant="caption" style={styles.description}>
          Đơn {params.orderCode} · Vui lòng hoàn tất thanh toán trên ứng dụng
          ngân hàng/ví, rồi quay lại đây.
        </Txt>

        <Card style={styles.demoCard}>
          <Txt variant="bodyStrong">🧪 Khu vực mô phỏng (chỉ có trong demo)</Txt>
          <Txt variant="tiny" style={styles.demoNote}>
            Trong app thật, hai nút này chính là việc bạn bấm xác nhận bên
            trong app MoMo. Kết quả về backend qua webhook, không qua app này.
          </Txt>
          <View style={styles.demoButtons}>
            <Button
              title="Mô phỏng: thành công"
              size="sm"
              onPress={async () => {
                await paymentApi.simulateGateway(params.intentId, 'success');
                void verifyNow();
              }}
              testID="simulate-payment-success"
            />
            <Button
              title="Mô phỏng: thất bại"
              size="sm"
              variant="secondary"
              onPress={async () => {
                await paymentApi.simulateGateway(params.intentId, 'failure');
                void verifyNow();
              }}
              testID="simulate-payment-failure"
            />
          </View>
        </Card>

        <Button
          title="Tôi đã thanh toán xong"
          variant="secondary"
          onPress={() => void verifyNow()}
          style={styles.action}
        />

        <Button
          title="Huỷ thanh toán"
          variant="ghost"
          onPress={() => {
            abandon();
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {marginTop: spacing.lg, textAlign: 'center'},
  description: {textAlign: 'center'},
  demoCard: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  demoNote: {lineHeight: 16},
  demoButtons: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs},
  action: {marginTop: spacing.lg, alignSelf: 'stretch'},
});
