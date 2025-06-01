// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { isTokenValid } from './utils/auth';
import { connectSocket, disconnectSocket, emitStatusUpdate } from './socket/socket'
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return token && isTokenValid(token);
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token && isTokenValid(token)) {
        setIsAuthenticated(true);
        // Connect socket when authenticated - sets user online
        connectSocket(token);
      } else {
        try {
          const newToken = await refreshAccessToken(); 
          localStorage.setItem("token", newToken);
          setIsAuthenticated(true);
          // Connect socket with new token - sets user online
          connectSocket(newToken);
        } catch (error) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          disconnectSocket(); // Sets user offline
        }
      }
    };

    checkAuth();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        connectSocket(token); // Sets user online
      }
    } else {
      disconnectSocket(); // Sets user offline
    }
  }, [isAuthenticated]);

  // Track user activity and update lastActive
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout;

    const handleActivity = () => {
      clearTimeout(activityTimeout);
      
      // Update user activity in database
      emitStatusUpdate();
      
      // Set timeout for next update (every 2 minutes of activity)
      activityTimeout = setTimeout(() => {
        emitStatusUpdate();
      }, 2 * 60 * 1000);
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial activity update
    handleActivity();

    return () => {
      // Cleanup event listeners and timeout
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(activityTimeout);
    };
  }, [isAuthenticated]);

  // Handle page visibility changes (tab switching, minimizing)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible - update activity
        emitStatusUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  // Handle browser close/refresh - cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectSocket(); // This will set user offline
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    disconnectSocket(); // Sets user offline
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />

        <Route         
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />}
        />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;