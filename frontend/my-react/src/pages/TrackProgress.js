import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleFill, HourglassSplit, GearFill, GeoAlt } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';

const StatusTimeline = ({ status }) => {
  // ... (This sub-component remains the same)
  const steps = [
    { name: 'Reported', icon: <CheckCircleFill /> },
    { name: 'In Progress', icon: <HourglassSplit /> },
    { name: 'Resolved', icon: <GearFill /> }
  ];
  const getStepStatus = (stepName) => {
    if (status === 'Resolved') return 'completed';
    if (status === 'In Progress' && (stepName === 'Reported' || stepName === 'In Progress')) return 'completed';
    if (status === 'New' && stepName === 'Reported') return 'completed';
    return 'pending';
  };
  return (
    <div className="timeline" role="list" aria-label="Issue progress timeline">
      {steps.map((step) => (
        <div key={step.name} className={`timeline-step ${getStepStatus(step.name)}`} role="listitem" aria-current={getStepStatus(step.name) === 'completed' ? 'step' : undefined}>
          <div className="timeline-icon">{step.icon}</div>
          <div className="timeline-label">{step.name}</div>
        </div>
      ))}
    </div>
  );
};

function TrackProgress() {
  const [searchId, setSearchId] = useState('');
  const [foundIssue, setFoundIssue] = useState(null);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qpIssueId = params.get('issueId') || localStorage.getItem('lastIssueId') || '';

  useEffect(() => {
    if (qpIssueId) {
      setSearchId(qpIssueId);
      handleSearch(undefined, qpIssueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qpIssueId]);

  const handleSearch = (e, forcedId) => {
    if (e) e.preventDefault();
    setError('');
    setFoundIssue(null);
    const id = (forcedId ?? searchId).trim();
    if (!id) {
      setError('Please enter an Issue ID.');
      return;
    }
    const { issues, updateIssue } = require('../mockDatabase');
    const issue = issues.find(i => (i.id || '').toLowerCase() === id.toLowerCase());
    if (issue) {
      setFoundIssue(issue);
      (issue).__saveRating = (rating) => updateIssue(issue.id, { rating });
    } else {
      setError(`No issue found with ID "${id}". Please check the ID and try again.`);
    }
  };

  const showMapParam = params.get('showMap') === '1' || params.get('showMap') === 'true';
  const mapUrl = useMemo(() => {
    if (!foundIssue || !foundIssue.location) return '';
    const { lat, lng } = foundIssue.location;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  }, [foundIssue]);

  const handleSaveRating = () => {
    if (!foundIssue || !userRating) return;
    try {
      foundIssue.__saveRating?.(userRating);
      setRatingSaved(true);
      localStorage.setItem(`rating:${foundIssue.id}`, String(userRating));
    } catch {
      setRatingSaved(true);
      localStorage.setItem(`rating:${foundIssue.id}`, String(userRating));
    }
  };

  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <style>{`
        /* Accessible green timeline with consistent sizing and contrast */
        .timeline { display: flex; justify-content: space-between; position: relative; padding-top: .5rem; }
        .timeline::before { content: ''; position: absolute; top: 1.25rem; left: 10%; width: 80%; height: 4px; background-color: #198754; transform: translateY(-50%); }
        .timeline-step { display: flex; flex-direction: column; align-items: center; text-align: center; width: 33%; position: relative; }
        .timeline-icon { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #e9f6ee; color: #198754; font-size: 1.25rem; z-index: 1; border: 4px solid #fff; box-shadow: 0 0 0 2px #198754; }
        .timeline-label { margin-top: 0.5rem; font-weight: 600; color: #155d39; }
        .timeline-step.completed .timeline-icon { background-color: #198754; color: #fff; }
        .timeline-step.completed .timeline-label { color: #198754; }
      `}</style>

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Track Your Issue</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          Enter the Issue ID you received upon submission to see its current status.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter Issue ID (e.g., CIV-001)" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Track</button>
            </div>
          </form>

          {error && <div className="alert alert-danger">{error}</div>}

          {foundIssue && (
            <motion.div
              className="card shadow-sm mt-5"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="card-header bg-light fs-5 d-flex justify-content-between align-items-center">
                <span>Status for Issue ID: <strong>{foundIssue.id}</strong></span>
                {foundIssue.location && (
                  <a className="btn btn-outline-success btn-sm" href={mapUrl} target="_blank" rel="noreferrer" aria-label={`Open map for ${foundIssue.id}`}>
                    <GeoAlt className="me-1" /> Open Map
                  </a>
                )}
              </div>
              <div className="card-body p-4">
                <h4 className="card-title">{foundIssue.title}</h4>
                <p className="card-text text-muted">
                  Reported on: {foundIssue.date} | Category: {foundIssue.category}
                </p>
                <hr className="my-4" />
                <h5 className="mb-4">Progress Timeline</h5>
                <StatusTimeline status={foundIssue.status} />

                {showMapParam && foundIssue.location && (
                  <div className="alert alert-info mt-4" role="note">
                    Map link prepared for you. Click "Open Map" in the header above.
                  </div>
                )}

                {foundIssue.status === 'Resolved' && (
                  <div className="mt-4">
                    <h6 className="mb-2">Rate the resolution</h6>
                    <div className="d-flex align-items-center gap-2" role="group" aria-label="Issue rating">
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          type="button"
                          className={`btn ${userRating === n ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                          onClick={() => setUserRating(n)}
                          aria-pressed={userRating === n}
                          aria-label={`${n} star${n>1?'s':''}`}
                        >
                          {n}★
                        </button>
                      ))}
                      <button type="button" className="btn btn-primary btn-sm ms-2" disabled={!userRating} onClick={handleSaveRating}>
                        Save Rating
                      </button>
                    </div>
                    {ratingSaved && (
                      <div className="alert alert-success mt-3" role="status" aria-live="polite">
                        Thanks! Your {userRating}-star rating has been recorded.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TrackProgress;