import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      console.log(email, password);
      await authService.signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Invalid email or password. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInvalid = !email || !password;

  return (
    <main className="container mt-5">
      <h2 className="mb-4">Sign In</h2>

      {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}

      <form onSubmit={onSubmit}>
        <section>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </section>

        <section>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </section>

        <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting || isInvalid}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-3 text-center">
        Don't have an account <Link to="/signup">Sign Up</Link>
      </p>
    </main>
  );
}
