import { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function bucketIssues(issues) {
  const isHigh = (i) => i.priority === 'high' || /emergency|outage|accident/i.test(i.title || '') || i.status === 'In Progress';
  const isLow = (i) => i.priority === 'low' || i.status === 'New';
  const high = issues.filter(isHigh);
  const low = issues.filter((i) => !isHigh(i) && isLow(i));
  const rest = issues.filter((i) => !high.includes(i) && !low.includes(i));
  return { all: issues, high, low: [...low, ...rest] };
}

function AdminDashboard({ user }) {
  const department = user?.department || 'All';
  const [issuesState, setIssuesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Fetch issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching issues from:', `${API_BASE_URL}/report`);
        const response = await axios.get(`${API_BASE_URL}/report`);
        console.log('Response received:', response.data);
        setIssuesState(response.data.issues || []);
      } catch (err) {
        console.error('Error fetching issues:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config
        });
        setError(err.response?.data?.message || 'Failed to fetch issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const baseIssues = department === 'All' ? issuesState : issuesState.filter(i => i.category === department);
  const categories = useMemo(() => ['All', ...Array.from(new Set(baseIssues.map(i => i.category)))], [baseIssues]);
  const issues = useMemo(() => {
    const filtered = categoryFilter === 'All' ? baseIssues : baseIssues.filter(i => i.category === categoryFilter);
    // Fallback: if no issues after filtering, show all issues
    return filtered.length > 0 ? filtered : issuesState;
  }, [baseIssues, categoryFilter, issuesState]);

  // Debug logging
  // console.log('Debug info:', {
  //   department,
  //   issuesState: issuesState.length,
  //   baseIssues: baseIssues.length,
  //   categoryFilter,
  //   issues: issues.length,
  //   categories
  // });

  const issueCounts = useMemo(() => ({
      new: issues.filter(issue => issue.status === 'New').length,
      inProgress: issues.filter(issue => issue.status === 'In Progress').length,
      resolved: issues.filter(issue => issue.status === 'Resolved').length,
  }), [issues]);

  const grouped = useMemo(() => bucketIssues(issues), [issues]);

  const handleShowPhotoModal = (issue) => { setSelectedImage(issue.photoUrl); setShowPhotoModal(true); };
  const handleClosePhotoModal = () => setShowPhotoModal(false);
  const handleShowDetailsModal = (issue) => { setSelectedIssue(issue); setShowDetailsModal(true); };
  const handleCloseDetailsModal = () => setShowDetailsModal(false);
  
  const StatusBadge = ({ status }) => {
    const badgeColors = { 'New': 'primary', 'In Progress': 'warning', 'Resolved': 'success', 'Assigned': 'info' };
    return <span className={`badge bg-${badgeColors[status]}`}>{status}</span>;
  };

  const handleSetStatus = async (issueId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/report/${issueId}`, { status });
      
      // Update local state
      setIssuesState(prevIssues => 
        prevIssues.map(issue => 
          issue.issueId === issueId ? { ...issue, status } : issue
        )
      );
    } catch (err) {
      console.error('Error updating issue status:', err);
      setError(err.response?.data?.message || 'Failed to update issue status. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing issues from:', `${API_BASE_URL}/report`);
      const response = await axios.get(`${API_BASE_URL}/report`);
      console.log('Refresh response received:', response.data);
      setIssuesState(response.data.issues || []);
    } catch (err) {
      console.error('Error refreshing issues:', err);
      setError(err.response?.data?.message || 'Failed to refresh issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="mb-0">👑 Admin Dashboard</h2>
        <div>
          <Button variant="outline-primary" size="sm" onClick={handleRefresh} className="me-2">
            🔄 Refresh
          </Button>
          <a href="/settings" className="btn btn-outline-secondary btn-sm">Settings</a>
        </div>
      </div>
      <p className="text-muted">Overview of {department === 'All' ? 'all departments' : `${department} department`} issues.</p>
      
      {/* Debug information */}
      <div className="mb-3">
        <small className="text-muted">
          API URL: {API_BASE_URL}/report | 
          Issues loaded: {issuesState.length} | 
          Base issues: {baseIssues.length} | 
          Filtered issues: {issues.length} | 
          Department: {department} | 
          Category filter: {categoryFilter}
        </small>
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <div className="mb-3 d-flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="row my-4">
        <div className="col-md-4"><div className="card text-white bg-primary mb-3"><div className="card-body"><h5 className="card-title">New Issues</h5><p className="card-text fs-2 fw-bold">{issueCounts.new}</p></div></div></div>
        <div className="col-md-4"><div className="card text-white bg-warning mb-3"><div className="card-body"><h5 className="card-title">In Progress</h5><p className="card-text fs-2 fw-bold">{issueCounts.inProgress}</p></div></div></div>
        <div className="col-md-4"><div className="card text-white bg-success mb-3"><div className="card-body"><h5 className="card-title">Completed</h5><p className="card-text fs-2 fw-bold">{issueCounts.resolved}</p></div></div></div>
      </div>
      
      {/* Debug: Show raw issues data */}
      {issuesState.length > 0 && (
        <div className="alert alert-info">
          <h6>Debug: Raw Issues Data</h6>
          <pre style={{fontSize: '12px', maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(issuesState.slice(0, 2), null, 2)}
          </pre>
        </div>
      )}

      <IssueGroup title="All" items={grouped.all} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />
      <IssueGroup title="High Priority" items={grouped.high} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />
      <IssueGroup title="Low Priority" items={grouped.low} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />

      <Modal show={showPhotoModal} onHide={handleClosePhotoModal} centered>
        <Modal.Header closeButton><Modal.Title>Issue Photo</Modal.Title></Modal.Header>
        <Modal.Body className="text-center"><img src={selectedImage?.startsWith('http') ? selectedImage : (selectedImage || '')} alt="Issue Snapshot" className="img-fluid" /></Modal.Body>
      </Modal>

      {selectedIssue && (
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered size="lg">
          <Modal.Header closeButton><Modal.Title>Issue Details: {selectedIssue.issueId}</Modal.Title></Modal.Header>
          <Modal.Body>
            <h4>{selectedIssue.title}</h4>
            <p className="text-muted">
              <strong>Status:</strong> <StatusBadge status={selectedIssue.status} /> | 
              <strong> Date:</strong> {new Date(selectedIssue.createdAt || selectedIssue.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <hr />
            <h5>Description</h5>
            <p>{selectedIssue.details}</p>
            <hr />
            <h5>Category</h5>
            <p><span className="badge bg-info">{selectedIssue.category}</span></p>
            <hr />
            <h5>Issue Location</h5>
            {selectedIssue.location ? (
              <p>
                Coordinates: {selectedIssue.location.lat.toFixed(4)}, {selectedIssue.location.lng.toFixed(4)}
                <a href={`https://maps.google.com/?q=${selectedIssue.location.lat},${selectedIssue.location.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary ms-3">
                  View on Map
                </a>
              </p>
            ) : (<p className="text-muted">Location data was not provided for this issue.</p>)}
            <hr />
            <h5>Reporter Information</h5>
            <p><strong>Name:</strong> {selectedIssue.reporter.username}</p>
            <p><strong>Email:</strong> {selectedIssue.reporter.email}</p>
            <p><strong>Phone:</strong> {selectedIssue.reporter.phone}</p>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button></Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboard;

function IssueGroup({ title, items, onDetails, onPhoto, onSetStatus }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="card mt-4">
      <div className="card-header"><h5>{title}</h5></div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>ID</th><th>Title</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.length ? items.map(issue => (
                <tr key={issue.issueId}>
                  <td>{issue.issueId}</td>
                  <td>{issue.title}</td>
                  <td>{formatDate(issue.createdAt || issue.date)}</td>
                  <td><span className={`badge bg-${issue.status==='Resolved'?'success':issue.status==='In Progress'?'warning text-dark':'secondary'}`}>{issue.status}</span></td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => onDetails(issue)} className="me-2">Details</Button>
                    {issue.photoUrl && (
                      <Button variant="outline-secondary" size="sm" onClick={() => onPhoto(issue)} className="me-2">View Photo</Button>
                    )}
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Set Status</button>
                      <ul className="dropdown-menu">
                        {['New','In Progress','Resolved'].map(st => (
                          <li key={st}><button className="dropdown-item" onClick={() => onSetStatus(issue.issueId, st)}>{st}</button></li>
                        ))}
                      </ul>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center">No issues.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}