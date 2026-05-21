import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subscription } from '../types';
import { getSubscriptions } from '../storage/subscriptions';
import {
  totalMonthlyBurn,
  totalYearlyBurn,
  categoryBreakdown,
  formatINR,
  toMonthly,
  toYearly,
} from '../utils/calculations';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [yearly, setYearly] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSubscriptions().then(setSubs);
    }, []),
  );

  const total = yearly ? totalYearlyBurn(subs) : totalMonthlyBurn(subs);
  const breakdown = categoryBreakdown(subs, yearly);
  const mostExpensive = [...subs].sort((a, b) =>
    yearly ? toYearly(b) - toYearly(a) : toMonthly(b) - toMonthly(a),
  )[0];

  const chartData = breakdown.map(b => ({
    name: b.category,
    amount: Math.round(b.amount),
    color: b.color,
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 11,
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Period toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            onPress={() => setYearly(false)}
            style={[styles.toggleBtn, !yearly && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, !yearly && styles.toggleTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setYearly(true)}
            style={[styles.toggleBtn, yearly && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, yearly && styles.toggleTextActive]}>Yearly</Text>
          </TouchableOpacity>
        </View>

        {/* Total hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            {yearly ? 'ANNUAL' : 'MONTHLY'} BURN · {subs.length} SUBS
          </Text>
          <Text style={styles.heroAmount} adjustsFontSizeToFit numberOfLines={1}>
            {formatINR(total)}
          </Text>
          {!yearly && (
            <Text style={styles.heroSub}>
              {formatINR(total * 12)} / year · {formatINR(total / 30)} / day
            </Text>
          )}
        </View>

        {subs.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="chart-pie" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Add subscriptions to see analytics</Text>
          </View>
        ) : (
          <>
            {/* Pie chart */}
            {chartData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>SPEND BY CATEGORY</Text>
                <PieChart
                  data={chartData}
                  width={width - SPACING.md * 2 - SPACING.lg * 2}
                  height={180}
                  chartConfig={{
                    backgroundColor: COLORS.card,
                    backgroundGradientFrom: COLORS.card,
                    backgroundGradientTo: COLORS.card,
                    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
                    labelColor: () => COLORS.textSecondary,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="12"
                  absolute={false}
                  hasLegend={false}
                />
                {/* Custom legend */}
                {breakdown.map(b => (
                  <View key={b.category} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: b.color }]} />
                    <Text style={styles.legendCat} numberOfLines={1}>{b.category}</Text>
                    <Text style={styles.legendAmt}>{formatINR(b.amount)}</Text>
                    <Text style={styles.legendPct}>
                      {total > 0 ? Math.round((b.amount / total) * 100) : 0}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Most expensive */}
            {mostExpensive && (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>MOST EXPENSIVE</Text>
                <View style={styles.cardRow}>
                  <MaterialCommunityIcons
                    name={mostExpensive.iconName as any}
                    size={28}
                    color={mostExpensive.color}
                  />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.cardName}>{mostExpensive.name}</Text>
                    <Text style={styles.cardSub}>{mostExpensive.category}</Text>
                  </View>
                  <Text style={styles.cardAmount}>
                    {formatINR(yearly ? toYearly(mostExpensive) : toMonthly(mostExpensive))}
                  </Text>
                </View>
              </View>
            )}

            {/* Yearly projection */}
            <View style={[styles.card, { borderColor: COLORS.accent + '44' }]}>
              <Text style={styles.cardLabel}>YEARLY PROJECTION</Text>
              <Text style={styles.projectionAmount}>{formatINR(totalYearlyBurn(subs))}</Text>
              <Text style={styles.projectionSub}>
                You'll spend this much on subscriptions by year end
              </Text>
              <View style={styles.projectionRow}>
                <View style={styles.projectionStat}>
                  <Text style={styles.projStatValue}>{formatINR(totalYearlyBurn(subs) / 365)}</Text>
                  <Text style={styles.projStatLabel}>per day</Text>
                </View>
                <View style={styles.projectionStat}>
                  <Text style={styles.projStatValue}>{formatINR(totalYearlyBurn(subs) / 52)}</Text>
                  <Text style={styles.projStatLabel}>per week</Text>
                </View>
                <View style={styles.projectionStat}>
                  <Text style={styles.projStatValue}>{subs.length}</Text>
                  <Text style={styles.projStatLabel}>active subs</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accentShadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  toggleText: { color: COLORS.textSecondary, fontSize: FONTS.sm, fontWeight: '600' },
  toggleTextActive: { color: '#000', fontWeight: '800' },
  heroCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  heroAmount: {
    color: COLORS.accent,
    fontSize: FONTS.hero,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: SPACING.xs,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  chartTitle: {
    alignSelf: 'flex-start',
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    marginTop: 4,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  legendCat: { flex: 1, color: COLORS.textSecondary, fontSize: FONTS.sm },
  legendAmt: { color: COLORS.textPrimary, fontSize: FONTS.sm, fontWeight: '700', marginRight: SPACING.sm },
  legendPct: { color: COLORS.textMuted, fontSize: FONTS.xs, width: 32, textAlign: 'right' },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { color: COLORS.textPrimary, fontSize: FONTS.lg, fontWeight: '700' },
  cardSub: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  cardAmount: { color: COLORS.accent, fontSize: FONTS.xl, fontWeight: '800' },
  projectionAmount: {
    color: COLORS.accent,
    fontSize: FONTS.xxl + 8,
    fontWeight: '900',
    letterSpacing: -1,
  },
  projectionSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  projectionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  projectionStat: { alignItems: 'center' },
  projStatValue: { color: COLORS.textPrimary, fontSize: FONTS.lg, fontWeight: '700' },
  projStatLabel: { color: COLORS.textSecondary, fontSize: FONTS.xs, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.md },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.md },
});
