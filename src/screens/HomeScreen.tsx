import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/auth-context';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleDashboardPress = () => {
    if (currentUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Job Search Organized</Text>
        <Text style={styles.title}>Job Application Tracker</Text>
        <Text style={styles.subtitle}>
          Keep track of all your job applications in one place. Manage your master CV, tailor cover letters, and track every stage of your career journey.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDashboardPress}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>

          {!currentUser ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    maxWidth: 540,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  badge: {
    backgroundColor: '#e7f1ff',
    color: '#0d6efd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
