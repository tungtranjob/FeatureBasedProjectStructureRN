import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Divider, ErrorView, Skeleton, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {useMenu} from '../api/menu.queries';
import {MENU_ROUTES} from '../navigation/menu.routes';
import {MenuItemRow} from './MenuItemRow';

interface MenuSectionListProps {
  restaurantId: string;
  restaurantName: string;
  canOrder: boolean;
}

/**
 * ⭐ THIS COMPONENT IS THE MENU FEATURE'S PUBLIC API.
 *
 * The restaurant feature embeds it in the restaurant detail screen WITHOUT needing to
 * know how menu fetches its data, how it caches, or how many child components it has.
 * It passes 3 props and gets back a complete block of UI.
 *
 * This is the "self-fetching component" style.
 * On mobile it usually beats prop-drilling, because the parent screen does not have to
 * carry the child's data and does not re-render when that data changes.
 */
export function MenuSectionList({
  restaurantId,
  restaurantName,
  canOrder,
}: MenuSectionListProps) {
  const navigation = useNavigation();
  const {data, isPending, error, refetch} = useMenu(restaurantId);

  if (isPending) {
    return (
      <View style={styles.skeleton}>
        {Array.from({length: 4}).map((_, i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={styles.skeletonInfo}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="90%" height={12} />
              <Skeleton width="35%" height={14} />
            </View>
            <Skeleton width={84} height={84} />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <View>
      {data?.sections.map(section => (
        <View key={section.categoryId}>
          <Txt variant="h3" style={styles.sectionTitle}>
            {section.categoryName}
          </Txt>
          {section.items.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <Divider inset={spacing.lg} />}
              <MenuItemRow
                item={item}
                canOrder={canOrder}
                onPress={() =>
                  navigation.navigate(MENU_ROUTES.ItemDetail, {
                    itemId: item.id,
                    restaurantId,
                    restaurantName,
                  })
                }
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  skeleton: {padding: spacing.lg, gap: spacing.lg},
  skeletonRow: {flexDirection: 'row', gap: spacing.md},
  skeletonInfo: {flex: 1, gap: spacing.sm},
});
