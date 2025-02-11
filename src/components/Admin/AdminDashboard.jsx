import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';
// import API_URL from '../../constants/Constants';


// Theme colors from your existing code
const theme = {
  primary: '#008080',
  secondary: '#4FB3B3',
  accent: '#D95032',
  neutral: '#E6F3F3',
  tableHover: '#F8FAFA'
};

const AdminDashboard = () => {
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
          <h2 className="mb-4" style={{ color: theme.primary }}>Admin Dashboard</h2>
          
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

          {/* Users Table */}
          <div className="card">
            <div className="card-header" style={{ backgroundColor: theme.primary, color: 'white' }}>
              User Management
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>CWS</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
                        <td>{user.cws?.name || 'N/A'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;