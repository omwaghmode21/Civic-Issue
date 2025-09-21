import React from 'react';
import { motion } from 'framer-motion';
import { Accordion } from 'react-bootstrap';
import { Bullseye, PeopleFill, Gem } from 'react-bootstrap-icons';

const teamMembers = [
  { name: 'Aarav Singh', role: 'Project Lead', img: '/team/lead.jpg', alt: 'Portrait of Project Lead Aarav Singh' },
  { name: 'Meera Patel', role: 'UI/UX Designer', img: '/team/uiux.jpg', alt: 'Portrait of UI/UX Designer Meera Patel' },
  { name: 'Rohit Kumar', role: 'Frontend Engineer', img: '/team/frontend.jpg', alt: 'Portrait of Frontend Engineer Rohit Kumar' },
  { name: 'Sara Khan', role: 'Backend Engineer', img: '/team/backend.jpg', alt: 'Portrait of Backend Engineer Sara Khan' }
];

const faqs = [
  {
    eventKey: '0',
    question: 'How does UNNATI work?',
    answer: 'You can report an issue through our "Report Issues" page by filling out a simple form with details and a photo. Our system then routes this report to the correct municipal department. You can track the progress using your unique Issue ID on the "Track Progress" page.'
  },
  {
    eventKey: '1',
    question: 'Is my personal information kept private?',
    answer: 'Absolutely. We only share necessary information with the relevant authorities to address your issue. Your personal contact details are not displayed publicly. Please refer to our Privacy Policy for more details.'
  },
  {
    eventKey: '2',
    question: 'What kind of issues can I report?',
    answer: 'You can report a wide range of non-emergency civic issues such as potholes, broken streetlights, water leaks, garbage collection problems, and maintenance issues in public parks. For emergencies, please contact your local emergency services directly.'
  },
  {
    eventKey: '3',
    question: 'How long does it take to resolve an issue?',
    answer: 'Resolution times vary depending on the complexity and severity of the issue. Our platform is designed to streamline the process, and you can see real-time status updates on the tracking page. Our goal is to improve accountability and speed up resolution.'
  }
];

function About() {
  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Our Mission Section */}
      <div className="text-center p-5 mb-4 bg-light rounded-3">
        <Bullseye size={50} className="text-primary mb-3" />
        <h1 className="display-4 fw-bold">Our Mission</h1>
        <p className="lead col-lg-8 mx-auto">
          To empower citizens and build stronger communities by creating a seamless and transparent communication channel with city authorities. We believe that by working together, we can make our neighborhoods safer, cleaner, and more efficient for everyone.
        </p>
      </div>
      
      {/* Our Values Section */}
      <div className="row text-center my-5 g-4">
        <h2 className="display-5 fw-bold mb-4">Our Core Values</h2>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <Gem size={40} className="text-success mb-3" />
              <h4 className="card-title">Transparency</h4>
              <p className="card-text">We provide real-time tracking and clear communication so you are always informed about the status of your report.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <PeopleFill size={40} className="text-warning mb-3" />
              <h4 className="card-title">Community</h4>
              <p className="card-text">We foster collaboration between citizens and local government to solve problems collectively and build trust.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <Bullseye size={40} className="text-danger mb-3" />
              <h4 className="card-title">Efficiency</h4>
              <p className="card-text">Our platform streamlines the reporting process, ensuring issues reach the right department quickly and effectively.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="my-5 py-5 text-center">
        <h2 className="display-5 fw-bold mb-5">Meet the Team</h2>
        <div className="row g-4 justify-content-center">
          {teamMembers.map(member => (
            <div key={member.name} className="col-lg-3 col-md-6">
              <motion.div whileHover={{ y: -10 }} className="card h-100 shadow-sm border-0">
                <img src={member.img} className="card-img-top img-fluid" alt={member.alt || member.name} style={{ objectFit: 'cover', aspectRatio: '1 / 1' }} />
                <div className="card-body">
                  <h5 className="card-title">{member.name}</h5>
                  <p className="card-text text-muted">{member.role}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="my-5">
        <h2 className="text-center display-5 fw-bold mb-5">Frequently Asked Questions</h2>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Accordion defaultActiveKey="0">
              {faqs.map(faq => (
                <Accordion.Item key={faq.eventKey} eventKey={faq.eventKey}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default About;