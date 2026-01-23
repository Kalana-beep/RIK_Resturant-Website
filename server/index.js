const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const EmployeeModel = require('./models/Employees');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/rik_restaurant')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check for admin login
  if (email === 'admin@gmail.com' && password === 'admin123') {
    return res.json("Success");
  }
  
  if (!email || !password) {
    return res.status(400).json("Email and password are required");
  }
  
  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.json("Success");
        } else {
          res.json("The password is incorrect");
        }
      } else {
        res.json("No record exists");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json("Server error");
    });
});

// Register endpoint
app.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json("Name, email and password are required");
  }
  
  const userData = {
    name,
    email,
    password
  };
  
  if (phone && phone.trim() !== '') {
    userData.phone = phone;
  }
  
  EmployeeModel.create(userData)
    .then(employee => {
      console.log('User created:', employee);
      res.json("Success");
    })
    .catch(err => {
      console.error('Registration error:', err);
      
      if (err.code === 11000) {
        return res.status(400).json("Email already exists");
      }
      
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json(messages.join(', '));
      }
      
      res.status(500).json("Error creating user");
    });
});

// Get all users (for admin dashboard)
app.get('/admin/users', (req, res) => {
  EmployeeModel.find({})
    .then(users => res.json(users))
    .catch(err => {
      console.error(err);
      res.status(500).json("Server error");
    });
});

// Get user by ID
app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  
  EmployeeModel.findById(id)
    .then(user => {
      if (!user) {
        return res.status(404).json("User not found");
      }
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json("Server error");
    });
});

// Update user
app.put('/user/:id', (req, res) => {
  const { id } = req.params;
  
  EmployeeModel.findByIdAndUpdate(id, req.body, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).json("User not found");
      }
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json("Server error");
    });
});

// Delete user
app.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  
  EmployeeModel.findByIdAndDelete(id)
    .then(user => {
      if (!user) {
        return res.status(404).json("User not found");
      }
      res.json({ message: "User deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json("Server error");
    });
});

// Get all carts (for admin)
app.get('/admin/carts', (req, res) => {
  try {
    const carts = JSON.parse(localStorage.getItem('userCarts') || '[]');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching carts" });
  }
});

// Get user's cart
app.get('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  try {
    const carts = JSON.parse(localStorage.getItem('userCarts') || '[]');
    const userCart = carts.find(cart => cart.userId === userId) || { userId, items: [] };
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cart" });
  }
});

// Update user's cart
app.post('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;
  
  try {
    let carts = JSON.parse(localStorage.getItem('userCarts') || '[]');
    const existingCartIndex = carts.findIndex(cart => cart.userId === userId);
    
    if (existingCartIndex >= 0) {
      carts[existingCartIndex] = { userId, items, updatedAt: new Date().toISOString() };
    } else {
      carts.push({ userId, items, updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem('userCarts', JSON.stringify(carts));
    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating cart" });
  }
});

// Clear user's cart
app.delete('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  
  try {
    let carts = JSON.parse(localStorage.getItem('userCarts') || '[]');
    carts = carts.filter(cart => cart.userId !== userId);
    localStorage.setItem('userCarts', JSON.stringify(carts));
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Error clearing cart" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});