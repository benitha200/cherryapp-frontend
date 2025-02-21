import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';

const theme = {
  primary: '#008080',    
  secondary: '#4FB3B3',  
  accent: '#D95032',     
  neutral: '#E6F3F3',    
  tableHover: '#F8FAFA', 
  directDelivery: '#4FB3B3',
  centralStation: '#008080'
};

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch user data' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/auth/users/${user.id}`,
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update password' });
    }
  };

  if (!user) {
    return (
      <div className="container-fluid bg-light min-vh-100 py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            {/* Skeleton Profile Header */}
            <div className="d-flex align-items-center mb-5">
              <div className="bg-white rounded-circle p-4 shadow-sm me-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>

            <div className="row g-4">
              {/* Skeleton Account Information Card */}
              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                    <div className="d-flex flex-column gap-3">
                      {[1, 2, 3, 4].map((index) => (
                        <div key={index} className="p-3 rounded bg-gray-100 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-32"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skeleton Security Card */}
              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Profile Header */}
          <div className="d-flex align-items-center mb-5">
            <div className="bg-white rounded-circle p-4 shadow-sm me-4">
              <i className="bi bi-person-circle" style={{ fontSize: '2.5rem', color: theme.primary }}></i>
            </div>
            <div>
              <h2 className="mb-1" style={{ color: theme.primary }}>{user.username}</h2>
              <span className="badge" style={{ backgroundColor: theme.secondary }}>{user.role}</span>
            </div>
          </div>

          <div className="row g-4">
            {/* Account Information Card */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4" style={{ color: theme.primary }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Account Details
                  </h5>
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 rounded" style={{ backgroundColor: theme.neutral }}>
                      <small className="text-muted d-block">Username</small>
                      <strong>{user.username}</strong>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: theme.neutral }}>
                      <small className="text-muted d-block">Role</small>
                      <strong>{user.role}</strong>
                    </div>
                    {user.cws && (
                      <>
                        <div className="p-3 rounded" style={{ backgroundColor: theme.neutral }}>
                          <small className="text-muted d-block">CWS</small>
                          <strong>{user.cws.name}</strong>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: theme.neutral }}>
                          <small className="text-muted d-block">Location</small>
                          <strong>{user.cws.location}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0" style={{ color: theme.primary }}>
                      <i className="bi bi-shield-lock me-2"></i>
                      Security
                    </h5>
                    {!isEditing && (
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: theme.neutral, color: theme.primary }}
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Change Password
                      </button>
                    )}
                  </div>

                  {message.text && (
                    <div 
                      className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}
                      role="alert"
                    >
                      <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                      {message.text}
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handlePasswordChange}>
                      <div className="d-flex flex-column gap-3">
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-end-0">
                            <i className="bi bi-key"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-start-0"
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-end-0">
                            <i className="bi bi-lock"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-start-0"
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-transparent border-end-0">
                            <i className="bi bi-lock-fill"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-start-0"
                            placeholder="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button
                            type="submit"
                            className="btn"
                            style={{ backgroundColor: theme.primary, color: 'white' }}
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                              setIsEditing(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: theme.secondary }}></i>
                      <p className="mt-3 mb-0 text-muted">Your account is secured with a password</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;