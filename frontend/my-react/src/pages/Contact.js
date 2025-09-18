import { motion } from 'framer-motion';

function Contact() {
  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-5">
        <motion.h1 className="display-5 fw-bold gradient-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Contact Us</motion.h1>
        <p className="lead text-muted">We would love to hear from you.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <motion.div className="card shadow-lg border-0 glass-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="card-body p-4 p-md-5">
              <form onSubmit={(e) => { e.preventDefault(); alert('Thanks! We will get back to you soon.'); e.currentTarget.reset(); }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control form-control-lg" placeholder="Your full name" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control form-control-lg" placeholder="you@example.com" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <input className="form-control form-control-lg" placeholder="How can we help?" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Message</label>
                    <textarea rows="5" className="form-control form-control-lg" placeholder="Write your message here..." required />
                  </div>
                </div>
                <div className="d-grid mt-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary btn-lg">Send Message</motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="row mt-5 g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0 glass-card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Office Address</h6>
              <p className="text-muted mb-0">123 Civic Center Road<br/>New Delhi, 110001<br/>India</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0 glass-card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Email</h6>
              <p className="mb-1"><a className="no-style-link" href="mailto:support@civicconnect.org">support@civicconnect.org</a></p>
              <p className="mb-0"><a className="no-style-link" href="mailto:info@civicconnect.org">info@civicconnect.org</a></p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0 glass-card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Phone</h6>
              <p className="mb-1"><a className="no-style-link" href="tel:+911234567890">+91 12345 67890</a></p>
              <p className="mb-0 text-muted">Mon–Fri, 9:00–18:00 IST</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0 glass-card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Office Hours</h6>
              <p className="mb-1 text-muted">Mon–Fri: 9:00 AM – 6:00 PM</p>
              <p className="mb-0 text-muted">Sat–Sun: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Contact;







