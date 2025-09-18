import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Signup({ onSignupSuccess }) {
  const ADMIN_VERIFY_CODE = 'ADMIN-2025';
  const AUTHORITY_VERIFY_CODE = 'AUTH-2025';
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    address: "",
    dob: "",
    terms: false,
    role: "user",
    verificationCode: "",
  });

  const navigate = useNavigate();

  const validate = () => {
    if (!formData.fname || !formData.lname || !formData.username) return false;
    if (!formData.email || !formData.phone) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (!formData.terms) return false;
    if (!formData.role) return false;
    if (formData.role !== 'user') {
      if (!formData.verificationCode) return false;
      const isAdminValid = formData.role === 'admin' && formData.verificationCode === ADMIN_VERIFY_CODE;
      const isAuthValid = formData.role === 'authority' && formData.verificationCode === AUTHORITY_VERIFY_CODE;
      if (!(isAdminValid || isAuthValid)) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("❌ Please fill all required fields correctly.");
      return;
    }
    const newUser = { username: formData.username, password: formData.password, role: formData.role, address: formData.address, department: formData.department || (formData.role === 'authority' ? 'All' : '') };
    try {
      const profileKey = `profile:${formData.username}`;
      const profile = {
        name: `${formData.fname} ${formData.lname}`.trim(),
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        role: formData.role,
        address: formData.address,
        department: formData.department || '',
        notifications: true,
        theme: 'light',
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
    } catch (_) {}
    if (onSignupSuccess) onSignupSuccess(newUser);
    alert("Signup Successful ✅ You can now login.");
    navigate("/login");
  };

  return (
    <motion.div
      className="container mt-5"
      style={{ maxWidth: "700px" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="mb-4 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        ✨ Create an Account ✨
      </motion.h2>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.fname}
              onChange={(e) =>
                setFormData({ ...formData, fname: e.target.value })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.lname}
              onChange={(e) =>
                setFormData({ ...formData, lname: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>

        {/* Address moved below password fields */}
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            placeholder="House No, Street, City, State, ZIP"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Role</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="authority">Authority</option>
          </select>
        </div>

        {formData.role !== 'user' && (
          <div className="mb-3">
            <label className="form-label">Verification Code for {formData.role === 'admin' ? 'Admin' : 'Authority'}</label>
            <input
              type="text"
              className="form-control"
              value={formData.verificationCode}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
              placeholder={formData.role === 'admin' ? 'Enter ADMIN-2025' : 'Enter AUTH-2025'}
              required
            />
            <small className="text-muted">Ask your organization for the verification code.</small>
          </div>
        )}

        {formData.role === 'admin' && (
          <div className="mb-3">
            <label className="form-label">Admin Department</label>
            <select
              className="form-select"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              <option value="Roads">Roads</option>
              <option value="Electricity">Electricity</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Spaces">Public Spaces</option>
            </select>
            <small className="text-muted">Admins manage their selected department.</small>
          </div>
        )}

        {formData.role === 'authority' && (
          <div className="mb-3">
            <label className="form-label">Authority Coverage</label>
            <input className="form-control" value="All Departments" disabled />
            <small className="text-muted">Authorities oversee all departments.</small>
          </div>
        )}

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.terms}
            onChange={(e) =>
              setFormData({ ...formData, terms: e.target.checked })
            }
          />
          <label className="form-check-label">
            I agree to the Terms & Conditions
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="btn btn-primary w-100"
        >
          🚀 Sign Up
        </motion.button>
      </form>
    </motion.div>
  );
}

export default Signup;
