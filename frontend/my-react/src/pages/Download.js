import { motion } from 'framer-motion';
import { Android, Apple } from 'react-bootstrap-icons';

function Download() {
  return (
    <motion.div className="container my-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-5">
        <h1 className="display-6 fw-bold gradient-text">Download Our App</h1>
        <p className="text-muted">Report issues on-the-go with our mobile app.</p>
      </div>
      <div className="row justify-content-center g-4">
        <div className="col-md-4">
          <motion.div className="card h-100 shadow-sm border-0 glass-card" whileHover={{ y: -6 }}>
            <div className="card-body text-center p-5">
              <div className="display-3 text-success mb-3"><Android /></div>
              <h5 className="fw-bold">Android</h5>
              <p className="text-muted">APK coming soon. Stay tuned!</p>
              <button className="btn btn-outline-success" disabled>Coming Soon</button>
            </div>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div className="card h-100 shadow-sm border-0 glass-card" whileHover={{ y: -6 }}>
            <div className="card-body text-center p-5">
              <div className="display-3 text-dark mb-3"><Apple /></div>
              <h5 className="fw-bold">iOS</h5>
              <p className="text-muted">Available soon on the App Store.</p>
              <button className="btn btn-outline-secondary" disabled>Coming Soon</button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Download;









