import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Profile.css';
import { API_URL } from './config';
import { FaHeart, FaComment } from "react-icons/fa"; // install react-icons if not already

const Profile = ({ isLoggedIn,user, onLogout }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  //const navigate = useNavigate();
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });

  useEffect(() => {
    if (user?.is_banned) {
      alert('Your account has been banned. Please contact support.');
      onLogout();
      return;
    }

    // Only fetch posts if user is admin or blogger
    if (user && (user.role === 'admin' || user.role === 'blogger')) {
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserPosts = async (page = 1) => {
  try {
    var response;
    response= await fetch(
    `${ API_URL }/profile?user_id=${user.id}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
    );
    
    
    
    const data = await response.json();
    console.log(data)
    if (response.ok) {
      // store the pagination info too
      console.log("User info loaded successfully!")
    } else {
      setError(data.message || 'Failed to fetch your posts');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (loading) return (
    <div className="post-detail-loading">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {user && user.name.toLowerCase().includes("enes") ? (
            <span>Reis hoşgeldin, <span className="username">{user.name}</span>!</span>
          ) : (
            <span>Welcome, <span className="username">{user?.name}</span>!</span>
          )}
        </h1>

        
      </div>

      <div className="user-info">
        <h2>Account Information</h2>
        <div className="info-grid">
          <div>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          <div>
            <p><strong>Role:</strong> <span className={`role-badge ${user?.role}`}>{user?.role}</span></p>
            <p><strong>Status:</strong> {user?.is_banned ? (
              <span className="banned">Banned</span>
            ) : (
              <span className="active">Active</span>
            )}</p>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="quick-links">
        <h3>Quick Links</h3>
        <ul>
          <li><Link to="/">View Blog Home</Link></li>
          {user?.role === 'user' && (
            <li><Link to="/apply-blogger">Apply to Become a Blogger</Link></li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;