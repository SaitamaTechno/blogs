import React, { useState } from 'react';
import './CommentForm.css';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Comment added successfully!');
        setError('');
        setContent('');
        // Call the callback function if provided
        if (onCommentAdded) {
          onCommentAdded(data.comment);
        }
      } else {
        setError(data.message || 'Failed to add comment');
        setSuccess('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-form-container">
      <div className="comment-form">
        <h3 className="comment-form-title">
          <i className="fas fa-pen"></i>
          Add a Comment
        </h3>
        
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              className="comment-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              placeholder="Share your thoughts..."
              required
            />
            <div className="textarea-footer">
              <span className="char-count">{content.length}/500</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || content.length === 0}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Posting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Submit Comment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;