import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types';

const KEY = '@drip:subscriptions';

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Subscription[]) : [];
  } catch {
    return [];
  }
};

export const saveSubscriptions = async (subs: Subscription[]): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(subs));
};

export const addSubscription = async (sub: Subscription): Promise<void> => {
  const current = await getSubscriptions();
  await saveSubscriptions([...current, sub]);
};

export const updateSubscription = async (updated: Subscription): Promise<void> => {
  const current = await getSubscriptions();
  await saveSubscriptions(current.map(s => (s.id === updated.id ? updated : s)));
};

export const deleteSubscription = async (id: string): Promise<void> => {
  const current = await getSubscriptions();
  await saveSubscriptions(current.filter(s => s.id !== id));
};

export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  const current = await getSubscriptions();
  return current.find(s => s.id === id) ?? null;
};
