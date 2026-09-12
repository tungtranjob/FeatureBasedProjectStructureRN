import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing} from '../theme';
import {Button} from './Button';
import {Txt} from './Txt';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = '🍽️',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <Txt style={styles.emoji}>{emoji}</Txt>
      <Txt variant="h3" style={styles.title}>
        {title}
      </Txt>
      {!!description && (
        <Txt variant="caption" style={styles.description}>
          {description}
        </Txt>
      )}
      {!!actionTitle && !!onAction && (
        <Button title={actionTitle} onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {fontSize: 44, marginBottom: spacing.md},
  title: {textAlign: 'center'},
  description: {textAlign: 'center', marginTop: spacing.sm},
  action: {marginTop: spacing.lg},
});
