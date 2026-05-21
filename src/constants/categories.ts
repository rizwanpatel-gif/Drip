import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { name: 'Entertainment', color: '#FF6B6B', icon: 'television-play' },
  { name: 'Music', color: '#4ECDC4', icon: 'music-note' },
  { name: 'Productivity', color: '#45B7D1', icon: 'lightning-bolt' },
  { name: 'Health & Fitness', color: '#96CEB4', icon: 'heart-pulse' },
  { name: 'News & Media', color: '#F7DC6F', icon: 'newspaper-variant' },
  { name: 'Education', color: '#DDA0DD', icon: 'school' },
  { name: 'Gaming', color: '#98D8C8', icon: 'controller-classic' },
  { name: 'Finance', color: '#FFB347', icon: 'cash' },
  { name: 'Shopping', color: '#F0A500', icon: 'shopping' },
  { name: 'Other', color: '#808080', icon: 'dots-horizontal' },
];

export const getCategoryColor = (name: string): string => {
  return CATEGORIES.find(c => c.name === name)?.color ?? '#808080';
};
