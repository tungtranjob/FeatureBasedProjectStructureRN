import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TextInput, View} from 'react-native';
import {Button, Screen, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {toUserMessage} from '@shared/errors/app-error';
import {useLogin} from '../hooks/use-auth';
import {isValidOtp, isValidVietnamesePhone, normalizePhone} from '../model/validate-phone';

/**
 * A SCREEN DOES ONLY THREE THINGS: read state, render, dispatch actions.
 *
 * Note what is NOT here: no fetch call, no token storage, no phone-number regex
 * written inline. All of that lives in model/ and hooks/, where it can be tested
 * without rendering anything.
 *
 * `useState` is legitimate here because this is FORM state (the text being typed),
 * which only lives in this screen. Domain state does not belong here.
 */
export function LoginScreen() {
  const [phone, setPhone] = useState('0901234567');
  const [otp, setOtp] = useState('123456');
  const login = useLogin();

  const canSubmit = isValidVietnamesePhone(phone) && isValidOtp(otp);

  const handleSubmit = () => {
    login.mutate({phone: normalizePhone(phone), otp});
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Txt style={styles.logo}>🍜</Txt>
        <Txt variant="h1">FoodGo</Txt>
        <Txt variant="caption" style={styles.subtitle}>
          Đặt món ngon, giao tận nơi
        </Txt>

        <View style={styles.form}>
          <Txt variant="caption">Số điện thoại</Txt>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="0xx xxx xxxx"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            testID="login-phone"
          />

          <Txt variant="caption" style={styles.label}>
            Mã OTP
          </Txt>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="6 chữ số"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            testID="login-otp"
          />
          <Txt variant="tiny" style={styles.hint}>
            Demo: mọi mã 6 số đều hợp lệ, trừ 000000 (để thử nhánh lỗi).
          </Txt>

          {!!login.error && (
            <Txt variant="caption" color={colors.danger} style={styles.error}>
              {toUserMessage(login.error)}
            </Txt>
          )}

          <Button
            title="Đăng nhập"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={login.isPending}
            fullWidth
            size="lg"
            style={styles.submit}
            testID="login-submit"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: spacing.xl},
  logo: {fontSize: 56, textAlign: 'center'},
  subtitle: {marginBottom: spacing.xxl},
  form: {gap: spacing.xs},
  label: {marginTop: spacing.md},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: {marginTop: spacing.xs},
  error: {marginTop: spacing.sm},
  submit: {marginTop: spacing.lg},
});
