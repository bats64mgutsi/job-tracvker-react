import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../services/auth-context';
import { Header } from '../components/Header';
import { PortalHost } from '@rn-primitives/portal';
import '../../global.css';

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0] || '';
    const inProtected = currentRoute === 'dashboard';
    const inAuth = currentRoute === 'login' || currentRoute === 'signup';

    if (!currentUser && inProtected) {
      router.replace('/login');
    } else if (currentUser && inAuth) {
      router.replace('/dashboard');
    }
  }, [currentUser, loading, segments]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header />
      <View style={styles.content}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
        <PortalHost />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#212529' },
  content: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
});
