// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import API_URL from '../../constants/Constants';
// // import API_URL from '../../constants/Constants';


// const theme = {
//   primary: '#008080',
//   secondary: '#4FB3B3',
//   accent: '#D95032',
//   neutral: '#E6F3F3',
//   tableHover: '#F8FAFA'
// };

// const Users = () => {
//   const [users, setUsers] = useState([]);
//   const [cwsList, setCwsList] = useState([]);
//   const [newUser, setNewUser] = useState({
//     username: '',
//     password: '',
//     role: 'CWS_MANAGER',
//     cwsId: ''
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     fetchUsers();
//     fetchCWS();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${API_URL}/auth/users`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUsers(response.data);
//     } catch (error) {
//       setError('Failed to fetch users');
//     }
//   };

//   const fetchCWS = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${API_URL}/cws`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCwsList(response.data);
//     } catch (error) {
//       setError('Failed to fetch CWS list');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${API_URL}/auth/register`, newUser, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSuccess('User created successfully');
//       setNewUser({ username: '', password: '', role: 'CWS_MANAGER', cwsId: '' });
//       fetchUsers();
//     } catch (error) {
//       setError(error.response?.data?.error || 'Failed to create user');
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (window.confirm('Are you sure you want to delete this user?')) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`${API_URL}/admin/users/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setSuccess('User deleted successfully');
//         fetchUsers();
//       } catch (error) {
//         setError('Failed to delete user');
//       }
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="row mb-4">
//         <div className="col">
//           <h2 className="mb-4" style={{ color: theme.primary }}>Users</h2>
          
//           {/* Alert Messages */}
//           {error && (
//             <div className="alert alert-danger" role="alert">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="alert alert-success" role="alert">
//               {success}
//             </div>
//           )}

//           {/* Create User Form */}
//           <div className="card mb-4">
//             <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
//               Create New User
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleSubmit}>
//                 <div className="row">
//                   <div className="col-md-3 mb-3">
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="Username"
//                       value={newUser.username}
//                       onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <input
//                       type="password"
//                       className="form-control"
//                       placeholder="Password"
//                       value={newUser.password}
//                       onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <select
//                       className="form-select"
//                       value={newUser.role}
//                       onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
//                       required
//                     >
//                       <option value="CWS_MANAGER">CWS Manager</option>
//                       <option value="ADMIN">Admin</option>
//                       <option value="SUPER_ADMIN">Super Admin</option>
//                     </select>
//                   </div>
//                   <div className="col-md-3 mb-3">
//                     <select
//                       className="form-select"
//                       value={newUser.cwsId}
//                       onChange={(e) => setNewUser({ ...newUser, cwsId: e.target.value })}
//                       required={newUser.role === 'CWS_MANAGER'}
//                     >
//                       <option value="">Select CWS</option>
//                       {cwsList.map((cws) => (
//                         <option key={cws.id} value={cws.id}>
//                           {cws.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <button
//                   type="submit"
//                   className="btn"
//                   style={{ backgroundColor: theme.primary, color: 'white' }}
//                 >
//                   Create User
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* Users Table */}
//           <div className="card">
//             <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
//               User Management
//             </div>
//             <div className="card-body">
//               <div className="table-responsive">
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th>Username</th>
//                       <th>Role</th>
//                       <th>CWS</th>
//                       <th>Created At</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {users.map((user) => (
//                       <tr key={user.id}>
//                         <td>{user.username}</td>
//                         <td>{user.role}</td>
//                         <td>{user.cws?.name || 'N/A'}</td>
//                         <td>{new Date(user.createdAt).toLocaleDateString()}</td>
//                         <td>
//                           <button
//                             className="btn btn-danger btn-sm"
//                             onClick={() => handleDeleteUser(user.id)}
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Users;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';

const theme = {
  primary: '#008080',
  secondary: '#4FB3B3',
  accent: '#D95032',
  neutral: '#E6F3F3',
  tableHover: '#F8FAFA'
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [cwsList, setCwsList] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'CWS_MANAGER',
    cwsId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    username: '',
    role: '',
    cwsId: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchCWS();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const fetchCWS = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cws`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCwsList(response.data);
    } catch (error) {
      setError('Failed to fetch CWS list');
    }
  };

  // Search and filter logic
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.cws?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/register`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User created successfully');
      setNewUser({ username: '', password: '', role: 'CWS_MANAGER', cwsId: '' });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditData({
      username: user.username,
      role: user.role,
      cwsId: user.cws?.id || ''
    });
  };

  const handleSaveEdit = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/users/${user.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User updated successfully');
      setEditId(null);
      fetchUsers();
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ username: '', role: '', cwsId: '' });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-4" style={{ color: theme.primary }}>Users</h2>
          
          {/* Alert Messages */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {/* Create User Form */}
          <div className="card mb-4">
            <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
              Create New User
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      required
                    >
                      <option value="CWS_MANAGER">CWS Manager</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <select
                      className="form-select"
                      value={newUser.cwsId}
                      onChange={(e) => setNewUser({ ...newUser, cwsId: e.target.value })}
                      required={newUser.role === 'CWS_MANAGER'}
                    >
                      <option value="">Select CWS</option>
                      {cwsList.map((cws) => (
                        <option key={cws.id} value={cws.id}>
                          {cws.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: theme.primary, color: 'white' }}
                >
                  Create User
                </button>
              </form>
            </div>
          </div>

          {/* Users Table with Search */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: theme.neutral }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0" style={{ color: theme.primary }}>
                  User Management
                </h5>
              </div>
              
              {/* Search Bar */}
              <div className="input-group">
                <span 
                  className="input-group-text"
                  style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                >
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by username, role, or CWS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    backgroundColor: theme.neutral,
                    border: `1px solid ${theme.secondary}`
                  }}
                />
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead style={{ backgroundColor: theme.neutral }}>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>CWS</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((user) => (
                      <tr key={user.id} style={{ '--bs-table-hover-bg': theme.tableHover }}>
                        <td>
                          {editId === user.id ? (
                            <input
                              type="text"
                              className="form-control"
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            />
                          ) : (
                            user.username
                          )}
                        </td>
                        <td>
                          {editId === user.id ? (
                            <select
                              className="form-select"
                              value={editData.role}
                              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            >
                              <option value="CWS_MANAGER">CWS Manager</option>
                              <option value="ADMIN">Admin</option>
                              {/* <option value="SUPER_ADMIN">Super Admin</option> */}
                              <option value="SUPERVISOR">Supervisor</option>
                            </select>
                          ) : (
                            user.role
                          )}
                        </td>
                        <td>
                          {editId === user.id ? (
                            <select
                              className="form-select"
                              value={editData.cwsId}
                              onChange={(e) => setEditData({ ...editData, cwsId: e.target.value })}
                            >
                              <option value="">Select CWS</option>
                              {cwsList.map((cws) => (
                                <option key={cws.id} value={cws.id}>
                                  {cws.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            user.cws?.name || 'N/A'
                          )}
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          {editId === user.id ? (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: theme.secondary }}
                                onClick={() => handleSaveEdit(user)}
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: theme.neutral, color: theme.primary }}
                                onClick={handleCancelEdit}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="btn-group">
                              <button
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: theme.primary }}
                                onClick={() => handleEdit(user)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: theme.accent }}
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.neutral }}>
                <small style={{ color: theme.secondary }}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                </small>
                <nav aria-label="Users pagination">
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ color: theme.primary, borderColor: theme.secondary }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => paginate(index + 1)}
                          style={{
                            backgroundColor: currentPage === index + 1 ? theme.primary : 'white',
                            borderColor: theme.secondary,
                            color: currentPage === index + 1 ? 'white' : theme.primary
                          }}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ color: theme.primary, borderColor: theme.secondary }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;