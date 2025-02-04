// Updated Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/purchases" className="nav-link">
                Purchases
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/processing" className="nav-link">
                Processing
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/site-collections" className="nav-link">
                Site Collections
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/site-collections/new" className="nav-link">
                New Site Collection
              </Link>
            </li> */}
          </ul>
          
          <div className="d-flex align-items-center">
            <span className="me-3 text-secondary">{user.username}</span>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;