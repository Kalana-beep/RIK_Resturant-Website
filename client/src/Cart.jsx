import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'guest'
    setUserEmail(email)
    
    const userCart = JSON.parse(localStorage.getItem(`cart_${email}`)) || []
    setCart(userCart)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })
    
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId)
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(updatedCart))
    setCart(updatedCart)
  }

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      localStorage.removeItem(`cart_${userEmail}`)
      setCart([])
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''))
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }
    
    // Save order to localStorage for admin to see
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const newOrder = {
      id: Date.now(),
      userEmail,
      items: cart,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      date: new Date().toISOString(),
      status: 'pending'
    }
    
    orders.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    // Clear cart
    localStorage.removeItem(`cart_${userEmail}`)
    
    alert('Order placed successfully! Your order ID is ' + newOrder.id)
    navigate('/home')
  }

  return (
    <div className="cart-container">
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
                <Link className="nav-link" to="/contact">Contact</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/cart">
                  <i className="bi bi-cart3 me-1"></i> Cart
                  {cart.length > 0 && (
                    <span className="badge bg-danger ms-1">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                  )}
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
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

      {/* Cart Header */}
      <div className="cart-header">
        <div className="container">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">Review your order before checkout</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="cart-card">
              <div className="cart-card-header">
                <h5 className="mb-0">
                  <i className="bi bi-cart3 me-2"></i>
                  Shopping Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)
                </h5>
                {cart.length > 0 && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearCart}
                  >
                    <i className="bi bi-trash me-1"></i> Clear Cart
                  </button>
                )}
              </div>
              
              <div className="cart-card-body">
                {cart.length === 0 ? (
                  <div className="empty-cart text-center py-5">
                    <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                    <h4>Your cart is empty</h4>
                    <p className="text-muted mb-4">Add some delicious items from our menu!</p>
                    <Link to="/menu" className="btn btn-primary">
                      <i className="bi bi-egg-fried me-2"></i>
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          <span className="cart-item-emoji">{item.image}</span>
                        </div>
                        
                        <div className="cart-item-details">
                          <h6 className="cart-item-name">{item.name}</h6>
                          <p className="cart-item-description">{item.description}</p>
                          <div className="cart-item-price">{item.price}</div>
                        </div>
                        
                        <div className="cart-item-controls">
                          <div className="quantity-control">
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          
                          <div className="cart-item-total">
                            ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                          </div>
                          
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Continue Shopping */}
            {cart.length > 0 && (
              <div className="mt-4">
                <Link to="/menu" className="btn btn-outline-primary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="order-summary-card">
              <h5 className="order-summary-title">
                <i className="bi bi-receipt me-2"></i>
                Order Summary
              </h5>
              
              <div className="order-summary-body">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span className="text-success">FREE</span>
                </div>
                
                <hr />
                
                <div className="summary-row total-row">
                  <span>
                    <strong>Total</strong>
                    <br/>
                    <small className="text-muted">Including tax</small>
                  </span>
                  <span className="total-amount">${calculateTotal().toFixed(2)}</span>
                </div>
                
                <button 
                  className="btn btn-success w-100 mt-4 checkout-btn"
                  onClick={proceedToCheckout}
                  disabled={cart.length === 0}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceed to Checkout
                </button>
                
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    <i className="bi bi-lock me-1"></i>
                    Secure checkout
                  </small>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="payment-methods mt-4">
                <h6 className="mb-3">Accepted Payment Methods</h6>
                <div className="payment-icons">
                  <i className="bi bi-credit-card payment-icon"></i>
                  <i className="bi bi-paypal payment-icon"></i>
                  <i className="bi bi-google payment-icon"></i>
                  <i className="bi bi-apple payment-icon"></i>
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
        .cart-container {
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
        
        .cart-header {
          background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
                      url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 3rem 0;
          text-align: center;
        }
        
        .cart-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .cart-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .cart-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .cart-card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .cart-card-body {
          padding: 1.5rem;
        }
        
        .empty-cart {
          padding: 3rem 1rem;
        }
        
        .cart-item {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          transition: background 0.3s;
        }
        
        .cart-item:hover {
          background: #f8f9fa;
        }
        
        .cart-item:last-child {
          border-bottom: none;
        }
        
        .cart-item-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1.5rem;
          flex-shrink: 0;
        }
        
        .cart-item-emoji {
          font-size: 2.5rem;
        }
        
        .cart-item-details {
          flex: 1;
        }
        
        .cart-item-name {
          font-weight: bold;
          margin-bottom: 0.25rem;
          color: #1a1a2e;
        }
        
        .cart-item-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .cart-item-price {
          font-weight: bold;
          color: #ff6b6b;
        }
        
        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .quantity-control {
          display: flex;
          align-items: center;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .quantity-btn {
          width: 35px;
          height: 35px;
          border: none;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .quantity-btn:hover:not(:disabled) {
          background: #e9ecef;
        }
        
        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity-display {
          width: 40px;
          text-align: center;
          font-weight: bold;
        }
        
        .cart-item-total {
          font-weight: bold;
          color: #1a1a2e;
          font-size: 1.1rem;
          min-width: 70px;
        }
        
        .order-summary-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .order-summary-title {
          padding: 1.5rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          margin: 0;
        }
        
        .order-summary-body {
          padding: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px dashed #e0e0e0;
        }
        
        .summary-row:last-child {
          border-bottom: none;
        }
        
        .total-row {
          font-size: 1.2rem;
        }
        
        .total-amount {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ff6b6b;
        }
        
        .checkout-btn {
          background: linear-gradient(45deg, #28a745, #20c997);
          border: none;
          padding: 1rem;
          font-weight: bold;
          border-radius: 10px;
          transition: all 0.3s;
        }
        
        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(40, 167, 69, 0.3);
        }
        
        .checkout-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .payment-methods {
          padding: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .payment-icons {
          display: flex;
          justify-content: space-around;
          font-size: 2rem;
        }
        
        .payment-icon {
          color: #666;
          transition: color 0.3s;
        }
        
        .payment-icon:hover {
          color: #667eea;
        }
        
        .restaurant-footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
        }
        
        @media (max-width: 768px) {
          .cart-title {
            font-size: 2rem;
          }
          
          .cart-item {
            flex-direction: column;
            text-align: center;
            padding: 1rem;
          }
          
          .cart-item-image {
            margin-right: 0;
            margin-bottom: 1rem;
          }
          
          .cart-item-controls {
            margin-top: 1rem;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}