import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  return (
    <ScrollView contentContainerClassName="flex-grow justify-center items-center p-6 bg-background">
      <Card className="w-full max-w-lg items-center text-center">
        <CardHeader className="items-center">
          <Badge variant="secondary">
            <Text>Job Search Organized</Text>
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Job Application Tracker
          </CardTitle>
          <CardDescription className="text-center max-w-md">
            Keep track of all your job applications in one place. Manage your master CV, tailor cover letters, and track every stage of your career journey.
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full gap-3">
          <Button onPress={() => router.push(currentUser ? '/dashboard' : '/login')}>
            <Text>Go to Dashboard</Text>
          </Button>

          {!currentUser && (
            <Button variant="outline" onPress={() => router.push('/signup')}>
              <Text>Create New Account</Text>
            </Button>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
};

export default HomeScreen;
