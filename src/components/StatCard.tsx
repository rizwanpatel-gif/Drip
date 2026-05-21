import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface Props {
  label: string;
  value: string;
  icon?: string;
  accent?: boolean;
  style?: ViewStyle;
}

export default function StatCard({ label, value, icon, accent, style }: Props) {
  return (
    <View
      style={[
        styles.card,
        accent && {
          borderColor: COLORS.accent,
          backgroundColor: COLORS.accentDim,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={accent ? COLORS.accent : COLORS.textSecondary}
          style={{ marginBottom: SPACING.xs }}
        />
      )}
      <Text style={[styles.value, accent && { color: COLORS.accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xl,
    fontWeight: '700',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
