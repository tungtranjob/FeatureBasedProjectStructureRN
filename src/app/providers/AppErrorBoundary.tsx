import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {logger} from '@core/logger/logger';

interface State {
  error: Error | null;
}

/**
 * The last safety net.
 *
 * Without it, one uncaught error in any component leaves the user on a BLANK
 * SCREEN with no buttons and no way out — they have to force quit the app.
 * To the user, that is indistinguishable from the app being dead.
 *
 * It still has to be a class component: React has no hook equivalent yet.
 */
export class AppErrorBoundary extends React.Component<
  {children: React.ReactNode},
  State
> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ErrorBoundary', error.message, info.componentStack);
    // In a real app: Sentry.captureException(error, {extra: info});
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <Txt style={styles.emoji}>💥</Txt>
        <Txt variant="h2">Ứng dụng gặp sự cố</Txt>
        <Txt variant="caption" style={styles.message}>
          {__DEV__ ? this.state.error.message : 'Vui lòng thử lại.'}
        </Txt>
        <Button
          title="Thử lại"
          onPress={() => this.setState({error: null})}
          style={styles.button}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emoji: {fontSize: 48, marginBottom: spacing.md},
  message: {textAlign: 'center', marginTop: spacing.sm},
  button: {marginTop: spacing.xl},
});
