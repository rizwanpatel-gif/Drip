import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import NeoPOPButton from './NeoPOPButton';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'receipt', title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={64} color={COLORS.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <NeoPOPButton label={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: FONTS.lg,
    fontWeight: '600',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
});
