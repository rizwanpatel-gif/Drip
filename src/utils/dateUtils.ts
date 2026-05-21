import {
  differenceInDays,
  addMonths,
  addYears,
  addWeeks,
  format,
  parseISO,
  subDays,
} from 'date-fns';
import { BillingCycle } from '../types';

export const getNextBillingDate = (billingDate: string, cycle: BillingCycle): Date => {
  let date = parseISO(billingDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  while (date <= now) {
    if (cycle === 'monthly') date = addMonths(date, 1);
    else if (cycle === 'yearly') date = addYears(date, 1);
    else date = addWeeks(date, 1);
  }

  return date;
};

export const getDaysUntilRenewal = (billingDate: string, cycle: BillingCycle): number => {
  const next = getNextBillingDate(billingDate, cycle);
  return differenceInDays(next, new Date());
};

export const getNotifTriggerDate = (billingDate: string, cycle: BillingCycle): Date => {
  return subDays(getNextBillingDate(billingDate, cycle), 3);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM');
};

export const renewalLabel = (days: number): string => {
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `in ${days}d`;
};

export const renewalUrgency = (days: number): 'danger' | 'warning' | 'normal' => {
  if (days <= 1) return 'danger';
  if (days <= 3) return 'warning';
  return 'normal';
};
