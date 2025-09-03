import React from 'react';
import './CommentList.css';

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="no-comments">
        <i className="far fa-comments"></i>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }
const LinkifiedContent = ({ content }) => {
  // Regular expression to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split content into parts, some will be text, some will be URLs
  const parts = content.split(urlRegex);
  
  return (
    <span className="post-content">
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
    </span>
  );
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
  return (
    <div className="comment-list">
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <div className="name-box">
            <div className="name-text">{comment.user.name}</div>
            <div className="name-title">{comment.user.role}</div>
          </div>
          <div className="comment-content">
            <div className="comment-header">
              <span className="comment-date">
                <span className="post-date">
                  {formatDate(comment.created_at)}
                </span>
              </span>
            </div>
            <p className="comment-text"><LinkifiedContent content={comment.content} /></p>
            <div className="comment-actions">
              {/*<button className="action-btn"><i className="far fa-thumbs-up"></i> Like</button>
              <button className="action-btn"><i className="far fa-flag"></i> Report</button>
              <button className="action-btn"><i className="far fa-comment"></i> Reply</button>*/}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;