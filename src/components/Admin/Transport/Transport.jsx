// import React, { useState, useEffect } from 'react';
// import { Card, Button, Alert, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
// import axios from 'axios';
// import API_URL from '../../../constants/Constants';

// const processingTheme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
// };

// const GRADE_GROUPS = {
//   HIGH: ['A0', 'A1', 'N1', 'N2', 'H2'],
//   LOW: ['A2', 'A3', 'B1', 'B2']
// };

// const Transport = () => {
//   const [transferRecords, setTransferRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [recordsPerPage, setRecordsPerPage] = useState(50);
//   const [expandedRecords, setExpandedRecords] = useState({});
//   const [filterType, setFilterType] = useState('ALL');
//   const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     fetchTransferRecords();
//   }, []);

//   const fetchTransferRecords = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching transfer records...");
//       const response = await axios.get(`${API_URL}/transfer`);
//       console.log("Transfer records response:", response.data);
//       setTransferRecords(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching records:", error);
//       setError(`Error fetching transfer records: ${error.message}`);
//       setLoading(false);
//     }
//   };

//   const toggleRecordExpansion = (recordId) => {
//     setExpandedRecords(prev => ({
//       ...prev,
//       [recordId]: !prev[recordId]
//     }));
//   };

//   const handleFilterChange = (e) => {
//     setFilterType(e.target.value);
//     setCurrentPage(1);
//   };

//   const getFilteredRecords = () => {
//     return transferRecords.filter(record => {
//       // Filter by search term
//       if (searchTerm && !record.batchNo.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }

//       // Filter by grade group
//       if (filterType === 'HIGH' && record.gradeGroup !== 'HIGH') {
//         return false;
//       }
//       if (filterType === 'LOW' && record.gradeGroup !== 'LOW') {
//         return false;
//       }

//       return true;
//     });
//   };

//   const getPaginatedRecords = () => {
//     const filteredRecords = getFilteredRecords();
//     const indexOfLastRecord = currentPage * recordsPerPage;
//     const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//     return filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const renderGradeBadge = (grade, kg, isHighGrade) => {
//     const badgeColor = isHighGrade ? processingTheme.primary : '#6c757d';

//     return (
//       <div key={grade} className="small mb-1">
//         <Badge
//           className="me-1"
//           bg="sucafina"
//           style={{ backgroundColor: badgeColor, color: 'white' }}
//         >
//           {grade}
//         </Badge>
//         <span>{parseFloat(kg).toFixed(2)} kg</span>
//         {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
//       </div>
//     );
//   };

//   const renderOutputGrades = (outputKgs, gradeDetails) => {
//     if (!outputKgs) return null;

//     return Object.entries(outputKgs).map(([grade, kg]) => {
//       const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
//       const details = gradeDetails?.[grade] || {};

//       return (
//         <div key={grade} className="mb-2">
//           {renderGradeBadge(grade, kg, isHighGrade)}
//           <div className="ms-3 small text-muted">
//             <div>Bags: {details.numberOfBags || 0}</div>
//             {isHighGrade && (
//               <>
//                 <div>Cup Profile: {details.cupProfile || 'N/A'}</div>
//                 <div>Moisture: {details.moistureContent || 'N/A'}%</div>
//               </>
//             )}
//           </div>
//         </div>
//       );
//     });
//   };

//   const downloadTransferData = () => {
//     const filteredData = getFilteredRecords();
//     const csvContent = convertToCSV(filteredData);
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', `coffee_transfers_${new Date().toISOString().slice(0,10)}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const convertToCSV = (data) => {
//     // Define headers with the new columns
//     const headers = [
//       'Date', 'Washing Station', 'Truck Plate No', 'Parch KGs', 
//       'Total Purchase Cherry', 'Batch No', 'Grade Group', 'Status'
//     ];

//     // Create CSV rows
//     const rows = data.map(record => {
//       const totalKgs = calculateTotalKgs(record.outputKgs);
//       const washingStation = record.baggingOff?.processing?.cws?.name || 'N/A';
//       // We don't have total purchase cherry in the data, using a placeholder
//       const totalPurchaseCherry = 'N/A';

//       return [
//         new Date(record.transferDate).toLocaleDateString(),
//         washingStation,
//         record.truckNumber,
//         totalKgs.toFixed(2),
//         totalPurchaseCherry,
//         record.batchNo,
//         record.gradeGroup,
//         record.status
//       ].join(',');
//     });

//     // Combine headers and rows
//     return [headers.join(','), ...rows].join('\n');
//   };

//   const LoadingSkeleton = () => (
//     <Card className="mb-4">
//       <Card.Body>
//         <div className="mb-3">
//           <div className="skeleton-line" style={{ height: '25px', width: '40%', background: '#eee' }}></div>
//         </div>
//         <div className="skeleton-table">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="d-flex mb-3">
//               <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
//               <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
//               <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
//               <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
//               <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
//               <div className="skeleton-cell" style={{ height: '20px', width: '25%', background: '#eee' }}></div>
//             </div>
//           ))}
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   const calculateTotalKgs = (outputKgs) => {
//     if (!outputKgs) return 0;
//     return Object.values(outputKgs).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);
//   };

//   // Extract washing station name from the nested data
//   const getWashingStation = (record) => {
//     return record.baggingOff?.processing?.cws?.name || 'N/A';
//   };

//   return (
//     <div className="container-fluid py-4">
//       <Card className="mb-4">
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center">
//             <span className="h5" style={{ color: processingTheme.primary }}>Parchment Transport</span>
//             <div className="d-flex">
//               <Button 
//                 variant="outline-success" 
//                 className="me-2"
//                 onClick={downloadTransferData}
//               >
//                 <i className="bi bi-download me-1"></i> Download
//               </Button>
//             </div>
//           </div>
//         </Card.Header>

//         <Card.Body>
//           <div className="row mb-3">
//             <div className="col-md-4">
//               <InputGroup>
//                 <Form.Control
//                   placeholder="Search by batch number..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </InputGroup>
//             </div>
//             <div className="col-md-4">
//               <Form.Select 
//                 value={filterType} 
//                 onChange={handleFilterChange}
//               >
//                 <option value="ALL">All Transfers</option>
//                 <option value="HIGH">High Grade Transfers</option>
//                 <option value="LOW">Low Grade Transfers</option>
//               </Form.Select>
//             </div>
//             <div className="col-md-4 text-end">
//               {/* Additional controls can go here */}
//             </div>
//           </div>

//           {loading ? (
//             <LoadingSkeleton />
//           ) : error ? (
//             <Alert variant="danger">{error}</Alert>
//           ) : (
//             <>
//               <div className="table-responsive">
//                 <table className="table table-hover">
//                   <thead>
//                     <tr>
//                       <th width="5%"></th>
//                       <th width="12%">Date</th>
//                       <th width="12%">Washing Station</th>
//                       <th width="12%">Truck Plate No</th>
//                       <th width="12%">Parch KGs</th>
//                       <th width="12%">Total Purchase Cherry</th>
//                       <th width="18%">Batch No</th>
//                       <th width="10%">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getPaginatedRecords().map((record) => {
//                       const isExpanded = expandedRecords[record.id] || false;
//                       const totalKgs = calculateTotalKgs(record.outputKgs);
//                       const transferDate = new Date(record.transferDate).toLocaleDateString();
//                       const washingStation = getWashingStation(record);

//                       return (
//                         <React.Fragment key={record.id}>
//                           <tr>
//                             <td className="align-middle">
//                               <Button
//                                 variant="link"
//                                 className="p-0"
//                                 onClick={() => toggleRecordExpansion(record.id)}
//                                 style={{ color: processingTheme.primary }}
//                               >
//                                 {isExpanded ? '▼' : '►'}
//                               </Button>
//                             </td>
//                             <td className="align-middle">{transferDate}</td>
//                             <td className="align-middle">{washingStation}</td>
//                             <td className="align-middle">{record.truckNumber}</td>
//                             <td className="align-middle">{totalKgs.toFixed(2)} kg</td>
//                             <td className="align-middle">N/A</td>
//                             <td className="align-middle">
//                               {record.batchNo}
//                               {record.isGrouped && (
//                                 <Badge 
//                                   bg="info" 
//                                   pill 
//                                   className="ms-2"
//                                   title="Combined batch"
//                                 >
//                                   combined
//                                 </Badge>
//                               )}
//                             </td>
//                             <td className="align-middle">
//                               <Badge
//                                 bg={record.status === 'COMPLETED' ? 'success' : 'warning'}
//                               >
//                                 {record.status}
//                               </Badge>
//                             </td>
//                           </tr>
//                           {isExpanded && (
//                             <tr className="table-light">
//                               <td colSpan="8" className="py-3">
//                                 <div className="px-4">
//                                   <Row>
//                                     <Col md={6}>
//                                       <h6 className="mb-3">Transfer Details</h6>
//                                       <div className="mb-2">
//                                         <strong>Transfer ID:</strong> {record.id}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Batch No:</strong> {record.batchNo}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Grade Group:</strong> {record.gradeGroup}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Total Bags:</strong> {record.numberOfBags || 0}
//                                       </div>
//                                       {record.cupProfile && (
//                                         <div className="mb-2">
//                                           <strong>Cup Profile:</strong> {record.cupProfile}
//                                         </div>
//                                       )}
//                                       <div className="mb-2">
//                                         <strong>Notes:</strong> {record.notes || 'No notes'}
//                                       </div>
//                                     </Col>
//                                     <Col md={6}>
//                                       <h6 className="mb-3">Grade Details</h6>
//                                       <div>
//                                         {renderOutputGrades(record.outputKgs, record.gradeDetails)}
//                                       </div>
//                                       <h6 className="mb-2 mt-3">Transport Details</h6>
//                                       <div className="mb-2">
//                                         <strong>Truck Number:</strong> {record.truckNumber}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Driver:</strong> {record.driverName}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Phone:</strong> {record.driverPhone || 'N/A'}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Washing Station:</strong> {washingStation}
//                                       </div>
//                                     </Col>
//                                   </Row>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       );
//                     })}
//                     {getPaginatedRecords().length === 0 && (
//                       <tr>
//                         <td colSpan="8" className="text-center py-3">No transfer records found</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="d-flex justify-content-between align-items-center mt-3">
//                 <div>
//                   Showing {Math.min(getPaginatedRecords().length, recordsPerPage)} of {getFilteredRecords().length} total records
//                 </div>
//                 <ul className="pagination mb-0">
//                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                     <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
//                   </li>
//                   {[...Array(Math.ceil(getFilteredRecords().length / recordsPerPage))].map((_, idx) => (
//                     <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
//                       <button 
//                         className="page-link" 
//                         style={currentPage === idx + 1 ? {backgroundColor: processingTheme.primary, borderColor: processingTheme.primary} : {}} 
//                         onClick={() => paginate(idx + 1)}
//                       >
//                         {idx + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li className={`page-item ${currentPage >= Math.ceil(getFilteredRecords().length / recordsPerPage) ? 'disabled' : ''}`}>
//                     <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
//                   </li>
//                 </ul>
//               </div>
//             </>
//           )}
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Transport;

import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import API_URL from '../../../constants/Constants';

const processingTheme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
};

const GRADE_GROUPS = {
  HIGH: ['A0', 'A1', 'N1', 'N2', 'H2'],
  LOW: ['A2', 'A3', 'B1', 'B2']
};

const Transport = () => {
  const [transferRecords, setTransferRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filterType, setFilterType] = useState('ALL');
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTransferRecords();
  }, []);

  useEffect(() => {
    if (transferRecords.length > 0) {
      groupRecordsByTransportId();
    }
  }, [transferRecords]);

  const fetchTransferRecords = async () => {
    try {
      setLoading(true);
      console.log("Fetching transfer records...");
      const response = await axios.get(`${API_URL}/transfer`);
      console.log("Transfer records response:", response.data);
      setTransferRecords(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(`Error fetching transfer records: ${error.message}`);
      setLoading(false);
    }
  };

  const groupRecordsByTransportId = () => {
    const groups = {};

    transferRecords.forEach(record => {
      const groupId = record.transportGroupId || 'ungrouped';
      if (!groups[groupId]) {
        groups[groupId] = {
          records: [],
          transportDate: record.transferDate,
          truckNumber: record.truckNumber,
          driverName: record.driverName,
          driverPhone: record.driverPhone
        };
      }
      groups[groupId].records.push(record);
    });

    setGroupedRecords(groups);
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const getFilteredGroups = () => {
    return Object.entries(groupedRecords).filter(([groupId, group]) => {
      // Skip the ungrouped key if it's empty
      if (groupId === 'ungrouped' && group.records.length === 0) return false;

      // Filter by search term
      if (searchTerm) {
        const hasMatch = group.records.some(record =>
          record.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Filter by grade group
      if (filterType === 'HIGH') {
        const hasHighGrade = group.records.some(record => record.gradeGroup === 'HIGH');
        if (!hasHighGrade) return false;
      }
      if (filterType === 'LOW') {
        const hasLowGrade = group.records.some(record => record.gradeGroup === 'LOW');
        if (!hasLowGrade) return false;
      }

      return true;
    });
  };

  const getPaginatedGroups = () => {
    const filteredGroups = getFilteredGroups();
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredGroups.slice(indexOfFirstRecord, indexOfLastRecord);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const calculateTotalKgs = (records) => {
    return records.reduce((sum, record) => {
      if (!record.outputKgs) return sum;
      const recordKgs = Object.values(record.outputKgs).reduce((recordSum, kg) => recordSum + parseFloat(kg || 0), 0);
      return sum + recordKgs;
    }, 0);
  };

  const calculateTotalBags = (records) => {
    return records.reduce((sum, record) => sum + (record.numberOfBags || 0), 0);
  };

  const getWashingStations = (records) => {
    const stations = new Set();
    records.forEach(record => {
      const station = record.baggingOff?.processing?.cws?.name || 'N/A';
      stations.add(station);
    });
    return Array.from(stations).join(', ');
  };

  const renderGradeBadge = (grade, kg, isHighGrade) => {
    const badgeColor = isHighGrade ? processingTheme.primary : '#6c757d';

    return (
      <div key={grade} className="small mb-1">
        <Badge
          className="me-1"
          bg="sucafina"
          style={{ backgroundColor: badgeColor, color: 'white' }}
        >
          {grade}
        </Badge>
        <span>{parseFloat(kg).toFixed(2)} kg</span>
        {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
      </div>
    );
  };

  const renderOutputGrades = (outputKgs, gradeDetails) => {
    if (!outputKgs) return null;

    return Object.entries(outputKgs).map(([grade, kg]) => {
      const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
      const details = gradeDetails?.[grade] || {};

      return (
        <div key={grade} className="mb-2">
          {renderGradeBadge(grade, kg, isHighGrade)}
          <div className="ms-3 small text-muted">
            <div>Bags: {details.numberOfBags || 0}</div>
            {isHighGrade && (
              <>
                <div>Cup Profile: {details.cupProfile || 'N/A'}</div>
                <div>Moisture: {details.moistureContent || 'N/A'}%</div>
              </>
            )}
          </div>
        </div>
      );
    });
  };

  const downloadTransferData = () => {
    const filteredData = getFilteredGroups().flatMap(([_, group]) => group.records);
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coffee_transfers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    const headers = [
      'Date', 'Washing Station', 'Truck Plate No', 'Parch KGs',
      'Total Purchase Cherry', 'Batch No', 'Grade Group', 'Status'
    ];

    const rows = data.map(record => {
      const totalKgs = Object.values(record.outputKgs || {}).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);
      const washingStation = record.baggingOff?.processing?.cws?.name || 'N/A';
      const totalPurchaseCherry = 'N/A';

      return [
        new Date(record.transferDate).toLocaleDateString(),
        washingStation,
        record.truckNumber,
        totalKgs.toFixed(2),
        totalPurchaseCherry,
        record.batchNo,
        record.gradeGroup,
        record.status
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const LoadingSkeleton = () => (
    <Card className="mb-4">
      <Card.Body>
        <div className="mb-3">
          <div className="skeleton-line" style={{ height: '25px', width: '40%', background: '#eee' }}></div>
        </div>
        <div className="skeleton-table">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="d-flex mb-3">
              <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '15%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '25%', background: '#eee' }}></div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container-fluid py-4">
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5" style={{ color: processingTheme.primary }}>Parchment Transport</span>
            <div className="d-flex">
              <Button
                variant="outline-success"
                className="me-2"
                onClick={downloadTransferData}
              >
                <i className="bi bi-download me-1"></i> Download
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-4">
              <InputGroup>
                <Form.Control
                  placeholder="Search by batch number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={filterType}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Transfers</option>
                <option value="HIGH">High Grade Transfers</option>
                <option value="LOW">Low Grade Transfers</option>
              </Form.Select>
            </div>
            <div className="col-md-4 text-end">
              {/* Additional controls can go here */}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th width="5%"></th>
                      <th width="12%">Date</th>
                      <th width="15%">Washing Station</th>
                      <th width="12%">Truck Plate No</th>
                      <th width="12%">Parch KGs</th>
                      <th width="12%">Total Purchase Cherry</th>
                      <th width="15%">Batch Count</th>
                      <th width="10%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedGroups().map(([groupId, group]) => {
                      const isExpanded = expandedGroups[groupId] || false;
                      const transferDate = new Date(group.transportDate).toLocaleDateString();
                      const washingStations = getWashingStations(group.records);
                      const totalKgs = calculateTotalKgs(group.records);
                      const totalBags = calculateTotalBags(group.records);

                      // Determine if the group is completed (all records are COMPLETED)
                      const isCompleted = group.records.every(record => record.status === 'COMPLETED');

                      return (
                        <React.Fragment key={groupId}>
                          <tr>
                            <td className="align-middle">
                              <Button
                                variant="link"
                                className="p-0"
                                onClick={() => toggleGroupExpansion(groupId)}
                                style={{ color: processingTheme.primary }}
                              >
                                {isExpanded ? '▼' : '►'}
                              </Button>
                            </td>
                            <td className="align-middle">{transferDate}</td>
                            <td className="align-middle">{washingStations}</td>
                            <td className="align-middle">{group.truckNumber}</td>
                            <td className="align-middle">{totalKgs.toFixed(2)} kg</td>
                            <td className="align-middle">N/A</td>
                            <td className="align-middle">
                              {group.records.length} batch{group.records.length !== 1 ? 'es' : ''}
                              {group.records.some(r => r.isGrouped) && (
                                <Badge
                                  bg="info"
                                  pill
                                  className="ms-2"
                                  title="Contains combined batches"
                                >
                                  combined
                                </Badge>
                              )}
                            </td>
                            <td className="align-middle">
                              <Badge
                                bg={isCompleted ? 'success' : 'warning'}
                              >
                                {isCompleted ? 'COMPLETED' : 'PENDING'}
                              </Badge>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="table-light">
                              <td colSpan="8" className="py-3">
                                <div className="px-4">
                                  <Row>
                                    <Col md={6}>
                                      <h6 className="mb-3">Transport Group Details</h6>
                                      <div className="mb-2">
                                        <strong>Truck Number:</strong> {group.truckNumber}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Driver:</strong> {group.driverName}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Phone:</strong> {group.driverPhone || 'N/A'}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Total KGs:</strong> {totalKgs.toFixed(2)} kg
                                      </div>
                                      <div className="mb-2">
                                        <strong>Total Bags:</strong> {totalBags}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Washing Stations:</strong> {washingStations}
                                      </div>
                                    </Col>
                                    <Col md={6}>
                                      <h6 className="mb-3">Batch Details</h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm">
                                          <thead>
                                            <tr>
                                              <th>Batch No</th>
                                              <th>Grade</th>
                                              <th>Grade Group</th>
                                              <th>KGs</th>
                                              <th>Bags</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {group.records.map(record => {
                                              const grades = record.outputKgs ? Object.keys(record.outputKgs).join(', ') : 'N/A';
                                              const totalKgs = Object.values(record.outputKgs || {}).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);

                                              return (
                                                <tr key={record.id}>
                                                  <td>{record.batchNo}</td>
                                                  <td>{grades}</td>
                                                  <td>{record.gradeGroup}</td>
                                                  <td>{totalKgs.toFixed(2)} kg</td>
                                                  <td>{record.numberOfBags || 0}</td>
                                                  <td>
                                                    <Badge bg={record.status === 'COMPLETED' ? 'success' : 'warning'}>
                                                      {record.status}
                                                    </Badge>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {getPaginatedGroups().length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-3">No transport groups found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Showing {Math.min(getPaginatedGroups().length, recordsPerPage)} of {getFilteredGroups().length} total groups
                </div>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(Math.ceil(getFilteredGroups().length / recordsPerPage))].map((_, idx) => (
                    <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        style={currentPage === idx + 1 ? { backgroundColor: processingTheme.primary, borderColor: processingTheme.primary } : {}}
                        onClick={() => paginate(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage >= Math.ceil(getFilteredGroups().length / recordsPerPage) ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Transport;