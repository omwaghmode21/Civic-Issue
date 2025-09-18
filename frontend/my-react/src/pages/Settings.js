import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings({ user, setUser }) {
  const navigate = useNavigate();

  const username = user?.username || JSON.parse(localStorage.getItem('currentUser') || 'null')?.username || '';

  const storageKey = useMemo(() => (username ? `profile:${username}` : null), [username]);

  const [profile, setProfile] = useState(() => {
    try {
      if (!storageKey) return { 
        name: '', 
        email: '', 
        phone: '',
        gender: '',
        dob: '',
        role: user?.role || 'user', 
        address: '',
        department: '',
        notifications: true,
        theme: 'light'
      };
      const existing = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (existing) return existing;
    } catch (_) {}
    const fallback = {
      name: username || '',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      role: user?.role || 'user',
      address: '',
      department: '',
      notifications: true,
      theme: 'light',
    };
    return fallback;
  });

  useEffect(() => {
    if (storageKey) {
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (existing) setProfile((p) => ({ ...p, ...existing }));
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const saveProfile = () => {
    if (!storageKey) return;
    const toSave = {
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      dob: profile.dob || '',
      role: profile.role || 'user',
      address: profile.address || '',
      department: profile.department || '',
      notifications: !!profile.notifications,
      theme: profile.theme || 'light',
    };
    localStorage.setItem(storageKey, JSON.stringify(toSave));
    // Apply theme to body for persistence on reload
    document.body.setAttribute('data-theme', toSave.theme);
    alert('Settings saved');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    if (setUser) setUser(null);
    navigate('/');
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4">Settings</h2>
      <p className="text-muted">
        In Settings, you can manage all your account details and preferences. Update your personal information,
        change your address, review your user role, and manage security options. You can also log out anytime from here.
      </p>

      <div className="card mb-4">
        <div className="card-header">User Information</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Role</label>
              <input type="text" className="form-control" value={profile.role} disabled />
            </div>
          </div>

          {profile.role === 'admin' && profile.department && (
            <div className="mb-3">
              <label className="form-label">Department</label>
              <input type="text" className="form-control" value={profile.department} disabled />
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Address</div>
        <div className="card-body">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            placeholder="House No, Street, City, State, ZIP"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Change Password</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" placeholder="Enter new password" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" placeholder="Re-enter new password" />
            </div>
          </div>
          <small className="text-muted">Note: This demo does not persist passwords.</small>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Account Preferences</div>
        <div className="card-body">
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="notifSwitch"
              checked={!!profile.notifications}
              onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="notifSwitch">Enable Notifications</label>
          </div>
          <div className="mb-3">
            <label className="form-label">Theme</label>
            <select
              className="form-select"
              value={profile.theme || 'light'}
              onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>
        <button className="btn btn-danger ms-auto" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default Settings;




