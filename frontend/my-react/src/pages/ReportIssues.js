import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, CardText, GeoAlt } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// ... (The rest of the ReportIssues component code remains the same as the previous correct version)
// It already correctly imports 'addIssue' from '../mockDatabase'
function ReportIssues({ user }) {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDetails, setIssueDetails] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [issuePhoto, setIssuePhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIssueId, setCreatedIssueId] = useState('');
  const location = useLocation();

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + (location.search || ''));
    return (
      <motion.div className="container text-center my-5 p-5 bg-light rounded shadow" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="display-5 fw-bold text-danger">⚠️ Access Denied</h2>
        <p className="lead my-4">To report an issue, you must be logged in.</p>
        <Link to={`/login?redirect=${redirect}`} className="btn btn-primary btn-lg">Go to Login</Link>
      </motion.div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIssuePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const finalizeSubmission = async (locationData) => {
    try {
      let uploadedPhotoUrl = '';
      if (issuePhoto) {
        const formData = new FormData();
        formData.append('photo', issuePhoto);
        const uploadRes = await axios.post(`${API_BASE_URL}/upload/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedPhotoUrl = uploadRes.data.url;
      }
      const payload = {
        title: issueTitle,
        details: issueDetails,
        category: issueCategory,
        photoUrl: uploadedPhotoUrl,
        reporter: {
          username: user.username,
          email: user.email || `${user.username}@example.com`,
          phone: user.phone || '9999999999',
        },
        location: locationData,
      };
      const { data } = await axios.post(`${API_BASE_URL}/report`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      const created = data?.issue;
      if (created) {
        setCreatedIssueId(created.issueId || created.id);
        setMessage(`✅ Thank you! Your issue has been reported successfully.`);
      } else {
        setMessage('✅ Thank you! Your issue has been reported successfully.');
      }
    } catch (err) {
      setMessage('❌ Failed to submit issue. Please try again.');
    } finally {
      setIssueTitle('');
      setIssueDetails('');
      setIssueCategory('');
      setIssuePhoto(null);
      setPhotoPreview('');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueTitle || !issueDetails || !issuePhoto || !issueCategory) {
      setMessage('⚠️ Please fill all fields, select a category, and upload a photo.');
      return;
    }
    setIsSubmitting(true);
    setMessage('Getting your location...');
    if (!('geolocation' in navigator)) {
      await finalizeSubmission(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await finalizeSubmission({ lat: latitude, lng: longitude });
      },
      async () => {
        await finalizeSubmission(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  const categories = ["Roads", "Electricity", "Water Supply", "Waste Management", "Public Spaces", "Other"];

  return (
    <motion.div className="container my-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Report a Civic Issue</h1>
        <p className="lead text-muted col-lg-8 mx-auto">Help improve your community by reporting local issues.</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="issueCategory" className="form-label fs-5"><CardText className="me-2"/>Category</label>
                    <select id="issueCategory" className="form-select form-select-lg" value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} required>
                        <option value="" disabled>-- Select issue category --</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="issueTitle" className="form-label fs-5">Issue Title</label>
                    <input type="text" className="form-control form-control-lg" id="issueTitle" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label htmlFor="issueDetails" className="form-label fs-5">Detailed Description</label>
                    <textarea className="form-control form-control-lg" id="issueDetails" rows="5" value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} required></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="issuePhoto" className="form-label fs-5"><Image className="me-2"/>Upload Photo</label>
                    <input type="file" className="form-control form-control-lg" id="issuePhoto" accept="image/*" onChange={handleFileChange} required />
                    {photoPreview && <img src={photoPreview} alt="Preview" className="img-fluid rounded mt-3" style={{ maxHeight: '200px' }} />}
                </div>
                {message && (<div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-info'} fs-6`} role="alert">{message}</div>)}
                {!!createdIssueId && (
                  <div className="alert alert-primary d-flex justify-content-between align-items-center" role="status" aria-live="polite">
                    <span>Your Issue ID: <strong>{createdIssueId}</strong></span>
                    <div className="d-flex gap-2">
                      <Link to={`/track?issueId=${encodeURIComponent(createdIssueId)}`} className="btn btn-outline-primary btn-sm">Track</Link>
                      <Link to={`/track?issueId=${encodeURIComponent(createdIssueId)}&showMap=1`} className="btn btn-success btn-sm" aria-label={`Show map for ${createdIssueId}`}>
                        <GeoAlt className="me-1" /> Show Map
                      </Link>
                    </div>
                  </div>
                )}
                <div className="d-grid mt-5">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ReportIssues;