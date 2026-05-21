import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function NeoPOPButton({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled,
}: Props) {
  const bgColor =
    variant === 'primary' ? COLORS.accent : variant === 'danger' ? COLORS.danger : 'transparent';
  const txtColor =
    variant === 'primary' ? '#000' : variant === 'ghost' ? COLORS.accent : COLORS.textPrimary;
  const shadowColor =
    variant === 'primary' ? COLORS.accentShadow : variant === 'danger' ? '#8B0000' : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: bgColor,
          shadowColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: COLORS.accent,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: txtColor }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  label: {
    fontSize: FONTS.md,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
