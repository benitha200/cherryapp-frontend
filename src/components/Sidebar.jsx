// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

// // Consistent theme colors
// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   danger: '#dc3545',     // Bootstrap danger red
//   dangerLight: '#ff6b6b' // Lighter red for hover
// };

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/login');
//   };

//   return (
//     <div 
//       className="d-flex flex-column vh-100"
//       style={{ 
//         width: '10%',
//         minWidth: '250px',
//         maxWidth: '350px',
//         backgroundColor: theme.primary
//       }}
//     >
//       {/* Header */}
//       <div className="p-4 border-bottom border-opacity-25">
//         <h3 className="fs-4 fw-bold text-light mb-0">
//           Cherry Purchase
//         </h3>
//       </div>

//       {/* Navigation Links */}
//       <nav className="p-3 flex-grow-1">
//         <div className="list-group list-group-flush">
//           <Link
//             to="/"
//             className="list-group-item list-group-item-action border-0 mb-2"
//             style={{ 
//               backgroundColor: 'transparent',
//               color: 'white'
//             }}
//           >
//             <i className="bi bi-house-door me-3"></i>
//             Dashboard
//           </Link>
//           <Link
//             to="/purchases"
//             className="list-group-item list-group-item-action border-0 mb-2"
//             style={{ 
//               backgroundColor: 'transparent',
//               color: 'white'
//             }}
//           >
//             <i className="bi bi-cart me-3"></i>
//             Purchases
//           </Link>
//           <Link
//             to="/processing"
//             className="list-group-item list-group-item-action border-0 mb-2"
//             style={{ 
//               backgroundColor: 'transparent',
//               color: 'white'
//             }}
//           >
//             <i className="bi bi-gear me-3"></i>
//             Processing
//           </Link>
//           <Link
//             to="/site-collections"
//             className="list-group-item list-group-item-action border-0 mb-2"
//             style={{ 
//               backgroundColor: 'transparent',
//               color: 'white'
//             }}
//           >
//             <i className="bi bi-collection me-3"></i>
//             Site Collections
//           </Link>
//         </div>
//       </nav>

//       {/* Logout Section */}
//       <div 
//         className="p-4 border-top border-opacity-25 mt-auto"
//         style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} // Slight highlight for the logout area
//       >
//         <div className="d-flex justify-content-between align-items-center">
//           <span className="text-light">
//             <i className="bi bi-person-circle me-2"></i>
//             {user.username}
//           </span>
//           <button
//             onClick={handleLogout}
//             className="btn btn-sm"
//             style={{ 
//               backgroundColor: theme.danger,
//               borderColor: theme.danger,
//               color: 'white',
//               transition: 'all 0.3s ease',
//               ':hover': {
//                 backgroundColor: theme.dangerLight,
//                 borderColor: theme.dangerLight
//               }
//             }}
//           >
//             <i className="bi bi-box-arrow-right me-2"></i>
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Consistent theme colors
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  danger: '#dc3545',     // Bootstrap danger red
  dangerLight: '#ff6b6b' // Lighter red for hover
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Style for active and inactive menu items
  const getLinkStyle = (path) => ({
    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: 'white',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    padding: '10px 15px',
    marginBottom: '8px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
  });

  const menuItems = [
    { path: '/', icon: 'house-door', text: 'Dashboard' },
    { path: '/purchases', icon: 'cart', text: 'Purchases' },
    { path: '/processing', icon: 'bag-check', text: 'Bagging Off' },
    { path: '/transfer', icon: 'truck', text: 'Transfer' },
    { path: '/site-collections', icon: 'collection', text: 'Site Collections' },
  ];

  return (
    <div
      className="d-flex flex-column vh-100"
      style={{
        width: '10%',
        minWidth: '250px',
        maxWidth: '350px',
        backgroundColor: theme.primary,
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-bottom border-opacity-25">
        <h3 className="fs-4 fw-bold text-light mb-0">
          Cherry Purchase
        </h3>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 flex-grow-1">
        <div className="list-group list-group-flush">
          {menuItems.map(({ path, icon, text }) => (
            <Link
              key={path}
              to={path}
              className="list-group-item list-group-item-action border-0"
              style={getLinkStyle(path)}
            >
              <i className={`bi bi-${icon} me-3`}></i>
              {text}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout Section */}
      <div 
        className="p-4 border-top border-opacity-25 mt-auto"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-light">
            <i className="bi bi-person-circle me-2"></i>
            {user.username}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            style={{
              backgroundColor: theme.danger,
              borderColor: theme.danger,
              color: 'white',
              transition: 'all 0.3s ease',
              padding: '5px 10px',
              borderRadius: '6px',
              ':hover': {
                backgroundColor: theme.dangerLight,
                borderColor: theme.dangerLight
              }
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;