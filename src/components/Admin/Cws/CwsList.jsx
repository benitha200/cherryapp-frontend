// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../../../constants/Constants';

// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA'  // Ultra light teal for table hover
// };

// const CwsList = () => {
//   const [cwsList, setCwsList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [editId, setEditId] = useState(null);
//   // const [editData, setEditData] = useState({ name: '', code: '', location: '' });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editData, setEditData] = useState({ 
//     name: '', 
//     code: '', 
//     location: '', 
//     havespeciality: false 
//   });
//   const skeletonRows = Array(5).fill(0);
  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     fetchCwsList();
//   }, []);

//   const fetchCwsList = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/cws`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setCwsList(response.data);
//     } catch (error) {
//       setError('Error fetching CWS list');
//     }
//     setLoading(false);
//   };

//   // Search and filter logic
//   const filteredCwsList = cwsList.filter(cws => 
//     cws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     cws.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     cws.location.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredCwsList.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredCwsList.length / itemsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Reset to first page when search changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   const handleEdit = (cws) => {
//     setEditId(cws.id);
//     setEditData({
//       name: cws.name,
//       code: cws.code,
//       location: cws.location
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditId(null);
//     setEditData({ name: '', code: '', location: '' });
//   };

//   const handleSaveEdit = async (cws) => {
//     try {
//       await axios.put(
//         `${API_URL}/cws/${cws.id}`,
//         editData,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }
//       );
      
//       const updatedList = cwsList.map((item) =>
//         item.id === cws.id ? { ...item, ...editData } : item
//       );
//       setCwsList(updatedList);
//       setEditId(null);
//       setEditData({ name: '', code: '', location: '' });
//     } catch (error) {
//       setError('Error updating CWS');
//     }
//   };

//   const handleDelete = async (cwsId) => {
//     if (!window.confirm('Are you sure you want to delete this CWS?')) {
//       return;
//     }

//     try {
//       await axios.delete(`${API_URL}/cws/${cwsId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       setCwsList(cwsList.filter((cws) => cws.id !== cwsId));
//     } catch (error) {
//       if (error.response?.status === 400) {
//         alert('Cannot delete CWS with associated records');
//       } else {
//         setError('Error deleting CWS');
//       }
//     }
//   };


//   if (loading) {
//     return (
//       <div className="container-fluid py-4">
//         <div className="card border-0 shadow-sm">
//           <div className="card-header bg-light bg-opacity-10 py-3">
//             <div className="d-flex justify-content-between align-items-center">
//               <div 
//                 className="skeleton-title"
//                 style={{ 
//                   backgroundColor: '#e0e0e0', 
//                   width: '200px', 
//                   height: '30px', 
//                   borderRadius: '4px' 
//                 }}
//               />
//               <div 
//                 className="skeleton-button"
//                 style={{ 
//                   backgroundColor: '#e0e0e0', 
//                   width: '150px', 
//                   height: '40px', 
//                   borderRadius: '4px' 
//                 }}
//               />
//             </div>
//           </div>
//           <div className="card-body p-0">
//             <div className="table-responsive">
//               <table className="table table-hover table-sm mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     {['Name', 'Code', 'Location', 'Created Date'].map((header, index) => (
//                       <th key={index} className="text-uppercase text-secondary px-4 py-3">
//                         <div 
//                           className="skeleton-header"
//                           style={{ 
//                             backgroundColor: '#e0e0e0', 
//                             width: '100px', 
//                             height: '20px', 
//                             borderRadius: '4px' 
//                           }}
//                         />
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {skeletonRows.map((_, rowIndex) => (
//                     <tr key={rowIndex}>
//                       {[1, 2, 3, 4].map((cellIndex) => (
//                         <td key={cellIndex} className="px-2 py-2">
//                           <div 
//                             className="skeleton-cell"
//                             style={{ 
//                               backgroundColor: '#f0f0f0', 
//                               width: '80%', 
//                               height: '20px', 
//                               borderRadius: '4px' 
//                             }}
//                           />
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger m-3" role="alert">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h2 className="card-title h4 mb-0" style={{ color: theme.primary }}>
//               Coffee Washing Stations
//             </h2>
//             <Link
//               to="/cws/new"
//               className="btn text-white"
//               style={{ backgroundColor: theme.primary }}
//             >
//               <i className="bi bi-plus-lg me-2"></i>
//               New CWS
//             </Link>
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
//               placeholder="Search by name, code, or location..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ 
//                 backgroundColor: theme.neutral,
//                 border: `1px solid ${theme.secondary}`,
//                 '&:focus': {
//                   borderColor: theme.primary,
//                   boxShadow: `0 0 0 0.2rem ${theme.primary}33`
//                 }
//               }}
//             />
//           </div>
//         </div>

//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Name</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Code</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Location</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Created Date</th>
//                   <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.map((cws) => (
//                   <tr key={cws.id} style={{ '--bs-table-hover-bg': theme.tableHover }}>
//                     <td className="px-2 py-2">
//                       {editId === cws.id ? (
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={editData.name}
//                           onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//                           style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//                         />
//                       ) : (
//                         cws.name
//                       )}
//                     </td>
//                     <td className="px-2 py-2">
//                       {editId === cws.id ? (
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={editData.code}
//                           onChange={(e) => setEditData({ ...editData, code: e.target.value })}
//                           style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//                         />
//                       ) : (
//                         cws.code
//                       )}
//                     </td>
//                     <td className="px-2 py-2">
//                       {editId === cws.id ? (
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={editData.location}
//                           onChange={(e) => setEditData({ ...editData, location: e.target.value })}
//                           style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
//                         />
//                       ) : (
//                         cws.location
//                       )}
//                     </td>
//                     <td className="px-2 py-2" style={{ color: theme.secondary }}>
//                       {new Date(cws.createdAt).toLocaleDateString('en-US', {
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric'
//                       })}
//                     </td>
//                     <td className="px-2 py-2">
//                       {editId === cws.id ? (
//                         <div className="btn-group">
//                           <button
//                             className="btn btn-sm text-white"
//                             style={{ backgroundColor: theme.secondary }}
//                             onClick={() => handleSaveEdit(cws)}
//                           >
//                             <i className="bi bi-check-lg"></i>
//                           </button>
//                           <button
//                             className="btn btn-sm"
//                             style={{ backgroundColor: theme.neutral, color: theme.primary }}
//                             onClick={handleCancelEdit}
//                           >
//                             <i className="bi bi-x-lg"></i>
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="btn-group m-0">
//                           <button
//                             className="btn btn-sm text-white"
//                             style={{ backgroundColor: theme.primary }}
//                             onClick={() => handleEdit(cws)}
//                           >
//                             <i className="bi bi-pencil-square"></i>
//                           </button>
//                           <button
//                             className="btn btn-sm text-white"
//                             style={{ backgroundColor: theme.accent }}
//                             onClick={() => handleDelete(cws.id)}
//                           >
//                             <i className="bi bi-trash3-fill"></i>
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           {/* Pagination */}
//           <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.neutral }}>
//             <small style={{ color: theme.secondary }}>
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCwsList.length)} of {filteredCwsList.length} entries
//             </small>
//             <nav aria-label="CWS pagination">
//               <ul className="pagination mb-0">
//                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                   <button
//                     className="page-link"
//                     onClick={() => paginate(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     style={{ color: theme.primary, borderColor: theme.secondary }}
//                   >
//                     <i className="bi bi-chevron-left"></i>
//                   </button>
//                 </li>
                
//                 {[...Array(totalPages)].map((_, index) => (
//                   <li
//                     key={index + 1}
//                     className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => paginate(index + 1)}
//                       style={{
//                         backgroundColor: currentPage === index + 1 ? theme.primary : 'white',
//                         borderColor: theme.secondary,
//                         color: currentPage === index + 1 ? 'white' : theme.primary
//                       }}
//                     >
//                       {index + 1}
//                     </button>
//                   </li>
//                 ))}
                
//                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                   <button
//                     className="page-link"
//                     onClick={() => paginate(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     style={{ color: theme.primary, borderColor: theme.secondary }}
//                   >
//                     <i className="bi bi-chevron-right"></i>
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CwsList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../constants/Constants';

const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA'  // Ultra light teal for table hover
};

const CwsList = () => {
  const [cwsList, setCwsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ 
    name: '', 
    code: '', 
    location: '', 
    havespeciality: false 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const skeletonRows = Array(5).fill(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCwsList();
  }, []);

  const fetchCwsList = async () => {
    try {
      const response = await axios.get(`${API_URL}/cws`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCwsList(response.data);
    } catch (error) {
      setError('Error fetching CWS list');
    }
    setLoading(false);
  };

  // Search and filter logic
  const filteredCwsList = cwsList.filter(cws => 
    cws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cws.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cws.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCwsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCwsList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (cws) => {
    setEditId(cws.id);
    setEditData({
      name: cws.name,
      code: cws.code,
      location: cws.location,
      havespeciality: cws.havespeciality
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ name: '', code: '', location: '', havespeciality: false });
  };

  const handleSaveEdit = async (cws) => {
    try {
      await axios.put(
        `${API_URL}/cws/${cws.id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      const updatedList = cwsList.map((item) =>
        item.id === cws.id ? { ...item, ...editData } : item
      );
      setCwsList(updatedList);
      setEditId(null);
      setEditData({ name: '', code: '', location: '', havespeciality: false });
    } catch (error) {
      setError('Error updating CWS');
    }
  };

  const handleDelete = async (cwsId) => {
    if (!window.confirm('Are you sure you want to delete this CWS?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/cws/${cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setCwsList(cwsList.filter((cws) => cws.id !== cwsId));
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Cannot delete CWS with associated records');
      } else {
        setError('Error deleting CWS');
      }
    }
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
              <table className="table table-hover table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    {['Name', 'Code', 'Location', 'Specialty', 'Created Date'].map((header, index) => (
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
                      {[1, 2, 3, 4, 5].map((cellIndex) => (
                        <td key={cellIndex} className="px-2 py-2">
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
        <div className="card-header py-3" style={{ backgroundColor: theme.neutral }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="card-title h4 mb-0" style={{ color: theme.primary }}>
              Coffee Washing Stations
            </h2>
            <Link
              to="/cws/new"
              className="btn text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              New CWS
            </Link>
          </div>
          
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
              placeholder="Search by name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                backgroundColor: theme.neutral,
                border: `1px solid ${theme.secondary}`,
                '&:focus': {
                  borderColor: theme.primary,
                  boxShadow: `0 0 0 0.2rem ${theme.primary}33`
                }
              }}
            />
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Name</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Code</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Location</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Specialty</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Created Date</th>
                  <th className="text-uppercase px-4 py-3" style={{ color: theme.primary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((cws) => (
                  <tr key={cws.id} style={{ '--bs-table-hover-bg': theme.tableHover }}>
                    <td className="px-2 py-2">
                      {editId === cws.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        />
                      ) : (
                        cws.name
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {editId === cws.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editData.code}
                          onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        />
                      ) : (
                        cws.code
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {editId === cws.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          style={{ backgroundColor: theme.neutral, border: `1px solid ${theme.secondary}` }}
                        />
                      ) : (
                        cws.location
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {editId === cws.id ? (
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={editData.havespeciality}
                            onChange={(e) => setEditData({ ...editData, havespeciality: e.target.checked })}
                            style={{ borderColor: theme.secondary }}
                          />
                        </div>
                      ) : (
                        <i 
                          className={`bi ${cws.havespeciality ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}
                        ></i>
                      )}
                    </td>
                    <td className="px-2 py-2" style={{ color: theme.secondary }}>
                      {new Date(cws.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-2 py-2">
                      {editId === cws.id ? (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: theme.secondary }}
                            onClick={() => handleSaveEdit(cws)}
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
                        <div className="btn-group m-0">
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: theme.primary }}
                            onClick={() => handleEdit(cws)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: theme.accent }}
                            onClick={() => handleDelete(cws.id)}
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
          
          <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: theme.neutral }}>
            <small style={{ color: theme.secondary }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCwsList.length)} of {filteredCwsList.length} entries
            </small>
            <nav aria-label="CWS pagination">
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

export default CwsList;