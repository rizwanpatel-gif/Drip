import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, Subscription } from '../types';
import { getSubscriptions } from '../storage/subscriptions';
import { totalMonthlyBurn, formatINR } from '../utils/calculations';
import SubscriptionCard from '../components/SubscriptionCard';
import EmptyState from '../components/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SubscriptionsScreen() {
  const nav = useNavigation<Nav>();
  const [subs, setSubs] = useState<Subscription[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSubscriptions().then(setSubs);
    }, []),
  );

  const monthly = totalMonthlyBurn(subs);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Summary header */}
      {subs.length > 0 && (
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryValue}>{subs.length}</Text>
            <Text style={styles.summaryLabel}>ACTIVE</Text>
          </View>
          <View style={styles.divider} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryValue}>{formatINR(monthly)}</Text>
            <Text style={styles.summaryLabel}>PER MONTH</Text>
          </View>
        </View>
      )}

      <FlatList
        data={subs}
        keyExtractor={s => s.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            sub={item}
            onPress={() => nav.navigate('Detail', { subscriptionId: item.id })}
          />
        )}
        contentContainerStyle={[styles.list, subs.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <EmptyState
            icon="playlist-plus"
            title="No subscriptions yet"
            subtitle="Track Netflix, Spotify, and every subscription that quietly drains your wallet."
            actionLabel="Add Subscription"
            onAction={() => nav.navigate('AddEdit', undefined)}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      {subs.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => nav.navigate('AddEdit', undefined)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.xxl,
    fontWeight: '800',
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.cardBorder,
  },
  list: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentShadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
});
