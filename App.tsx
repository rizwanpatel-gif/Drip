import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation';
import { requestPermission, scheduleAll } from './src/notifications';
import { getSubscriptions } from './src/storage/subscriptions';

export default function App() {
  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (granted) {
        const subs = await getSubscriptions();
        await scheduleAll(subs);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
