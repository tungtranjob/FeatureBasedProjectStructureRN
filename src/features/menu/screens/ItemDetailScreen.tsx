import React from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {Button, Divider, ErrorView, QuantityStepper, Screen, Skeleton, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
// menu -> cart: phụ thuộc MỘT CHIỀU. cart không bao giờ import menu.
import {useAddToCart} from '@features/cart';
import {useMenuItem} from '../api/menu.queries';
import {useItemCustomizer} from '../hooks/use-item-customizer';
import {resolveSelectedOptions} from '../model/calc-item-price';
import {OptionGroupPicker} from '../components/OptionGroupPicker';
import type {MenuStackParamList} from '../navigation/menu.routes';

type ItemDetailRoute = RouteProp<MenuStackParamList, 'ItemDetail'>;

export function ItemDetailScreen() {
  const navigation = useNavigation();
  const {params} = useRoute<ItemDetailRoute>();

  const {data: item, isPending, error, refetch} = useMenuItem(params.itemId);
  const customizer = useItemCustomizer(item);
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    if (!item) {
      return;
    }
    customizer.markSubmitted();
    if (!customizer.isValid) {
      return; // lỗi sẽ hiện ngay dưới nhóm tương ứng
    }

    const options = resolveSelectedOptions(item, customizer.selection);

    /**
     * ⭐ CHỐT GIÁ TẠI THỜI ĐIỂM THÊM VÀO GIỎ.
     *
     * Ta gửi sang cart một "ảnh chụp" (snapshot) gồm tên + giá đã tính, chứ
     * không gửi tham chiếu tới MenuItem. Hai lý do:
     *  1. Giỏ hàng hoạt động offline — không thể đi hỏi lại menu.
     *  2. Quán đổi giá lúc nửa đêm không được làm giỏ hàng của user nhảy số.
     * (Server vẫn tính lại giá khi đặt đơn — snapshot này chỉ phục vụ UI.)
     */
    addToCart({
      restaurantId: params.restaurantId,
      restaurantName: params.restaurantName,
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: customizer.unitPrice,
      optionIds: options.map(o => o.id),
      optionNames: options.map(o => o.name),
      quantity: customizer.quantity,
      note: customizer.note,
    });

    navigation.goBack();
  };

  if (isPending) {
    return (
      <Screen>
        <Skeleton height={220} style={styles.flatSkeleton} />
        <View style={styles.skeletonBody}>
          <Skeleton width="60%" height={22} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="40%" height={18} />
        </View>
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const errorByGroup = new Map(
    customizer.visibleErrors.map(e => [e.groupId, e.message]),
  );

  return (
    <Screen edgeBottom={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{uri: item.imageUrl}} style={styles.cover} />

        <View style={styles.header}>
          <Txt variant="h2">{item.name}</Txt>
          {!!item.description && <Txt variant="caption">{item.description}</Txt>}
          <Txt variant="h3" color={colors.primary}>
            {formatCurrency(item.basePrice)}
          </Txt>
        </View>

        {item.optionGroups.map(group => (
          <View key={group.id}>
            <Divider />
            <OptionGroupPicker
              group={group}
              selectedIds={customizer.selection[group.id] ?? []}
              onToggle={optionId => customizer.toggle(group.id, optionId)}
              errorMessage={errorByGroup.get(group.id)}
            />
          </View>
        ))}

        <Divider />
        <View style={styles.noteBlock}>
          <Txt variant="bodyStrong">Ghi chú cho quán</Txt>
          <TextInput
            value={customizer.note}
            onChangeText={customizer.setNote}
            placeholder="VD: ít đá, không hành..."
            placeholderTextColor={colors.textMuted}
            style={styles.noteInput}
            multiline
          />
        </View>
      </ScrollView>

      {/* Thanh dính đáy: số lượng + nút thêm vào giỏ */}
      <View style={styles.bottomBar}>
        <QuantityStepper
          value={customizer.quantity}
          onChange={customizer.setQuantity}
          testID="item-quantity"
        />
        <Button
          title={`Thêm · ${formatCurrency(customizer.totalPrice)}`}
          onPress={handleAddToCart}
          disabled={!item.isAvailable}
          style={styles.addButton}
          testID="add-to-cart"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 120},
  cover: {width: '100%', height: 220, backgroundColor: colors.surfaceAlt},
  header: {padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.surface},
  noteBlock: {
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {flex: 1},
  flatSkeleton: {borderRadius: 0},
  skeletonBody: {padding: spacing.lg, gap: spacing.md},
});
