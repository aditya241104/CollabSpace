import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { isTokenValid } from './utils/auth';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (token && isTokenValid(token)) {
      setIsAuthenticated(true);
    } else {
      try {
        const newToken = await refreshAccessToken(); 
        localStorage.setItem("token",newToken);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    }
  };

  checkAuth();
}, []);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return token && isTokenValid(token);
  });

  // Optional: Keep checking token changes
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(token && isTokenValid(token));
    };

    window.addEventListener('storage', checkToken); // For cross-tab sync
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

        <Route         
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={() => setIsAuthenticated(true)} />}
        />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
