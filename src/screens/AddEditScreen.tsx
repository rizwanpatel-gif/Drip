
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { RootStackParamList, Subscription, BillingCycle } from '../types';
import { addSubscription, updateSubscription } from '../storage/subscriptions';
import { scheduleRenewal } from '../notifications';
import { PRESETS } from '../constants/presets';
import { CATEGORIES } from '../constants/categories';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import NeoPOPButton from '../components/NeoPOPButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEdit'>;

const CYCLES: { label: string; value: BillingCycle }[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' },
];

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function AddEditScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const editing = route.params?.subscription;

  const [name, setName] = useState(editing?.name ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [cycle, setCycle] = useState<BillingCycle>(editing?.cycle ?? 'monthly');
  const [billingDate, setBillingDate] = useState(
    editing ? parseISO(editing.billingDate) : new Date(),
  );
  const [category, setCategory] = useState(editing?.category ?? 'Entertainment');
  const [color, setColor] = useState(editing?.color ?? '#FF6B6B');
  const [iconName, setIconName] = useState(editing?.iconName ?? 'television-play');
  const [notifEnabled, setNotifEnabled] = useState(editing?.notifEnabled ?? true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setName(preset.name);
    setAmount(String(preset.amount));
    setCategory(preset.category);
    setColor(preset.color);
    setIconName(preset.iconName);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a subscription name.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    const sub: Subscription = {
      id: editing?.id ?? generateId(),
      name: name.trim(),
      amount: parsedAmount,
      currency: 'INR',
      cycle,
      billingDate: billingDate.toISOString(),
      category,
      color,
      iconName,
      notifEnabled,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };

    if (editing) {
      await updateSubscription(sub);
    } else {
      await addSubscription(sub);
    }

    await scheduleRenewal(sub);
    nav.goBack();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Presets */}
        <Text style={styles.sectionLabel}>QUICK ADD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          {PRESETS.map(p => (
            <TouchableOpacity
              key={p.name}
              onPress={() => applyPreset(p)}
              style={[styles.presetChip, name === p.name && { borderColor: p.color }]}
            >
              <MaterialCommunityIcons name={p.iconName as any} size={14} color={name === p.name ? p.color : COLORS.textSecondary} />
              <Text style={[styles.presetLabel, name === p.name && { color: p.color }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Name */}
        <Text style={styles.sectionLabel}>NAME</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Netflix"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.accent}
        />

        {/* Amount */}
        <Text style={styles.sectionLabel}>AMOUNT (₹)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="decimal-pad"
          selectionColor={COLORS.accent}
        />

        {/* Billing Cycle */}
        <Text style={styles.sectionLabel}>BILLING CYCLE</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map(c => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setCycle(c.value)}
              style={[styles.cycleChip, cycle === c.value && styles.cycleChipActive]}
            >
              <Text
                style={[styles.cycleLabel, cycle === c.value && styles.cycleLabelActive]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Billing Date */}
        <Text style={styles.sectionLabel}>NEXT BILLING DATE</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONTS.md }}>
            {format(billingDate, 'dd MMM yyyy')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={billingDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setBillingDate(date);
            }}
            themeVariant="dark"
          />
        )}

        {/* Category */}
        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.name}
              onPress={() => { setCategory(cat.name); setColor(cat.color); }}
              style={[
                styles.presetChip,
                category === cat.name && { borderColor: cat.color, backgroundColor: cat.color + '22' },
              ]}
            >
              <MaterialCommunityIcons name={cat.icon as any} size={14} color={category === cat.name ? cat.color : COLORS.textSecondary} />
              <Text style={[styles.presetLabel, category === cat.name && { color: cat.color }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notifications */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Renewal Reminders</Text>
            <Text style={styles.toggleSub}>Notify 3 days before billing</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ true: COLORS.accent, false: COLORS.cardBorder }}
            thumbColor={notifEnabled ? '#000' : COLORS.textSecondary}
          />
        </View>

        <NeoPOPButton
          label={editing ? 'Save Changes' : 'Add Subscription'}
          onPress={handleSave}
          style={styles.saveBtn}
        />
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
    paddingBottom: SPACING.xxl,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  presetLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    fontWeight: '600',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cycleChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  cycleChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.accentShadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cycleLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  cycleLabelActive: {
    color: COLORS.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  toggleLabel: {
    color: COLORS.textPrimary,
    fontSize: FONTS.md,
    fontWeight: '600',
  },
  toggleSub: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: SPACING.xl,
  },
});
