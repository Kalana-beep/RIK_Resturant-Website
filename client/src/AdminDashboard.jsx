import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [bookedTables, setBookedTables] = useState([])
  const [todaysSpecials, setTodaysSpecials] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [carts, setCarts] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    unreadMessages: 0,
    totalMessages: 0
  })
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizers',
    image: '🍝'
  })
  
  const [activeSection, setActiveSection] = useState('dashboard')
  const [replyModal, setReplyModal] = useState({
    show: false,
    messageId: null,
    replyText: '',
    message: null
  })
  
  const categories = [
    { value: 'appetizers', label: 'Appetizers' },
    { value: 'maincourse', label: 'Main Course' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'drinks', label: 'Drinks' },
    { value: 'specials', label: "Today's Specials" }
  ]
  
  const imageEmojis = ['🍝', '🐟', '🍰', '🥩', '🥗', '🍣', '🍕', '🍔', '🌮', '🥘', '🍅', '🍞', '🥤', '🍋', '🍫', '☕']

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    // Load users
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers')) || []
    setUsers(savedUsers)
    
    // Load bookings
    const bookings = JSON.parse(localStorage.getItem('bookedTables')) || []
    setBookedTables(bookings)
    
    // Load menu items
    const menu = JSON.parse(localStorage.getItem('menuItems')) || []
    setMenuItems(menu)
    
    // Load today's specials from menu items
    const specials = menu.filter(item => item.category === 'specials')
    setTodaysSpecials(specials)
    
    // Load orders
    const orderData = JSON.parse(localStorage.getItem('orders')) || []
    setOrders(orderData)
    
    // Load all carts from localStorage
    loadAllCarts()
    
    // Load contact messages
    loadContactMessages()
    
    // Calculate stats
    const revenue = orderData.reduce((total, order) => total + order.total, 0)
    setStats({
      totalUsers: savedUsers.length,
      totalBookings: bookings.length,
      totalOrders: orderData.length,
      totalRevenue: revenue,
      unreadMessages: contactMessages.filter(msg => msg.status === 'unread').length,
      totalMessages: contactMessages.length
    })
  }

  const loadContactMessages = () => {
    const messages = JSON.parse(localStorage.getItem('contactInquiries')) || []
    // Sort by date (newest first)
    const sortedMessages = messages.sort((a, b) => new Date(b.date) - new Date(a.date))
    setContactMessages(sortedMessages)
    
    // Update unread count
    const unreadCount = messages.filter(msg => msg.status === 'unread').length
    setStats(prev => ({
      ...prev,
      unreadMessages: unreadCount,
      totalMessages: messages.length
    }))
  }

  const loadAllCarts = () => {
    // Get all localStorage keys that start with 'cart_'
    const allKeys = Object.keys(localStorage)
    const cartKeys = allKeys.filter(key => key.startsWith('cart_'))
    const allCarts = []
    
    cartKeys.forEach(key => {
      try {
        const cartData = JSON.parse(localStorage.getItem(key))
        if (cartData && Array.isArray(cartData)) {
          const userEmail = key.replace('cart_', '')
          allCarts.push({
            userEmail,
            items: cartData,
            itemCount: cartData.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: cartData.reduce((sum, item) => {
              const price = parseFloat(item.price.replace('$', '')) || 0
              return sum + (price * item.quantity)
            }, 0)
          })
        }
      } catch (error) {
        console.error('Error parsing cart:', error)
      }
    })
    
    setCarts(allCarts)
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const deleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const updatedBookings = bookedTables.filter(booking => booking.id !== bookingId)
      setBookedTables(updatedBookings)
      localStorage.setItem('bookedTables', JSON.stringify(updatedBookings))
      loadAllData()
      alert('Booking deleted successfully!')
    }
  }

  const deleteMenuItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const updatedMenu = menuItems.filter(item => item.id !== itemId)
      setMenuItems(updatedMenu)
      localStorage.setItem('menuItems', JSON.stringify(updatedMenu))
      loadAllData()
      alert('Menu item deleted successfully!')
    }
  }

  const addMenuItem = () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      alert('Please fill all required fields')
      return
    }

    const newMenuItem = {
      id: Date.now(),
      ...newItem,
      rating: 4.5,
      createdAt: new Date().toISOString()
    }

    const updatedMenu = [...menuItems, newMenuItem]
    setMenuItems(updatedMenu)
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu))
    
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'appetizers',
      image: '🍝'
    })
    
    loadAllData()
    alert('Menu item added successfully!')
  }

  const deleteUser = (userEmail) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.email !== userEmail)
      setUsers(updatedUsers)
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
      
      // Also delete user's cart
      localStorage.removeItem(`cart_${userEmail}`)
      
      loadAllData()
      alert('User deleted successfully!')
    }
  }

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status }
      }
      return order
    })
    
    setOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    alert(`Order #${orderId} status updated to ${status}`)
  }

  const clearUserCart = (userEmail) => {
    if (window.confirm('Are you sure you want to clear this user\'s cart?')) {
      localStorage.removeItem(`cart_${userEmail}`)
      loadAllCarts()
      alert('User cart cleared!')
    }
  }

  const markMessageAsRead = (messageId) => {
    const updatedMessages = contactMessages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status: 'read' }
      }
      return msg
    })
    
    localStorage.setItem('contactInquiries', JSON.stringify(updatedMessages))
    loadContactMessages()
  }

  const markAllAsRead = () => {
    const updatedMessages = contactMessages.map(msg => ({
      ...msg,
      status: 'read'
    }))
    
    localStorage.setItem('contactInquiries', JSON.stringify(updatedMessages))
    loadContactMessages()
    alert('All messages marked as read!')
  }

  const deleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = contactMessages.filter(msg => msg.id !== messageId)
      localStorage.setItem('contactInquiries', JSON.stringify(updatedMessages))
      loadContactMessages()
      alert('Message deleted successfully!')
    }
  }

  const openReplyModal = (message) => {
    setReplyModal({
      show: true,
      messageId: message.id,
      replyText: '',
      message: message
    })
    
    // Mark as read when opening reply
    if (message.status === 'unread') {
      markMessageAsRead(message.id)
    }
  }

  const closeReplyModal = () => {
    setReplyModal({
      show: false,
      messageId: null,
      replyText: '',
      message: null
    })
  }

  const sendReply = () => {
    if (!replyModal.replyText.trim()) {
      alert('Please enter a reply message')
      return
    }

    const updatedMessages = contactMessages.map(msg => {
      if (msg.id === replyModal.messageId) {
        return {
          ...msg,
          replied: true,
          reply: replyModal.replyText,
          replyDate: new Date().toISOString(),
          status: 'read'
        }
      }
      return msg
    })
    
    localStorage.setItem('contactInquiries', JSON.stringify(updatedMessages))
    loadContactMessages()
    
    alert(`Reply sent to ${replyModal.message.email}`)
    closeReplyModal()
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'unread': return 'danger';
      case 'read': return 'success';
      default: return 'secondary';
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'unread': return 'Unread';
      case 'read': return 'Read';
      default: return status;
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">RIK Restaurant Admin</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle me-2"></i>
              Admin
            </span>
            <button 
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <div className="row">
          {/* Fixed Sidebar */}
          <div className="col-md-3 col-lg-2 px-0">
            <div className="bg-light sidebar">
              <div className="position-sticky pt-3">
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
                      onClick={() => setActiveSection('dashboard')}
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'users' ? 'active' : ''}`}
                      onClick={() => setActiveSection('users')}
                    >
                      <i className="bi bi-people me-2"></i>
                      Users ({stats.totalUsers})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'bookings' ? 'active' : ''}`}
                      onClick={() => setActiveSection('bookings')}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Bookings ({stats.totalBookings})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'menu' ? 'active' : ''}`}
                      onClick={() => setActiveSection('menu')}
                    >
                      <i className="bi bi-egg-fried me-2"></i>
                      Menu Items ({menuItems.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'orders' ? 'active' : ''}`}
                      onClick={() => setActiveSection('orders')}
                    >
                      <i className="bi bi-receipt me-2"></i>
                      Orders ({stats.totalOrders})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'carts' ? 'active' : ''}`}
                      onClick={() => setActiveSection('carts')}
                    >
                      <i className="bi bi-cart3 me-2"></i>
                      User Carts ({carts.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeSection === 'messages' ? 'active' : ''}`}
                      onClick={() => setActiveSection('messages')}
                    >
                      <i className="bi bi-envelope me-2"></i>
                      Messages 
                      {stats.unreadMessages > 0 && (
                        <span className="badge bg-danger ms-2">{stats.unreadMessages}</span>
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">
                {activeSection === 'dashboard' && 'Dashboard Overview'}
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'bookings' && 'Table Bookings'}
                {activeSection === 'menu' && 'Menu Management'}
                {activeSection === 'orders' && 'Order Management'}
                {activeSection === 'carts' && 'User Cart Details'}
                {activeSection === 'messages' && 'Contact Messages'}
              </h1>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={loadAllData}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Data
              </button>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <>
                {/* Stats Cards */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card text-white bg-primary">
                      <div className="card-body">
                        <h5 className="card-title">Total Users</h5>
                        <h2 className="card-text">{stats.totalUsers}</h2>
                        <small>Registered users</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-white bg-success">
                      <div className="card-body">
                        <h5 className="card-title">Total Orders</h5>
                        <h2 className="card-text">{stats.totalOrders}</h2>
                        <small>Completed orders</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-white bg-warning">
                      <div className="card-body">
                        <h5 className="card-title">Active Bookings</h5>
                        <h2 className="card-text">{stats.totalBookings}</h2>
                        <small>Table reservations</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-white bg-info">
                      <div className="card-body">
                        <h5 className="card-title">New Messages</h5>
                        <h2 className="card-text">{stats.unreadMessages}</h2>
                        <small>Out of {stats.totalMessages} total</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Recent Orders</h6>
                      </div>
                      <div className="card-body">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                            <div>
                              <strong>Order #{order.id}</strong>
                              <br/>
                              <small className="text-muted">{order.userEmail}</small>
                            </div>
                            <div className="text-end">
                              <span className={`badge bg-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}`}>
                                {order.status}
                              </span>
                              <br/>
                              <small>${order.total.toFixed(2)}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Recent Messages</h6>
                      </div>
                      <div className="card-body">
                        {contactMessages.slice(0, 5).map(message => (
                          <div key={message.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                            <div>
                              <strong>{message.name}</strong>
                              <br/>
                              <small className="text-muted">{message.subject}</small>
                            </div>
                            <div className="text-end">
                              <span className={`badge bg-${message.status === 'unread' ? 'danger' : 'success'}`}>
                                {message.status}
                              </span>
                              <br/>
                              <small>{new Date(message.date).toLocaleDateString()}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Registered Users ({users.length})
                  </h5>
                </div>
                <div className="card-body">
                  {users.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-people display-4 text-muted mb-3"></i>
                      <h5>No Registered Users</h5>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Registered Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={user.email}>
                              <td>{index + 1}</td>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.phone || 'N/A'}</td>
                              <td>{user.registrationDate?.split('T')[0] || 'N/A'}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteUser(user.email)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Section */}
            {activeSection === 'bookings' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-calendar-check me-2"></i>
                    Table Bookings ({bookedTables.length})
                  </h5>
                </div>
                <div className="card-body">
                  {bookedTables.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-calendar-x display-4 text-muted"></i>
                      <p className="mt-3">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date & Time</th>
                            <th>Table</th>
                            <th>Guests</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookedTables.map(booking => (
                            <tr key={booking.id}>
                              <td>#{booking.id.toString().slice(-6)}</td>
                              <td>{booking.name}</td>
                              <td>{booking.email}</td>
                              <td>{booking.date} at {booking.time}</td>
                              <td>
                                <span className="badge bg-primary">
                                  Table {booking.tableNumber}
                                </span>
                              </td>
                              <td>{booking.guests}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteBooking(booking.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Management Section */}
            {activeSection === 'menu' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-egg-fried me-2"></i>
                    Menu Management ({menuItems.length} items)
                  </h5>
                </div>
                <div className="card-body">
                  {/* Add New Item Form */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">Add New Menu Item</h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-3">
                              <label className="form-label">Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                placeholder="Item name"
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Category *</label>
                              <select
                                className="form-control"
                                value={newItem.category}
                                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                              >
                                {categories.map(cat => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Price *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newItem.price}
                                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                placeholder="$12.99"
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Image</label>
                              <select
                                className="form-control"
                                value={newItem.image}
                                onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                              >
                                {imageEmojis.map(emoji => (
                                  <option key={emoji} value={emoji}>{emoji}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Description *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                placeholder="Item description"
                              />
                            </div>
                            <div className="col-md-12">
                              <button 
                                className="btn btn-primary"
                                onClick={addMenuItem}
                              >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Menu Item
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items List */}
                  <div className="row">
                    <h6 className="mb-3">Current Menu Items</h6>
                    {menuItems.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="bi bi-egg-fried display-4 text-muted"></i>
                        <p className="mt-3">No menu items added yet</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Category</th>
                              <th>Description</th>
                              <th>Price</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {menuItems.map(item => (
                              <tr key={item.id}>
                                <td>{item.id}</td>
                                <td><span style={{fontSize: '1.5rem'}}>{item.image}</span></td>
                                <td>{item.name}</td>
                                <td>
                                  <span className={`badge bg-${item.category === 'specials' ? 'warning' : 'secondary'}`}>
                                    {categories.find(c => c.value === item.category)?.label}
                                  </span>
                                </td>
                                <td>{item.description}</td>
                                <td>{item.price}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => deleteMenuItem(item.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-receipt me-2"></i>
                    Order Management ({orders.length})
                  </h5>
                </div>
                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-receipt display-4 text-muted"></i>
                      <p className="mt-3">No orders yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>{order.userEmail}</td>
                              <td>
                                <small>
                                  {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                                </small>
                              </td>
                              <td>${order.total.toFixed(2)}</td>
                              <td>{new Date(order.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge bg-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <select 
                                  className="form-select form-select-sm"
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Carts Section */}
            {activeSection === 'carts' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-cart3 me-2"></i>
                    User Cart Details ({carts.length})
                  </h5>
                </div>
                <div className="card-body">
                  {carts.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-cart display-4 text-muted"></i>
                      <p className="mt-3">No active carts</p>
                    </div>
                  ) : (
                    <div className="row">
                      {carts.map((cart, index) => (
                        <div key={index} className="col-md-6 mb-4">
                          <div className="card h-100">
                            <div className="card-header">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  <i className="bi bi-person-circle me-2"></i>
                                  {cart.userEmail}
                                </h6>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => clearUserCart(cart.userEmail)}
                                >
                                  <i className="bi bi-trash"></i> Clear Cart
                                </button>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="cart-summary-admin mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                  <span>Items in cart:</span>
                                  <strong>{cart.itemCount}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                  <span>Cart value:</span>
                                  <strong>${cart.totalValue.toFixed(2)}</strong>
                                </div>
                              </div>
                              
                              <h6 className="border-top pt-3">Cart Items:</h6>
                              <div className="cart-items-admin">
                                {cart.items.map((item, idx) => (
                                  <div key={idx} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                                    <div className="d-flex align-items-center">
                                      <span className="me-2" style={{fontSize: '1.2rem'}}>{item.image}</span>
                                      <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <small className="text-muted">Qty: {item.quantity}</small>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <div>${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</div>
                                      <small className="text-muted">{item.price} each</small>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Messages Section */}
            {activeSection === 'messages' && (
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    Contact Messages ({contactMessages.length})
                    {stats.unreadMessages > 0 && (
                      <span className="badge bg-danger ms-2">{stats.unreadMessages} unread</span>
                    )}
                  </h5>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-success"
                      onClick={markAllAsRead}
                      disabled={stats.unreadMessages === 0}
                    >
                      <i className="bi bi-check-all me-1"></i>
                      Mark All as Read
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={loadAllData}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-envelope display-4 text-muted"></i>
                      <h5 className="mt-3">No Messages Yet</h5>
                      <p className="text-muted">Customer messages will appear here when they contact you</p>
                    </div>
                  ) : (
                    <div className="messages-container">
                      {contactMessages.map(message => (
                        <div key={message.id} className={`message-card ${message.status === 'unread' ? 'unread' : ''}`}>
                          <div className="message-header">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {message.name}
                                  {message.status === 'unread' && (
                                    <span className="badge bg-danger ms-2">New</span>
                                  )}
                                  {message.replied && (
                                    <span className="badge bg-success ms-2">Replied</span>
                                  )}
                                </h6>
                                <div className="message-meta">
                                  <small className="text-muted me-3">
                                    <i className="bi bi-envelope me-1"></i>
                                    {message.email}
                                  </small>
                                  <small className="text-muted me-3">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(message.date).toLocaleString()}
                                  </small>
                                  <small className={`badge bg-${getStatusBadge(message.status)}`}>
                                    {getStatusText(message.status)}
                                  </small>
                                </div>
                              </div>
                              <div className="message-actions">
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => openReplyModal(message)}
                                >
                                  <i className="bi bi-reply"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteMessage(message.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                            <div className="message-subject mt-2">
                              <strong>Subject:</strong> {message.subject}
                            </div>
                          </div>
                          
                          <div className="message-body">
                            <p>{message.message}</p>
                          </div>
                          
                          {message.replied && message.reply && (
                            <div className="reply-section">
                              <div className="reply-header">
                                <strong>
                                  <i className="bi bi-reply-fill me-2"></i>
                                  Your Reply ({new Date(message.replyDate).toLocaleDateString()})
                                </strong>
                              </div>
                              <div className="reply-body">
                                <p>{message.reply}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="message-footer">
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">
                                Message ID: {message.id}
                              </small>
                              {message.status === 'unread' && (
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => markMessageAsRead(message.id)}
                                >
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.show && (
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
            onClick={closeReplyModal}
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
            onClick={closeReplyModal}
          >
            <div 
              className="modal-dialog modal-dialog-centered modal-lg" 
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content" style={{
                borderRadius: '15px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
              }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-reply me-2"></i>
                    Reply to {replyModal.message?.name}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={closeReplyModal}
                    aria-label="Close"
                  ></button>
                </div>
                
                <div className="modal-body">
                  {/* Original Message */}
                  <div className="original-message mb-4">
                    <h6>Original Message:</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <p><strong>From:</strong> {replyModal.message?.name} ({replyModal.message?.email})</p>
                        <p><strong>Subject:</strong> {replyModal.message?.subject}</p>
                        <p><strong>Date:</strong> {new Date(replyModal.message?.date).toLocaleString()}</p>
                        <hr />
                        <p>{replyModal.message?.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reply Form */}
                  <div className="reply-form">
                    <h6>Your Reply:</h6>
                    <textarea
                      className="form-control"
                      rows="6"
                      value={replyModal.replyText}
                      onChange={(e) => setReplyModal({...replyModal, replyText: e.target.value})}
                      placeholder="Type your reply here..."
                    ></textarea>
                    <div className="text-end mt-2">
                      <small className="text-muted">
                        {replyModal.replyText.length}/1000 characters
                      </small>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeReplyModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={sendReply}
                  >
                    <i className="bi bi-send me-2"></i>
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .sidebar {
          min-height: calc(100vh - 56px);
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          overflow-y: auto;
        }
        
        .nav-link {
          color: #333;
          padding: 0.75rem 1rem;
          transition: all 0.3s;
          border-radius: 0;
          border: none;
          background: none;
          text-align: left;
          width: 100%;
        }
        
        .nav-link:hover {
          background-color: #e9ecef;
          color: #007bff;
        }
        
        .nav-link.active {
          color: #007bff;
          background-color: #e7f1ff;
          border-left: 4px solid #007bff;
        }
        
        .card {
          border: none;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          margin-bottom: 1.5rem;
        }
        
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        .cart-summary-admin {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 10px;
        }
        
        .cart-items-admin {
          max-height: 200px;
          overflow-y: auto;
        }
        
        /* Messages Styling */
        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .message-card {
          background: white;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        
        .message-card.unread {
          border-left: 4px solid #dc3545;
          background: rgba(220, 53, 69, 0.05);
        }
        
        .message-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .message-header {
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }
        
        .message-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          margin-top: 0.5rem;
        }
        
        .message-subject {
          color: #666;
          font-size: 0.95rem;
        }
        
        .message-body {
          padding: 1rem 0;
          line-height: 1.6;
          color: #333;
        }
        
        .reply-section {
          background: rgba(25, 135, 84, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          border-left: 4px solid #198754;
        }
        
        .reply-header {
          color: #198754;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .reply-body {
          color: #333;
          line-height: 1.5;
        }
        
        .message-footer {
          border-top: 1px solid #e0e0e0;
          padding-top: 1rem;
          margin-top: 1rem;
        }
        
        .message-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        /* Modal Styling */
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
        
        @media (max-width: 768px) {
          .sidebar {
            min-height: auto;
            margin-bottom: 1rem;
          }
          
          .message-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .message-actions {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .modal-dialog {
            margin: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .message-header > div {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .message-actions {
            margin-top: 1rem;
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  )
}