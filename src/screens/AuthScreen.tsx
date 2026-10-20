import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export interface AuthScreenProps {
  mode?: 'login' | 'signup';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ mode = 'login' }) => {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');

  useEffect(() => {
    setIsSignUp(mode === 'signup');
  }, [mode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = () => {
    setErrorMessage('');
    setPassword('');
    if (isSignUp) {
      router.push('/login');
    } else {
      router.push('/signup');
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || isSubmitting) return;

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(trimmedEmail, password);
      } else {
        await signIn(trimmedEmail, password);
      }
      router.replace('/dashboard');
    } catch (err: any) {
      console.warn('Auth Error:', err);
      const msg = err?.message || '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMessage('Invalid email or password. Try again.');
      } else if (msg.includes('email-already-in-use')) {
        setErrorMessage('An account with this email already exists.');
      } else {
        setErrorMessage(isSignUp ? 'Failed to create account. Try again.' : 'Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInvalid = !email.trim() || !password;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center items-center p-6 bg-background"
        keyboardShouldPersistTaps="handled"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center items-center">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center text-sm">
              {isSignUp ? 'Start tracking your job applications' : 'Welcome back to Job Tracker'}
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            {errorMessage ? (
              <View className="bg-destructive/15 border border-destructive/30 rounded-md p-3">
                <Text className="text-destructive text-sm font-medium">{errorMessage}</Text>
              </View>
            ) : null}

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Email Address</Text>
              <Input
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isSubmitting}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Password</Text>
              <Input
                placeholder={isSignUp ? 'At least 6 characters' : 'Enter password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <Button
              onPress={handleSubmit}
              disabled={isInvalid || isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </Button>
          </CardContent>

          <CardFooter className="justify-center">
            <Text className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Button variant="link" onPress={switchMode} disabled={isSubmitting} className="h-auto p-0">
              <Text className="text-sm font-bold text-primary">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
