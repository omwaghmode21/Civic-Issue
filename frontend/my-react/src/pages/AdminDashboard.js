import { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { issues as initialIssues, setIssueStatus } from '../mockDatabase';

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
  const [issuesState, setIssuesState] = useState(initialIssues);
  const baseIssues = department === 'All' ? issuesState : issuesState.filter(i => i.category === department);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(baseIssues.map(i => i.category)))], [baseIssues]);
  const issues = useMemo(() => (
    categoryFilter === 'All' ? baseIssues : baseIssues.filter(i => i.category === categoryFilter)
  ), [baseIssues, categoryFilter]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  const handleSetStatus = (id, status) => {
    setIssueStatus(id, status);
    setIssuesState([...issuesState]);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="mb-0">👑 Admin Dashboard</h2>
        <a href="/settings" className="btn btn-outline-secondary btn-sm">Settings</a>
      </div>
      <p className="text-muted">Overview of {department === 'All' ? 'all departments' : `${department} department`} issues.</p>
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
      
      <IssueGroup title="All" items={grouped.all} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />
      <IssueGroup title="High Priority" items={grouped.high} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />
      <IssueGroup title="Low Priority" items={grouped.low} onDetails={handleShowDetailsModal} onPhoto={handleShowPhotoModal} onSetStatus={handleSetStatus} />

      <Modal show={showPhotoModal} onHide={handleClosePhotoModal} centered>
        <Modal.Header closeButton><Modal.Title>Issue Photo</Modal.Title></Modal.Header>
        <Modal.Body className="text-center"><img src={selectedImage?.startsWith('http') ? selectedImage : (selectedImage || '')} alt="Issue Snapshot" className="img-fluid" /></Modal.Body>
      </Modal>

      {selectedIssue && (
        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered size="lg">
          <Modal.Header closeButton><Modal.Title>Issue Details: {selectedIssue.id}</Modal.Title></Modal.Header>
          <Modal.Body>
            <h4>{selectedIssue.title}</h4>
            <p className="text-muted"><strong>Status:</strong> <StatusBadge status={selectedIssue.status} /> | <strong>Date:</strong> {selectedIssue.date}</p>
            <hr />
            <h5>Description</h5>
            <p>{selectedIssue.details}</p>
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
            <p><strong>Name:</strong> {selectedIssue.reporter.name}</p>
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
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>{issue.title}</td>
                  <td>{issue.date}</td>
                  <td><span className={`badge bg-${issue.status==='Resolved'?'success':issue.status==='In Progress'?'warning text-dark':'secondary'}`}>{issue.status}</span></td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => onDetails(issue)} className="me-2">Details</Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => onPhoto(issue)} className="me-2">View Photo</Button>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Set Status</button>
                      <ul className="dropdown-menu">
                        {['New','Assigned','In Progress','Resolved'].map(st => (
                          <li key={st}><button className="dropdown-item" onClick={() => onSetStatus(issue.id, st)}>{st}</button></li>
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