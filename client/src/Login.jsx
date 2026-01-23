import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Check for admin login
    if (email === 'admin@gmail.com' && password === 'admin123') {
      localStorage.setItem('userToken', 'admin-token')
      localStorage.setItem('userRole', 'admin')
      navigate('/admin')
      setIsLoading(false)
      return
    }

    // Regular user login
    axios.post("http://localhost:3001/login", { email, password })
      .then(result => {
        if (result.data === "Success") {
          localStorage.setItem('userToken', 'user-token')
          localStorage.setItem('userRole', 'user')
          navigate('/home')
        } else {
          setError(result.data)
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.log(err)
        setError("Login failed. Please try again.")
        setIsLoading(false)
      })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Enter your credentials</p>

        {error && (
          <div style={styles.errorAlert}>
            {error}
            <button 
              style={styles.closeButton} 
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>


          <div style={styles.links}>
            <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
            <span style={styles.separator}>|</span>
            <Link to="/register" style={styles.link}>Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px'
  },
  errorAlert: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  button: {
    padding: '12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  demoInfo: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginTop: '10px'
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '14px'
  },
  separator: {
    color: '#999'
  }
}

export default Login