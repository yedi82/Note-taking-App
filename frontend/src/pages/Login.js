import { Eye, EyeOff } from 'lucide-react';
import { default as React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import '../App.css';
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function base64urlToUint8Array(base64url) {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

const base64UrlToBase64 = (base64Url) => {
  const padding = '='.repeat((4 - base64Url.length % 4) % 4);
  return base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding;
};

export const login = async (email, password, rememberMe = false) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'ngrok-skip-browser-warning': 'true' 
    },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not log in");
  }

  // Store the token
  sessionStorage.setItem('token', data.token);

  return data;
};

export const loginWithPasskey = async (email) => {

  const challengeResponse = await fetch(`${API_URL}/auth/challenge?email=${email}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' 
    },
  });
  if (!challengeResponse.ok) {
    throw new Error("Could not retrieve challenge");
  }

  const challengeData = await challengeResponse.json();
  console.log("Raw challenge response:", challengeData);

  if (challengeData.credentialId) {
    console.log("User has a registered credential:", challengeData.credentialId);
  } else {
    console.log("No registered credential found for the user with email=", email);
    throw new Error("No registered credential, please register a passkey");
    
  }
  const challenge = base64urlToUint8Array(challengeData.challenge);

  // Fetch the user's registered credentials
  const credentialsResponse = await fetch(`${API_URL}/auth/get-credentials?email=${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'ngrok-skip-browser-warning': 'true' 
    },
  });

  if (!credentialsResponse.ok) {
    throw new Error("Could not retrieve credentials");
  }

  const credentialsData = await credentialsResponse.json();
  console.log("Registered credentials:", credentialsData);

  const publicKeyCredentialRequestOptions = {
    challenge: challenge,
    allowCredentials: credentialsData.map(cred => {
      if (!cred.id) {
        console.error("Invalid credential data:", cred);
        throw new Error("Invalid credential ID");
      }
      return {
        id: base64urlToUint8Array(cred.id),
        type: 'public-key',
      };
    }),
    timeout: 60000,
    userVerification: 'preferred',
  };

  try{
    const credential = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

    if (!credential) {
      throw new Error("No credentials available");
    }
  
    // Send credential to the server for verification
    const response = await fetch(`${API_URL}/auth/passkey-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify({ credential }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || "Could not log in with passkey");
    }
  
    // Store the token
    sessionStorage.setItem("token", data.token);
  
    return data;
  } catch(err) {
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
      console.log("User canceled the passkey login.");
      return; // Exit gracefully without throwing an error
    }
    throw err;
  }

};


export default function Login() {
  const navigate = useNavigate();
  const { darkMode, currentTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    try {
      await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    try {
      // Check if there are registered passkeys before attempting login
      const hasPasskey = await checkRegisteredPasskey(email);
      if (!hasPasskey) {
        throw new Error("No registered credential, please register a passkey");
      }

      const result  = await loginWithPasskey(email);
      if (result) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterPasskey = async () => {
    setError("")
    if (!email || !password) {
      setError("Email and password are required to register a passkey");
      return;
    }
     
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
    console.log(challengeData)
    const username = challengeData.username;

    const userExistResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    if (!userExistResponse.ok) {
      setError("User not found");
      return
    }

    try {
      await registerPasskey(challengeData.challenge, username); // Call registerPasskey
    } catch (err) {
      setError(err.message);
    }

  };

  const handleResetPassword = () => {
    navigate("/request-password-reset"); // Navigate to reset password page
  };

  const checkRegisteredPasskey = async (email) => {
    const response = await fetch(`${API_URL}/auth/get-credentials?email=${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true' 
      },
    });

    if (!response.ok) {
      throw new Error("Could not retrieve credentialss");
    }

    const data = await response.json();
    return data.length > 0; // Return true if there are registered credentials
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
        id: Uint8Array.from(username, c => c.charCodeAt(0)), // check that the ID is Uint8Array
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

      <main className={`flex-grow transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="max-w-md mx-auto px-4 py-8">
          <h2 className="h1-login">Log in to Marker</h2>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
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

            {/* password */}
            <div>
              <label htmlFor="password" className="login-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`input border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Enter your password"
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
            
            {/* remember me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="login-text ml-2">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                className={`login-text ${currentTheme.text} hover:underline`}
              >
                Forgot password?
              </button>
            </div>

            {/* buttons */}
            <button
              type="submit"
              className={`login-page-btn ${currentTheme.primary}`}
            >
              Log in
            </button>
          </form>
          <button
            type="button"
            onClick={handlePasskeyLogin}
            className={`login-page-btn ${currentTheme.primary}`}
          >
            Log in with Passkey
          </button>
          <button
            type="button"
            onClick={handleRegisterPasskey}
            className={`login-page-btn ${currentTheme.primary}`}
          >
            Register a Passkey
          </button>

          <p className="login-text text-center mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className={`font-medium ${currentTheme.text} hover:underline`}>
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}