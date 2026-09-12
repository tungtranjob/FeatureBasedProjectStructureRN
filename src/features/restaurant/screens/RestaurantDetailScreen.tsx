import React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {Badge, Divider, ErrorView, Screen, Skeleton, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatCurrency, formatDistance, formatEta, formatRating} from '@shared/lib/format';
import {CartFab} from '@features/cart';
// restaurant does NOT know how menu is implemented — only that there is a component
// that takes a restaurantId and handles the rest itself.
import {MenuSectionList} from '@features/menu';
import {useRestaurant} from '../api/restaurant.queries';
import {AVAILABILITY_LABEL, getAvailability} from '../model/availability';
import type {RestaurantStackParamList} from '../navigation/restaurant.routes';

type DetailRoute = RouteProp<RestaurantStackParamList, 'RestaurantDetail'>;

/**
 * This screen is a textbook example of COMPOSITION between features:
 * the header is drawn by `restaurant`, the menu by `menu`, and the cart button by
 * `cart`. Each handles its own data; nobody drills props through layers.
 */
export function RestaurantDetailScreen() {
  const {params} = useRoute<DetailRoute>();
  const {data: restaurant, isPending, error, refetch} = useRestaurant(params.restaurantId);

  if (isPending) {
    return (
      <Screen>
        <Skeleton height={200} style={styles.flatSkeleton} />
        <View style={styles.skeletonBody}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={14} />
          <Skeleton width="80%" height={14} />
        </View>
      </Screen>
    );
  }

  if (error || !restaurant) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const availability = getAvailability(restaurant);

  return (
    <Screen edgeBottom={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{uri: restaurant.coverImageUrl}} style={styles.cover} />

        <View style={styles.header}>
          <Txt variant="h1">{restaurant.name}</Txt>
          <Txt variant="caption">{restaurant.cuisines.join(' · ')}</Txt>

          <View style={styles.metaRow}>
            <Txt variant="caption" color={colors.warning}>
              ★ {formatRating(restaurant.rating)} ({restaurant.ratingCount})
            </Txt>
            <Txt variant="caption">· {formatDistance(restaurant.distanceKm)}</Txt>
            <Txt variant="caption">· {formatEta(restaurant.etaMinutes)}</Txt>
          </View>

          <Badge
            label={AVAILABILITY_LABEL[availability]}
            color={availability === 'open' ? colors.success : colors.danger}
            background={availability === 'open' ? '#E8F8F0' : '#FDECEA'}
          />

          <Txt variant="tiny">
            Phí giao {formatCurrency(restaurant.deliveryFee)} · Đơn tối thiểu{' '}
            {formatCurrency(restaurant.minOrderAmount)}
          </Txt>
        </View>

        <Divider />

        <MenuSectionList
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          canOrder={availability === 'open'}
        />
      </ScrollView>

      <CartFab />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 140},
  cover: {width: '100%', height: 200, backgroundColor: colors.surfaceAlt},
  header: {padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.surface},
  metaRow: {flexDirection: 'row', gap: spacing.xs, alignItems: 'center'},
  flatSkeleton: {borderRadius: 0},
  skeletonBody: {padding: spacing.lg, gap: spacing.md},
});
