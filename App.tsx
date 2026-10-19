import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/services/auth-context';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

export type ScreenName = 'home' | 'login' | 'signup' | 'dashboard';

function Navigator() {
  const { currentUser, loading } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('home');

  // Automatic auth guard: redirect if unauthorized or already logged in
  useEffect(() => {
    if (loading) return;
    if (!currentUser && screen === 'dashboard') setScreen('login');
    if (currentUser && (screen === 'login' || screen === 'signup')) setScreen('dashboard');
  }, [currentUser, loading, screen]);

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
      <Header currentScreen={screen} onNavigate={setScreen} />
      <View style={styles.content}>
        {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
        {screen === 'login' && <AuthScreen mode="login" onNavigate={setScreen} />}
        {screen === 'signup' && <AuthScreen mode="signup" onNavigate={setScreen} />}
        {screen === 'dashboard' && <DashboardScreen onNavigate={setScreen} />}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#212529' },
  content: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
});
