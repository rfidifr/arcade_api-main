import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Lock, ArrowRight, ShieldCheck, UserCog } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from query params
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get('role');
  const isManager = roleParam === 'manager';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Allow 'admin' as alias for manager login
    const isLoginSuccess = await login(username, password);
    if (isLoginSuccess) {
      if (username === 'manager' || username === 'admin') {
        navigate('/manager');
      } else {
        navigate('/operator');
      }
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`p-8 ${isManager ? 'bg-indigo-600' : 'bg-blue-600'} text-center transition-colors duration-300`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 text-white">
            {isManager ? <UserCog size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isManager ? 'Admin Access' : 'Employee Access'}
          </h1>
          <p className={`${isManager ? 'text-indigo-100' : 'text-blue-100'} text-sm mt-1`}>
            RFID Arcade Management System
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full ${isManager ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 group`}
            >
              <span>Sign In</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
