import React, { useState } from 'react';
import axios from 'axios';

const RegisterClient = () => {
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', { email });
      setResponse(`Client Registered: ${res.data.email}, Password: ${res.data.password}`);
    } catch (error) {
      setResponse('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Register Client</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Client Email" 
          required 
        />
        <button type="submit">Register</button>
      </form>
      {response && <p>{response}</p>}
    </div>
  );
};

export default RegisterClient;
