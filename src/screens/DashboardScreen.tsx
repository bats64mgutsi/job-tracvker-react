import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { jobService } from '../services/job';
import { userService } from '../services/user';
import { useAuth } from '../services/auth-context';
import { Job, JobStatus, JobUpdate } from '../models/job.model';
import { User } from '../models/user.model';
import { NativeMarkdown } from '../components/NativeMarkdown';

export interface DashboardScreenProps {
  onNavigate: (screen: 'home' | 'login' | 'signup' | 'dashboard') => void;
}

function formatMedium(date: Date | any): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function getLatestJobUpdate(job: Job): JobUpdate {
  if (!job.jobUpdates || job.jobUpdates.length === 0) {
    return { status: JobStatus.NEW, updatedAt: new Date() };
  }
  return job.jobUpdates.reduce((latest, current) => {
    const currentDate = current.updatedAt instanceof Date ? current.updatedAt : new Date(current.updatedAt);
    const latestDate = latest.updatedAt instanceof Date ? latest.updatedAt : new Date(latest.updatedAt);
    return currentDate > latestDate ? current : latest;
  });
}

const ALL_STATUSES: JobStatus[] = [
  JobStatus.NEW,
  JobStatus.APPLIED,
  JobStatus.INTERVIEW,
  JobStatus.OFFER,
  JobStatus.REJECTED,
  JobStatus.ACCEPTED,
];

const FILTER_OPTIONS = ['ALL', ...ALL_STATUSES];

const getStatusBadgeStyle = (status: JobStatus | string) => {
  switch (status) {
    case JobStatus.NEW:
      return { bg: '#e9ecef', text: '#495057' };
    case JobStatus.APPLIED:
      return { bg: '#cff4fc', text: '#055160' };
    case JobStatus.INTERVIEW:
      return { bg: '#fff3cd', text: '#664d03' };
    case JobStatus.OFFER:
      return { bg: '#d1e7dd', text: '#0f5132' };
    case JobStatus.REJECTED:
      return { bg: '#f8d7da', text: '#842029' };
    case JobStatus.ACCEPTED:
      return { bg: '#e0cffc', text: '#3d0a91' };
    default:
      return { bg: '#e9ecef', text: '#495057' };
  }
};

export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<User | undefined>();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Mode states: 'view' | 'add-job' | 'edit-cv'
  const [mode, setMode] = useState<'view' | 'add-job' | 'edit-cv'>('view');

  // Add Job form fields
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [isSavingJob, setIsSavingJob] = useState(false);

  // Edit CV form fields
  const [cvText, setCvText] = useState('');
  const [isSavingCv, setIsSavingCv] = useState(false);

  // Inspect selected job
  const [viewedJob, setViewedJob] = useState<Job | undefined>();

  // Force re-render for local updates
  const [, forceUpdate] = useState(0);

  const loadJobs = async () => {
    try {
      setJobs(null);
      const items = await jobService.getJobs();
      setJobs(items);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = await userService.getUser();
      setCurrentUserProfile(user);
    } catch (err) {
      console.warn('Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    loadJobs();
    loadUserProfile();
  }, []);

  const triggerAlert = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  // Pre-submission CV validation
  const handleBeginAddJob = async () => {
    try {
      const user = await userService.getUser();
      if (!user?.cv || !user.cv.trim()) {
        triggerAlert('CV Required', 'Please set your CV before adding a job.');
        return;
      }
      setNewCompany('');
      setNewRole('');
      setNewJobDescription('');
      setMode('add-job');
      setViewedJob(undefined);
    } catch (err) {
      triggerAlert('Notice', 'Please set your CV before adding a job.');
    }
  };

  const handleCancelAddJob = () => {
    setMode('view');
  };

  const handleSaveJob = async () => {
    if (!newJobDescription.trim()) {
      triggerAlert('Validation', 'Job description cannot be empty.');
      return;
    }

    setIsSavingJob(true);
    try {
      const newJob: Job = {
        company: newCompany.trim() || 'Untitled Company',
        role: newRole.trim() || 'Untitled Role',
        jobDescription: newJobDescription.trim(),
        jobUpdates: [{ status: JobStatus.NEW, updatedAt: new Date() }],
      };

      await jobService.addJob(newJob);
      setMode('view');
      await loadJobs();
    } catch (err) {
      console.error('Error saving job:', err);
      triggerAlert('Error', 'Failed to save job application.');
    } finally {
      setIsSavingJob(false);
    }
  };

  const handleBeginEditCv = async () => {
    try {
      const user = await userService.getUser();
      setCvText(user?.cv ?? '');
      setMode('edit-cv');
      setViewedJob(undefined);
    } catch (err) {
      setCvText('');
      setMode('edit-cv');
    }
  };

  const handleCancelEditCv = () => {
    setMode('view');
  };

  const handleSaveCv = async () => {
    setIsSavingCv(true);
    try {
      await userService.updateUser({
        email: currentUser?.email ?? '',
        cv: cvText.trim(),
      });
      await loadUserProfile();
      setMode('view');
    } catch (err) {
      console.error('Error saving CV:', err);
      triggerAlert('Error', 'Failed to update CV.');
    } finally {
      setIsSavingCv(false);
    }
  };

  const handleToggleJobDetails = (job: Job) => {
    if (viewedJob?.id === job.id) {
      setViewedJob(undefined);
    } else {
      setViewedJob(job);
      setMode('view');
    }
  };

  const handleUpdateJobStatus = async (job: Job, newStatus: JobStatus) => {
    try {
      await jobService.updateJobStatus(job.id!, newStatus);
      job.jobUpdates.push({ status: newStatus, updatedAt: new Date() });
      forceUpdate((n) => n + 1);
    } catch (err) {
      console.error('Failed to update job status:', err);
      triggerAlert('Error', 'Failed to update job status.');
    }
  };

  // Filter jobs by selected status
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (selectedFilter === 'ALL') return jobs;
    return jobs.filter((j) => getLatestJobUpdate(j).status === selectedFilter);
  }, [jobs, selectedFilter]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Top User Info Bar */}
          <View style={styles.topInfoBar}>
            <View>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <Text style={styles.userEmailSubtitle}>
                Signed in as: <Text style={styles.boldEmail}>{currentUser?.email || 'User'}</Text>
              </Text>
            </View>

            {mode === 'view' ? (
              <View style={styles.topActionsRow}>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={handleBeginEditCv}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnSecondaryText}>
                    {currentUserProfile?.cv ? 'Edit CV' : 'Set Master CV'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleBeginAddJob}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPrimaryText}>Add Job</Text>
                </TouchableOpacity>
              </View>
            ) : mode === 'add-job' ? (
              <View style={styles.topActionsRow}>
                <TouchableOpacity
                  style={styles.btnDanger}
                  onPress={handleCancelAddJob}
                  disabled={isSavingJob}
                >
                  <Text style={styles.btnDangerText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSaveJob}
                  disabled={isSavingJob}
                >
                  {isSavingJob ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save Job</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.topActionsRow}>
                <TouchableOpacity
                  style={styles.btnDanger}
                  onPress={handleCancelEditCv}
                  disabled={isSavingCv}
                >
                  <Text style={styles.btnDangerText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSaveCv}
                  disabled={isSavingCv}
                >
                  {isSavingCv ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save CV</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Master CV Status Banner / Summary (when not editing) */}
          {mode === 'view' && !viewedJob ? (
            <View style={styles.cvSummaryBox}>
              <View style={styles.cvSummaryHeader}>
                <Text style={styles.cvSummaryTitle}>Master CV</Text>
                <TouchableOpacity onPress={handleBeginEditCv}>
                  <Text style={styles.linkAction}>
                    {currentUserProfile?.cv ? 'Edit CV' : 'Set CV'}
                  </Text>
                </TouchableOpacity>
              </View>
              {currentUserProfile?.cv ? (
                <NativeMarkdown
                  content={currentUserProfile.cv}
                  fallbackText="No master CV set. Please set your CV before adding jobs."
                />
              ) : (
                <Text style={styles.noCvNotice}>
                  No master CV set yet. Please click 'Set Master CV' above before adding job applications.
                </Text>
              )}
            </View>
          ) : null}

          {/* ADD JOB FORM */}
          {mode === 'add-job' && (
            <View style={styles.formCard}>
              <Text style={styles.formHeader}>New Job Application</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Company</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCompany}
                  onChangeText={setNewCompany}
                  placeholder="e.g. Google, Acme Corp"
                  placeholderTextColor="#adb5bd"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role / Position</Text>
                <TextInput
                  style={styles.textInput}
                  value={newRole}
                  onChangeText={setNewRole}
                  placeholder="e.g. Senior Software Engineer"
                  placeholderTextColor="#adb5bd"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Job Description</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newJobDescription}
                  onChangeText={setNewJobDescription}
                  placeholder="Paste the job description here..."
                  placeholderTextColor="#adb5bd"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formActionsRow}>
                <TouchableOpacity style={styles.btnDanger} onPress={handleCancelAddJob}>
                  <Text style={styles.btnDangerText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSaveJob}
                  disabled={isSavingJob}
                >
                  {isSavingJob ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* EDIT CV FORM */}
          {mode === 'edit-cv' && (
            <View style={styles.formCard}>
              <Text style={styles.formHeader}>Edit Master CV (Markdown)</Text>
              <Text style={styles.formSubheader}>
                Use Markdown formatting (# for headers, - for bullets, **bold**, etc.)
              </Text>

              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.textInput, styles.cvMultilineInput]}
                  value={cvText}
                  onChangeText={setCvText}
                  placeholder="# Jane Doe&#10;&#10;**Software Engineer**&#10;- 5+ years experience with React and TypeScript&#10;- Built scalable cloud architectures"
                  placeholderTextColor="#adb5bd"
                  multiline
                  numberOfLines={12}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formActionsRow}>
                <TouchableOpacity style={styles.btnDanger} onPress={handleCancelEditCv}>
                  <Text style={styles.btnDangerText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleSaveCv}
                  disabled={isSavingCv}
                >
                  {isSavingCv ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save Master CV</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* JOB DETAILS INSPECTION VIEW */}
          {mode === 'view' && viewedJob && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailCompany}>{viewedJob.company || 'Untitled Company'}</Text>
                  <Text style={styles.detailRole}>{viewedJob.role || 'Untitled Role'}</Text>
                  <Text style={styles.detailTimestamp}>
                    Updated: {formatMedium(getLatestJobUpdate(viewedJob).updatedAt)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeDetailsBtn}
                  onPress={() => setViewedJob(undefined)}
                >
                  <Text style={styles.closeDetailsText}>✕ Close Details</Text>
                </TouchableOpacity>
              </View>

              {/* Status Transition Picker */}
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeader}>Application Stage</Text>
              <Text style={styles.sectionSubtext}>Tap any stage to update status immediately:</Text>

              <View style={styles.statusButtonsWrap}>
                {ALL_STATUSES.map((status) => {
                  const isCurrent = getLatestJobUpdate(viewedJob).status === status;
                  const badgeStyle = getStatusBadgeStyle(status);

                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusPillBtn,
                        { backgroundColor: badgeStyle.bg },
                        isCurrent && styles.statusPillBtnActive,
                      ]}
                      onPress={() => handleUpdateJobStatus(viewedJob, status)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: badgeStyle.text },
                          isCurrent && styles.statusPillTextActive,
                        ]}
                      >
                        {isCurrent ? `✓ ${status.toUpperCase()}` : status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Job Description */}
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeader}>Job Description</Text>
              <View style={styles.textBlockBox}>
                <Text style={styles.descriptionText}>
                  {viewedJob.jobDescription || 'No description provided.'}
                </Text>
              </View>

              {/* Generated Cover Letter */}
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeader}>Cover Letter</Text>
              <View style={styles.textBlockBox}>
                <NativeMarkdown
                  content={viewedJob.generatedCoverLetter}
                  fallbackText="No cover letter generated yet"
                />
              </View>

              {/* Generated Tailored CV */}
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeader}>Tailored CV</Text>
              <View style={styles.textBlockBox}>
                <NativeMarkdown
                  content={viewedJob.generatedCv}
                  fallbackText="No CV generated yet"
                />
              </View>
            </View>
          )}

          {/* STATUS FILTER BAR & JOBS LIST */}
          {mode === 'view' && (
            <View style={styles.jobsSectionContainer}>
              <View style={styles.filterBarHeader}>
                <Text style={styles.sectionHeader}>Applications ({filteredJobs.length})</Text>
              </View>

              {/* Status filter bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollView}
              >
                {FILTER_OPTIONS.map((filter) => {
                  const isSelected = selectedFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                      onPress={() => setSelectedFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextSelected,
                        ]}
                      >
                        {filter.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Jobs Cards List */}
              {jobs === null ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="#0d6efd" />
                  <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
              ) : filteredJobs.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>
                    {jobs.length === 0
                      ? 'No jobs yet. Load your first job'
                      : `No applications with status "${selectedFilter}"`}
                  </Text>
                  {jobs.length === 0 && (
                    <TouchableOpacity
                      style={[styles.btnPrimary, { marginTop: 16 }]}
                      onPress={handleBeginAddJob}
                    >
                      <Text style={styles.btnPrimaryText}>Add Your First Job</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.cardsGrid}>
                  {filteredJobs.map((job) => {
                    const latest = getLatestJobUpdate(job);
                    const badge = getStatusBadgeStyle(latest.status);
                    const isSelected = viewedJob?.id === job.id;

                    return (
                      <TouchableOpacity
                        key={job.id}
                        style={[styles.jobCard, isSelected && styles.jobCardSelected]}
                        onPress={() => handleToggleJobDetails(job)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.jobCardHeader}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.jobCardCompany} numberOfLines={1}>
                              {job.company || 'Untitled Company'}
                            </Text>
                            <Text style={styles.jobCardRole} numberOfLines={1}>
                              {job.role || 'Untitled Role'}
                            </Text>
                          </View>

                          <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.badgeText, { color: badge.text }]}>
                              {latest.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.jobCardDate}>
                          Updated: {formatMedium(latest.updatedAt)}
                        </Text>

                        <View style={styles.jobCardFooter}>
                          <Text style={styles.viewDetailsPrompt}>
                            {isSelected ? '▲ Hide Details' : '▼ Tap to inspect & update status'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212529',
  },
  userEmailSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  boldEmail: {
    fontWeight: '600',
    color: '#0d6efd',
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cvSummaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cvSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cvSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  linkAction: {
    color: '#0d6efd',
    fontWeight: '600',
    fontSize: 14,
  },
  noCvNotice: {
    color: '#dc3545',
    fontStyle: 'italic',
    fontSize: 14,
    marginVertical: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  formHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  formSubheader: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#212529',
  },
  multilineInput: {
    minHeight: 140,
  },
  cvMultilineInput: {
    minHeight: 200,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#0d6efd',
    shadowColor: '#0d6efd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailCompany: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  detailRole: {
    fontSize: 16,
    color: '#495057',
    marginTop: 2,
  },
  detailTimestamp: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
  },
  closeDetailsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  closeDetailsText: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 10,
  },
  statusButtonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  statusPillBtnActive: {
    borderColor: '#0d6efd',
    borderWidth: 2,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusPillTextActive: {
    fontWeight: 'bold',
  },
  textBlockBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#343a40',
  },
  jobsSectionContainer: {
    marginTop: 10,
  },
  filterBarHeader: {
    marginBottom: 10,
  },
  filterScrollView: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterChipSelected: {
    backgroundColor: '#0d6efd',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  cardsGrid: {
    gap: 12,
    marginTop: 8,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobCardSelected: {
    borderColor: '#0d6efd',
    borderWidth: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  jobCardCompany: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
  },
  jobCardRole: {
    fontSize: 15,
    color: '#495057',
    marginTop: 2,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  jobCardDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  jobCardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  viewDetailsPrompt: {
    fontSize: 12,
    color: '#0d6efd',
    fontWeight: '500',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#6c757d',
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default DashboardScreen;
