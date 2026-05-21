import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RootStackParamList, Subscription } from '../types';
import { getSubscriptions } from '../storage/subscriptions';
import {
  totalMonthlyBurn,
  upcomingRenewals,
  formatINR,
  dailyCost,
} from '../utils/calculations';
import SubscriptionCard from '../components/SubscriptionCard';
import EmptyState from '../components/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const nav = useNavigation<Nav>();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setSubs(await getSubscriptions());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const monthly = totalMonthlyBurn(subs);
  const upcoming = upcomingRenewals(subs, 7);
  const daily = dailyCost(subs);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>DRIP</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, dd MMM')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => nav.navigate('AddEdit', undefined)}
            style={styles.addBtn}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Hero Burn Card */}
        <View style={styles.burnCard}>
          <Text style={styles.burnLabel}>MONTHLY BURN</Text>
          <Text style={styles.burnAmount} numberOfLines={1} adjustsFontSizeToFit>
            {formatINR(monthly)}
          </Text>
          <View style={styles.burnRow}>
            <Text style={styles.burnSub}>
              <Text style={{ color: COLORS.accent }}>{subs.length}</Text> active subscriptions
            </Text>
            <Text style={styles.burnSub}>
              {formatINR(daily)}<Text style={{ color: COLORS.textSecondary }}>/day</Text>
            </Text>
          </View>
        </View>

        {/* Upcoming Renewals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING RENEWALS</Text>
          {upcoming.length === 0 ? (
            <View style={styles.noUpcoming}>
              <MaterialCommunityIcons name="check-circle-outline" size={28} color={COLORS.success} />
              <Text style={styles.noUpcomingText}>No renewals in the next 7 days</Text>
            </View>
          ) : (
            upcoming.map(sub => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                onPress={() => nav.navigate('Detail', { subscriptionId: sub.id })}
              />
            ))
          )}
        </View>

        {/* All Subscriptions quick-link */}
        {subs.length === 0 ? (
          <EmptyState
            icon="playlist-plus"
            title="No subscriptions yet"
            subtitle="Start tracking your subscriptions to see your monthly burn rate."
            actionLabel="Add First Sub"
            onAction={() => nav.navigate('AddEdit', undefined)}
          />
        ) : (
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => nav.navigate('MainTabs', undefined)}
          >
            <Text style={styles.viewAllText}>View all {subs.length} subscriptions</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brand: {
    color: COLORS.accent,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentShadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  burnCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  burnLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  burnAmount: {
    color: COLORS.accent,
    fontSize: FONTS.hero,
    fontWeight: '900',
    letterSpacing: -1,
  },
  burnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  burnSub: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  noUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  noUpcomingText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  viewAllText: {
    color: COLORS.accent,
    fontSize: FONTS.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
