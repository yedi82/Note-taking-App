import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Header from '../components/Header';
import Footer from "../components/Footer";
import { useTheme } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Signup() {
  const { darkMode, currentTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event, withPasskey = false) => {
    event.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!username) {
      setError("Username is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCreated = await createUser(email, password, username);
      if (userCreated && withPasskey) {

        const challengeResponse = await fetch(`${API_URL}/auth/challenge?email=${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' 
          },
        });

        const challengeData = await challengeResponse.json();
        // Check if challenge is present
        if (!challengeData.challenge) {
          throw new Error("Challenge is not available in response");
        }

        // Start the passkey registration process
        const passkeyRegistered = await registerPasskey(challengeData.challenge, username);

        if (passkeyRegistered) {
          console.log("passkey registered done")
          navigate('/login')
        } else {
          console.log("passkey not registered")
          await deleteUser(email);
          return;

        }
      } else if (!userCreated) {
        return;
      } else {
        navigate('/login')
      }

    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('User deletion failed');
      }
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const createUser = async (email, password, username) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();
      if (!response.ok) {
        let errorMessage;
        // Check for the first error format (errors array)
        if (data.errors && data.errors.length > 0) {
          errorMessage = data.errors[0].msg;
        }
        // Check for the second error format (single error message)
        else if (data.error) {
          errorMessage = data.error;
        }
        // Fallback message
        else {
          errorMessage = 'Signup failed';
        }
        throw new Error(errorMessage);

      }
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message || "User creation failed");
      return false;
    }
  };


  const base64UrlToBase64 = (base64Url) => {
    return base64Url.replace(/-/g, '+').replace(/_/g, '/')
  };


  const registerPasskey = async (challenge, username) => {
    console.log("Received challenge:", challenge); // Log the challenge

    let challengeArray;
    try {
      const base64Challenge = base64UrlToBase64(challenge.trim());
      challengeArray = Uint8Array.from(atob(base64Challenge), c => c.charCodeAt(0));
    } catch (err) {
      console.error("Error decoding challenge:", err);
      setError("Invalid challenge format");
      return;
    }

    // Prepare public key options for creating a new credential
    const publicKey = {
      challenge: challengeArray,
      rp: { name: "frontend" },
      user: {
        id: Uint8Array.from(username, c => c.charCodeAt(0)), // chekc that the ID is Uint8Array
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256 (Elliptic Curve)
        { type: "public-key", alg: -257 }  // RS256 (RSA)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform', 
        requireResidentKey: false, 
        userVerification: 'preferred',
      }
    };


    try {
      // Create the new credential
      const credential = await navigator.credentials.create({ publicKey });
      console.log(credential)
      console.log(username)
      console.log(publicKey)

      const credentialData = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
        },
        type: credential.type,
      };
      console.log(credentialData)
      // Send the credential to your server for verification and storage
      const credentialResponse = await fetch(`${API_URL}/auth/register-passkey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ username, credential: credentialData, publicKey: JSON.stringify(publicKey) }),
      });

      if (!credentialResponse.ok) {
        throw new Error("Could not register passkey");
      }
      return true;
    } catch (err) {
      console.error("Error during passkey registration:", err);
      setError("Passkey registration failed")
      return false;
    }
  };



  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Header islanding={true}/>

      <main className={`flex-grow ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
        <div className="max-w-md mx-auto px-4 py-8">
          <h2 className="h1-login">Sign up for Marker</h2>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div>
              <label htmlFor="email" className="login-label">Email</label>
              <input
                type="email"
                id="email"
                className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="username" className="login-label">Username</label>
              <input
                type="text"
                id="username"
                className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="login-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="login-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="eye"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={`login-page-btn ${currentTheme.primary}`}
            >
              Sign up
            </button>
          </form>
          <button
            onClick={(e) => handleSubmit(e, true)}
            className={`login-page-btn ${darkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-800 bg-gray-400 hover:bg-gray-300'}`}
          >
            Sign up + register Passkey
          </button>
          <p className="login-text text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className={`font-medium ${currentTheme.text} hover:underline`}>
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}