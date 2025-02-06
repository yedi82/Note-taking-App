import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Eye, EyeOff, Lock, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode, currentTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'  },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(['Password has been reset successfully.']);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map((error) => error.msg);
          setMessages(errorMessages);
        } else {
          setMessages([data.error || 'An error occurred.']);
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessages(['An error occurred.']);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h1 className={`h1-login ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reset Password</h1>

        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 mb-4 rounded-md ${
                messages[0].includes('successfully')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {messages.length === 1 ? (
                <div className="flex items-center">
                  {messages[0].includes('successfully') ? (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  <p>{messages[0]}</p>
                </div>
              ) : (
                <ul className="list-disc list-inside">
                  {messages.map((msg, index) => (
                    <li key={index} className="flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>New Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="eye"
              >
                {showPassword ? (
                  <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                ) : (
                  <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`login-page-btn ${currentTheme.primary}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Reset Password
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPassword;