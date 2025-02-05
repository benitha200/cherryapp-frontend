// SiteCollectionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

const SiteCollectionList = () => {
  const [siteCollections, setSiteCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const skeletonRows = Array(5).fill(0);

  useEffect(() => {
    fetchSiteCollections();
  }, []);

  const fetchSiteCollections = async () => {
    try {
      const response = await axios.get(`${API_URL}/site-collections`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSiteCollections(response.data);
    } catch (error) {
      setError('Error fetching site collections');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light bg-opacity-10 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div 
                className="skeleton-title"
                style={{ 
                  backgroundColor: '#e0e0e0', 
                  width: '200px', 
                  height: '30px', 
                  borderRadius: '4px' 
                }}
              />
              <div 
                className="skeleton-button"
                style={{ 
                  backgroundColor: '#e0e0e0', 
                  width: '150px', 
                  height: '40px', 
                  borderRadius: '4px' 
                }}
              />
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    {['Name', 'CWS', 'Created Date'].map((header, index) => (
                      <th key={index} className="text-uppercase text-secondary px-4 py-3">
                        <div 
                          className="skeleton-header"
                          style={{ 
                            backgroundColor: '#e0e0e0', 
                            width: '100px', 
                            height: '20px', 
                            borderRadius: '4px' 
                          }}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skeletonRows.map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[1, 2, 3].map((cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3">
                          <div 
                            className="skeleton-cell"
                            style={{ 
                              backgroundColor: '#f0f0f0', 
                              width: '80%', 
                              height: '20px', 
                              borderRadius: '4px' 
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light bg-opacity-10 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title h4 mb-0 text-sucafina">Site Collections</h2>
            <Link
              to="/site-collections/new"
              className="btn btn-sucafina text-white"
            >
              <i className="bi bi-plus-lg me-2"></i>
              New Site Collection
            </Link>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-uppercase text-secondary px-4 py-3">Name</th>
                  <th className="text-uppercase text-secondary px-4 py-3">CWS</th>
                  <th className="text-uppercase text-secondary px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {siteCollections.map((site) => (
                  <tr key={site.id}>
                    <td className="px-4 py-3">{site.name}</td>
                    <td className="px-4 py-3">{site.cws.name}</td>
                    <td className="px-4 py-3 text-secondary">
                      {new Date(site.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCollectionList;