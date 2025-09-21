import { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function UrgentIssuesDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/report`);
        setIssues(response.data.issues || []);
      } catch (err) {
        setError('Failed to fetch issues.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Only high-priority issues (ML controlled)
  const urgentIssues = useMemo(() => {
    return issues.filter(i => i.priority === 'high').sort((a, b) => {
      // Optionally, sort by date or other urgency metric
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
  }, [issues]);

  if (loading) {
    return <div className="container-fluid mt-4 text-center"><Spinner animation="border" /><p>Loading urgent issues...</p></div>;
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0 text-danger">🚨 Urgent Issues (ML Priority)</h2>
        <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>🔄 Refresh</Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="card mt-3">
        <div className="card-header"><h5>High Priority Issues</h5></div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {urgentIssues.length ? urgentIssues.map(issue => (
                  <tr key={issue.issueId}>
                    <td>{issue.issueId}</td>
                    <td>{issue.title}</td>
                    <td>{new Date(issue.createdAt || issue.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td><span className={`badge bg-${issue.status==='Resolved'?'success':issue.status==='In Progress'?'warning text-dark':'secondary'}`}>{issue.status}</span></td>
                    <td>{issue.category}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center">No urgent issues.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UrgentIssuesDashboard;
