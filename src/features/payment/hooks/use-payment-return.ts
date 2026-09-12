import {useCallback, useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {appEventBus} from '@core/events/app-event-bus';
import {logger} from '@core/logger/logger';
import {useAppState} from '@shared/hooks/use-app-state';
import {sleep} from '@shared/lib/sleep';
import {paymentApi} from '../api/payment.api';
import {usePaymentStore} from '../store/payment.store';
import type {PaymentFlowStatus} from '../model/types';

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 8;

/**
 * ⭐⭐⭐ HOOK QUAN TRỌNG NHẤT CỦA FEATURE PAYMENT.
 *
 * Nó xử lý câu hỏi: "người dùng vừa quay lại từ app MoMo — họ đã trả tiền chưa?"
 *
 * Cái bẫy lớn nhất với người mới làm mobile payment: tưởng rằng CHỈ CÓ MỘT
 * đường quay lại (deep link). Thực tế có BA, và bỏ sót đường nào cũng để lại
 * một nhóm người dùng mắc kẹt ở màn hình "đang xử lý" vĩnh viễn:
 *
 *   1. DEEP LINK — foodgo://payment/return.
 *      Đường đẹp nhất. Xảy ra khi user bấm "Quay lại ứng dụng" trong MoMo.
 *
 *   2. APP QUAY LẠI FOREGROUND — không có deep link nào cả.
 *      Xảy ra khi user tự bấm nút Back của máy, hoặc chuyển app bằng
 *      multitask. Rất phổ biến. Chỉ có sự kiện AppState 'active'.
 *
 *   3. COLD START — app đã bị hệ điều hành GIẾT khi ở nền.
 *      Không deep link, không AppState change. App khởi động lại từ đầu và
 *      manh mối duy nhất là pendingIntentId đã persist xuống đĩa.
 *
 * Trong cả ba đường, SERVER LÀ NGUỒN SỰ THẬT. Ta không bao giờ tin tham số
 * trên deep link (ai cũng gõ được `foodgo://payment/return?status=success`
 * vào trình duyệt) — ta chỉ dùng nó làm tín hiệu để đi HỎI server.
 */
export function usePaymentReturn(options?: {
  onResolved?: (result: {success: boolean; orderId: string}) => void;
}) {
  const pendingIntentId = usePaymentStore(state => state.pendingIntentId);
  const pendingOrderId = usePaymentStore(state => state.pendingOrderId);
  const clearPending = usePaymentStore(state => state.clearPending);

  const [status, setStatus] = useState<PaymentFlowStatus>('idle');

  // Chặn hai lần verify chạy chồng nhau. Rất dễ xảy ra: deep link và
  // AppState 'active' thường bắn gần như đồng thời.
  const isVerifying = useRef(false);
  const onResolvedRef = useRef(options?.onResolved);
  onResolvedRef.current = options?.onResolved;

  const verify = useCallback(async () => {
    const intentId = usePaymentStore.getState().pendingIntentId;
    const orderId = usePaymentStore.getState().pendingOrderId;

    if (!intentId || !orderId || isVerifying.current) {
      return;
    }

    isVerifying.current = true;
    setStatus('verifying');
    logger.info('Payment', `Đang xác minh giao dịch ${intentId}`);

    try {
      /**
       * Hỏi lại nhiều lần: webhook từ cổng thanh toán tới backend có thể
       * chậm hơn việc người dùng quay lại app vài giây. Hỏi một lần rồi kết
       * luận "thất bại" là sai lầm kinh điển.
       */
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
        const intent = await paymentApi.getIntent(intentId);

        if (intent.status === 'PAID') {
          clearPending();
          setStatus('succeeded');
          appEventBus.emit('payment:succeeded', {
            orderId,
            paymentIntentId: intentId,
          });
          onResolvedRef.current?.({success: true, orderId});
          return;
        }

        if (intent.status === 'FAILED') {
          clearPending();
          setStatus('failed');
          appEventBus.emit('payment:failed', {
            orderId,
            reason: 'Giao dịch bị từ chối',
          });
          onResolvedRef.current?.({success: false, orderId});
          return;
        }

        await sleep(POLL_INTERVAL_MS);
      }

      /**
       * Hết lượt hỏi mà vẫn PENDING. KHÔNG được xoá pendingIntentId ở đây:
       * giao dịch có thể vẫn đang được xử lý. Cứ giữ lại để lần sau mở app
       * còn hỏi tiếp. Thà hỏi thừa còn hơn để mất dấu một khoản tiền.
       */
      setStatus('redirected');
      logger.warn('Payment', 'Hết thời gian chờ, giữ giao dịch để hỏi lại sau');
    } catch (error) {
      logger.error('Payment', 'Xác minh thất bại', error);
      setStatus('redirected'); // lỗi mạng -> vẫn giữ pending
    } finally {
      isVerifying.current = false;
    }
  }, [clearPending]);

  /* --- Đường 1: deep link --- */
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      if (url.includes('/payment/return')) {
        logger.info('Payment', `Nhận deep link: ${url}`);
        void verify();
      }
    });
    return () => subscription.remove();
  }, [verify]);

  /* --- Đường 2: app quay lại foreground --- */
  useAppState((next, previous) => {
    if (next === 'active' && previous !== 'active' && pendingIntentId) {
      void verify();
    }
  });

  /* --- Đường 3: cold start sau khi app bị giết --- */
  useEffect(() => {
    if (pendingIntentId) {
      void verify();
    }
    // Cố tình chỉ chạy một lần lúc mount: đây là nhánh "khởi động lại".
    // Các lần sau đã có đường 1 và 2 lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    pendingIntentId,
    pendingOrderId,
    /** Cho phép màn hình chủ động kiểm tra lại (nút "Tôi đã thanh toán"). */
    verifyNow: verify,
    /** Người dùng bỏ cuộc — huỷ theo dõi giao dịch này. */
    abandon: () => {
      clearPending();
      setStatus('idle');
      if (pendingOrderId) {
        appEventBus.emit('payment:cancelled', {orderId: pendingOrderId});
      }
    },
  };
}
