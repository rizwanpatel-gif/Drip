import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Subscription } from '../types';
import { getSubscriptionById, deleteSubscription } from '../storage/subscriptions';
import { cancelRenewal } from '../notifications';
import {
  toMonthly,
  toYearly,
  totalPaidSoFar,
  formatINR,
} from '../utils/calculations';
import {
  getDaysUntilRenewal,
  renewalLabel,
  formatDate,
  getNextBillingDate,
} from '../utils/dateUtils';
import NeoPOPButton from '../components/NeoPOPButton';
import StatCard from '../components/StatCard';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const nav = useNavigation<Nav>();
  const { subscriptionId } = useRoute<Route>().params;
  const [sub, setSub] = useState<Subscription | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSubscriptionById(subscriptionId).then(setSub);
    }, [subscriptionId]),
  );

  const handleDelete = () => {
    Alert.alert(
      'Cancel Subscription',
      `Remove ${sub?.name} from tracking? This won't cancel the actual subscription.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!sub) return;
            await deleteSubscription(sub.id);
            await cancelRenewal(sub.id);
            nav.goBack();
          },
        },
      ],
    );
  };

  if (!sub) return null;

  const days = getDaysUntilRenewal(sub.billingDate, sub.cycle);
  const nextDate = formatDate(getNextBillingDate(sub.billingDate, sub.cycle));
  const monthly = toMonthly(sub);
  const yearly = toYearly(sub);
  const paid = totalPaidSoFar(sub);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <View style={[styles.hero, { borderLeftColor: sub.color }]}>
          <View style={[styles.iconWrap, { backgroundColor: sub.color + '22' }]}>
            <MaterialCommunityIcons name={sub.iconName as any} size={36} color={sub.color} />
          </View>
          <Text style={styles.heroName}>{sub.name}</Text>
          <Text style={styles.heroAmount}>{formatINR(sub.amount)}</Text>
          <Text style={styles.heroCycle}>
            per {sub.cycle === 'monthly' ? 'month' : sub.cycle === 'yearly' ? 'year' : 'week'}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <StatCard
            label="Next billing"
            value={nextDate}
            icon="calendar"
            accent={days <= 3}
            style={{ marginRight: SPACING.sm }}
          />
          <StatCard
            label={renewalLabel(days)}
            value={days === 0 ? 'Today' : `${days}d`}
            icon="clock-outline"
            accent={days <= 3}
          />
        </View>
        <View style={[styles.grid, { marginTop: SPACING.sm }]}>
          <StatCard
            label="Monthly cost"
            value={formatINR(monthly)}
            icon="cash-multiple"
            style={{ marginRight: SPACING.sm }}
          />
          <StatCard label="Yearly cost" value={formatINR(yearly)} icon="calendar-month" />
        </View>
        {paid > 0 && (
          <View style={[styles.grid, { marginTop: SPACING.sm }]}>
            <StatCard label="Total paid so far" value={formatINR(paid)} icon="history" />
          </View>
        )}

        {/* Category badge */}
        <View style={styles.catRow}>
          <View style={[styles.catBadge, { borderColor: sub.color }]}>
            <Text style={[styles.catText, { color: sub.color }]}>{sub.category}</Text>
          </View>
          {sub.notifEnabled && (
            <View style={styles.notifBadge}>
              <MaterialCommunityIcons name="bell-check" size={12} color={COLORS.success} />
              <Text style={styles.notifText}>Reminders on</Text>
            </View>
          )}
        </View>

        {/* Cancel nudge */}
        <View style={styles.nudge}>
          <MaterialCommunityIcons name="fire" size={20} color={COLORS.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nudgeTitle}>Yearly waste if unused</Text>
            <Text style={styles.nudgeAmount}>{formatINR(yearly)}/year</Text>
          </View>
          <Text style={styles.nudgeHint}>Cancel to save this</Text>
        </View>

        {/* Actions */}
        <NeoPOPButton
          label="Edit Subscription"
          onPress={() => nav.navigate('AddEdit', { subscription: sub })}
          variant="ghost"
          style={{ marginTop: SPACING.lg }}
        />
        <NeoPOPButton
          label="Remove from Drip"
          onPress={handleDelete}
          variant="danger"
          style={{ marginTop: SPACING.sm }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  hero: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroAmount: {
    color: COLORS.accent,
    fontSize: FONTS.hero,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: SPACING.xs,
  },
  heroCycle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  catBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  catText: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  notifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.success + '44',
    borderRadius: 20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  notifText: {
    color: COLORS.success,
    fontSize: FONTS.xs,
    fontWeight: '600',
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  nudgeTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nudgeAmount: {
    color: COLORS.warning,
    fontSize: FONTS.lg,
    fontWeight: '800',
  },
  nudgeHint: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    maxWidth: 60,
    textAlign: 'right',
  },
});
