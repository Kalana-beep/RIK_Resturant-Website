import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [bookedTables, setBookedTables] = useState([])
  const [todaysSpecials, setTodaysSpecials] = useState([])
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    tableNumber: ''
  })
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [availableTable, setAvailableTable] = useState(null)

  // Fetch today's specials, booked tables, and cart from localStorage on component mount
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    // Load menu items and filter today's specials
    const savedMenuItems = JSON.parse(localStorage.getItem('menuItems')) || []
    const specials = savedMenuItems.filter(item => item.category === 'specials')
    setTodaysSpecials(specials)
    
    // Load booked tables from localStorage
    const savedBookings = JSON.parse(localStorage.getItem('bookedTables')) || []
    setBookedTables(savedBookings)
    
    // Load cart from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'guest'
    const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || []
    setCart(userCart)
    setCartCount(userCart.reduce((total, item) => total + item.quantity, 0))
    
    // Set user email if not set (for new logins)
    if (!localStorage.getItem('userEmail')) {
      const userEmail = localStorage.getItem('userEmail') || 'guest'
      localStorage.setItem('userEmail', userEmail)
    }
    
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  const handleOrderNow = () => {
    navigate('/menu')
  }

  const validateForm = () => {
    const errors = {}
    
    if (!bookingForm.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!bookingForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingForm.email)) {
      errors.email = 'Please enter a valid email'
    }
    
    if (!bookingForm.date) {
      errors.date = 'Date is required'
    } else {
      const selectedDate = new Date(bookingForm.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past'
      }
    }
    
    if (!bookingForm.time) {
      errors.time = 'Time is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleTableBooking = () => {
    if (!validateForm()) {
      return
    }

    const availableTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const available = availableTables.filter(table => 
      !bookedTables.some(booking => 
        booking.tableNumber === table && 
        booking.date === bookingForm.date &&
        booking.time === bookingForm.time
      )
    )

    if (available.length === 0) {
      
      setAvailableTable(null)
      setShowBookingModal(true)
      return
    }

    const selectedTable = available[0]
    setAvailableTable(selectedTable)
    setBookingForm({...bookingForm, tableNumber: selectedTable})
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    const newBooking = {
      id: Date.now(),
      ...bookingForm,
      tableNumber: availableTable,
      status: 'confirmed',
      bookingDate: new Date().toISOString()
    }

    const updatedBookings = [...bookedTables, newBooking]
    setBookedTables(updatedBookings)
    localStorage.setItem('bookedTables', JSON.stringify(updatedBookings))
    
    setShowBookingModal(false)
    setAvailableTable(null)
    setBookingForm({
      name: '',
      email: '',
      date: '',
      time: '',
      guests: 2,
      tableNumber: ''
    })
    setFormErrors({})
    
    alert(`Table ${newBooking.tableNumber} booked successfully! Confirmation sent to ${newBooking.email}`)
  }

  const closeModal = () => {
    setShowBookingModal(false)
    setAvailableTable(null)
  }

  const addToCart = (item) => {
    const userEmail = localStorage.getItem('userEmail') || 'guest'
    const currentCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || []
    
    const existingItem = currentCart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      currentCart.push({
        ...item,
        quantity: 1,
        addedAt: new Date().toISOString()
      })
    }
    
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(currentCart))
    setCart(currentCart)
    setCartCount(currentCart.reduce((total, item) => total + item.quantity, 0))
    
    // Show success message
    alert(`${item.name} added to cart!`)
  }

  // Available time slots
  const timeSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']

  // Calculate tomorrow's date for min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return (
    <div className="home-container">
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
                <Link className="nav-link active" to="/home">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/menu">Menu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Contact</Link>
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

      {/* Hero Section with Welcome Message */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6">
              <h1 className="hero-title">Welcome to RIK Restaurant</h1>
              <p className="hero-subtitle">
                Experience fine dining at its best. Our chefs prepare exquisite dishes 
                using the freshest ingredients sourced from local farms.
              </p>
              <div className="mt-4">
                <button className="btn btn-primary btn-lg me-3" onClick={handleOrderNow}>
                  <i className="bi bi-cart me-2"></i>
                  Order Now
                </button>
                <button 
                  className="btn btn-outline-light btn-lg" 
                  onClick={() => {
                    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  Book a Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mt-5">
        {/* Today's Specials Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="section-header mb-4">
              <h2 className="section-title">
                <i className="bi bi-star-fill me-2"></i>
                Today's Specials
              </h2>
              <p className="section-subtitle">Chef's recommendations for today</p>
            </div>
            
            {todaysSpecials.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-star display-4 text-muted mb-3"></i>
                <h4>No Specials Today</h4>
                <p className="text-muted">Check back later for today's specials</p>
              </div>
            ) : (
              <div className="row">
                {todaysSpecials.map(special => (
                  <div key={special.id} className="col-md-4 mb-4">
                    <div className="special-card">
                      <div className="special-image">
                        <span className="special-emoji">{special.image}</span>
                        <span className="special-badge">Special</span>
                      </div>
                      <div className="special-content">
                        <h5>{special.name}</h5>
                        <p className="special-description">{special.description}</p>
                        <div className="special-rating">
                          {'★'.repeat(Math.floor(special.rating || 4.5))}
                          <span className="rating-text">{special.rating || 4.5}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="special-price">{special.price}</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => addToCart(special)}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Booking Section */}
        <div id="booking-section" className="row mb-5">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 booking-form-card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-check me-2"></i>
                  Book Your Table
                </h5>
                <p className="mb-0 small">Please fill the form below to reserve your table</p>
              </div>
              
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      value={bookingForm.name}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, name: e.target.value})
                        if (formErrors.name) {
                          setFormErrors({...formErrors, name: ''})
                        }
                      }}
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
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      value={bookingForm.email}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, email: e.target.value})
                        if (formErrors.email) {
                          setFormErrors({...formErrors, email: ''})
                        }
                      }}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback d-block">
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date *</label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                      value={bookingForm.date}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, date: e.target.value})
                        if (formErrors.date) {
                          setFormErrors({...formErrors, date: ''})
                        }
                      }}
                      min={tomorrowStr}
                    />
                    {formErrors.date && (
                      <div className="invalid-feedback d-block">
                        {formErrors.date}
                      </div>
                    )}
                    <small className="text-muted">Bookings available from tomorrow</small>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Time Slot *</label>
                    <select
                      className={`form-control ${formErrors.time ? 'is-invalid' : ''}`}
                      value={bookingForm.time}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, time: e.target.value})
                        if (formErrors.time) {
                          setFormErrors({...formErrors, time: ''})
                        }
                      }}
                    >
                      <option value="">Select preferred time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {formErrors.time && (
                      <div className="invalid-feedback d-block">
                        {formErrors.time}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Number of Guests</label>
                    <select
                      className="form-control"
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({...bookingForm, guests: parseInt(e.target.value)})}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                    <small className="text-muted">Maximum 8 guests per table</small>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Special Requests (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Any special requirements? (e.g., wheelchair access, allergies)"
                    />
                  </div>
                </div>
                
                <div className="row mt-4">
                  <div className="col-12">
                    <button 
                      className="btn btn-primary btn-lg w-100 py-3 booking-submit-btn"
                      onClick={handleTableBooking}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Check Availability & Book Table
                    </button>
                  </div>
                  <div className="col-12 text-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      You'll receive a confirmation email after booking
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Booking Information
                </h5>
              </div>
              
              <div className="card-body">
                <div className="info-item mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="info-icon">
                      <i className="bi bi-clock"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Operating Hours</h6>
                      <p className="mb-1 text-dark">Lunch: 12:00 PM - 3:00 PM</p>
                      <p className="mb-0 text-dark">Dinner: 6:00 PM - 10:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="info-item mb-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="info-icon">
                      <i className="bi bi-table"></i>
                    </div>
                    <div>
                      <h6 className="mb-1">Table Capacity</h6>
                      <p className="mb-1 text-dark">We have 10 tables available</p>
                      <div className="table-types">
                        <div className="table-type-item">
                          <span className="table-badge bg-primary">T1-T4</span>
                          <small className="text-muted">2-4 persons</small>
                        </div>
                        <div className="table-type-item">
                          <span className="table-badge bg-warning">T5-T8</span>
                          <small className="text-muted">4-6 persons</small>
                        </div>
                        <div className="table-type-item">
                          <span className="table-badge bg-danger">T9-T10</span>
                          <small className="text-muted">6-8 persons</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="d-flex align-items-start">
                    <div className="info-icon">
                      <i className="bi bi-exclamation-circle"></i>
                    </div>
                    <div>
                      <h6 className="mb-2">Important Notes</h6>
                      <ul className="list-unstyled small text-dark">
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Booking confirmation required
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          15-minute grace period for arrivals
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Special diet? Please inform in advance
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Free cancellation up to 2 hours before
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-5">
          <div className="col-md-3 mb-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <i className="bi bi-people stat-icon"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">10</h3>
                <p className="stat-text">Tables Available</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <i className="bi bi-star stat-icon"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{todaysSpecials.length}</h3>
                <p className="stat-text">Today's Specials</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <i className="bi bi-clock-history stat-icon"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">30</h3>
                <p className="stat-text">Min Delivery</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <i className="bi bi-award stat-icon"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">4.8</h3>
                <p className="stat-text">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Dishes */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="section-header mb-4">
              <h2 className="section-title">
                <i className="bi bi-egg-fried me-2"></i>
                Recommended For You
              </h2>
              <p className="section-subtitle">Popular dishes our customers love</p>
            </div>
            
            <div className="row">
              {[
                { id: 1, name: 'Truffle Pasta', price: '$24.99', rating: 4.8, image: '🍝', description: 'Creamy pasta with black truffle' },
                { id: 2, name: 'Grilled Salmon', price: '$28.50', rating: 4.9, image: '🐟', description: 'Atlantic salmon with lemon butter' },
                { id: 3, name: 'Chocolate Lava Cake', price: '$12.99', rating: 4.7, image: '🍰', description: 'Warm cake with melting center' },
                { id: 4, name: 'Mango Smoothie', price: '$8.99', rating: 4.6, image: '🥭', description: 'Fresh mango blended smoothie' }
              ].map(dish => (
                <div key={dish.id} className="col-md-3 col-6 mb-4">
                  <div className="dish-card">
                    <div className="dish-image">
                      <span className="dish-emoji">{dish.image}</span>
                    </div>
                    <div className="dish-content">
                      <h6 className="dish-name">{dish.name}</h6>
                      <p className="dish-description">{dish.description}</p>
                      <div className="dish-rating">
                        {'★'.repeat(Math.floor(dish.rating))}
                        <span className="rating-text">{dish.rating}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <strong className="dish-price">{dish.price}</strong>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => addToCart({
                            ...dish,
                            category: 'maincourse'
                          })}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="cart-summary-floating">
          <div className="container">
            <div className="cart-summary-content">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cart3 fs-4 me-3"></i>
                    <div>
                      <h6 className="mb-0">{cartCount} items in cart</h6>
                      <small className="text-muted">
                        Total: ${cart.reduce((total, item) => 
                          total + (parseFloat(item.price.replace('$', '')) * item.quantity), 0
                        ).toFixed(2)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  <Link to="/cart" className="btn btn-success me-2">
                    <i className="bi bi-bag-check me-2"></i>
                    View Cart
                  </Link>
                  <button className="btn btn-warning" onClick={() => navigate('/menu')}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="restaurant-footer mt-5">
        <div className="container py-4">
          <div className="row">
            <div className="col-md-4">
              <h5>RIK Restaurant</h5>
              <p className="small"> Serving excellence on every plate.</p>
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

      {/* Booking Confirmation Modal  */}
      {showBookingModal && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
              opacity: 1
            }}
            onClick={closeModal}
          ></div>
          
          {/* Modal */}
          <div 
            className="modal fade show"
            style={{
              display: 'block',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050,
              overflowX: 'hidden',
              overflowY: 'auto',
              outline: 0
            }}
            tabIndex="-1"
            role="dialog"
            onClick={closeModal}
          >
            <div 
              className="modal-dialog modal-dialog-centered" 
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{
                borderRadius: '15px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
              }}>
                <div className="modal-header" style={{
                  backgroundColor: availableTable ? '#28a745' : '#dc3545',
                  color: 'white',
                  borderBottom: 'none',
                  padding: '1.5rem'
                }}>
                  <h5 className="modal-title">
                    <i className={`bi ${availableTable ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                    {availableTable ? 'Table Available!' : 'No Tables Available'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                
                <div className="modal-body" style={{padding: '2rem'}}>
                  <div className="text-center mb-4">
                    <i className={`bi ${availableTable ? 'bi-calendar-check' : 'bi-calendar-x'} display-4`} 
                       style={{color: availableTable ? '#28a745' : '#dc3545'}}></i>
                  </div>
                  
                  {availableTable ? (
                    <>
                      <div className="booking-summary">
                        <div className="summary-item">
                          <strong>Name:</strong> <span>{bookingForm.name}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Email:</strong> <span>{bookingForm.email}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Date:</strong> <span>{bookingForm.date}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Time:</strong> <span>{bookingForm.time}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Guests:</strong> <span>{bookingForm.guests}</span>
                        </div>
                        <div className="summary-item">
                          <strong>Table:</strong> <span className="fw-bold">Table {availableTable}</span>
                        </div>
                      </div>
                      
                      <div className="alert alert-success mt-3" style={{borderRadius: '10px'}}>
                        <i className="bi bi-check-circle me-2"></i>
                        Table {availableTable} is available and ready for booking!
                      </div>
                      
                      <div className="alert alert-info mt-3" style={{borderRadius: '10px'}}>
                        <i className="bi bi-info-circle me-2"></i>
                        You'll receive a confirmation email at {bookingForm.email}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <h5 className="text-danger mb-3">No Tables Available</h5>
                        <p>Sorry, all tables are booked for {bookingForm.date} at {bookingForm.time}.</p>
                      </div>
                      
                      <div className="alert alert-warning" style={{borderRadius: '10px'}}>
                        <i className="bi bi-lightbulb me-2"></i>
                        <strong>Suggestions:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Try a different time slot</li>
                          <li>Check availability for other dates</li>
                          <li>Consider booking for fewer guests</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="modal-footer" style={{
                  borderTop: '1px solid #dee2e6',
                  padding: '1rem 1.5rem'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    {availableTable ? 'Cancel' : 'Close'}
                  </button>
                  
                  {availableTable && (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={confirmBooking}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .home-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          padding-bottom: 80px;
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
        
        .hero-section {
          background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                      url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 4rem 0;
          min-height: 60vh;
          display: flex;
          align-items: center;
        }
        
        .hero-title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        
        .hero-subtitle {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.9;
          max-width: 600px;
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
        
        .special-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 2px solid #ffd700;
          height: 100%;
        }
        
        .special-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .special-image {
          height: 200px;
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .special-emoji {
          font-size: 4rem;
        }
        
        .special-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(45deg, #ff6b6b, #ff8e53);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .special-content {
          padding: 1.5rem;
        }
        
        .special-description {
          color: #666;
          margin-bottom: 1rem;
          min-height: 48px;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .special-rating {
          color: #ffd700;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .rating-text {
          color: #666;
          margin-left: 0.5rem;
          font-size: 0.8rem;
        }
        
        .special-price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ff6b6b;
        }
        
        /* Booking Form - Improved Visibility */
        .booking-form-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }
        
        .booking-form-card .card-header {
          padding: 1.5rem;
          border-bottom: none;
        }
        
        .booking-form-card .card-body {
          padding: 2rem;
          background: linear-gradient(to bottom, #ffffff, #f8f9fa);
        }
        
        .booking-form-card .form-control {
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }
        
        .booking-form-card .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
          background: #fff;
        }
        
        .booking-form-card .form-control.is-invalid {
          border-color: #dc3545;
        }
        
        .booking-form-card .form-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .booking-submit-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .booking-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        /* Info Items */
        .info-item {
          padding: 1rem 0;
        }
        
        .info-icon {
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
        
        .table-types {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        
        .table-type-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .table-badge {
          width: 60px;
          padding: 0.25rem;
          border-radius: 5px;
          text-align: center;
          color: white;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        /* Tables Grid */
        .tables-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        
        .table-indicator {
          padding: 0.75rem;
          border-radius: 10px;
          text-align: center;
          transition: all 0.3s;
        }
        
        .table-indicator.available {
          background: #d4edda;
          border: 2px solid #28a745;
        }
        
        .table-indicator.booked {
          background: #f8d7da;
          border: 2px solid #dc3545;
          opacity: 0.7;
        }
        
        .table-number {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        
        .table-status {
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .legend {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .legend-box {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        
        .legend-box.available {
          background: #28a745;
          border: 2px solid #28a745;
        }
        
        .legend-box.booked {
          background: #dc3545;
          border: 2px solid #dc3545;
        }
        
        /* Stats Cards */
        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
          height: 100%;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .stat-icon {
          font-size: 2rem;
          color: white;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #1a1a2e;
          margin-bottom: 0.25rem;
        }
        
        .stat-text {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }
        
        /* Dish Cards */
        .dish-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          height: 100%;
        }
        
        .dish-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .dish-image {
          height: 120px;
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dish-emoji {
          font-size: 3rem;
        }
        
        .dish-content {
          padding: 1.25rem;
        }
        
        .dish-name {
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }
        
        .dish-description {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          min-height: 40px;
        }
        
        .dish-rating {
          color: #ffd700;
          font-size: 0.85rem;
        }
        
        .dish-price {
          color: #ff6b6b;
          font-size: 1.25rem;
        }
        
        /* Cart Summary */
        .cart-summary-floating {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid #e0e0e0;
          padding: 1rem 0;
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
          z-index: 1030;
        }
        
        .cart-summary-content {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* Modal */
        .modal-backdrop {
          z-index: 1040 !important;
        }
        
        .modal {
          z-index: 1050 !important;
        }
        
        .modal-content {
          animation: modalFadeIn 0.3s ease-out;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .booking-summary .summary-item {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
        }
        
        .booking-summary .summary-item:last-child {
          border-bottom: none;
        }
        
        .restaurant-footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .special-emoji {
            font-size: 3rem;
          }
          
          .tables-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .booking-form-card .card-body {
            padding: 1.5rem;
          }
          
          .cart-summary-floating {
            padding: 0.5rem 0;
          }
          
          .cart-summary-content {
            padding: 0.75rem 1rem;
          }
          
          .stat-card {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
          }
          
          .stat-icon-wrapper {
            margin-right: 0;
            margin-bottom: 1rem;
          }
          
          .modal-dialog {
            margin: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .tables-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .booking-form-card .form-control {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}