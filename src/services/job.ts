import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { firestore, firebaseAuth } from '../firebase';
import { Job, JobStatus, JobUpdate } from '../models/job.model';

export class JobService {
  private db = firestore;

  private jobsCollection() {
    const uid = firebaseAuth.currentUser?.uid;

    if (!uid) {
      throw new Error('Cannot access jobs: No user is signed in.');
    }
    return collection(this.db, 'users', uid, 'jobs');
  }

  async getJobs(): Promise<Job[]> {
    const snapshot = await getDocs(this.jobsCollection());
    return snapshot.docs.map((d) => this.toJob(d.id, d.data()));
  }

  async addJob(job: Job): Promise<Job> {
    const docRef = await addDoc(this.jobsCollection(), {
      company: job.company ?? '',
      role: job.role ?? '',
      jobDescription: job.jobDescription ?? '',
      generatedCv: job.generatedCv ?? '',
      generatedCoverLetter: job.generatedCoverLetter ?? '',
      jobUpdates: job.jobUpdates.map((u) => ({
        status: u.status,
        updatedAt: u.updatedAt,
      }))
    });
    return { ...job, id: docRef.id };
  }

  async saveJob(job: Job): Promise<string> {
    const created = await this.addJob(job);
    return created.id ?? '';
  }

  async updateJobStatus(jobId: string, newStatus: JobStatus): Promise<void> {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;

    const jobRef = doc(this.db, 'users', uid, 'jobs', jobId);
    await updateDoc(jobRef, {
      jobUpdates: arrayUnion({ status: newStatus, updatedAt: new Date() })
    });
  }

  private toJob(id: string, data: DocumentData): Job {
    const rawUpdates = data['jobUpdates'] ?? [];
    const jobUpdates: JobUpdate[] = rawUpdates.map((u: any) => {
      const rawDate = u.updatedAt ?? u.updateAt;
      let date: Date;
      if (rawDate instanceof Timestamp) {
        date = rawDate.toDate();
      } else if (rawDate instanceof Date) {
        date = rawDate;
      } else if (rawDate) {
        date = new Date(rawDate);
      } else {
        date = new Date();
      }

      return {
        status: u.status as JobStatus,
        updatedAt: date,
      };
    });

    return {
      id,
      company: data['company'] ?? '',
      role: data['role'] ?? '',
      jobDescription: data['jobDescription'] ?? '',
      generatedCv: data['generatedCv'],
      generatedCoverLetter: data['generatedCoverLetter'],
      jobUpdates
    };
  }
}

export const jobService = new JobService();
