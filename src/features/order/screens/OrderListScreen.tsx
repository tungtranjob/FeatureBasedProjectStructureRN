import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {EmptyState, ErrorView, Screen, Skeleton, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {useOrders} from '../api/order.queries';
import {isActiveOrder} from '../model/order-rules';
import {OrderCard} from '../components/OrderCard';
import {ORDER_ROUTES} from '../navigation/order.routes';

type Tab = 'active' | 'history';

export function OrderListScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>('active');
  const {data, isPending, error, refetch, isRefetching} = useOrders();

  /**
   * Filtering on the CLIENT rather than calling two different endpoints.
   *
   * Reasonable here because one user's order list is usually small (a few dozen).
   * With thousands of orders it would have to be filtered server-side — but do not
   * optimise prematurely.
   *
   * useMemo so we do not re-filter on every render (e.g. when switching tabs).
   */
  const orders = useMemo(() => {
    if (!data) {
      return [];
    }
    return tab === 'active' ? data.filter(isActiveOrder) : data.filter(o => !isActiveOrder(o));
  }, [data, tab]);

  return (
    <Screen edgeBottom={false}>
      <View style={styles.header}>
        <Txt variant="h2">Đơn hàng của tôi</Txt>
        <View style={styles.tabs}>
          <TabButton
            label="Đang đến"
            active={tab === 'active'}
            onPress={() => setTab('active')}
          />
          <TabButton
            label="Lịch sử"
            active={tab === 'history'}
            onPress={() => setTab('history')}
          />
        </View>
      </View>

      {isPending ? (
        <View style={styles.skeleton}>
          {Array.from({length: 3}).map((_, i) => (
            <Skeleton key={i} height={88} />
          ))}
        </View>
      ) : error ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              emoji={tab === 'active' ? '🛵' : '📋'}
              title={tab === 'active' ? 'Chưa có đơn nào đang đến' : 'Chưa có đơn nào'}
              description="Đặt món đầu tiên của bạn nhé."
            />
          }
          renderItem={({item}) => (
            <OrderCard
              order={item}
              onPress={() =>
                navigation.navigate(ORDER_ROUTES.OrderDetail, {orderId: item.id})
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}>
      <Txt
        variant="bodyStrong"
        color={active ? colors.textInverse : colors.textMuted}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  tabs: {flexDirection: 'row', gap: spacing.sm},
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  tabActive: {backgroundColor: colors.primary},
  list: {padding: spacing.lg, gap: spacing.md},
  skeleton: {padding: spacing.lg, gap: spacing.md},
});
