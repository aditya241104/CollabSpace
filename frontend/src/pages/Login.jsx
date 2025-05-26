import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import API from '../services/api';
import logo from '../assets/logo.png';
import { login } from '../services/authService';
export default function Login( { onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userEmail: '', userPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const res = await API.post('/auth/login', form);
      // localStorage.setItem('token', res.data.token);
      await login(form.userEmail,form.userPassword);
      toast.success('Login successful!');
       onLogin();
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="bg-white p-10 rounded-xl shadow-sm w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Company Logo" className="h-12" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Sign in to your account</h1>
          <p className="text-gray-500">Welcome back to your workplace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
            <input
              id="userEmail"
              name="userEmail"
              type="email"
              placeholder="john@company.com"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
          
          <div>
            <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="userPassword"
              name="userPassword"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <div className="flex justify-end mt-1">
              <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>
        
        
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}