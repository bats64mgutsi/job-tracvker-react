import { NavLink, Link, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './services/auth';
import { useAuth } from './services/auth-context';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login.component';
import { SignUp } from './pages/signup/signup.component';
import { Dashboard } from './pages/dashboard/dashboard';

export function App() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const logOut = async () => {
    await authService.logOut();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <section className="container">
          <Link className="navbar-brand" to="/">Job Tracker</Link>
          <section></section>

          <section className="navbar-nav ms-auto">
            {currentUser ? (
              <>
                <NavLink className="nav-link" to="/" end>Home</NavLink>
                <p className="nav-link text-light-emphasis">{currentUser.email}</p>
                <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
                <button onClick={logOut} className="btn btn-outline-light btn-sml">Log Out</button>
              </>
            ) : (
              <NavLink className="nav-link" to="/login">Sign In</NavLink>
            )}
          </section>
        </section>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/signup" element={<GuestGuard><SignUp /></GuestGuard>} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
