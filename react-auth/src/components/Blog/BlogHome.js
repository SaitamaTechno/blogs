import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
import { FaHeart, FaComment, FaFilter, FaChevronDown } from "react-icons/fa";
import './BlogHome.css';

const BlogHome = ({ isLoggedIn, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('latest');
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });
  const [filter, setFilter] = useState('time');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [myurl, setmyurl] = useState(API_URL.replace("/api",""));

  useEffect(() => {
    fetchPosts();
  }, [activeTab, filter]);

  const fetchPosts = async (page = 1) => {
    try {
      //setLoading(true);
      let endpoint = '';
      
      if (activeTab === 'latest') {
        endpoint = `${API_URL}/posts12?page=${page}&filter=${filter}`;
      } else {
        endpoint = `${API_URL}/postself?user_id=${user.id}&page=${page}&filter=${filter}`;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts.data || []);
        setPagination({
          currentPage: data.posts.current_page,
          lastPage: data.posts.last_page,
        });
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    setShowFilterOptions(false);
  };
  const truncateContent = (content, wordLimit = 20) => {
    const words = content.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return content;
  };
   const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete post');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) return (
    <div className="post-detail-loading">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
  
  if (error) return <div>{error}</div>;

  return (
    <div className="blog-home">
      <div className="container">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
            onClick={() => setActiveTab('latest')}
          >
            Latest Blogs
          </button>
          {isLoggedIn && (
            <button 
              className={`tab ${activeTab === 'myBlogs' ? 'active' : ''}`}
              onClick={() => setActiveTab('myBlogs')}
            >
              My Blogs
            </button>
          )}
        </div>
      </div>
      
      <div className='titleContainer'>
        <div className='title'>
          <h1>{activeTab === 'latest' ? 'Latest Blogs' : 'My Blogs'}</h1>
        </div>
        
        {/* Filter Dropdown */}
        <div className="filter-dropdown">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
          >
            <FaFilter className="filter-icon" />
            <span>Filter by {filter}</span>
            <FaChevronDown className={`dropdown-arrow ${showFilterOptions ? 'open' : ''}`} />
          </button>
          
          {showFilterOptions && (
            <div className="filter-options">
              <button 
                className={`filter-option ${filter === 'time' ? 'active' : ''}`}
                onClick={() => handleFilterSelect('time')}
              >
                Time
              </button>
              <button 
                className={`filter-option ${filter === 'likes' ? 'active' : ''}`}
                onClick={() => handleFilterSelect('likes')}
              >
                Likes
              </button>
              <button 
                className={`filter-option ${filter === 'comments' ? 'active' : ''}`}
                onClick={() => handleFilterSelect('comments')}
              >
                Comments
              </button>
            </div>
          )}
        </div>
      </div>

      {posts.length > 0 && (
        <div className="pagination">
          <button className='btn-change-page'
            disabled={pagination.currentPage === 1}
            onClick={() => fetchPosts(pagination.currentPage - 1)}
          >
            Previous
          </button>

          <span> Page {pagination.currentPage} of {pagination.lastPage} </span>

          <button className='btn-change-page'
            disabled={pagination.currentPage === pagination.lastPage}
            onClick={() => fetchPosts(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      
      <div className="posts-grid">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <h4>
            <Link to={`/posts/${post.slug}`}>{post.title}</Link>
          </h4>
          {post.image && <>
          <Link to={`/posts/${post.slug}`} className="post-image-link">
          <div className="post-image-container">

            <img 
              src={`${myurl}/storage/${post.image}`} //url will be changed to a variable!!!
              alt={post.title}
              className="post-image"
              onError={(e) => {
                console.log("error loading the image"+e); // Fallback for broken images
              }}
            />
          </div>
          </Link></>
          }
          {/* Content preview with truncation */}
          <div className="post-content-preview">
            
              {truncateContent(post.content)}
          </div>

           <p className="post-date">
            <strong>{post.user.name}</strong>{" "}
            {formatDate(post.created_at)}
          </p>
          
          <div className="post-actions">
            {(isLoggedIn && ((post.user.name === user.name && user.role !== "admin") || user.role === "admin")) && (
              <>
                <Link 
                  to={`/posts/${post.slug}/edit`} 
                  className="btn edit-btn"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="btn delete-btn"
                >
                  Delete
                </button>
              </>
            )}

            <div className="post-stats">
              <span className="likes">
                <FaHeart style={{ color: "red" }} /> {post.likes.length ?? 0}
              </span>
              <span className="comments">
                <FaComment style={{ color: "gray" }} /> {post.comments?.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
      
      {posts.length === 0 && !loading && (
        <div className="no-posts">
          <p>{activeTab === 'latest' ? 'No posts available.' : "You haven't created any posts yet."}</p>
        </div>
      )}
    </div>
  );
};

export default BlogHome;