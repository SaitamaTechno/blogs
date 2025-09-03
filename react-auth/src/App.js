import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./Profile";
import LoginAndRegisterPage from "./LoginAndRegisterPage";
import VerificationNotice from "./VerificationNotice"; // You'll need to create this
import BlogHome from './components/Blog/BlogHome';
import PostDetail from './components/Blog/PostDetail';
import CreatePost from './components/Blog/CreatePost';
import EditBlog from "./components/Blog/EditBlog"; // adjust path
import { API_URL } from "./config";
import Navbar from "./NavBar";
import Dashboard from "./Dashboard";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        const userData = await res.json();
        setToken(token);
        setUser(userData);
        setIsLoggedIn(true);
        setNeedsVerification(!userData.email_verified_at);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Please check your email for verification.");
        setRegisterData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        setMessage(data.errors ? JSON.stringify(data.errors) : "Registration failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful!");
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setNeedsVerification(false);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else if (data.needs_verification) {
        setNeedsVerification(true);
        setVerificationEmail(data.email);
        setMessage(data.message);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await fetch(`${API_URL}/email/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Verification email resent. Please check your inbox.");
      } else {
        setMessage(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setToken("");
    setUser(null);
    setIsLoggedIn(false);
    setNeedsVerification(false);
    setMessage("You have been logged out.");
  };

  if (isLoading) {
    return (
    <div className="post-detail-loading">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
  }

  return (
    <Router>
      <Navbar
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout} 
      user={user}
      />

      <Routes>
        <Route 
          path="/login" 
          element={
            isLoggedIn ? (
              needsVerification ? (
                <Navigate to="/verify-email" replace />
              ) : (
                <Navigate to="/profile" replace />
              )
            ) : (
              needsVerification ? (
                <Navigate to="/verify-email" replace />
              ) : (
              <LoginAndRegisterPage 
                handleRegister={handleRegister}
                handleLogin={handleLogin}
                registerData={registerData}
                setRegisterData={setRegisterData}
                loginData={loginData}
                setLoginData={setLoginData}
                message={message}
              />
            )
          )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn && !needsVerification ? (
              <Dashboard 
                user={user} 
                onLogout={handleLogout} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route
          path="/verify-email"
          element={
            needsVerification ? (
              <VerificationNotice
                email={verificationEmail}
                onResendVerification={handleResendVerification}
                message={message}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route 
          path="/" 
          element={<BlogHome isLoggedIn={isLoggedIn} user={user} />} 
        />
        
        <Route 
          path="/posts/:slug" 
          element={<PostDetail isLoggedIn={isLoggedIn} user={user} />} 
        />
        
        <Route 
          path="/posts/create" 
          element={
            isLoggedIn && (user?.role === 'admin' || user?.role === 'blogger') ? (
              <CreatePost user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isLoggedIn && !needsVerification ? (
              <Profile 
                user={user} 
                onLogout={handleLogout} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="/posts/:slug/edit" element={<EditBlog />} />
      </Routes>
    </Router>
  );
}

export default App;