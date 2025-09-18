import { useState } from 'react';
import { motion } from 'framer-motion';
import mockIssues from '../mockData';
import { Image, GeoAlt, CardText } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

function ReportIssues({ user }) { 
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDetails, setIssueDetails] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [issuePhoto, setIssuePhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  if (!user) {
    return (
      <motion.div 
        className="container text-center my-5 p-5 bg-light rounded shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="display-5 fw-bold text-danger">⚠️ Access Denied</h2>
        <p className="lead my-4">समस्या नोंदवण्यासाठी, कृपया आधी लॉगिन करा.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          लॉगिन पेजवर जा
        </Link>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueTitle || !issueDetails || !issuePhoto || !issueCategory) {
      setMessage('⚠️ Please fill all fields, select a category, and upload a photo.');
      return;
    }
    
    const reporterInfo = {
        name: user.username,
        email: `${user.username}@example.com`,
        phone: '9999999999'
    };
    
    const newIssue = {
      id: `CIV-${String(mockIssues.length + 1).padStart(3, '0')}`,
      title: issueTitle,
      details: issueDetails,
      category: issueCategory,
      assigned: false,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      photoUrl: photoPreview,
      reporter: reporterInfo,
    };

    mockIssues.unshift(newIssue);
    setMessage(`✅ धन्यवाद ${user.username}! तुमची समस्या यशस्वीरित्या नोंदवली गेली आहे.`);
    
    setIssueTitle('');
    setIssueDetails('');
    setIssueCategory('');
    setIssuePhoto(null);
    setPhotoPreview('');
    e.target.reset();
  };

  const categories = ["Roads", "Electricity", "Water Supply", "Waste Management", "Public Spaces", "Other"];

  return (
    <motion.div 
      className="container my-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Report a Civic Issue</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          तुमच्या परिसरातील समस्या नोंदवून सुधारणा करण्यास मदत करा.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="issueCategory" className="form-label fs-5"><CardText className="me-2"/>Category</label>
                  <select 
                    id="issueCategory" 
                    className="form-select form-select-lg"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select the issue category --</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="issueTitle" className="form-label fs-5">Issue Title</label>
                  <input type="text" className="form-control form-control-lg" id="issueTitle" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="e.g., Large Pothole on Main Street" required />
                </div>

                <div className="mb-4">
                  <label htmlFor="issueDetails" className="form-label fs-5">Detailed Description</label>
                  <textarea className="form-control form-control-lg" id="issueDetails" rows="5" value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} placeholder="Describe the problem, its location, and its impact." required ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="issueLocation" className="form-label fs-5"><GeoAlt className="me-2"/>Location</label>
                    <input type="text" className="form-control form-control-lg" id="issueLocation" placeholder="e.g., Near City Mall, Andheri West" required />
                    <div className="form-text">You can also provide GPS coordinates or a nearby landmark.</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="issuePhoto" className="form-label fs-5"><Image className="me-2"/>Upload Photo</label>
                  <input type="file" className="form-control form-control-lg" id="issuePhoto" accept="image/*" onChange={handleFileChange} required />
                  {photoPreview && <img src={photoPreview} alt="Preview" className="img-fluid rounded mt-3" style={{ maxHeight: '200px' }} />}
                </div>

                {message && (<div className={`alert ${message.includes('यशस्वीरित्या') ? 'alert-success' : 'alert-warning'} fs-5`} role="alert">{message}</div>)}
                
                <div className="d-grid mt-5">
                  <button type="submit" className="btn btn-primary btn-lg">Submit Report</button>
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