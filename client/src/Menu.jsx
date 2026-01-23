import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Menu() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [cartCount, setCartCount] = useState(0)

  // Menu categories
  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
    { id: 'maincourse', name: 'Main Course', icon: '🍝' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'specials', name: "Today's Specials", icon: '⭐' }
  ]

  // Initialize menu items from localStorage
  useEffect(() => {
    const savedMenuItems = JSON.parse(localStorage.getItem('menuItems')) || [
      // Appetizers
      { id: 1, name: 'Bruschetta', description: 'Toasted bread topped with tomatoes, garlic, and basil', price: '$8.99', category: 'appetizers', image: '🍅', rating: 4.5 },
      { id: 2, name: 'Garlic Bread', description: 'Freshly baked bread with garlic butter', price: '$6.99', category: 'appetizers', image: '🍞', rating: 4.2 },
      { id: 3, name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing', price: '$9.99', category: 'appetizers', image: '🥗', rating: 4.7 },
      
      // Main Course
      { id: 4, name: 'Spaghetti Carbonara', description: 'Classic Italian pasta with eggs, cheese, and pancetta', price: '$16.99', category: 'maincourse', image: '🍝', rating: 4.8 },
      { id: 5, name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce', price: '$24.99', category: 'maincourse', image: '🐟', rating: 4.9 },
      { id: 6, name: 'Beef Steak', description: 'Premium beef steak with herbs and spices', price: '$28.99', category: 'maincourse', image: '🥩', rating: 4.6 },
      { id: 7, name: 'Vegetable Pizza', description: 'Fresh vegetables on thin crust', price: '$14.99', category: 'maincourse', image: '🍕', rating: 4.4 },
      
      // Desserts
      { id: 8, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with melting center', price: '$8.99', category: 'desserts', image: '🍫', rating: 4.8 },
      { id: 9, name: 'Cheesecake', description: 'New York style cheesecake with berry sauce', price: '$9.99', category: 'desserts', image: '🍰', rating: 4.7 },
      { id: 10, name: 'Tiramisu', description: 'Classic Italian dessert with coffee flavor', price: '$10.99', category: 'desserts', image: '☕', rating: 4.9 },
      
      // Drinks
      { id: 11, name: 'Fresh Lemonade', description: 'Refreshing homemade lemonade', price: '$4.99', category: 'drinks', image: '🍋', rating: 4.3 },
      { id: 12, name: 'Mango Smoothie', description: 'Fresh mango blended with yogurt', price: '$6.99', category: 'drinks', image: '🥭', rating: 4.5 },
      { id: 13, name: 'Iced Coffee', description: 'Cold brew coffee with milk', price: '$5.99', category: 'drinks', image: '🧊', rating: 4.4 }
    ]
    
    setMenuItems(savedMenuItems)
    
    // Load cart from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'guest'
    const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || []
    setCart(userCart)
    setCartCount(userCart.reduce((total, item) => total + item.quantity, 0))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
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

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  // Get today's specials (items marked as special)
  const todaysSpecials = menuItems.filter(item => item.category === 'specials')

  return (
    <div className="menu-container">
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
                <Link className="nav-link active" to="/menu">Menu</Link>
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

      {/* Menu Header */}
      <div className="menu-header">
        <div className="container">
          <h1 className="menu-title">Our Menu</h1>
          <p className="menu-subtitle">Discover our delicious dishes prepared with love</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="category-nav">
        <div className="container">
          <div className="category-scroll">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="container py-5">
        <div className="row">
          {/* Today's Specials Section */}
          {activeCategory === 'all' && todaysSpecials.length > 0 && (
            <div className="col-12 mb-5">
              <div className="special-banner mb-4">
                <h3 className="special-title">
                  <i className="bi bi-star-fill me-2"></i>
                  Today's Specials
                </h3>
                <p className="special-subtitle">Chef's recommendations for today</p>
              </div>
              <div className="row">
                {todaysSpecials.map(item => (
                  <div key={item.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="menu-card special-card">
                      <div className="menu-card-image">
                        <span className="menu-emoji">{item.image}</span>
                        <span className="special-badge">Special</span>
                      </div>
                      <div className="menu-card-body">
                        <h5 className="menu-item-name">{item.name}</h5>
                        <p className="menu-item-description">{item.description}</p>
                        <div className="menu-item-rating">
                          {'★'.repeat(Math.floor(item.rating))}
                          <span className="rating-text">{item.rating}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="menu-item-price">{item.price}</span>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => addToCart(item)}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="my-5" />
            </div>
          )}

          {/* Regular Menu Items */}
          {filteredItems.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="empty-state">
                <i className="bi bi-egg-fried display-1 text-muted mb-3"></i>
                <h4>No items found in this category</h4>
                <p className="text-muted">Please select a different category</p>
              </div>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="col-md-4 col-lg-3 mb-4">
                <div className="menu-card">
                  <div className="menu-card-image">
                    <span className="menu-emoji">{item.image}</span>
                  </div>
                  <div className="menu-card-body">
                    <h5 className="menu-item-name">{item.name}</h5>
                    <p className="menu-item-description">{item.description}</p>
                    <div className="menu-item-rating">
                      {'★'.repeat(Math.floor(item.rating))}
                      <span className="rating-text">{item.rating}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="menu-item-price">{item.price}</span>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => addToCart(item)}
                      >
                        <i className="bi bi-cart-plus me-1"></i> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer  */}
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
        .menu-container {
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
        
        .menu-header {
          background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
                      url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 4rem 0;
          text-align: center;
        }
        
        .menu-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .menu-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .category-nav {
          background: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .category-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding: 0.5rem 0;
          -webkit-overflow-scrolling: touch;
        }
        
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 15px;
          background: white;
          color: #333;
          transition: all 0.3s;
          white-space: nowrap;
          min-width: 100px;
        }
        
        .category-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
        }
        
        .category-btn.active {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .category-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .category-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .menu-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          height: 100%;
        }
        
        .menu-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .menu-card.special-card {
          border: 2px solid #ffd700;
        }
        
        .menu-card-image {
          height: 150px;
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .menu-emoji {
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
        
        .menu-card-body {
          padding: 1.5rem;
        }
        
        .menu-item-name {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #1a1a2e;
        }
        
        .menu-item-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.4;
          min-height: 40px;
        }
        
        .menu-item-rating {
          color: #ffd700;
          font-size: 0.9rem;
        }
        
        .rating-text {
          color: #666;
          margin-left: 0.5rem;
          font-size: 0.8rem;
        }
        
        .menu-item-price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #ff6b6b;
        }
        
        .special-banner {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
          border-radius: 15px;
        }
        
        .special-title {
          font-size: 2rem;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        
        .special-subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .empty-state {
          padding: 3rem;
        }
        
        .restaurant-footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
        }
        
        @media (max-width: 768px) {
          .menu-title {
            font-size: 2.5rem;
          }
          
          .menu-subtitle {
            font-size: 1rem;
          }
          
          .category-btn {
            padding: 0.5rem 1rem;
            min-width: 80px;
          }
          
          .category-icon {
            font-size: 1.25rem;
          }
          
          .menu-emoji {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  )
}