import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge, Card, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatFullAddress, type DeliveryAddress} from '../model/types';

interface AddressRowProps {
  address: DeliveryAddress;
  selected: boolean;
  onPress: () => void;
}

export function AddressRow({address, selected, onPress}: AddressRowProps) {
  return (
    <Card
      onPress={onPress}
      testID={`address-${address.id}`}
      style={[styles.card, selected && styles.selected]}>
      <View style={styles.header}>
        <Txt variant="bodyStrong">{address.label}</Txt>
        {address.isDefault && <Badge label="Mặc định" />}
        {selected && (
          <Txt variant="bodyStrong" color={colors.primary} style={styles.check}>
            ✓
          </Txt>
        )}
      </View>
      <Txt variant="caption">{formatFullAddress(address)}</Txt>
      <Txt variant="tiny">
        {address.recipientName} · {address.phone}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {gap: 2},
  header: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  check: {marginLeft: 'auto'},
  selected: {borderColor: colors.primary, backgroundColor: colors.primarySoft},
});
