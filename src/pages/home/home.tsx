import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main className="container mt-5 text-center">
      <h1 className="display-4">Job Application Tracker</h1>
      <p className="lead text-muted">Keep track of all your job applications in one place.</p>
      <Link to="/dashboard" className="btn btn-primary btn-lg mt-3">Go to Dashboard</Link>
    </main>
  );
}
