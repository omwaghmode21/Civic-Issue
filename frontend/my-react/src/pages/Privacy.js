import { motion } from 'framer-motion';

function Privacy() {
  return (
    <motion.div className="container my-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-4">
        <h1 className="display-6 fw-bold gradient-text">Privacy Policy</h1>
        <p className="text-muted">Your privacy matters to us.</p>
      </div>
      <div className="col-lg-9 mx-auto">
        <div className="card shadow-sm border-0 glass-card">
          <div className="card-body p-4">
            <h5 className="fw-bold">1. Information We Collect</h5>
            <p className="text-muted">Basic details you provide during signup and when reporting issues.</p>
            <h5 className="fw-bold mt-4">2. How We Use Information</h5>
            <p className="text-muted">To facilitate reporting, tracking, and improving civic services.</p>
            <h5 className="fw-bold mt-4">3. Data Security</h5>
            <p className="text-muted">We apply reasonable safeguards. Avoid sharing sensitive data in reports.</p>
            <h5 className="fw-bold mt-4">4. Contact</h5>
            <p className="text-muted">For questions, visit the Contact page.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Privacy;









