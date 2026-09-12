import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Skeleton} from '@shared/ui';
import {radius, spacing} from '@shared/theme';

/**
 * A skeleton must MIRROR the real layout (150px image, 3 lines of text).
 * Draw it roughly and the real content will make the layout jump — which feels
 * worse than showing a spinner.
 */
export function RestaurantListSkeleton({count = 4}: {count?: number}) {
  return (
    <View style={styles.list}>
      {Array.from({length: count}).map((_, index) => (
        <View key={index} style={styles.card}>
          <Skeleton height={150} style={styles.cover} />
          <View style={styles.body}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="45%" height={13} />
            <Skeleton width="60%" height={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {gap: spacing.md, padding: spacing.lg},
  card: {borderRadius: radius.lg, overflow: 'hidden'},
  cover: {borderRadius: 0},
  body: {padding: spacing.md, gap: spacing.sm},
});
