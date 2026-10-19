import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../services/auth-context';

export interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: 'home' | 'login' | 'signup' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Text style={styles.brandText}>Job Tracker</Text>
        </TouchableOpacity>
        {currentUser?.email ? (
          <Text style={styles.userEmailText} numberOfLines={1}>
            {currentUser.email}
          </Text>
        ) : null}
      </View>

      <View style={styles.navLinksRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentScreen === 'home' && styles.navBtnActive]}
          onPress={() => onNavigate('home')}
        >
          <Text style={[styles.navBtnText, currentScreen === 'home' && styles.navBtnTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {currentUser ? (
          <>
            <TouchableOpacity
              style={[styles.navBtn, currentScreen === 'dashboard' && styles.navBtnActive]}
              onPress={() => onNavigate('dashboard')}
            >
              <Text style={[styles.navBtnText, currentScreen === 'dashboard' && styles.navBtnTextActive]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.navBtn, currentScreen === 'login' && styles.navBtnActive]}
              onPress={() => onNavigate('login')}
            >
              <Text style={[styles.navBtnText, currentScreen === 'login' && styles.navBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, currentScreen === 'signup' && styles.navBtnActive]}
              onPress={() => onNavigate('signup')}
            >
              <Text style={[styles.navBtnText, currentScreen === 'signup' && styles.navBtnTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#212529',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#343a40',
    ...(Platform.OS === 'web'
      ? {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }
      : {}),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'web' ? 0 : 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  userEmailText: {
    color: '#adb5bd',
    fontSize: 13,
    marginLeft: 12,
    maxWidth: 180,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  navBtnActive: {
    backgroundColor: '#343a40',
  },
  navBtnText: {
    color: '#ced4da',
    fontSize: 14,
    fontWeight: '500',
  },
  navBtnTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Header;
