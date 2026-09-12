import React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Card, Screen, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {useAuth} from '../hooks/use-auth';

/**
 * The profile screen — deliberately minimal.
 *
 * In a real app this part is usually big enough to become its own `profile` feature
 * (editing details, the address book, the wallet, notification settings). Here it
 * lodges inside `auth` because it is just the user's details and a sign-out button.
 *
 * That is a lesson about boundaries too: do not split a feature too early. Split it
 * when it genuinely grows, not to make the architecture diagram look more balanced.
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
