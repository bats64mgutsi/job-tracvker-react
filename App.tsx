import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/services/auth-context';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

export type ScreenName = 'home' | 'login' | 'signup' | 'dashboard';

function MainNavigator() {
  const { currentUser, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');

  // Guard navigation based on auth state changes
  useEffect(() => {
    if (loading) return;

    if (!currentUser && currentScreen === 'dashboard') {
      setCurrentScreen('login');
    } else if (currentUser && (currentScreen === 'login' || currentScreen === 'signup')) {
      setCurrentScreen('dashboard');
    }
  }, [currentUser, loading, currentScreen]);

  const navigateTo = (screen: ScreenName) => {
    if (!currentUser && screen === 'dashboard') {
      setCurrentScreen('login');
      return;
    }
    if (currentUser && (screen === 'login' || screen === 'signup')) {
      setCurrentScreen('dashboard');
      return;
    }
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading Job Tracker...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <Header currentScreen={currentScreen} onNavigate={navigateTo} />
      <View style={styles.screenWrapper}>
        {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
        {currentScreen === 'login' && <LoginScreen onNavigate={navigateTo} />}
        {currentScreen === 'signup' && <SignUpScreen onNavigate={navigateTo} />}
        {currentScreen === 'dashboard' && <DashboardScreen onNavigate={navigateTo} />}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#212529',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6c757d',
  },
});
