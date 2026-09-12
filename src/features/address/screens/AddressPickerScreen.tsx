import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {EmptyState, ErrorView, Screen, Skeleton} from '@shared/ui';
import {spacing} from '@shared/theme';
import {useDeliveryAddress} from '../hooks/use-delivery-address';
import {AddressRow} from '../components/AddressRow';

export function AddressPickerScreen() {
  const navigation = useNavigation();
  const {addresses, address, isPending, error, refetch, select} =
    useDeliveryAddress();

  if (isPending) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.list}>
          {Array.from({length: 3}).map((_, i) => (
            <Skeleton key={i} height={84} />
          ))}
        </ScrollView>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  if (addresses.length === 0) {
    return (
      <Screen>
        <EmptyState emoji="📍" title="Chưa có địa chỉ nào" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list}>
        {addresses.map(item => (
          <AddressRow
            key={item.id}
            address={item}
            selected={address?.id === item.id}
            onPress={() => {
              select(item.id);
              navigation.goBack();
            }}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {padding: spacing.lg, gap: spacing.md},
});
