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

function AuthorityDashboard({ user }) {
  // Authorities see all departments; optional category filter
  const [issues, setIssues] = useState(initialIssues);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const relevantIssues = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return issues.filter(issue => {
      const issueDate = new Date(issue.date);
      const isOldAndUnresolved = issueDate < thirtyDaysAgo && issue.status !== 'Resolved';
      const isActive = issue.assigned && (issue.status === 'In Progress' || issue.status === 'New');
      const categoryOk = categoryFilter === 'All' ? true : issue.category === categoryFilter;
      return (isOldAndUnresolved || isActive) && categoryOk;
    });
  }, [issues, categoryFilter]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(issues.map(i => i.category)))], [issues]);
  const countsByCategory = useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c, 0));
    issues.forEach(i => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const issueDate = new Date(i.date);
      const qualifies = (issueDate < thirtyDaysAgo && i.status !== 'Resolved') || (i.assigned && (i.status === 'In Progress' || i.status === 'New'));
      if (qualifies) {
        map.set('All', (map.get('All') || 0) + 1);
        map.set(i.category, (map.get(i.category) || 0) + 1);
      }
    });
    return map;
  }, [issues, categories]);
  
  const handleShowDetailsModal = (issue) => { setSelectedIssue(issue); setShowDetailsModal(true); };
  const handleCloseDetailsModal = () => setShowDetailsModal(false);
  const handleSetStatus = (id, status) => {
    setIssueStatus(id, status);
    // trigger refresh by cloning state; in-memory store already mutated
    setIssues([...issues]);
  };

  const StatusBadge = ({ status }) => {
    const badgeColors = { 'New': 'primary', 'In Progress': 'warning' };
    return <span className={`badge bg-${badgeColors[status]}`}>{status}</span>;
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="mb-0">🛠️ Authority Dashboard</h2>
        <a href="/settings" className="btn btn-outline-secondary btn-sm">Settings</a>
      </div>
      <p className="text-muted">Displaying active and high-priority issues.</p>
      <div className="row my-4">
        <div className="col-md-6"><div className="card text-white bg-warning mb-3"><div className="card-body"><h5 className="card-title">Issues In Progress</h5><p className="card-text fs-2 fw-bold">{relevantIssues.filter(i => i.status === 'In Progress').length}</p></div></div></div>
        <div className="col-md-6"><div className="card text-white bg-primary mb-3"><div className="card-body"><h5 className="card-title">New Assigned Issues</h5><p className="card-text fs-2 fw-bold">{relevantIssues.filter(i => i.status === 'New').length}</p></div></div></div>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat} <span className="badge bg-light text-dark ms-1">{countsByCategory.get(cat) || 0}</span>
          </button>
        ))}
      </div>

      <div className="row g-3" style={{ maxHeight: '60vh', overflowY: 'auto' }} aria-label="Scrollable department issues">
        <div className="col-12">
          <IssueGroup title="All" items={bucketIssues(relevantIssues).all} onDetails={handleShowDetailsModal} onSetStatus={handleSetStatus} />
        </div>
        <div className="col-12">
          <IssueGroup title="High Priority" items={bucketIssues(relevantIssues).high} onDetails={handleShowDetailsModal} onSetStatus={handleSetStatus} />
        </div>
        <div className="col-12 mb-3">
          <IssueGroup title="Low Priority" items={bucketIssues(relevantIssues).low} onDetails={handleShowDetailsModal} onSetStatus={handleSetStatus} />
        </div>
      </div>

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Issue Details: {selectedIssue?.id}</Modal.Title></Modal.Header>
        {selectedIssue && (
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
            ) : (<p className="text-muted">Location data was not provided.</p>)}
          </Modal.Body>
        )}
        <Modal.Footer><Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button></Modal.Footer>
      </Modal>
    </div>
  );
}

export default AuthorityDashboard;

function IssueGroup({ title, items, onDetails, onSetStatus }) {
  return (
    <div className="card mt-2">
      <div className="card-header"><h5>{title}</h5></div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>ID</th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.length ? items.map(issue => (
                <tr key={issue.id}>
                  <td>{issue.id}</td>
                  <td>{issue.title}</td>
                  <td>{issue.category}</td>
                  <td>{issue.date}</td>
                  <td><span className={`badge bg-${issue.status==='Resolved'?'success':issue.status==='In Progress'?'warning text-dark':'secondary'}`}>{issue.status}</span></td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => onDetails(issue)}>
                      Details
                    </Button>
                    <div className="btn-group ms-2">
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
                <tr><td colSpan="6" className="text-center">No issues.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}