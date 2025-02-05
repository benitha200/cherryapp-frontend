import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

const SiteCollectionForm = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    name: '',
    cwsId: userInfo?.cwsId || 1  // Use cwsId from user info directly
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/site-collections`, 
        {
          ...formData,
          cwsId: parseInt(formData.cwsId, 10)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      navigate('/site-collections');
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating site collection');
    }
    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light bg-opacity-1 border-0">
              <h2 className="card-title h4 mb-0 text-sucafina py-2">New Site Collection</h2>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-4">
                  <label className="form-label text-secondary">Name</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    value={userInfo?.cwsId} 
                    readOnly 
                    hidden
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-sucafina w-100 text-white py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Creating Site Collection...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>Create Site Collection</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCollectionForm;