import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { isTokenValid } from './utils/auth';
import { connectSocket, disconnectSocket, emitStatusUpdate } from './socket/socket';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return token && isTokenValid(token);
  });

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh-token');
      return response.data.token;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token && isTokenValid(token)) {
        setIsAuthenticated(true);
        connectSocket(token);
      } else {
        try {
          const newToken = await refreshAccessToken(); 
          localStorage.setItem("token", newToken);
          setIsAuthenticated(true);
          connectSocket(newToken);
        } catch (error) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          disconnectSocket();
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout;

    const handleActivity = () => {
      clearTimeout(activityTimeout);
      emitStatusUpdate();
      activityTimeout = setTimeout(() => {
        emitStatusUpdate();
      }, 2 * 60 * 1000);
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    handleActivity();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(activityTimeout);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        emitStatusUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnectSocket();
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
    disconnectSocket();
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