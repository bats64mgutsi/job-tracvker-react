import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../services/auth-context';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isHome = pathname === '/' || pathname === '';
  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname.startsWith('/login');
  const isSignUp = pathname.startsWith('/signup');

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.7}>
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
          style={[styles.navBtn, isHome && styles.navBtnActive]}
          onPress={() => router.push('/')}
        >
          <Text style={[styles.navBtnText, isHome && styles.navBtnTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {currentUser ? (
          <>
            <TouchableOpacity
              style={[styles.navBtn, isDashboard && styles.navBtnActive]}
              onPress={() => router.push('/dashboard')}
            >
              <Text style={[styles.navBtnText, isDashboard && styles.navBtnTextActive]}>
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
              style={[styles.navBtn, isLogin && styles.navBtnActive]}
              onPress={() => router.push('/login')}
            >
              <Text style={[styles.navBtnText, isLogin && styles.navBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, isSignUp && styles.navBtnActive]}
              onPress={() => router.push('/signup')}
            >
              <Text style={[styles.navBtnText, isSignUp && styles.navBtnTextActive]}>
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
