import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Badge, Card, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency, formatDistance, formatEta, formatRating} from '@shared/lib/format';
import {AVAILABILITY_LABEL, getAvailability} from '../model/availability';
import type {Restaurant} from '../model/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

/**
 * A DOMAIN component — it knows what a "restaurant" is, so it belongs to the
 * restaurant feature rather than shared/ui.
 *
 * The boundary is sharp: shared/ui/Card does not know what a restaurant is, and
 * RestaurantCard knows nothing about corner radii or shadows — it delegates that
 * to Card.
 */
export function RestaurantCard({restaurant, onPress}: RestaurantCardProps) {
  const availability = getAvailability(restaurant);
  const isOpen = availability === 'open';

  return (
    <Card onPress={onPress} style={styles.card} testID={`restaurant-${restaurant.id}`}>
      <View>
        <Image source={{uri: restaurant.coverImageUrl}} style={styles.cover} />
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Txt variant="bodyStrong" color={colors.textInverse}>
              {AVAILABILITY_LABEL[availability]}
            </Txt>
          </View>
        )}
        {!!restaurant.promoLabel && isOpen && (
          <View style={styles.promo}>
            <Badge
              label={restaurant.promoLabel}
              color={colors.textInverse}
              background={colors.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Txt variant="h3" numberOfLines={1}>
          {restaurant.name}
        </Txt>
        <Txt variant="caption" numberOfLines={1}>
          {restaurant.cuisines.join(' · ')}
        </Txt>

        <View style={styles.metaRow}>
          <Txt variant="caption" color={colors.warning}>
            ★ {formatRating(restaurant.rating)}
          </Txt>
          <Txt variant="caption">({restaurant.ratingCount})</Txt>
          <Txt variant="caption">·</Txt>
          <Txt variant="caption">{formatDistance(restaurant.distanceKm)}</Txt>
          <Txt variant="caption">·</Txt>
          <Txt variant="caption">{formatEta(restaurant.etaMinutes)}</Txt>
        </View>

        <Txt variant="tiny">
          Phí giao {formatCurrency(restaurant.deliveryFee)} · Tối thiểu{' '}
          {formatCurrency(restaurant.minOrderAmount)}
        </Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {padding: 0, overflow: 'hidden'},
  cover: {width: '100%', height: 150, backgroundColor: colors.surfaceAlt},
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promo: {position: 'absolute', top: spacing.sm, left: spacing.sm},
  body: {padding: spacing.md, gap: 2},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});

export const restaurantCardStyles = {radius: radius.lg};
