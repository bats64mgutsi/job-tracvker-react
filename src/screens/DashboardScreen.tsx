import React, { useEffect, useState } from 'react';
import { View, ScrollView, Platform, Alert } from 'react-native';
import { jobService } from '../services/job';
import { userService } from '../services/user';
import { useAuth } from '../services/auth-context';
import { Job, JobStatus } from '../models/job.model';
import { NativeMarkdown } from '../components/NativeMarkdown';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export interface DashboardScreenProps {
  onNavigate?: (screen: 'home' | 'login' | 'signup' | 'dashboard') => void;
}

const ALL_STATUSES: JobStatus[] = [
  JobStatus.NEW,
  JobStatus.APPLIED,
  JobStatus.INTERVIEW,
  JobStatus.OFFER,
  JobStatus.REJECTED,
  JobStatus.ACCEPTED,
];

export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvText, setCvText] = useState('');

  // Add Job form fields
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');

  // Feature 4: which job is expanded to show generated CV & cover letter
  const [expandedJobId, setExpandedJobId] = useState<string | undefined>();

  // Force re-render after local status updates
  const [, forceUpdate] = useState(0);

  const loadJobs = async () => {
    const items = await jobService.getJobs();
    setJobs(items);
  };

  const loadCv = async () => {
    const user = await userService.getUser();
    setCvText(user?.cv ?? '');
  };

  useEffect(() => {
    loadJobs();
    loadCv();
  }, []);

  const notify = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Notice', message);
    }
  };

  // Feature 1: Edit CV
  const handleSaveCv = async () => {
    await userService.updateUser({
      email: currentUser?.email ?? '',
      cv: cvText.trim(),
    });
    notify('CV saved.');
  };

  // Feature 2: Load a job
  const handleAddJob = async () => {
    if (!newJobDescription.trim()) {
      notify('Job description cannot be empty.');
      return;
    }

    const newJob: Job = {
      company: newCompany.trim() || 'Untitled Company',
      role: newRole.trim() || 'Untitled Role',
      jobDescription: newJobDescription.trim(),
      status: { status: JobStatus.NEW, updatedAt: new Date() },
    };

    await jobService.addJob(newJob);
    setNewCompany('');
    setNewRole('');
    setNewJobDescription('');
    await loadJobs();
  };

  // Feature 3: Update job status
  const handleUpdateJobStatus = async (job: Job, newStatus: JobStatus) => {
    await jobService.updateJobStatus(job.id!, newStatus);
    job.status = { status: newStatus, updatedAt: new Date() };
    forceUpdate((n) => n + 1);
  };

  // Feature 4: Toggle generated CV & cover letter view
  const handleToggleDetails = (job: Job) => {
    setExpandedJobId((current) => (current === job.id ? undefined : job.id));
  };

  return (
    <ScrollView contentContainerClassName="p-4 max-w-2xl w-full self-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
      <Text className="text-sm text-muted-foreground mb-4">
        Signed in as {currentUser?.email || 'User'}
      </Text>

      {/* Feature 1: Edit CV */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Your CV</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Input
            className="min-h-[120px] py-2 text-start"
            value={cvText}
            onChangeText={setCvText}
            placeholder="Write your CV here..."
            multiline
            textAlignVertical="top"
          />
          <Button onPress={handleSaveCv}>
            <Text>Save CV</Text>
          </Button>
        </CardContent>
      </Card>

      {/* Feature 2: Load a job */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Add a Job</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Input
            value={newCompany}
            onChangeText={setNewCompany}
            placeholder="Company"
          />
          <Input
            value={newRole}
            onChangeText={setNewRole}
            placeholder="Role"
          />
          <Input
            className="min-h-[100px] py-2 text-start"
            value={newJobDescription}
            onChangeText={setNewJobDescription}
            placeholder="Job description"
            multiline
            textAlignVertical="top"
          />
          <Button onPress={handleAddJob}>
            <Text>Add Job</Text>
          </Button>
        </CardContent>
      </Card>

      {/* Feature 3 & 4: Jobs list with status update + tap to view details */}
      <Text className="text-lg font-bold text-foreground mb-3">Jobs ({jobs.length})</Text>
      {jobs.map((job) => (
        <Card key={job.id} className="mb-3">
          <CardHeader>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-2">
                <CardTitle className="text-base font-bold">{job.company}</CardTitle>
                <CardDescription className="text-sm">{job.role}</CardDescription>
              </View>
              <Badge variant="outline">
                <Text>{job.status.status}</Text>
              </Badge>
            </View>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleToggleDetails(job)}
              className="self-start px-0 h-auto mt-2"
            >
              <Text className="text-xs text-primary font-medium">
                {expandedJobId === job.id
                  ? 'Hide details'
                  : 'View generated CV & cover letter'}
              </Text>
            </Button>
          </CardHeader>

          <CardContent className="gap-3 pt-0">
            <View className="flex-row flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={job.status.status === status ? 'default' : 'secondary'}
                  onPress={() => handleUpdateJobStatus(job, status)}
                  className="h-8 px-2.5"
                >
                  <Text className="text-xs">{status}</Text>
                </Button>
              ))}
            </View>

            {expandedJobId === job.id && (
              <View className="mt-3 pt-3 border-t border-border gap-2">
                <Text className="text-sm font-semibold text-foreground">Generated CV</Text>
                <NativeMarkdown
                  content={job.generatedCv}
                  fallbackText="No CV generated yet"
                />

                <Text className="text-sm font-semibold text-foreground mt-2">Cover Letter</Text>
                <NativeMarkdown
                  content={job.generatedCoverLetter}
                  fallbackText="No cover letter generated yet"
                />
              </View>
            )}
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );
};

export default DashboardScreen;
