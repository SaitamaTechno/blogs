import React, { useState,useEffect  } from 'react';
import './LoginAndRegisterPage.css';
import { useLocation } from 'react-router-dom';


const LoginAndRegisterPage = ({ 
  handleRegister, 
  handleLogin, 
  registerData, 
  setRegisterData, 
  loginData, 
  setLoginData, 
  message 
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const [isLoginView, setIsLoginView] = useState(true);
 useEffect(() => {
    if (mode === "register") setIsLoginView(false);
    else setIsLoginView(true);
  }, [mode]);
  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
        <button 
          onClick={() => setIsLoginView(true)}
          style={{ 
            marginRight: "10px",
            background: isLoginView ? "#4CAF50" : "#f0f0f0",
            color: isLoginView ? "white" : "black"
          }}
        >
          Login
        </button>
        <button 
          onClick={() => setIsLoginView(false)}
          style={{
            background: !isLoginView ? "#4CAF50" : "#f0f0f0",
            color: !isLoginView ? "white" : "black"
          }}
        >
          Register
        </button>
      </div>

      {isLoginView ? (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <button 
              type="submit"
              style={{ width: "100%", padding: "10px", margin: "10px 0", background: "#4CAF50", color: "white" }}
            >
              Login
            </button>
          </form>
        </>
      ) : (
        <>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Name"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={registerData.password_confirmation}
              onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
              required
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <button 
              type="submit"
              style={{ width: "100%", padding: "10px", margin: "10px 0", background: "#4CAF50", color: "white" }}
            >
              Register
            </button>
          </form>
        </>
      )}
      
      <div style={{ marginTop: "20px", padding: "10px", textAlign: "center" }}>
        {message && (
          <div style={{ 
            background: message.includes("success") ? "#dff0d8" : "#f8d7da",
            color: message.includes("success") ? "#3c763d" : "#721c24",
            padding: "10px",
            borderRadius: "4px"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginAndRegisterPage;