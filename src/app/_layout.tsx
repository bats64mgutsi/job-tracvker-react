import React, { useEffect } from 'react';
import { View, StatusBar, ActivityIndicator } from 'react-native';
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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="default" />
      <Header />
      <View className="flex-1">
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
