import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subscription } from '../types';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { formatINR } from '../utils/calculations';
import { getDaysUntilRenewal, renewalLabel, renewalUrgency } from '../utils/dateUtils';

interface Props {
  sub: Subscription;
  onPress: () => void;
}

export default function SubscriptionCard({ sub, onPress }: Props) {
  const days = getDaysUntilRenewal(sub.billingDate, sub.cycle);
  const urgency = renewalUrgency(days);
  const badgeColor =
    urgency === 'danger' ? COLORS.danger : urgency === 'warning' ? COLORS.warning : COLORS.textSecondary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: sub.color + '22' }]}>
        <MaterialCommunityIcons name={sub.iconName as any} size={22} color={sub.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{sub.name}</Text>
        <Text style={styles.category}>{sub.category}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatINR(sub.amount)}</Text>
        <Text style={styles.cycle}>/{sub.cycle === 'monthly' ? 'mo' : sub.cycle === 'yearly' ? 'yr' : 'wk'}</Text>
        <View style={[styles.badge, { borderColor: badgeColor }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{renewalLabel(days)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
  category: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    color: COLORS.textPrimary,
    fontSize: FONTS.lg,
    fontWeight: '700',
  },
  cycle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
