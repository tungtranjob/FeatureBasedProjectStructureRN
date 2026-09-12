import React, {useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {EmptyState, ErrorView, Screen, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {useDebounce} from '@shared/hooks/use-debounce';
// Cross-feature import: ONLY through the public API '@features/cart', never
// reaching into '@features/cart/store/cart.store'.
import {CartFab} from '@features/cart';
import {useRestaurants} from '../api/restaurant.queries';
import {RestaurantCard} from '../components/RestaurantCard';
import {RestaurantListSkeleton} from '../components/RestaurantListSkeleton';
import {RESTAURANT_ROUTES} from '../navigation/restaurant.routes';

const CUISINES = ['Phở', 'Bún', 'Cơm', 'Pizza', 'Trà sữa', 'Bánh mì'];

export function HomeScreen() {
  const navigation = useNavigation();

  // UI state (the text being typed) -> useState is the right home.
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState<string | undefined>();

  // Debounced so we do not fire a request on every keystroke.
  const debouncedSearch = useDebounce(search, 350);

  // Server state (the restaurant list) -> TanStack Query is the right home.
  const {data, isPending, error, refetch, isRefetching} = useRestaurants({
    search: debouncedSearch,
    cuisine,
  });

  return (
    <Screen edgeBottom={false}>
      <View style={styles.header}>
        <Txt variant="h2">Bạn muốn ăn gì hôm nay?</Txt>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm món ăn, nhà hàng..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          testID="home-search"
        />
        <View style={styles.chips}>
          {CUISINES.map(item => {
            const selected = cuisine === item;
            return (
              <Txt
                key={item}
                variant="caption"
                color={selected ? colors.textInverse : colors.text}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCuisine(selected ? undefined : item)}>
                {item}
              </Txt>
            );
          })}
        </View>
      </View>

      {isPending ? (
        <RestaurantListSkeleton />
      ) : error ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              emoji="🔍"
              title="Không tìm thấy nhà hàng"
              description="Thử từ khoá khác hoặc bỏ bớt bộ lọc."
            />
          }
          renderItem={({item}) => (
            <RestaurantCard
              restaurant={item}
              onPress={() =>
                navigation.navigate(RESTAURANT_ROUTES.RestaurantDetail, {
                  restaurantId: item.id,
                })
              }
            />
          )}
        />
      )}

      {/* The floating cart — shown on every shopping screen. */}
      <CartFab />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface},
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  chipSelected: {backgroundColor: colors.primary},
  list: {padding: spacing.lg, gap: spacing.md, paddingBottom: 120},
});
