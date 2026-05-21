import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Subscription } from '../types';
import { getNotifTriggerDate } from '../utils/dateUtils';
import { formatINR } from '../utils/calculations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermission = async (): Promise<boolean> => {
  if (!Device.isDevice) return false;
  const { status: existing } = await 
  Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('drip-renewals', {
      name: 'Renewal Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
};

const notifId = (subId: string) => `drip_renewal_${subId}`;

export const scheduleRenewal = async (sub: Subscription): Promise<void> => {
  if (!sub.notifEnabled) return;
  const triggerDate = getNotifTriggerDate(sub.billingDate, sub.cycle);
  if (triggerDate <= new Date()) return;

  await Notifications.cancelScheduledNotificationAsync(notifId(sub.id)).catch(() => null);
  await Notifications.scheduleNotificationAsync({
    identifier: notifId(sub.id),
    content: {
      title: `${sub.name} renews in 3 days`,
      body: `${formatINR(sub.amount)} will be charged on your next billing date.`,
      data: { subscriptionId: sub.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
};

export const cancelRenewal = async (subId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notifId(subId)).catch(() => null);
};

export const scheduleAll = async (subs: Subscription[]): Promise<void> => {
  for (const sub of subs) {
    await scheduleRenewal(sub);
  }
};
