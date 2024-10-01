import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginComponent.css'; // Assuming you have a separate CSS file for styling

const LoginComponent = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      const token = res.data.token;
      setMessage('Login successful');
      onLoginSuccess(token); // Store token
      navigate('/chart');    // Redirect to chart page
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid login credentials';
      setMessage(errorMsg); // Display error message from the server
    }
  };

  return (
    <div className="login-container">
      <h2>Client Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LoginComponent;
