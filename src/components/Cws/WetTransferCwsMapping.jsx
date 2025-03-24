import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import API_URL from '../../constants/Constants';

const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA'  // Ultra light teal for table hover
};

const WetTransferCwsMapping = () => {
  // CWS data state
  const [cwsList, setCwsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mappings state to be fetched from database
  const [mappings, setMappings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch CWS data and mappings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch CWS data
        const cwsResponse = await axios.get(`${API_URL}/cws`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setCwsList(cwsResponse.data);
        
        // Fetch existing CWS mappings
        const mappingsResponse = await axios.get(`${API_URL}/wet-transfer/cws-mappings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setMappings(mappingsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter mappings based on search term
  const filteredMappings = mappings.filter(mapping => 
    mapping.senderCws.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.receivingCws.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input changes for sender and receiving CWS using dropdown selection
  const handleInputChange = (index, field, value) => {
    const updatedMappings = [...mappings];
    updatedMappings[index][field] = value;
    setMappings(updatedMappings);
  };

  // Add a new mapping row
  const addMappingRow = () => {
    setMappings([...mappings, { senderCws: '', receivingCws: '' }]);
  };

  // Remove a mapping row
  const removeMappingRow = (index) => {
    const updatedMappings = mappings.filter((_, i) => i !== index);
    setMappings(updatedMappings);
  };

  // Submit mappings to the backend
  const handleMapCws = async () => {
    // Only process new or modified mappings (those without IDs)
    const newMappings = mappings.filter(mapping => !mapping.senderCwsId);
    
    // Validate all fields are filled in new mappings
    const isValid = newMappings.every(mapping => mapping.senderCws && mapping.receivingCws);
    if (!isValid) {
      setError('Please fill in all fields for new mappings.');
      return;
    }

    if (newMappings.length === 0) {
      setSuccess('No new mappings to process.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(`${API_URL}/wet-transfer/map-cws`, { 
        mappings: newMappings 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Mapping successful:', response.data);
      setSuccess('CWS mappings processed successfully!');
      
      // Refresh mappings after successful submission
      const mappingsResponse = await axios.get(`${API_URL}/wet-transfer/cws-mappings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMappings(mappingsResponse.data);
    } catch (error) {
      console.error('Error mapping CWS:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to map CWS. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [success, error]);

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-3">Loading CWS data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Get all existing mappings for filtering
  const existingMappings = mappings
    .filter(mapping => mapping.senderCwsId) // Only consider existing mappings (with IDs)
    .map(mapping => ({
      sender: mapping.senderCws,
      receiver: mapping.receivingCws
    }));

  // Function to filter out already selected CWS names for sender dropdown
  const getAvailableSenderCws = (currentSelection) => {
    // Get all senders that are already mapped
    const alreadyMappedSenders = existingMappings
      .map(mapping => mapping.sender)
      .filter(sender => sender !== currentSelection);
    
    // Return CWS that are either wet parchment senders or the current selection
    return cwsList
      .filter(cws => 
        (cws.is_wet_parchment_sender === 1 || cws.name === currentSelection) && 
        !alreadyMappedSenders.includes(cws.name)
      )
      .map(cws => cws.name);
  };

  // Function to filter out already selected CWS names for receiver dropdown
  const getAvailableReceiverCws = (currentSelection) => {
    // Get all receivers that are already mapped
    const alreadyMappedReceivers = existingMappings
      .map(mapping => mapping.receiver)
      .filter(receiver => receiver !== currentSelection);
    
    // Return CWS that are either wet parchment receivers or the current selection
    return cwsList
      .filter(cws => 
        (cws.is_wet_parchment_sender === 2 || cws.name === currentSelection) && 
        !alreadyMappedReceivers.includes(cws.name)
      )
      .map(cws => cws.name);
  };

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0" style={{ color: theme.primary }}>
              Wet Transfer CWS Mapping
            </h2>
            <button
              className="btn d-flex align-items-center gap-2 text-white"
              style={{ backgroundColor: theme.primary }}
              onClick={addMappingRow}
            >
              <i className="bi bi-plus-lg"></i>
              Add New Mapping
            </button>
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
              placeholder="Search by sender or receiving CWS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: theme.neutral,
                border: `1px solid ${theme.secondary}`
              }}
            />
          </div>
        </div>

        {/* Alert messages */}
        {error && (
          <div className="alert alert-danger m-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success m-3" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Sender CWS</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Receiving CWS</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.map((mapping, index) => (
                  <tr key={index} style={{ '--bs-table-hover-bg': theme.tableHover }}>
                    <td className="px-4 py-2">
                      {mapping.senderCwsId ? (
                        // If this is an existing mapping, show as text (not editable)
                        <span>{mapping.senderCws}</span>
                      ) : (
                        // If this is a new mapping, show as dropdown
                        <select
                          className="form-select"
                          value={mapping.senderCws}
                          onChange={(e) => handleInputChange(index, 'senderCws', e.target.value)}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        >
                          <option value="">Select Sender CWS</option>
                          {getAvailableSenderCws(mapping.senderCws).map(cwsName => (
                            <option key={`sender-${cwsName}`} value={cwsName}>{cwsName}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {mapping.receivingCwsId ? (
                        // If this is an existing mapping, show as text (not editable)
                        <span>{mapping.receivingCws}</span>
                      ) : (
                        // If this is a new mapping, show as dropdown
                        <select
                          className="form-select"
                          value={mapping.receivingCws}
                          onChange={(e) => handleInputChange(index, 'receivingCws', e.target.value)}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        >
                          <option value="">Select Receiving CWS</option>
                          {getAvailableReceiverCws(mapping.receivingCws).map(cwsName => (
                            <option key={`receiver-${cwsName}`} value={cwsName}>{cwsName}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: theme.accent }}
                        onClick={() => removeMappingRow(index)}
                        disabled={mapping.senderCwsId} // Disable remove button for existing mappings
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMappings.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No mappings found. {searchTerm ? 'Try a different search term.' : 'Add a new mapping to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: theme.neutral }}>
            <span style={{ color: theme.secondary }}>
              Total mappings: {filteredMappings.length}
            </span>
            <button
              className="btn text-white"
              style={{ backgroundColor: theme.primary }}
              onClick={handleMapCws}
              disabled={loading || !mappings.some(m => !m.senderCwsId)} // Only enable if there are new mappings
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Process Mappings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WetTransferCwsMapping;