import React from "react";
import { Link } from "react-router-dom";
import { Camera, Send, BarChartSteps, Twitter, Instagram } from "react-bootstrap-icons";
import { motion } from "framer-motion";

function Home() {
  return (
    <div>
      {/* 1. Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm glass-card">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <span className="gradient-text">Civic Connect</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              {/* Removed Report Issues from navbar */}
              <li className="nav-item">
                <Link className="nav-link" to="/track">
                  Track Progress
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/community">
                  Community
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">
                  Contact
                </Link>
              </li>
              {/* Removed Download link from navbar */}
              <li className="nav-item">
                <Link className="nav-link" to="/settings">
                  Settings
                </Link>
              </li>
            </ul>
            {/* Login + Signup buttons */}
            <div className="d-flex">
              <Link to="/login" className="btn btn-primary me-2">
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline-secondary">
                Signup
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        {/* 2. Hero Section */}
        <div className="row align-items-center py-5">
          <div className="col-md-6">
            <motion.h1 className="display-4 fw-bold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              Connect Your Community to Better Solutions
            </motion.h1>
            <motion.p className="lead text-muted my-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Report local issues, track their progress, and work together to
              make your community better. From potholes to broken streetlights,
              your voice matters.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {/* Removed Report an Issue CTA from hero */}
              <Link to="/login" className="btn btn-outline-secondary btn-lg me-2">
                Login
              </Link>
              <Link to="/signup" className="btn btn-success btn-lg">
                Signup
              </Link>
            </motion.div>
            {/* Info: Require login to submit issues */}
            <div className="alert alert-info d-flex align-items-center mt-3" role="alert">
              <span className="me-1">To submit an issue, please</span>
              <Link to="/login" className="alert-link">log in</Link>
              <span className="ms-1">first.</span>
            </div>
          </div>
          <div className="col-md-6 mt-4 mt-md-0">
            <motion.div
              className="glass-card rounded d-flex align-items-center justify-content-center"
              style={{ height: "300px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-muted">Community Dashboard Preview</span>
            </motion.div>
          </div>
        </div>

        <hr className="my-5" />

        {/* 3. "How It Works" Section */}
        <div className="text-center mb-5">
          <h2 className="fw-bold gradient-text">How Civic Connect Works</h2>
          <p className="text-muted">
            Simple, effective tools to report issues and track improvements in
            your community.
          </p>
        </div>
        <div className="row text-center g-4">
          {[{icon: <Camera />, title: 'Snap & Report', text: 'Take a photo of the issue and submit it with location details in seconds.'},
            {icon: <Send />, title: 'Send to Authorities', text: 'Your report is automatically sent to the right local authorities.'},
            {icon: <BarChartSteps />, title: 'Track Progress', text: 'Get updates and see when your reported issue gets resolved.'}]
            .map((c, idx) => (
            <div className="col-md-4" key={c.title}>
              <motion.div className="card h-100 border-0 glass-card" whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <div className="card-body">
                  <div className="fs-1 mb-3 text-primary">{c.icon}</div>
                  <h5 className="card-title fw-bold">{c.title}</h5>
                  <p className="card-text text-muted">{c.text}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* 4. Stats Section */}
        <div className="bg-light p-5 rounded-3 my-5">
          <div className="row text-center">
            <div className="col-md-3 col-6">
              <h3 className="display-5 fw-bold">50K+</h3>
              <p className="text-muted">Issues Reported</p>
            </div>
            <div className="col-md-3 col-6">
              <h3 className="display-5 fw-bold">85%</h3>
              <p className="text-muted">Resolution Rate</p>
            </div>
            <div className="col-md-3 col-6 mt-4 mt-md-0">
              <h3 className="display-5 fw-bold">200+</h3>
              <p className="text-muted">Communities</p>
            </div>
            <div className="col-md-3 col-6 mt-4 mt-md-0">
              <h3 className="display-5 fw-bold">24hr</h3>
              <p className="text-muted">Avg Response Time</p>
            </div>
          </div>
        </div>

        {/* 5. Community Dashboard Section */}
        <div className="text-center mb-5">
          <h2 className="fw-bold">Community Dashboard</h2>
          <p className="text-muted">
            Track all community issues and their progress in real-time
          </p>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between">
                <strong>Active Issues</strong>{" "}
                <span className="badge bg-danger rounded-pill">24</span>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Pothole on Main St</li>
                <li className="list-group-item">Broken streetlight</li>
                <li className="list-group-item">Graffiti removal needed</li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between">
                <strong>In Progress</strong>{" "}
                <span className="badge bg-warning text-dark rounded-pill">
                  12
                </span>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Park bench repair</li>
                <li className="list-group-item">Traffic sign replacement</li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between">
                <strong>Resolved</strong>{" "}
                <span className="badge bg-success rounded-pill">336</span>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Sidewalk crack fixed</li>
                <li className="list-group-item">Trash pickup scheduled</li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="bg-light rounded d-flex align-items-center justify-content-center mt-4"
          style={{ height: "350px" }}
        >
          <span className="text-muted">Interactive Community Map</span>
        </div>
      </div>

      {/* 6. Call to Action Section */}
      <div className="bg-primary text-white text-center py-5">
        <div className="container">
          <h2 className="fw-bold">
            Ready to Make a Difference in Your Community?
          </h2>
          <p className="lead col-lg-8 mx-auto">
            Join thousands of citizens who are actively improving their
            neighborhoods through Civic Connect.
          </p>
          <div className="mt-4">
            {/* Removed bottom CTA to report issues */}
            <Link to="/login" className="btn btn-outline-light btn-lg me-2">
              Login Now
            </Link>
            <Link to="/signup" className="btn btn-success btn-lg">
              Signup Now
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Footer */}
      <footer className="bg-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="fw-bold">Civic Connect</h5>
              <p className="text-muted">
                Connecting communities to better solutions, one report at a
                time.
              </p>
            </div>
            <div className="col-lg-2 col-6">
              <h6 className="fw-bold">Product</h6>
              <ul className="list-unstyled">
                {/* Removed Report Issues from footer product list */}
                <li>
                  <Link to="/track" className="text-muted no-style-link">
                    Track Progress
                  </Link>
                </li>
                {/* Removed Download from footer product list */}
              </ul>
            </div>
            <div className="col-lg-2 col-6">
              <h6 className="fw-bold">Company</h6>
              <ul className="list-unstyled">
                <li>
                  <Link to="/about" className="text-muted no-style-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted no-style-link">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted no-style-link">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 text-lg-end">
              <h6 className="fw-bold">Connect</h6>
              <a href="https://twitter.com" className="text-muted me-3 fs-4">
                <Twitter />
              </a>
              <a href="https://instagram.com" className="text-muted fs-4">
                <Instagram />
              </a>
            </div>
          </div>
          <hr />
          <p className="text-center text-muted small mb-0">
            &copy; 2025 Civic Connect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
