import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChartComponent from './components/ChartComponent';
import LoginComponent from './components/LoginComponent';
import './components/LoginComponent.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLoginSuccess = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          {!token ? (
            <Route path="/login" element={<LoginComponent onLoginSuccess={handleLoginSuccess} />} />
          ) : (
            <>
              <Route path="/chart" element={<ChartComponent onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/chart" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
