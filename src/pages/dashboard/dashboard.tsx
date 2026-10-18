import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { jobService } from '../../services/job';
import { userService } from '../../services/user';
import { Job, JobStatus, JobUpdate } from '../../models/job.model';
import { User } from '../../models/user.model';

// Mirrors Angular's DatePipe 'medium' format, e.g. "Jan 1, 2024, 12:00:00 PM"
function formatMedium(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function getStatuses(): JobStatus[] {
  return Object.values(JobStatus);
}

function getLatestJobUpdate(job: Job): JobUpdate {
  return job.jobUpdates.reduce((latest, current) => {
    return current.updatedAt > latest.updatedAt ? current : latest;
  });
}

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[] | null>(null);

  const [editedJob, setEditedJob] = useState<Job | undefined>();
  const [viewedJob, setViewedJob] = useState<Job | undefined>();
  const [editedUser, setEditedUser] = useState<User | undefined>();
  const [editingUser, setEditingUser] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  // force re-render after mutating a job's jobUpdates array in place
  const [, forceUpdate] = useState(0);

  const loadJobs = async () => {
    setJobs(null);
    const items = await jobService.getJobs();
    setJobs(items);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const beginJobEdit = async () => {
    const user = await userService.getUser();
    if (!user?.cv) {
      window.alert('Please set your CV before adding a job.');
      return;
    }
    setEditedJob({
      company: '',
      role: '',
      jobDescription: '',
      jobUpdates: []
    });
  };

  const cancelJobEdit = () => {
    setEditedJob(undefined);
  };

  const saveJob = async () => {
    const job: Job = {
      ...editedJob!,
      jobUpdates: [{ status: JobStatus.NEW, updatedAt: new Date() }]
    };
    await jobService.addJob(job);
    setEditedJob(undefined);
    loadJobs();
  };

  const editUser = async () => {
    setEditingUser(true);
    setUserLoading(true);
    const user = await userService.getUser();
    setEditedUser(user ? user : { email: '', cv: '' });
    setUserLoading(false);
  };

  const cancelUserEdit = () => {
    setEditedUser(undefined);
    setEditingUser(false);
  };

  const saveUser = () => {
    if (editedUser) {
      userService.updateUser(editedUser);
      setEditedUser(undefined);
      setEditingUser(false);
    }
  };

  const toggleDetails = (job: Job) => {
    if (viewedJob?.id === job.id) {
      setViewedJob(undefined);
    } else {
      setViewedJob(job);
    }
  };

  const updateJobStatus = async (job: Job, newStatus: JobStatus) => {
    await jobService.updateJobStatus(job.id!, newStatus);
    job.jobUpdates.push({ status: newStatus, updatedAt: new Date() });
    forceUpdate((n) => n + 1);
  };

  return (
    <main className="container mt-4">
      <section className="d-flex justify-content-between">
        <h2>Dashboard</h2>

        {editedJob ? (
          <section className="gap-2 d-flex">
            <button className="btn btn-danger" onClick={cancelJobEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveJob}>Save</button>
          </section>
        ) : editingUser ? (
          <section className="gap-2 d-flex">
            <button className="btn btn-danger" onClick={cancelUserEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveUser}>Save</button>
          </section>
        ) : (
          <section className="gap-2 d-flex">
            <button className="btn btn-secondary" onClick={editUser}>Edit CV</button>
            <button className="btn btn-primary" onClick={beginJobEdit}>Add Job</button>
          </section>
        )}
      </section>

      {editedJob && (
        <textarea
          className="form-control mt-2"
          rows={10}
          value={editedJob.jobDescription}
          onChange={(e) => setEditedJob({ ...editedJob, jobDescription: e.target.value })}
          placeholder="Please enter the job description..."
        />
      )}

      {editingUser ? (
        userLoading || !editedUser ? (
          <p>Loading...</p>
        ) : (
          <textarea
            className="form-control mt-2"
            rows={10}
            value={editedUser.cv ?? ''}
            onChange={(e) => setEditedUser({ ...editedUser, cv: e.target.value })}
            placeholder="Please enter your CV..."
          />
        )
      ) : viewedJob ? (
        <>
          <table className="table table-striped mt-3">
            <thead className="table-dark">
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => toggleDetails(viewedJob)}>
                <td>{viewedJob.company}</td>
                <td>{viewedJob.role}</td>
                <td><span className="badge bg-secondary">{getLatestJobUpdate(viewedJob).status}</span></td>
                <td>{formatMedium(getLatestJobUpdate(viewedJob).updatedAt)}</td>
              </tr>
            </tbody>
          </table>

          <h3>Status</h3>
          <hr />
          {getStatuses().map((status) => (
            <section className="form-check form-check-inline" key={status}>
              <input
                type="radio"
                className="form-check-input"
                name="statusRadioOptions"
                id={`statusRadio${status}`}
                checked={getLatestJobUpdate(viewedJob).status === status}
                onChange={() => updateJobStatus(viewedJob, status)}
              />
              <label htmlFor={`statusRadio${status}`} className="form-check-label">{status}</label>
            </section>
          ))}

          <h3 className="mt-3">Job Description</h3>
          <hr />
          <p>{viewedJob.jobDescription}</p>

          <h3>Cover Letter</h3>
          <hr />
          <Markdown>{viewedJob.generatedCoverLetter || 'No cover letter gerenated yet'}</Markdown>

          <h3>CV</h3>
          <hr />
          <Markdown>{viewedJob.generatedCv || 'No CV generated yet'}</Markdown>
        </>
      ) : (
        <table className="table table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {jobs ? (
              jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} onClick={() => toggleDetails(job)}>
                    <td>{job.company}</td>
                    <td>{job.role}</td>
                    <td><span className="badge bg-secondary">{getLatestJobUpdate(job).status}</span></td>
                    <td>{formatMedium(getLatestJobUpdate(job).updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <p>No jobs yet. Load your first job</p>
              )
            ) : (
              <p>Loading...</p>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
