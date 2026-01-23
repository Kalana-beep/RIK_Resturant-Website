import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Contact() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [cartCount, setCartCount] = useState(0)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [userMessages, setUserMessages] = useState([])
  const [showReplies, setShowReplies] = useState(false)

  // Contact options
  const contactOptions = [
    {
      id: 1,
      icon: '📞',
      title: 'Call Us',
      info: '070-2137237',
      description: 'Available 24/7 for reservations'
    },
    {
      id: 2,
      icon: '📧',
      title: 'Email Us',
      info: 'info@rikrestaurant.com',
      description: 'Response within 24 hours'
    },
    {
      id: 3,
      icon: '📍',
      title: 'Visit Us',
      info: 'Wariyapola',
      description: 'Punchi Wariyapola'
    },
    {
      id: 4,
      icon: '⏰',
      title: 'Opening Hours',
      info: 'Mon-Sun: 11AM-10PM',
      description: 'Closed on Thanksgiving'
    }
  ]

  // Business hours
  const businessHours = [
    { day: 'Monday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Tuesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Wednesday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Thursday', hours: '11:00 AM - 10:00 PM' },
    { day: 'Friday', hours: '11:00 AM - 11:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 9:00 PM' }
  ]

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    // Load cart from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'guest'
    const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || []
    setCartCount(userCart.reduce((total, item) => total + item.quantity, 0))
    
    // Load user messages if logged in
    if (userEmail && userEmail !== 'guest') {
      loadUserMessages(userEmail)
    }
    
    return () => clearInterval(timer)
  }, [])

  const loadUserMessages = (email) => {
    const inquiries = JSON.parse(localStorage.getItem('contactInquiries')) || []
    const userMessages = inquiries.filter(msg => msg.email === email || msg.userEmail === email)
    
    // Sort by date (newest first)
    const sortedMessages = userMessages.sort((a, b) => new Date(b.date) - new Date(a.date))
    setUserMessages(sortedMessages)
  }

  const hasUnreadReplies = () => {
    return userMessages.some(msg => msg.replied && msg.status === 'read')
  }

  const refreshMessages = () => {
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail && userEmail !== 'guest') {
      loadUserMessages(userEmail)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  const validateForm = () => {
    const errors = {}
    
    if (!contactForm.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!contactForm.subject.trim()) {
      errors.subject = 'Subject is required'
    }
    
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required'
    } else if (contactForm.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Save contact inquiry to localStorage
    const inquiries = JSON.parse(localStorage.getItem('contactInquiries')) || []
    const newInquiry = {
      id: Date.now(),
      ...contactForm,
      date: new Date().toISOString(),
      status: 'unread',
      replied: false,
      userEmail: localStorage.getItem('userEmail') || 'guest'
    }
    
    localStorage.setItem('contactInquiries', JSON.stringify([...inquiries, newInquiry]))
    
    setIsSubmitting(false)
    setSubmitSuccess(true)
    
    // Refresh user messages
    refreshMessages()
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
    }, 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="contact-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark restaurant-navbar">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="restaurant-logo">
              <span className="logo-letter">R</span>
              <span className="logo-text">RIK Restaurant</span>
            </div>
          </div>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/menu">Menu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/contact">Contact</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cart">
                  <i className="bi bi-cart3 me-1"></i> Cart
                  {cartCount > 0 && (
                    <span className="badge bg-danger ms-1">{cartCount}</span>
                  )}
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              <div className="text-white me-4 d-none d-md-block">
                <i className="bi bi-clock me-2"></i>
                {time.toLocaleTimeString()}
              </div>
              <button 
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="contact-hero">
        <div className="container">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6">
              <h1 className="contact-title">Get in Touch</h1>
              <p className="contact-subtitle">
                We'd love to hear from you. Whether you have questions about our menu, 
                want to make a special request, or just want to say hello, we're here for you.
              </p>
              <div className="mt-4">
                <button 
                  className="btn btn-outline-light btn-lg"
                  onClick={() => document.getElementById('contact-form-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Send us a Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Contact Options */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="section-header mb-4">
              <h2 className="section-title">
                <i className="bi bi-chat-dots me-2"></i>
                Contact Information
              </h2>
              <p className="section-subtitle">Choose your preferred way to reach us</p>
            </div>
          </div>
          
          {contactOptions.map(option => (
            <div key={option.id} className="col-md-3 col-sm-6 mb-4">
              <div className="contact-option-card">
                <div className="contact-icon">
                  <span className="contact-emoji">{option.icon}</span>
                </div>
                <div className="contact-option-content">
                  <h5>{option.title}</h5>
                  <p className="contact-info">{option.info}</p>
                  <p className="contact-description">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          {/* Left Column - Contact Form */}
          <div className="col-lg-7 mb-5">
            <div id="contact-form-section" className="card shadow-lg border-0 contact-form-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-pencil-square me-2"></i>
                  Send us a Message
                </h5>
                <p className="mb-0 small">Your message will be sent directly to the admin</p>
              </div>
              
              <div className="card-body">
                {submitSuccess && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    <strong>Message Sent!</strong> Your message has been sent to the admin. We'll contact you within 24 hours.
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSubmitSuccess(false)}
                    ></button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        value={contactForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && (
                        <div className="invalid-feedback d-block">
                          {formErrors.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        value={contactForm.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback d-block">
                          {formErrors.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Subject *</label>
                      <select
                        name="subject"
                        className={`form-control ${formErrors.subject ? 'is-invalid' : ''}`}
                        value={contactForm.subject}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a subject</option>
                        <option value="Reservation Inquiry">Reservation Inquiry</option>
                        <option value="Menu Question">Menu Question</option>
                        <option value="Catering Request">Catering Request</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Complaint">Complaint</option>
                        <option value="Other">Other</option>
                      </select>
                      {formErrors.subject && (
                        <div className="invalid-feedback d-block">
                          {formErrors.subject}
                        </div>
                      )}
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">Message *</label>
                      <textarea
                        name="message"
                        className={`form-control ${formErrors.message ? 'is-invalid' : ''}`}
                        value={contactForm.message}
                        onChange={handleInputChange}
                        placeholder="Please write your message here..."
                        rows="6"
                        maxLength="500"
                      ></textarea>
                      {formErrors.message && (
                        <div className="invalid-feedback d-block">
                          {formErrors.message}
                        </div>
                      )}
                      <div className="text-end mt-1">
                        <small className="text-muted">
                          {contactForm.message.length}/500 characters
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-4">
                    <div className="col-12">
                      <button 
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-3 submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Send Message to Admin
                          </>
                        )}
                      </button>
                    </div>
                    <div className="col-12 text-center mt-3">
                      <small className="text-muted">
                        <i className="bi bi-shield-check me-1"></i>
                        Your message will be visible in the admin dashboard
                      </small>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Right Column - Contact Info & Messages History */}
          <div className="col-lg-5">
            {/* Messages History */}
            {localStorage.getItem('userEmail') && localStorage.getItem('userEmail') !== 'guest' && (
              <div className="card shadow-lg border-0 mb-4">
                <div className="card-header bg-info text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-chat-text me-2"></i>
                      Your Messages & Replies
                      {hasUnreadReplies() && (
                        <span className="badge bg-danger ms-2">New Reply!</span>
                      )}
                    </h5>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-light"
                        onClick={refreshMessages}
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-light"
                        onClick={() => setShowReplies(!showReplies)}
                      >
                        <i className={`bi bi-chevron-${showReplies ? 'up' : 'down'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {showReplies && (
                  <div className="card-body">
                    {userMessages.length === 0 ? (
                      <div className="text-center py-3">
                        <i className="bi bi-chat-square-text display-4 text-muted mb-3"></i>
                        <p className="text-muted">No messages yet. Send your first message above!</p>
                      </div>
                    ) : (
                      <div className="user-messages-history">
                        {userMessages.map((message, index) => (
                          <div 
                            key={message.id} 
                            className={`user-message-card ${message.replied ? 'has-reply' : ''}`}
                          >
                            <div className="user-message-header">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{message.subject}</h6>
                                  <small className="text-muted">
                                    {formatDate(message.date)}
                                  </small>
                                </div>
                                <div>
                                  {message.replied ? (
                                    <span className="badge bg-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Replied
                                    </span>
                                  ) : (
                                    <span className="badge bg-warning">
                                      <i className="bi bi-clock me-1"></i>
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="user-message-body">
                              <p className="mb-2">{message.message}</p>
                            </div>
                            
                            {message.replied && message.reply && (
                              <div className="admin-reply-section">
                                <div className="admin-reply-header">
                                  <strong>
                                    <i className="bi bi-person-check-fill me-2"></i>
                                    Admin's Reply ({formatDate(message.replyDate)})
                                  </strong>
                                </div>
                                <div className="admin-reply-body">
                                  <p className="mb-0">{message.reply}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Location Info */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Our Location
                </h5>
              </div>
              <div className="card-body">
                <div className="location-info">
                  <div className="d-flex align-items-start mb-3">
                    <div className="location-icon">
                      <i className="bi bi-building"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Address</h6>
                      <p className="mb-1">Wariyapola</p>
                      <p className="mb-0">Punchi Wariyapola</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start mb-3">
                    <div className="location-icon">
                      <i className="bi bi-telephone"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Phone Number</h6>
                      <p className="mb-0">070-5544332</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="location-icon">
                      <i className="bi bi-envelope"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Email Address</h6>
                      <p className="mb-0">info@rikrestaurant.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Map */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-map me-2"></i>
                  Find Us on Map
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="map-container">
                  <iframe
                    title="RIK Restaurant Location"
                    src="https://www.google.com/maps/embed?pb=!1m24!1m12!1m3!1d247.17222774464958!2d80.26104886049168!3d7.6015501577398075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m9!3e6!4m3!3m2!1d7.601646799999999!2d80.2612935!4m3!3m2!1d7.6019532!2d80.2610007!5e0!3m2!1sen!2slk!4v1769170462670!5m2!1sen!2slk"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
                <div className="p-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Free valet parking available
                  </small>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="card shadow-lg border-0">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="bi bi-clock me-2"></i>
                  Business Hours
                </h5>
              </div>
              <div className="card-body">
                <div className="business-hours">
                  {businessHours.map((hour, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="fw-medium">{hour.day}</span>
                      <span className="text-dark">{hour.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    Last seating 30 minutes before closing
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as Home page */}
      <footer className="restaurant-footer mt-5">
        <div className="container py-4">
          <div className="row">
            <div className="col-md-4">
              <h5>RIK Restaurant</h5>
              <p className="small">Serving excellence on every plate.</p>
            </div>
            <div className="col-md-4">
              <h5>Opening Hours</h5>
              <ul className="list-unstyled small">
                <li>Monday - Friday: 11AM - 10PM</li>
                <li>Saturday: 10AM - 11PM</li>
                <li>Sunday: 10AM - 9PM</li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Contact</h5>
              <ul className="list-unstyled small">
                <li><i className="bi bi-geo-alt me-2"></i>Wariyapola</li>
                <li><i className="bi bi-telephone me-2"></i>070-7766550</li>
                <li><i className="bi bi-envelope me-2"></i>info@rikrestaurant.com</li>
              </ul>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center small">
            © 2026 RIK Restaurant. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        .contact-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
        }
        
        .restaurant-navbar {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .restaurant-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .logo-letter {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #ff6b6b, #ff8e53);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
          color: white;
        }
        
        .logo-text {
          font-weight: bold;
          font-size: 1.2rem;
          color: white;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 1rem;
          transition: color 0.3s;
        }
        
        .nav-link:hover,
        .nav-link.active {
          color: white;
        }
        
        .contact-hero {
          background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                      url('https://images.unsplash.com/photo-1519690889869-e705e59f72e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 5rem 0;
          text-align: center;
        }
        
        .contact-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        
        .contact-subtitle {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .section-header {
          text-align: center;
          padding: 2rem 0;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        
        .section-subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .contact-option-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          height: 100%;
        }
        
        .contact-option-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .contact-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .contact-emoji {
          font-size: 2.5rem;
        }
        
        .contact-option-content h5 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }
        
        .contact-info {
          font-size: 1.1rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.5rem;
        }
        
        .contact-description {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        /* Contact Form */
        .contact-form-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }
        
        .contact-form-card .card-header {
          padding: 1.5rem;
          border-bottom: none;
        }
        
        .contact-form-card .card-body {
          padding: 2rem;
          background: linear-gradient(to bottom, #ffffff, #f8f9fa);
        }
        
        .contact-form-card .form-control,
        .contact-form-card .form-select {
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }
        
        .contact-form-card .form-control:focus,
        .contact-form-card .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
          background: #fff;
        }
        
        .contact-form-card .form-control.is-invalid,
        .contact-form-card .form-select.is-invalid {
          border-color: #dc3545;
        }
        
        .contact-form-card .form-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .submit-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* Location Info */
        .location-info {
          padding: 1rem 0;
        }
        
        .location-icon {
          width: 40px;
          height: 40px;
          background: #e9ecef;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
          color: #495057;
        }
        
        .location-info h6 {
          color: #1a1a2e;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }
        
        .location-info p {
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        /* Map */
        .map-container {
          position: relative;
          overflow: hidden;
          border-radius: 0 0 15px 15px;
        }
        
        .map-container iframe {
          display: block;
          filter: grayscale(20%);
        }
        
        /* Business Hours */
        .business-hours {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .business-hours::-webkit-scrollbar {
          width: 5px;
        }
        
        .business-hours::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .business-hours::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
        }
        
        /* User Messages History */
        .user-messages-history {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .user-message-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }
        
        .user-message-card.has-reply {
          border-left: 4px solid #198754;
        }
        
        .user-message-card:hover {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        .user-message-header {
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .user-message-body {
          padding: 0.5rem 0;
          color: #333;
          line-height: 1.5;
        }
        
        .admin-reply-section {
          background: rgba(25, 135, 84, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          border-left: 4px solid #198754;
        }
        
        .admin-reply-header {
          color: #198754;
          font-weight: bold;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .admin-reply-body {
          color: #333;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        
        /* Custom scrollbar for messages */
        .user-messages-history::-webkit-scrollbar {
          width: 5px;
        }
        
        .user-messages-history::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .user-messages-history::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 10px;
        }
        
        .user-messages-history::-webkit-scrollbar-thumb:hover {
          background: #764ba2;
        }
        
        /* Success alert for new replies */
        .has-reply .admin-reply-section {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
          }
        }
        
        /* Footer */
        .restaurant-footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
        }
        
        .alert-success {
          border-radius: 10px;
          border: none;
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
          border-left: 4px solid #198754;
        }
        
        .alert-info {
          border-radius: 15px;
          border: none;
          background: rgba(13, 202, 240, 0.1);
          color: #0dcaf0;
          border-left: 4px solid #0dcaf0;
        }
        
        @media (max-width: 768px) {
          .contact-title {
            font-size: 2.5rem;
          }
          
          .contact-subtitle {
            font-size: 1rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .contact-option-card {
            padding: 1.5rem;
          }
          
          .contact-icon {
            width: 60px;
            height: 60px;
          }
          
          .contact-emoji {
            font-size: 2rem;
          }
          
          .contact-form-card .card-body {
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .contact-hero {
            padding: 3rem 0;
          }
          
          .contact-title {
            font-size: 2rem;
          }
          
          .contact-option-card {
            padding: 1.25rem;
          }
          
          .contact-form-card .form-control,
          .contact-form-card .form-select {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}