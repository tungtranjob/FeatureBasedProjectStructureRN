import React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Card, Screen, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {useAuth} from '../hooks/use-auth';

/**
 * Màn hồ sơ cá nhân — cố tình để tối giản.
 *
 * Trong app thật, phần này thường đủ lớn để tách thành feature `profile`
 * riêng (đổi thông tin, sổ địa chỉ, ví, cài đặt thông báo). Ở đây nó nằm
 * nhờ trong `auth` vì chỉ có mỗi thông tin người dùng và nút đăng xuất.
 *
 * Đó cũng là một bài học về ranh giới: đừng tách feature quá sớm. Tách khi
 * nó thật sự lớn lên, không phải vì sơ đồ kiến trúc trông cân đối hơn.
 */
export function ProfileScreen() {
  const navigation = useNavigation();
  const {user, logout} = useAuth();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profile}>
          <Image source={{uri: user?.avatarUrl}} style={styles.avatar} />
          <View style={styles.info}>
            <Txt variant="h3">{user?.name}</Txt>
            <Txt variant="caption">{user?.phone}</Txt>
            <Txt variant="tiny">{user?.email}</Txt>
          </View>
        </Card>

        <Card>
          <Txt
            variant="body"
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddressPicker')}>
            📍  Sổ địa chỉ
          </Txt>
        </Card>

        <Button title="Đăng xuất" variant="secondary" onPress={logout} />

        <Txt variant="tiny" style={styles.version}>
          FoodGo demo · kiến trúc feature-first
        </Txt>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg, gap: spacing.md},
  profile: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  info: {flex: 1, gap: 2},
  menuItem: {paddingVertical: spacing.sm},
  version: {textAlign: 'center', marginTop: spacing.xl},
});
