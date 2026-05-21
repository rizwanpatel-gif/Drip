import { Subscription } from '../types';
import { getDaysUntilRenewal } from './dateUtils';

export const toMonthly = (sub: Subscription): number => {
  if (sub.cycle === 'monthly') return sub.amount;
  if (sub.cycle === 'yearly') return sub.amount / 12;
  return (sub.amount * 52) / 12; // weekly
};

export const toYearly = (sub: Subscription): number => {
  if (sub.cycle === 'yearly') return sub.amount;
  if (sub.cycle === 'monthly') return sub.amount * 12;
  return sub.amount * 52; // weekly
};

export const totalMonthlyBurn = (subs: Subscription[]): number =>
  subs.reduce((sum, s) => sum + toMonthly(s), 0);

export const totalYearlyBurn = (subs: Subscription[]): number =>
  subs.reduce((sum, s) => sum + toYearly(s), 0);

export const upcomingRenewals = (subs: Subscription[], withinDays = 7): Subscription[] =>
  subs
    .filter(s => {
      const d = getDaysUntilRenewal(s.billingDate, s.cycle);
      return d >= 0 && d <= withinDays;
    })
    .sort(
      (a, b) =>
        getDaysUntilRenewal(a.billingDate, a.cycle) -
        getDaysUntilRenewal(b.billingDate, b.cycle),
    );

export const categoryBreakdown = (
  subs: Subscription[],
  yearly = false,
): { category: string; amount: number; color: string }[] => {
  const map: Record<string, { amount: number; color: string }> = {};
  subs.forEach(s => {
    const amt = yearly ? toYearly(s) : toMonthly(s);
    if (!map[s.category]) map[s.category] = { amount: 0, color: s.color };
    map[s.category].amount += amt;
  });
  return Object.entries(map)
    .map(([category, { amount, color }]) => ({ category, amount, color }))
    .sort((a, b) => b.amount - a.amount);
};

export const totalPaidSoFar = (sub: Subscription): number => {
  const created = new Date(sub.createdAt);
  const now = new Date();
  const months = Math.max(
    0,
    (now.getFullYear() - created.getFullYear()) * 12 + now.getMonth() - created.getMonth(),
  );
  if (sub.cycle === 'monthly') return sub.amount * months;
  if (sub.cycle === 'yearly') return sub.amount * Math.floor(months / 12);
  return sub.amount * Math.floor(months * 4.33); // weekly
};

export const formatINR = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const dailyCost = (subs: Subscription[]): number => totalMonthlyBurn(subs) / 30;
