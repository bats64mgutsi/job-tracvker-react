import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/auth-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
} from '@/components/ui/menubar';

export const Header: React.FC = () => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <View className="bg-card border-b border-border px-4 py-2.5 flex-row items-center justify-between">
      <Button variant="ghost" size="sm" onPress={() => router.push('/')}>
        <Text className="text-lg font-bold text-primary">Job Tracker</Text>
      </Button>

      <Menubar className="bg-primary/10 border border-primary/20 rounded-lg p-1 h-auto gap-1">
        <MenubarMenu value="nav">
          <MenubarTrigger className="rounded-md px-3 py-1.5 active:bg-primary/20">
            <Text className="text-primary font-semibold">Navigation</Text>
          </MenubarTrigger>
          <MenubarContent align="end">
            <MenubarItem onPress={() => router.push('/')}>
              <Text>Home</Text>
            </MenubarItem>
            {currentUser ? (
              <MenubarItem onPress={() => router.push('/dashboard')}>
                <Text>Dashboard</Text>
              </MenubarItem>
            ) : null}
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="account">
          <MenubarTrigger className="bg-primary rounded-md px-3 py-1.5 active:bg-primary/90">
            <Text className="text-primary-foreground font-semibold">Account</Text>
          </MenubarTrigger>
          <MenubarContent align="end">
            {currentUser ? (
              <>
                {currentUser.email ? (
                  <MenubarLabel numberOfLines={1}>{currentUser.email}</MenubarLabel>
                ) : null}
                <MenubarSeparator />
                <MenubarItem variant="destructive" onPress={handleLogout}>
                  <Text>Log Out</Text>
                </MenubarItem>
              </>
            ) : (
              <>
                <MenubarItem onPress={() => router.push('/login')}>
                  <Text>Sign In</Text>
                </MenubarItem>
                <MenubarItem onPress={() => router.push('/signup')}>
                  <Text>Sign Up</Text>
                </MenubarItem>
              </>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </View>
  );
};

export default Header;
