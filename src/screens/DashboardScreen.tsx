import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { jobService } from '../services/job';
import { userService } from '../services/user';
import { useAuth } from '../services/auth-context';
import { Job, JobStatus } from '../models/job.model';
import { NativeMarkdown } from '../components/NativeMarkdown';

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
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Dashboard</Text>
      <Text style={styles.subtitle}>Signed in as {currentUser?.email || 'User'}</Text>

      {/* Feature 1: Edit CV */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your CV</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={cvText}
          onChangeText={setCvText}
          placeholder="Write your CV here..."
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveCv}>
          <Text style={styles.buttonText}>Save CV</Text>
        </TouchableOpacity>
      </View>

      {/* Feature 2: Load a job */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add a Job</Text>
        <TextInput
          style={styles.input}
          value={newCompany}
          onChangeText={setNewCompany}
          placeholder="Company"
        />
        <TextInput
          style={styles.input}
          value={newRole}
          onChangeText={setNewRole}
          placeholder="Role"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          value={newJobDescription}
          onChangeText={setNewJobDescription}
          placeholder="Job description"
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddJob}>
          <Text style={styles.buttonText}>Add Job</Text>
        </TouchableOpacity>
      </View>

      {/* Feature 3 & 4: Jobs list with status update + tap to view details */}
      <Text style={styles.cardTitle}>Jobs ({jobs.length})</Text>
      {jobs.map((job) => (
        <View key={job.id} style={styles.card}>
          <TouchableOpacity onPress={() => handleToggleDetails(job)}>
            <Text style={styles.jobCompany}>{job.company}</Text>
            <Text style={styles.jobRole}>{job.role}</Text>
            <Text style={styles.jobStatus}>Status: {job.status.status}</Text>
            <Text style={styles.tapHint}>
              {expandedJobId === job.id ? 'Tap to hide details' : 'Tap to view generated CV & cover letter'}
            </Text>
          </TouchableOpacity>

          <View style={styles.statusRow}>
            {ALL_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.statusButton}
                onPress={() => handleUpdateJobStatus(job, status)}
              >
                <Text style={styles.statusButtonText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {expandedJobId === job.id && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Generated CV</Text>
              <NativeMarkdown content={job.generatedCv} fallbackText='No Cv generated yet' />

              <Text style={styles.detailLabel}>Cover Letter</Text>
              <NativeMarkdown content={job.generatedCoverLetter} fallbackText='No cover letter generated yet' />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 120,
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  jobCompany: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  jobRole: {
    fontSize: 14,
    color: '#495057',
  },
  jobStatus: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    color: '#0d6efd',
    marginBottom: 10,
  },
  detailSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});

export default DashboardScreen;
