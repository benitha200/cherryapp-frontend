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
  const [originalMappings, setOriginalMappings] = useState([]); // Keep track of original values for comparison

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const skeletonRows = Array(10).fill(0);

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
        setOriginalMappings(JSON.parse(JSON.stringify(mappingsResponse.data))); // Deep copy for comparison
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

  // Delete a mapping from the database
  const deleteMappingFromDatabase = async (mapping) => {
    if (!mapping.senderCwsId || !mapping.receivingCwsId) {
      // This is a new mapping that hasn't been saved to the database yet
      // Just remove it from the UI state
      return true;
    }

    try {
      setLoading(true);

      // Make API call to delete the mapping
      await axios.delete(
        `${API_URL}/wet-transfer/cws-mappings/${mapping.senderCwsId}/${mapping.receivingCwsId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setSuccess('Mapping deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting mapping:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to delete mapping. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Replace your existing removeMappingRow function with this updated version
  const removeMappingRow = async (index) => {
    const mapping = mappings[index];

    // If it's a new mapping (not saved to DB yet), just remove from UI
    if (!mapping.senderCwsId) {
      const updatedMappings = mappings.filter((_, i) => i !== index);
      setMappings(updatedMappings);
      return;
    }

    // If it's already saved to DB, we need to delete it
    const success = await deleteMappingFromDatabase(mapping);

    if (success) {
      // Remove from UI state after successful DB deletion
      const updatedMappings = mappings.filter((_, i) => i !== index);
      setMappings(updatedMappings);

      // Also update the original mappings state to keep them in sync
      const updatedOriginalMappings = originalMappings.filter(m =>
        m.senderCwsId !== mapping.senderCwsId || m.receivingCwsId !== mapping.receivingCwsId
      );
      setOriginalMappings(updatedOriginalMappings);
    }
  };

  // Check if a mapping has been modified from its original state
  const isMappingModified = (mapping, index) => {
    if (!mapping.senderCwsId) return true; // New mapping

    const original = originalMappings.find(m =>
      m.senderCwsId === mapping.senderCwsId && m.receivingCwsId === mapping.receivingCwsId
    );

    return original && (original.senderCws !== mapping.senderCws || original.receivingCws !== mapping.receivingCws);
  };

  // Submit mappings to the backend
  const handleMapCws = async () => {
    // Separate new and modified mappings
    const newMappings = mappings.filter(mapping => !mapping.senderCwsId);
    const modifiedMappings = mappings.filter((mapping, index) =>
      mapping.senderCwsId && isMappingModified(mapping, index)
    );

    // Validate all fields are filled in new mappings
    const isValid = newMappings.every(mapping => mapping.senderCws && mapping.receivingCws);
    if (!isValid) {
      setError('Please fill in all fields for new mappings.');
      return;
    }

    if (newMappings.length === 0 && modifiedMappings.length === 0) {
      setSuccess('No new or modified mappings to process.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Process new mappings
      if (newMappings.length > 0) {
        await axios.post(`${API_URL}/wet-transfer/map-cws`, {
          mappings: newMappings
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      // Process modified mappings
      if (modifiedMappings.length > 0) {
        await axios.put(`${API_URL}/wet-transfer/update-cws-mappings`, {
          mappings: modifiedMappings
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      setSuccess('CWS mappings processed successfully!');

      // Refresh mappings after successful submission
      const mappingsResponse = await axios.get(`${API_URL}/wet-transfer/cws-mappings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMappings(mappingsResponse.data);
      setOriginalMappings(JSON.parse(JSON.stringify(mappingsResponse.data))); // Update original mappings
    } catch (error) {
      console.error('Error processing mappings:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to process mappings. Please try again.');
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
          <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="h4 mb-0 bg-secondary bg-opacity-25 rounded" style={{ width: '200px', height: '24px' }} />
              <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '150px', height: '38px' }} />
            </div>

            {/* Search Bar Skeleton */}
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: theme.neutral }}>
                <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '16px', height: '16px' }} />
              </span>
              <div
                className="form-control bg-secondary bg-opacity-25"
                style={{ border: `1px solid ${theme.secondary}` }}
              />
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm mb-0">
                <thead style={{ backgroundColor: theme.neutral }}>
                  <tr>
                    {['Name', 'CWS', 'Created Date', 'Actions'].map((header, index) => (
                      <th
                        key={index}
                        className="text-uppercase px-4 py-3"
                        style={{ color: theme.primary }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skeletonRows.map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="px-2 py-2">
                        <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '180px', height: '20px' }} />
                      </td>
                      <td className="px-2 py-2">
                        <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '120px', height: '20px' }} />
                      </td>
                      <td className="px-2 py-2">
                        <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '100px', height: '20px' }} />
                      </td>
                      <td className="px-2 py-2">
                        <div className="d-flex gap-2">
                          <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '32px', height: '32px' }} />
                          <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '32px', height: '32px' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Skeleton */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.neutral }}>
              <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '200px', height: '20px' }} />
              <nav aria-label="Site Collections pagination">
                <ul className="pagination mb-0">
                  {[1, 2, 3].map((_, index) => (
                    <li key={index} className="page-item">
                      <div
                        className="page-link bg-secondary bg-opacity-25"
                        style={{ width: '40px', height: '38px', border: `1px solid ${theme.secondary}` }}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to filter out already selected CWS names for sender dropdown
  const getAvailableSenderCws = (currentMapping) => {
    if (!currentMapping) return [];

    // For existing mappings, always include the current selection
    const currentSelection = currentMapping.senderCws;

    // Get all senders that are already mapped (excluding current selection)
    const alreadyMappedSenders = mappings
      .filter(m => m.senderCwsId && m.senderCwsId !== currentMapping.senderCwsId)
      .map(m => m.senderCws);

    // Return CWS that are either wet parchment senders or the current selection
    return cwsList
      .filter(cws =>
        (cws.is_wet_parchment_sender === 1 || cws.name === currentSelection) &&
        !alreadyMappedSenders.includes(cws.name)
      )
      .map(cws => cws.name);
  };

  // Function to filter out already selected CWS names for receiver dropdown
  const getAvailableReceiverCws = (currentMapping) => {
    if (!currentMapping) return [];

    // For existing mappings, always include the current selection
    const currentSelection = currentMapping.receivingCws;

    // Get all receivers that are already mapped (excluding current selection)
    const alreadyMappedReceivers = mappings
      .filter(m => m.receivingCwsId && m.receivingCwsId !== currentMapping.receivingCwsId)
      .map(m => m.receivingCws);

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
                      <select
                        className="form-select"
                        value={mapping.senderCws}
                        onChange={(e) => handleInputChange(index, 'senderCws', e.target.value)}
                        style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                      >
                        <option value="">Select Sender CWS</option>
                        {getAvailableSenderCws(mapping).map(cwsName => (
                          <option key={`sender-${cwsName}`} value={cwsName}>{cwsName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="form-select"
                        value={mapping.receivingCws}
                        onChange={(e) => handleInputChange(index, 'receivingCws', e.target.value)}
                        style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                      >
                        <option value="">Select Receiving CWS</option>
                        {getAvailableReceiverCws(mapping).map(cwsName => (
                          <option key={`receiver-${cwsName}`} value={cwsName}>{cwsName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="d-flex align-items-center">
                        {mapping.senderCwsId && (
                          <span
                            className="badge rounded-pill me-2"
                            style={{
                              backgroundColor: isMappingModified(mapping, index) ? theme.accent : theme.secondary,
                              color: 'white'
                            }}
                          >
                            {isMappingModified(mapping, index) ? 'Modified' : 'Saved'}
                          </span>
                        )}
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: theme.accent }}
                          onClick={() => removeMappingRow(index)}
                          disabled={loading} 
                        >
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
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
              disabled={loading || (!mappings.some(m => !m.senderCwsId) && !mappings.some((m, i) => isMappingModified(m, i)))}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WetTransferCwsMapping;


// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import API_URL from '../../constants/Constants';

// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA'  // Ultra light teal for table hover
// };

// const WetTransferCwsMapping = () => {
//   // CWS data state
//   const [cwsList, setCwsList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Mappings state to be fetched from database
//   const [mappings, setMappings] = useState([]);
//   const [originalMappings, setOriginalMappings] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Memoized CWS lists for better performance
//   const senderCwsList = useMemo(() => 
//     cwsList.filter(cws => cws.is_wet_parchment_sender === 1).map(cws => cws.name), 
//     [cwsList]
//   );
  
//   const receiverCwsList = useMemo(() => 
//     cwsList.filter(cws => cws.is_wet_parchment_sender === 2).map(cws => cws.name), 
//     [cwsList]
//   );

//   // Fetch CWS data and mappings on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);

//         // Use Promise.all to fetch data in parallel
//         const [cwsResponse, mappingsResponse] = await Promise.all([
//           axios.get(`${API_URL}/cws`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           }),
//           axios.get(`${API_URL}/wet-transfer/cws-mappings`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           })
//         ]);

//         setCwsList(cwsResponse.data);
//         setMappings(mappingsResponse.data);
//         setOriginalMappings(JSON.parse(JSON.stringify(mappingsResponse.data)));
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError('Failed to load data.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter mappings based on search term - memoized for performance
//   const filteredMappings = useMemo(() => 
//     mappings.filter(mapping =>
//       mapping.senderCws?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       mapping.receivingCws?.toLowerCase().includes(searchTerm.toLowerCase())
//     ),
//     [mappings, searchTerm]
//   );

//   // Handle input changes for sender and receiving CWS
//   const handleInputChange = (index, field, value) => {
//     const updatedMappings = [...mappings];
//     updatedMappings[index][field] = value;
//     setMappings(updatedMappings);
//   };

//   // Add a new mapping row
//   const addMappingRow = () => {
//     setMappings([...mappings, { senderCws: '', receivingCws: '' }]);
//   };

//   // Delete a mapping from the database
//   const deleteMappingFromDatabase = async (mapping) => {
//     if (!mapping.senderCwsId || !mapping.receivingCwsId) {
//       return true;
//     }

//     try {
//       setLoading(true);
//       await axios.delete(
//         `${API_URL}/wet-transfer/cws-mappings/${mapping.senderCwsId}/${mapping.receivingCwsId}`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }
//       );

//       setSuccess('Mapping deleted successfully!');
//       return true;
//     } catch (error) {
//       console.error('Error deleting mapping:', error);
//       setError(error.response?.data?.message || 'Failed to delete mapping. Please try again.');
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove mapping row
//   const removeMappingRow = async (index) => {
//     const mapping = mappings[index];

//     // If it's a new mapping (not saved to DB yet), just remove from UI
//     if (!mapping.senderCwsId) {
//       const updatedMappings = mappings.filter((_, i) => i !== index);
//       setMappings(updatedMappings);
//       return;
//     }

//     // If it's already saved to DB, we need to delete it
//     const success = await deleteMappingFromDatabase(mapping);

//     if (success) {
//       // Remove from UI state after successful DB deletion
//       const updatedMappings = mappings.filter((_, i) => i !== index);
//       setMappings(updatedMappings);

//       // Also update the original mappings state to keep them in sync
//       const updatedOriginalMappings = originalMappings.filter(m =>
//         m.senderCwsId !== mapping.senderCwsId || m.receivingCwsId !== mapping.receivingCwsId
//       );
//       setOriginalMappings(updatedOriginalMappings);
//     }
//   };

//   // Check if a mapping has been modified from its original state
//   const isMappingModified = (mapping) => {
//     if (!mapping.senderCwsId) return true; // New mapping

//     const original = originalMappings.find(m =>
//       m.senderCwsId === mapping.senderCwsId && m.receivingCwsId === mapping.receivingCwsId
//     );

//     return original && (original.senderCws !== mapping.senderCws || original.receivingCws !== mapping.receivingCws);
//   };

//   // Submit mappings to the backend
//   const handleMapCws = async () => {
//     // Separate new and modified mappings
//     const newMappings = mappings.filter(mapping => !mapping.senderCwsId);
//     const modifiedMappings = mappings.filter(mapping => mapping.senderCwsId && isMappingModified(mapping));

//     // Validate all fields are filled in new mappings
//     const isValid = newMappings.every(mapping => mapping.senderCws && mapping.receivingCws);
//     if (!isValid) {
//       setError('Please fill in all fields for new mappings.');
//       return;
//     }

//     if (newMappings.length === 0 && modifiedMappings.length === 0) {
//       setSuccess('No new or modified mappings to process.');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // Process new mappings and modified mappings in parallel if both exist
//       const promises = [];
      
//       if (newMappings.length > 0) {
//         promises.push(axios.post(`${API_URL}/wet-transfer/map-cws`, {
//           mappings: newMappings
//         }, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }));
//       }

//       if (modifiedMappings.length > 0) {
//         promises.push(axios.put(`${API_URL}/wet-transfer/update-cws-mappings`, {
//           mappings: modifiedMappings
//         }, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }));
//       }

//       await Promise.all(promises);
//       setSuccess('CWS mappings processed successfully!');

//       // Refresh mappings after successful submission
//       const mappingsResponse = await axios.get(`${API_URL}/wet-transfer/cws-mappings`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       setMappings(mappingsResponse.data);
//       setOriginalMappings(JSON.parse(JSON.stringify(mappingsResponse.data)));
//     } catch (error) {
//       console.error('Error processing mappings:', error);
//       setError(error.response?.data?.message || 'Failed to process mappings. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Clear messages after 5 seconds
//   useEffect(() => {
//     if (!success && !error) return;
    
//     const timer = setTimeout(() => {
//       setSuccess('');
//       setError('');
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [success, error]);

//   // Lightweight loading skeleton
//   if (isLoading) {
//     return (
//       <div className="container-fluid py-4">
//         <div className="card border-0 shadow-sm">
//           <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
//             <h2 className="h4 mb-0" style={{ color: theme.primary }}>Loading CWS Mappings...</h2>
//           </div>
//           <div className="card-body">
//             <div className="d-flex justify-content-center py-5">
//               <div className="spinner-border" role="status" style={{ color: theme.primary }}>
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h2 className="h4 mb-0" style={{ color: theme.primary }}>
//               Wet Transfer CWS Mapping
//             </h2>
//             <button
//               className="btn d-flex align-items-center gap-2 text-white"
//               style={{ backgroundColor: theme.primary }}
//               onClick={addMappingRow}
//             >
//               <i className="bi bi-plus-lg"></i>
//               Add New Mapping
//             </button>
//           </div>

//           {/* Search Bar */}
//           <div className="input-group">
//             <span
//               className="input-group-text"
//               style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//             >
//               <i className="bi bi-search"></i>
//             </span>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search by sender or receiving CWS..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{
//                 backgroundColor: theme.neutral,
//                 border: `1px solid ${theme.secondary}`
//               }}
//             />
//           </div>
//         </div>

//         {/* Alert messages */}
//         {error && (
//           <div className="alert alert-danger m-3" role="alert">
//             <i className="bi bi-exclamation-triangle-fill me-2"></i>
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="alert alert-success m-3" role="alert">
//             <i className="bi bi-check-circle-fill me-2"></i>
//             {success}
//           </div>
//         )}

//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover table-sm mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Sender CWS</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Receiving CWS</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredMappings.map((mapping, index) => (
//                   <tr key={index} style={{ '--bs-table-hover-bg': theme.tableHover }}>
//                     <td className="px-4 py-2">
//                       <select
//                         className="form-select"
//                         value={mapping.senderCws || ''}
//                         onChange={(e) => handleInputChange(index, 'senderCws', e.target.value)}
//                         style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//                       >
//                         <option value="">Select Sender CWS</option>
//                         {senderCwsList.map(cwsName => (
//                           <option key={`sender-${index}-${cwsName}`} value={cwsName}>{cwsName}</option>
//                         ))}
//                       </select>
//                     </td>
//                     <td className="px-4 py-2">
//                       <select
//                         className="form-select"
//                         value={mapping.receivingCws || ''}
//                         onChange={(e) => handleInputChange(index, 'receivingCws', e.target.value)}
//                         style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//                       >
//                         <option value="">Select Receiving CWS</option>
//                         {receiverCwsList.map(cwsName => (
//                           <option key={`receiver-${index}-${cwsName}`} value={cwsName}>{cwsName}</option>
//                         ))}
//                       </select>
//                     </td>
//                     <td className="px-4 py-2">
//                       <div className="d-flex align-items-center">
//                         {mapping.senderCwsId && (
//                           <span
//                             className="badge rounded-pill me-2"
//                             style={{
//                               backgroundColor: isMappingModified(mapping) ? theme.accent : theme.secondary,
//                               color: 'white'
//                             }}
//                           >
//                             {isMappingModified(mapping) ? 'Modified' : 'Saved'}
//                           </span>
//                         )}
//                         <button
//                           className="btn btn-sm text-white"
//                           style={{ backgroundColor: theme.accent }}
//                           onClick={() => removeMappingRow(index)}
//                           disabled={loading} 
//                         >
//                           <i className="bi bi-trash3-fill"></i>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {filteredMappings.length === 0 && (
//                   <tr>
//                     <td colSpan="3" className="text-center py-4">
//                       No mappings found. {searchTerm ? 'Try a different search term.' : 'Add a new mapping to get started.'}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: theme.neutral }}>
//             <span style={{ color: theme.secondary }}>
//               Total mappings: {filteredMappings.length}
//             </span>
//             <button
//               className="btn text-white"
//               style={{ backgroundColor: theme.primary }}
//               onClick={handleMapCws}
//               disabled={loading || (!mappings.some(m => !m.senderCwsId) && !mappings.some(m => isMappingModified(m)))}
//             >
//               {loading ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                   Processing...
//                 </>
//               ) : (
//                 'Save'
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WetTransferCwsMapping;