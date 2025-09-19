import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

function Login({ setUser, registeredUsers }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectPath = params.get('redirect') || '';
  const prefIssueId = params.get('issueId') || localStorage.getItem('lastIssueId') || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const el = document.getElementById('usernameInput');
    if (el) el.focus();
  }, []);

  const finishLogin = (userObj) => {
    setUser(userObj);
    const to = redirectPath ? decodeURIComponent(redirectPath) :
      userObj.role === 'admin' ? '/admin-dashboard' :
      userObj.role === 'authority' ? '/authority-dashboard' : '/user-dashboard';
    navigate(to, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      const endpoint = process.env.REACT_APP_LOGIN_API || 'http://localhost:5000/api/auth/login';
      const { data } = await axios.post(
        endpoint,
        { usernameOrEmail: username, password },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      const userObj = data?.user || { username, role };
      // console.log(userObj);
      finishLogin(userObj);
    } catch (err) {
      const message = err?.response?.data?.message || 'Invalid credentials.';
      setError(message);
      submittedRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2>Login</h2>
      {redirectPath && (
        <div className="alert alert-info" role="status" aria-live="polite">Please login to continue.</div>
      )}
      {prefIssueId && (
        <div className="alert alert-success d-flex justify-content-between align-items-center" role="status" aria-live="polite">
          <span>Issue ID after authentication: <strong>{prefIssueId}</strong></span>
          <Link to={`/track?issueId=${encodeURIComponent(prefIssueId)}&showMap=1`} className="btn btn-outline-success btn-sm" aria-label={`Show map for Issue ${prefIssueId}`}>
            Show Map
          </Link>
        </div>
      )}
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="roleSelect" className="form-label">
            Select Your Role
          </label>
          <select
            id="roleSelect"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="authority">Authority</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="usernameInput" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="usernameInput"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="passwordInput"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
