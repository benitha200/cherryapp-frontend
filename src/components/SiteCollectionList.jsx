// SiteCollectionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SiteCollectionList = () => {
  const [siteCollections, setSiteCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSiteCollections();
  }, []);

  const fetchSiteCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/site-collections', {
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
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
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
        <div className="card-header bg-info bg-opacity-10 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title h4 mb-0 text-info">Site Collections</h2>
            <Link
              to="/site-collections/new"
              className="btn btn-info text-white"
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