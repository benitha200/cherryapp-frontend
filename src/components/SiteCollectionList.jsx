import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA'  // Ultra light teal for table hover
}

const SiteCollectionList = () => {
  const [siteCollections, setSiteCollections] = useState([]);
  const [cwsList, setCwsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', cwsId: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const skeletonRows = Array(5).fill(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchInitialData = async () => {
    try {
      const [siteCollectionsRes, cwsRes] = await Promise.all([
        axios.get(`${API_URL}/site-collections`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/cws`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setSiteCollections(siteCollectionsRes.data);
      setCwsList(cwsRes.data);
    } catch (error) {
      setError('Error fetching data');
    }
    setLoading(false);
  };

  // Search and filter logic
  const filteredSiteCollections = siteCollections.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.cws.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSiteCollections.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSiteCollections.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ... (keeping existing handler functions)
  const handleEdit = (site) => {
    setEditId(site.id);
    setEditData({
      name: site.name,
      cwsId: site.cws.id
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ name: '', cwsId: '' });
  };

  const handleSaveEdit = async (site) => {
    try {
      const response = await axios.put(
        `${API_URL}/site-collections/${site.id}`,
        {
          name: editData.name,
          cwsId: parseInt(editData.cwsId)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      const updatedCollections = siteCollections.map((s) =>
        s.id === site.id ? {
          ...s,
          name: editData.name,
          cws: cwsList.find(cws => cws.id === parseInt(editData.cwsId))
        } : s
      );
      setSiteCollections(updatedCollections);
      setEditId(null);
      setEditData({ name: '', cwsId: '' });
    } catch (error) {
      setError('Error updating site collection');
    }
  };

  const handleDelete = async (siteId) => {
    if (!window.confirm('Are you sure you want to delete this site collection?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/site-collections/${siteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSiteCollections(siteCollections.filter((site) => site.id !== siteId));
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Cannot delete site collection with associated purchases');
      } else {
        setError('Error deleting site collection');
      }
    }
  };

  if (loading) {
    // ... (keeping existing loading state JSX)
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light bg-opacity-10 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton-title bg-gray-200 w-48 h-8 rounded" />
              <div className="skeleton-button bg-gray-200 w-36 h-10 rounded" />
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    {['Name', 'CWS', 'Created Date', 'Actions'].map((header, index) => (
                      <th key={index} className="text-uppercase text-secondary px-4 py-3">
                        <div className="skeleton-header bg-gray-200 w-24 h-5 rounded" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skeletonRows.map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[1, 2, 3, 4].map((cellIndex) => (
                        <td key={cellIndex} className="px-2 py-2">
                          <div className="skeleton-cell bg-gray-100 w-4/5 h-5 rounded" />
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
      <div className="alert bg-danger text-white m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0" style={{ color: theme.primary }}>
              Site Collections
            </h2>
            <Link
              to="/site-collections/new"
              className="btn d-flex align-items-center gap-2 text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <i className="bi bi-plus-lg"></i>
              New Site Collection
            </Link>
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
              placeholder="Search by name or CWS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: theme.neutral,
                border: `1px solid ${theme.secondary}`
              }}
            />
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Name</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>CWS</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Created Date</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((site) => (
                  <tr key={site.id} style={{ '--bs-table-hover-bg': theme.tableHover }}>
                    <td className="px-2 py-2">
                      {editId === site.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        />
                      ) : (
                        site.name
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {editId === site.id ? (
                        <select
                          className="form-select"
                          value={editData.cwsId}
                          onChange={(e) => setEditData({ ...editData, cwsId: e.target.value })}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        >
                          {cwsList.map(cws => (
                            <option key={cws.id} value={cws.id}>{cws.name}</option>
                          ))}
                        </select>
                      ) : (
                        site.cws.name
                      )}
                    </td>
                    <td className="px-2 py-2" style={{ color: theme.secondary }}>
                      {new Date(site.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-2">
                      {editId === site.id ? (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: theme.secondary }}
                            onClick={() => handleSaveEdit(site)}
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
                            onClick={() => handleEdit(site)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: theme.accent }}
                            onClick={() => handleDelete(site.id)}
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSiteCollections.length)} of {filteredSiteCollections.length} entries
            </small>
            <nav aria-label="Site Collections pagination">
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
  );
};

export default SiteCollectionList;