// src/pages/AdminRegister.js

import { useState } from "react";
import { motion } from "framer-motion";

function AdminRegister() {
  const [formData, setFormData] = useState({
    fname: "", lname: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
    department: "", state: "", district: "", taluka: "", terms: false,
  });
  const [errors, setErrors] = useState({});

  const states = ["Maharashtra", "Gujarat", "Karnataka", "Delhi", "Tamil Nadu"];
  const districts = {
    Maharashtra: ["Pune", "Mumbai", "Nagpur"], Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubli"], Delhi: ["Central Delhi", "North Delhi", "South Delhi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  };
  const talukas = {
    Pune: ["Haveli", "Baramati", "Mulshi"], Mumbai: ["Andheri", "Borivali", "Dadar"],
    Nagpur: ["Katol", "Umred", "Hingna"], Ahmedabad: ["Daskroi", "Sanand", "Detroj"],
    Surat: ["Olpad", "Kamrej", "Choryasi"],
  };
  const departments = ["Health", "Education", "Police", "Transport", "Revenue", "Municipal"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.fname) newErrors.fname = "First name is required";
    if (!formData.lname) newErrors.lname = "Last name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.department) newErrors.department = "Select department";
    if (!formData.state) newErrors.state = "Select state";
    if (!formData.district) newErrors.district = "Select district";
    if (!formData.taluka) newErrors.taluka = "Select taluka";
    if (!formData.terms) newErrors.terms = "You must accept terms & conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("✅ Admin Registered Successfully!");
      console.log("Admin Data:", formData);
      setFormData({
        fname: "", lname: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
        department: "", state: "", district: "", taluka: "", terms: false,
      });
    }
  };

  return (
    <motion.div className="container mt-5" style={{ maxWidth: "700px" }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <motion.h2 className="mb-4 text-center"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        🏛️ Admin Registration
      </motion.h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3"><label className="form-label">First Name</label><input type="text" className="form-control" name="fname" value={formData.fname} onChange={handleChange} />{errors.fname && <small className="text-danger">{errors.fname}</small>}</div>
          <div className="col-md-6 mb-3"><label className="form-label">Last Name</label><input type="text" className="form-control" name="lname" value={formData.lname} onChange={handleChange} />{errors.lname && <small className="text-danger">{errors.lname}</small>}</div>
        </div>
        <div className="mb-3"><label className="form-label">Username</label><input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} />{errors.username && <small className="text-danger">{errors.username}</small>}</div>
        <div className="row">
          <div className="col-md-6 mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />{errors.email && <small className="text-danger">{errors.email}</small>}</div>
          <div className="col-md-6 mb-3"><label className="form-label">Phone</label><input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />{errors.phone && <small className="text-danger">{errors.phone}</small>}</div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3"><label className="form-label">Password</label><input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />{errors.password && <small className="text-danger">{errors.password}</small>}</div>
          <div className="col-md-6 mb-3"><label className="form-label">Confirm Password</label><input type="password" className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />{errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}</div>
        </div>
        <div className="mb-3"><label className="form-label">Department</label><select className="form-select" name="department" value={formData.department} onChange={handleChange}><option value="">-- Select Department --</option>{departments.map((d, i) => (<option key={i} value={d}>{d}</option>))}</select>{errors.department && <small className="text-danger">{errors.department}</small>}</div>
        <div className="mb-3"><label className="form-label">State</label><select className="form-select" name="state" value={formData.state} onChange={handleChange}><option value="">-- Select State --</option>{states.map((s, i) => (<option key={i} value={s}>{s}</option>))}</select>{errors.state && <small className="text-danger">{errors.state}</small>}</div>
        <div className="mb-3"><label className="form-label">District</label><select className="form-select" name="district" value={formData.district} onChange={handleChange} disabled={!formData.state}><option value="">-- Select District --</option>{formData.state && districts[formData.state]?.map((d, i) => (<option key={i} value={d}>{d}</option>))}</select>{errors.district && <small className="text-danger">{errors.district}</small>}</div>
        <div className="mb-3"><label className="form-label">Taluka</label><select className="form-select" name="taluka" value={formData.taluka} onChange={handleChange} disabled={!formData.district}><option value="">-- Select Taluka --</option>{formData.district && talukas[formData.district]?.map((t, i) => (<option key={i} value={t}>{t}</option>))}</select>{errors.taluka && <small className="text-danger">{errors.taluka}</small>}</div>
        <div className="form-check mb-3"><input type="checkbox" className="form-check-input" name="terms" checked={formData.terms} onChange={handleChange} /><label className="form-check-label">I agree to the Terms & Conditions</label>{errors.terms && <small className="text-danger d-block">{errors.terms}</small>}</div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-success w-100">🚀 Register Admin</motion.button>
      </form>
    </motion.div>
  );
}

export default AdminRegister;