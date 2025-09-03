import React, { useState, useEffect, useCallback } from 'react';
import { useParams,useNavigate,Link } from 'react-router-dom';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import './PostDetail.css';
import { API_URL } from '../../config';
import { FaHeart, FaComment } from "react-icons/fa";

const PostDetail = ({ isLoggedIn, user }) => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [myurl, setmyurl] = useState(API_URL.replace("/api",""));
  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${slug}`);
      const data = await response.json();
      if (response.ok) {
        //console.log(`${myurl}`);
        setPost(data.post);
        setComments(data.post.comments || []);
        
        // detect if user has already liked
        if (isLoggedIn && user) {
          const liked = data.post.likes?.some(like => like.user_id === user.id);
          setHasLiked(liked);
        }
        setLikeCount(data.post.likes?.length || 0);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug, isLoggedIn, user]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const toggleLike = async () => {
    if (!isLoggedIn) return alert("Please log in to like posts");

    try {
      const url = `${API_URL}/posts/${post.id}/like`;

      const response = await fetch(url, {
        method: hasLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setHasLiked(!hasLiked);
        setLikeCount(prev => hasLiked ? prev - 1 : prev + 1);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
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
  const LinkifiedContent = ({ content }) => {
  // Regular expression to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split content into parts, some will be text, some will be URLs
  const parts = content.split(urlRegex);
  
  return (
    <div className="post-content">
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="content-link"
            >
              {part}
            </a>
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
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
          navigate("/");
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

  if (error) return <div className="post-detail-error">{error}</div>;
  if (!post) return <div className="post-detail-error">Post not found</div>;

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        <div className='edit-btns'>
          
        {((((user && post.user.name==user.name) && (user && user.role!="admin")) || (user && user.role=="admin"))) && (<>

        <Link 
          to={`/posts/${post.slug}/edit`} 
          className="btn edit-btn"
        >
          Edit
        </Link>
        <button 
          onClick={() => {handleDeletePost(post.id);}}
          className="btn delete-btn"
          
        >
          Delete
        </button>
        </>)}
        </div>
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          {/* Add image display if exists */}
          {post.image && (
            <div className="post-image1-container">
              <img 
                src={`${myurl}/storage/${post.image}`} //url will be changed to a variable!!!
                alt={post.title} 
                className="post-image1"
              />
            </div>
          )}
          <div className="post-meta">
            
            <div className="author-info">
              <span className="author-avatar">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
              <span className="author-name">By {post.user.name}</span>
            </div>

            <button className="like-button" onClick={toggleLike}>
              <FaHeart style={{ color: hasLiked ? "red" : "FF8787" }} /> {likeCount}
            </button>

            <span className="comments">
              <FaComment style={{ color: "gray" }} /> {comments.length}
            </span>

            <span className="post-date">
            {formatDate(post.created_at)}
          </span>
            
          </div>
        </header>
        
        <div className="post-content">
                <LinkifiedContent content={post.content} />

          
        </div>
        
      </article>
      
      <section className="comments-section">
        <div className="comments-header">
          <h2>Comments ({comments.length})</h2>
        </div>
        
        <CommentList comments={comments} />

        {isLoggedIn && !user.is_banned && (
          <CommentForm postId={post.id} onCommentAdded={() => fetchPost()} />
        )}
      </section>
    </div>
  );
};

export default PostDetail;
