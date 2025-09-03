import React, { useState } from 'react';

const VerificationNotice = ({ email, onResendVerification, message }) => {
  const [showButton, setShowButton] = useState(true);

  const handleClick = () => {
    // Trigger the resend function
    onResendVerification();

    // Hide button for 5 seconds
    setShowButton(false);
    setTimeout(() => setShowButton(true), 5000);
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      textAlign: 'center'
    }}>
      <h2>Verify Your Email Address</h2>
      <p>
        A verification link has been sent to <strong>{email}</strong>.
        Please check your email and click on the link to verify your account.
      </p>
      <p>
        Didn't receive the email?
        {showButton && (
          <button 
            onClick={handleClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
              marginLeft: '5px'
            }}
          >
            Click here to resend
          </button>
        )}
      </p>
      {message && (
        <p style={{ color: message.includes('resent') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default VerificationNotice;
