import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import Unauthorized from "./pages/Unauthorized";
import ReportIssues from "./pages/ReportIssues";
import UserDashboard from "./pages/UserDashboard";
import TrackProgress from "./pages/TrackProgress";
import Community from "./pages/Community";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Download from "./pages/Download";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";
// Removed floating download button globally

function App() {
  // Store users for signup/login
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (_) {
      return null;
    }
  });

  const handleSignupSuccess = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const setUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} registeredUsers={users} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />
        <Route path="/report" element={<ProtectedRoute><ReportIssues user={currentUser} /></ProtectedRoute>} />
        <Route path="/track" element={<TrackProgress />} />
        <Route path="/community" element={<Community />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/download" element={<Download />} />
        <Route path="/settings" element={<ProtectedRoute><Settings user={currentUser} setUser={setUser} /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard user={currentUser} /></ProtectedRoute>} />
  <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard user={currentUser} /></ProtectedRoute>} />
        <Route path="/authority-dashboard" element={<ProtectedRoute requiredRole="authority"><AuthorityDashboard user={currentUser} /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
      {/* Download button removed from all pages */}
    </Router>
  );
}

export default App;
