// Sidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column vh-100 bg-white shadow-sm">
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar Content */}
      <div
        className={`sidebar-container fixed-top d-flex flex-column bg-white w-64 transition-transform 
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} lg:translate-x-0`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="px-4 py-3">
          <h1 className="text-2xl" style={{ color: '#00d4ff' }}>Cherry App</h1>
        </div>

        {/* User Info */}
        <div className="bg-cyan-500 text-white px-4 py-3">
          <div className="text-lg">{user.username}</div>
          <div className="text-sm opacity-90">{user.role}</div>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <ul className="list-unstyled">
            <li>
              <Link to="/" className="d-flex align-items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                <i className="bi bi-house-door me-2"></i>
                Dashboard
              </Link>
            </li>

            {/* Purchases Section */}
            <li className="pt-2">
              <div className="px-4 py-2">Purchases</div>
              <ul className="ps-4">
                <li>
                  <Link 
                    to="/purchases" 
                    className="d-flex align-items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    All Purchases
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/purchases/new" 
                    className="d-flex align-items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    New Purchase
                  </Link>
                </li>
              </ul>
            </li>

            {/* Site Collections Section */}
            <li className="pt-2">
              <div className="px-4 py-2">Site Collections</div>
              <ul className="ps-4">
                <li>
                  <Link 
                    to="/site-collections" 
                    className="d-flex align-items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    All Sites
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/site-collections/new" 
                    className="d-flex align-items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <i className="bi bi-arrow-right me-2"></i>
                    New Site
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto px-4 pb-4">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
