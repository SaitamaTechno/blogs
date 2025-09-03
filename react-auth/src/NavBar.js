import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
//import LoginAndRegisterPage from "./LoginAndRegisterPage";

const Navbar = ({ isLoggedIn, onLogout, user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Blogs</Link>
        {isLoggedIn && (<Link to="/dashboard">Dashboard</Link>)}
        {(isLoggedIn && user.role=="admin") && (<Link to="/admin">Admin Panel</Link>)}
        {isLoggedIn && <>
            <Link to="/posts/create">
              Create New Post
            </Link>
          </>}
        
      </div>
      <div className="navbar-right">
        {isLoggedIn ? (<>
          <Link to="/profile">Profile</Link>
          <Link to="/" onClick={onLogout}>Logout</Link>
          </>):(<>
         <Link to="/login?mode=login">Login</Link>
      <Link to="/login?mode=register">Register</Link></>)}
        
      </div>
    </nav>
  );
};

export default Navbar;
