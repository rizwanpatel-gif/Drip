export type BillingCycle = 'monthly' | 'yearly' | 'weekly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cycle: BillingCycle;
  billingDate: string; // ISO string
  category: string;
  color: string;
  notifEnabled: boolean;
  iconName: string;
  createdAt: string; // ISO string
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

export interface Preset {
  name: string;
  category: string;
  color: string;
  iconName: string;
  amount: number;
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddEdit: { subscription?: Subscription } | undefined;
  Detail: { subscriptionId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Subscriptions: undefined;
  Analytics: undefined;
};
