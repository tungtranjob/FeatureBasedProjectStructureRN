import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Skeleton} from '@shared/ui';
import {radius, spacing} from '@shared/theme';

/**
 * Skeleton phải MÔ PHỎNG ĐÚNG bố cục thật (ảnh 150px, 3 dòng chữ).
 * Nếu vẽ đại, nội dung thật xuất hiện sẽ làm layout nhảy — cảm giác còn
 * tệ hơn là hiện spinner.
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
