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
//   const [groupedRecords, setGroupedRecords] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [recordsPerPage, setRecordsPerPage] = useState(50);
//   const [expandedGroups, setExpandedGroups] = useState({});
//   const [filterType, setFilterType] = useState('ALL');
//   const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     fetchTransferRecords();
//   }, []);

//   useEffect(() => {
//     if (transferRecords.length > 0) {
//       groupRecordsByTransportId();
//     }
//   }, [transferRecords]);

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

//   const groupRecordsByTransportId = () => {
//     const groups = {};

//     transferRecords.forEach(record => {
//       const groupId = record.transportGroupId || 'ungrouped';
//       if (!groups[groupId]) {
//         groups[groupId] = {
//           records: [],
//           transportDate: record.transferDate,
//           truckNumber: record.truckNumber,
//           driverName: record.driverName,
//           driverPhone: record.driverPhone
//         };
//       }
//       groups[groupId].records.push(record);
//     });

//     setGroupedRecords(groups);
//   };

//   const toggleGroupExpansion = (groupId) => {
//     setExpandedGroups(prev => ({
//       ...prev,
//       [groupId]: !prev[groupId]
//     }));
//   };

//   const handleFilterChange = (e) => {
//     setFilterType(e.target.value);
//     setCurrentPage(1);
//   };

//   const getFilteredGroups = () => {
//     return Object.entries(groupedRecords).filter(([groupId, group]) => {
//       // Skip the ungrouped key if it's empty
//       if (groupId === 'ungrouped' && group.records.length === 0) return false;

//       // Filter by search term
//       if (searchTerm) {
//         const hasMatch = group.records.some(record =>
//           record.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
//         );
//         if (!hasMatch) return false;
//       }

//       // Filter by grade group
//       if (filterType === 'HIGH') {
//         const hasHighGrade = group.records.some(record => record.gradeGroup === 'HIGH');
//         if (!hasHighGrade) return false;
//       }
//       if (filterType === 'LOW') {
//         const hasLowGrade = group.records.some(record => record.gradeGroup === 'LOW');
//         if (!hasLowGrade) return false;
//       }

//       return true;
//     });
//   };

//   const getPaginatedGroups = () => {
//     const filteredGroups = getFilteredGroups();
//     const indexOfLastRecord = currentPage * recordsPerPage;
//     const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//     return filteredGroups.slice(indexOfFirstRecord, indexOfLastRecord);
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const calculateTotalKgs = (records) => {
//     return records.reduce((sum, record) => {
//       if (!record.outputKgs) return sum;
//       const recordKgs = Object.values(record.outputKgs).reduce((recordSum, kg) => recordSum + parseFloat(kg || 0), 0);
//       return sum + recordKgs;
//     }, 0);
//   };

//   const calculateTotalBags = (records) => {
//     return records.reduce((sum, record) => sum + (record.numberOfBags || 0), 0);
//   };

//   const getWashingStations = (records) => {
//     const stations = new Set();
//     records.forEach(record => {
//       const station = record.baggingOff?.processing?.cws?.name || 'N/A';
//       stations.add(station);
//     });
//     return Array.from(stations).join(', ');
//   };

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
//     const filteredData = getFilteredGroups().flatMap(([_, group]) => group.records);
//     const csvContent = convertToCSV(filteredData);
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', `coffee_transfers_${new Date().toISOString().slice(0, 10)}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const convertToCSV = (data) => {
//     const headers = [
//       'Date', 'Washing Station', 'Truck Plate No', 'Parch KGs',
//       'Total Purchase Cherry', 'Batch No', 'Grade Group', 'Status'
//     ];

//     const rows = data.map(record => {
//       const totalKgs = Object.values(record.outputKgs || {}).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);
//       const washingStation = record.baggingOff?.processing?.cws?.name || 'N/A';
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
//                       <th width="15%">Washing Station</th>
//                       <th width="12%">Truck Plate No</th>
//                       <th width="12%">Parch KGs</th>
//                       <th width="12%">Total Purchase Cherry</th>
//                       <th width="15%">Batch Count</th>
//                       <th width="10%">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getPaginatedGroups().map(([groupId, group]) => {
//                       const isExpanded = expandedGroups[groupId] || false;
//                       const transferDate = new Date(group.transportDate).toLocaleDateString();
//                       const washingStations = getWashingStations(group.records);
//                       const totalKgs = calculateTotalKgs(group.records);
//                       const totalBags = calculateTotalBags(group.records);

//                       // Determine if the group is completed (all records are COMPLETED)
//                       const isCompleted = group.records.every(record => record.status === 'COMPLETED');

//                       return (
//                         <React.Fragment key={groupId}>
//                           <tr>
//                             <td className="align-middle">
//                               <Button
//                                 variant="link"
//                                 className="p-0"
//                                 onClick={() => toggleGroupExpansion(groupId)}
//                                 style={{ color: processingTheme.primary }}
//                               >
//                                 {isExpanded ? '▼' : '►'}
//                               </Button>
//                             </td>
//                             <td className="align-middle">{transferDate}</td>
//                             <td className="align-middle">{washingStations}</td>
//                             <td className="align-middle">{group.truckNumber}</td>
//                             <td className="align-middle">{totalKgs.toFixed(2)} kg</td>
//                             <td className="align-middle">N/A</td>
//                             <td className="align-middle">
//                               {group.records.length} batch{group.records.length !== 1 ? 'es' : ''}
//                               {group.records.some(r => r.isGrouped) && (
//                                 <Badge
//                                   bg="info"
//                                   pill
//                                   className="ms-2"
//                                   title="Contains combined batches"
//                                 >
//                                   combined
//                                 </Badge>
//                               )}
//                             </td>
//                             <td className="align-middle">
//                               <Badge
//                                 bg={isCompleted ? 'success' : 'warning'}
//                               >
//                                 {isCompleted ? 'COMPLETED' : 'PENDING'}
//                               </Badge>
//                             </td>
//                           </tr>
//                           {isExpanded && (
//                             <tr className="table-light">
//                               <td colSpan="8" className="py-3">
//                                 <div className="px-4">
//                                   <Row>
//                                     <Col md={6}>
//                                       <h6 className="mb-3">Transport Group Details</h6>
//                                       <div className="mb-2">
//                                         <strong>Truck Number:</strong> {group.truckNumber}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Driver:</strong> {group.driverName}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Phone:</strong> {group.driverPhone || 'N/A'}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Total KGs:</strong> {totalKgs.toFixed(2)} kg
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Total Bags:</strong> {totalBags}
//                                       </div>
//                                       <div className="mb-2">
//                                         <strong>Washing Stations:</strong> {washingStations}
//                                       </div>
//                                     </Col>
//                                     <Col md={6}>
//                                       <h6 className="mb-3">Batch Details</h6>
//                                       <div className="table-responsive">
//                                         <table className="table table-sm">
//                                           <thead>
//                                             <tr>
//                                               <th>Batch No</th>
//                                               <th>Grade</th>
//                                               <th>Grade Group</th>
//                                               <th>KGs</th>
//                                               <th>Bags</th>
//                                               <th>Status</th>
//                                             </tr>
//                                           </thead>
//                                           <tbody>
//                                             {group.records.map(record => {
//                                               const grades = record.outputKgs ? Object.keys(record.outputKgs).join(', ') : 'N/A';
//                                               const totalKgs = Object.values(record.outputKgs || {}).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);

//                                               return (
//                                                 <tr key={record.id}>
//                                                   <td>{record.batchNo}</td>
//                                                   <td>{grades}</td>
//                                                   <td>{record.gradeGroup}</td>
//                                                   <td>{totalKgs.toFixed(2)} kg</td>
//                                                   <td>{record.numberOfBags || 0}</td>
//                                                   <td>
//                                                     <Badge bg={record.status === 'COMPLETED' ? 'success' : 'warning'}>
//                                                       {record.status}
//                                                     </Badge>
//                                                   </td>
//                                                 </tr>
//                                               );
//                                             })}
//                                           </tbody>
//                                         </table>
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
//                     {getPaginatedGroups().length === 0 && (
//                       <tr>
//                         <td colSpan="8" className="text-center py-3">No transport groups found</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="d-flex justify-content-between align-items-center mt-3">
//                 <div>
//                   Showing {Math.min(getPaginatedGroups().length, recordsPerPage)} of {getFilteredGroups().length} total groups
//                 </div>
//                 <ul className="pagination mb-0">
//                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                     <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
//                   </li>
//                   {[...Array(Math.ceil(getFilteredGroups().length / recordsPerPage))].map((_, idx) => (
//                     <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
//                       <button
//                         className="page-link"
//                         style={currentPage === idx + 1 ? { backgroundColor: processingTheme.primary, borderColor: processingTheme.primary } : {}}
//                         onClick={() => paginate(idx + 1)}
//                       >
//                         {idx + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li className={`page-item ${currentPage >= Math.ceil(getFilteredGroups().length / recordsPerPage) ? 'disabled' : ''}`}>
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

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Alert,
  Form,
  Badge,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import API_URL from "../../../constants/Constants";
import { Bar, Pie } from "recharts";

const processingTheme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover
  accent: "#FF8C00", // Orange accent
  text: "#333333", // Dark text
  highlight: "#FFF7E6", // Light yellow highlight
};

const GRADE_GROUPS = {
  HIGH: ["A0", "A1", "N1", "H2"],
  LOW: ["A2", "A3", "B1", "B2", "N2"],
};

const Transport = () => {
  const [transferRecords, setTransferRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filterType, setFilterType] = useState("ALL");
  const [cupProfileFilter, setCupProfileFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [summaryData, setSummaryData] = useState({
    totalKgs: 0,
    totalBags: 0,
    highGradeKgs: 0,
    lowGradeKgs: 0,
    cupProfiles: {},
    gradeDistribution: {},
    washingStationStats: {},
  });

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTransferRecords();
  }, []);

  useEffect(() => {
    if (transferRecords.length > 0) {
      groupRecordsByTransportId();
      calculateSummaryData();
    }
  }, [transferRecords]);

  const fetchTransferRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/transfer`);
      setTransferRecords(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(`Error fetching transfer records: ${error.message}`);
      setLoading(false);
    }
  };

  const calculateSummaryData = () => {
    let totalKgs = 0;
    let totalBags = 0;
    let highGradeKgs = 0;
    let lowGradeKgs = 0;
    const cupProfiles = {};
    const gradeDistribution = {};
    const washingStationStats = {};

    transferRecords.forEach((record) => {
      // Station stats
      const stationName = record.baggingOff?.processing?.cws?.name || "Unknown";
      if (!washingStationStats[stationName]) {
        washingStationStats[stationName] = {
          totalKgs: 0,
          batches: 0,
          highGradeKgs: 0,
        };
      }
      washingStationStats[stationName].batches += 1;

      // Process grade output data
      if (record.outputKgs) {
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg || 0);
          totalKgs += kgValue;

          // Update grade distribution
          if (!gradeDistribution[grade]) {
            gradeDistribution[grade] = 0;
          }
          gradeDistribution[grade] += kgValue;

          // Update high/low grade totals
          if (GRADE_GROUPS.HIGH.includes(grade)) {
            highGradeKgs += kgValue;
            washingStationStats[stationName].highGradeKgs += kgValue;
          } else if (GRADE_GROUPS.LOW.includes(grade)) {
            lowGradeKgs += kgValue;
          }

          washingStationStats[stationName].totalKgs += kgValue;
        });
      }

      // Process cup profiles
      if (record.gradeDetails) {
        Object.values(record.gradeDetails).forEach((detail) => {
          if (detail.cupProfile) {
            if (!cupProfiles[detail.cupProfile]) {
              cupProfiles[detail.cupProfile] = {
                count: 0,
                kgs: 0,
              };
            }
            cupProfiles[detail.cupProfile].count += 1;
            // We use the outputKgs to map back to the amount for this cup profile
            const matchingGrade = Object.keys(record.gradeDetails).find(
              (g) => record.gradeDetails[g].cupProfile === detail.cupProfile
            );
            if (
              matchingGrade &&
              record.outputKgs &&
              record.outputKgs[matchingGrade]
            ) {
              cupProfiles[detail.cupProfile].kgs += parseFloat(
                record.outputKgs[matchingGrade] || 0
              );
            }
          }
        });
      }

      // Update total bags
      totalBags += record.numberOfBags || 0;
    });

    setSummaryData({
      totalKgs,
      totalBags,
      highGradeKgs,
      lowGradeKgs,
      cupProfiles,
      gradeDistribution,
      washingStationStats,
    });
  };

  const groupRecordsByTransportId = () => {
    const groups = {};

    transferRecords.forEach((record) => {
      const groupId = record.transportGroupId || "ungrouped";
      if (!groups[groupId]) {
        groups[groupId] = {
          records: [],
          transportDate: record.transferDate,
          truckNumber: record.truckNumber,
          driverName: record.driverName,
          driverPhone: record.driverPhone,
        };
      }
      groups[groupId].records.push(record);
    });

    setGroupedRecords(groups);
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleCupProfileFilterChange = (e) => {
    setCupProfileFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRangeFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const getFilteredGroups = () => {
    return Object.entries(groupedRecords).filter(([groupId, group]) => {
      // Skip the ungrouped key if it's empty
      if (groupId === "ungrouped" && group.records.length === 0) return false;

      // Filter by search term
      if (searchTerm) {
        const hasMatch = group.records.some((record) => {
          return (
            record.batchNo
              ?.toLowerCase()
              ?.replace(/\s+/g, "")
              ?.includes(
                searchTerm.toLowerCase().trim()?.replace(/\s+/g, "")
              ) ||
            record.truckNumber
              ?.toLowerCase()
              ?.replace(/\s+/g, "")
              ?.includes(
                searchTerm.toLowerCase().trim()?.replace(/\s+/g, "")
              ) ||
            record.driverName
              ?.toLowerCase()
              ?.replace(/\s+/g, "")
              ?.includes(
                searchTerm.toLowerCase().trim()?.replace(/\s+/g, "")
              ) ||
            record?.baggingOff?.processing?.cws?.name
              ?.toLowerCase()
              ?.replace(/\s+/g, "")
              ?.includes(searchTerm?.toLowerCase().trim()?.replace(/\s+/g, ""))
          );
        });
        if (!hasMatch) return false;
      }

      // Filter by grade group
      if (filterType === "HIGH") {
        const hasHighGrade = group.records.some(
          (record) => record.gradeGroup === "HIGH"
        );
        if (!hasHighGrade) return false;
      }
      if (filterType === "LOW") {
        const hasLowGrade = group.records.some(
          (record) => record.gradeGroup === "LOW"
        );
        if (!hasLowGrade) return false;
      }

      // Filter by cup profile
      if (cupProfileFilter !== "ALL") {
        const hasCupProfile = group.records.some((record) => {
          if (!record.gradeDetails) return false;
          return Object.values(record.gradeDetails).some(
            (detail) => detail.cupProfile === cupProfileFilter
          );
        });
        if (!hasCupProfile) return false;
      }

      // Filter by date range
      if (dateRangeFilter.startDate) {
        const startDate = new Date(dateRangeFilter.startDate);
        const transferDate = new Date(group.transportDate);
        if (transferDate < startDate) return false;
      }

      if (dateRangeFilter.endDate) {
        const endDate = new Date(dateRangeFilter.endDate);
        const transferDate = new Date(group.transportDate);
        if (transferDate > endDate) return false;
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
      const recordKgs = Object.values(record.outputKgs).reduce(
        (recordSum, kg) => recordSum + parseFloat(kg || 0),
        0
      );
      return sum + recordKgs;
    }, 0);
  };

  const calculateTotalBags = (records) => {
    return records.reduce((sum, record) => sum + (record.numberOfBags || 0), 0);
  };

  const getWashingStations = (records) => {
    const stations = new Set();
    records.forEach((record) => {
      const station = record.baggingOff?.processing?.cws?.name || "N/A";
      stations.add(station);
    });
    return Array.from(stations).join(", ");
  };

  const getAllCupProfiles = () => {
    const profiles = new Set(["ALL"]);
    transferRecords.forEach((record) => {
      if (record.gradeDetails) {
        Object.values(record.gradeDetails).forEach((detail) => {
          if (detail.cupProfile) {
            profiles.add(detail.cupProfile);
          }
        });
      }
    });
    return Array.from(profiles);
  };

  const renderGradeBadge = (grade, kg, isHighGrade) => {
    const badgeColor = isHighGrade ? processingTheme.primary : "#6c757d";

    return (
      <div key={grade} className="small mb-1">
        <Badge
          className="me-1"
          bg="sucafina"
          style={{ backgroundColor: badgeColor, color: "white" }}
        >
          {grade}
        </Badge>
        <span>{parseFloat(kg).toFixed(2)} kg</span>
        {isHighGrade && (
          <span className="ms-1" style={{ color: processingTheme.primary }}>
            ★
          </span>
        )}
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
                <div>Cup Profile: {details.cupProfile || "N/A"}</div>
                <div>Moisture: {details.moistureContent || "N/A"}%</div>
              </>
            )}
          </div>
        </div>
      );
    });
  };

  const downloadTransferData = () => {
    const filteredData = getFilteredGroups().flatMap(
      ([_, group]) => group.records
    );
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `coffee_transfers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    const headers = [
      "Date",
      "Washing Station",
      "Truck Plate No",
      "Parch KGs",
      "Total Purchase Cherry",
      "Batch No",
      "Grade Group",
      "Status",
    ];

    const rows = data.map((record) => {
      const totalKgs = Object.values(record.outputKgs || {}).reduce(
        (sum, kg) => sum + parseFloat(kg || 0),
        0
      );
      const washingStation = record.baggingOff?.processing?.cws?.name || "N/A";
      const totalPurchaseCherry = "N/A";

      return [
        new Date(record.transferDate).toLocaleDateString(),
        washingStation,
        record.truckNumber,
        totalKgs.toFixed(2),
        totalPurchaseCherry,
        record.batchNo,
        record.gradeGroup,
        record.status,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const LoadingSkeleton = () => (
    <Card className="mb-4">
      <Card.Body>
        <div className="mb-3">
          <div
            className="skeleton-line"
            style={{ height: "25px", width: "40%", background: "#eee" }}
          ></div>
        </div>
        <div className="skeleton-table">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="d-flex mb-3">
              <div
                className="skeleton-cell"
                style={{
                  height: "20px",
                  width: "15%",
                  background: "#eee",
                  marginRight: "10px",
                }}
              ></div>
              <div
                className="skeleton-cell"
                style={{
                  height: "20px",
                  width: "15%",
                  background: "#eee",
                  marginRight: "10px",
                }}
              ></div>
              <div
                className="skeleton-cell"
                style={{
                  height: "20px",
                  width: "15%",
                  background: "#eee",
                  marginRight: "10px",
                }}
              ></div>
              <div
                className="skeleton-cell"
                style={{
                  height: "20px",
                  width: "15%",
                  background: "#eee",
                  marginRight: "10px",
                }}
              ></div>
              <div
                className="skeleton-cell"
                style={{
                  height: "20px",
                  width: "15%",
                  background: "#eee",
                  marginRight: "10px",
                }}
              ></div>
              <div
                className="skeleton-cell"
                style={{ height: "20px", width: "25%", background: "#eee" }}
              ></div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  // Generate data for charts
  const getCupProfileChartData = () => {
    return Object.entries(summaryData.cupProfiles).map(([profile, data]) => ({
      name: profile,
      value: data.kgs,
    }));
  };

  const getGradeDistributionChartData = () => {
    return Object.entries(summaryData.gradeDistribution).map(([grade, kg]) => ({
      name: grade,
      value: kg,
    }));
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="h2 text-sucafina mb-2">Transport</h1>
      <br></br>
      {/* Dashboard Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.primary}` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1">Total Parchment</h6>
              <h3 style={{ color: processingTheme.primary }}>
                {summaryData.totalKgs.toLocaleString(2)} kg
              </h3>
              <p className="mb-0">{summaryData.totalBags} bags transported</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.accent}` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1"> High grade (A0, A1, N1, H2) </h6>
              <h3 style={{ color: processingTheme.accent }}>
                {summaryData.highGradeKgs.toLocaleString(2)} kg
              </h3>
              <p className="mb-0">
                {(
                  (summaryData.highGradeKgs / summaryData.totalKgs) *
                  100
                ).toLocaleString(1)}
                % of total
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid #6c757d` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1">
                Low Grade (A2, A3, B1, B2, N2)
              </h6>
              <h3 style={{ color: "#6c757d" }}>
                {summaryData.lowGradeKgs.toLocaleString(2)} kg
              </h3>
              <p className="mb-0">
                {(
                  (summaryData.lowGradeKgs / summaryData.totalKgs) *
                  100
                ).toLocaleString(1)}
                % of total
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid #28a745` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1">Total Trucks</h6>
              <h3 style={{ color: "#28a745" }}>
                {Object.keys(groupedRecords).length}
              </h3>
              <p className="mb-0">{transferRecords.length} total batches</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cup Profile Summary Cards */}
      <Card className="mb-4 shadow-sm">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <h5 style={{ color: processingTheme.primary }}>
            Cup Profile Overview
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(summaryData.cupProfiles).map(([profile, data]) => (
              <Col md={3} key={profile} className="mb-3">
                <Card
                  className="h-100 border-0"
                  style={{ backgroundColor: processingTheme.tableHover }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">{profile}</h6>
                    </div>
                    <h4>{data.kgs.toLocaleString(2)} kg</h4>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${(data.kgs / summaryData.totalKgs) * 100}%`,
                          backgroundColor: processingTheme.primary,
                        }}
                        aria-valuenow={(data.kgs / summaryData.totalKgs) * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small className="text-muted mt-2 d-block">
                      {((data.kgs / summaryData.totalKgs) * 100).toFixed(1)}% of
                      total
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <Card className="mb-4 shadow-sm">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5" style={{ color: processingTheme.primary }}>
              Parchment Transport
            </span>
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
          <div className="row mb-4">
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by batch, truck, driver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>Grade Type</Form.Label>
                <Form.Select value={filterType} onChange={handleFilterChange}>
                  <option value="ALL">All Grades</option>
                  <option value="HIGH">High Grade Only</option>
                  <option value="LOW">Low Grade Only</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>Cup Profile</Form.Label>
                <Form.Select
                  value={cupProfileFilter}
                  onChange={handleCupProfileFilterChange}
                >
                  {getAllCupProfiles().map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={dateRangeFilter.startDate}
                      onChange={handleDateRangeChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={dateRangeFilter.endDate}
                      onChange={handleDateRangeChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
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
                      <th width="12%">Quality</th>
                      <th width="15%">Batch Count</th>
                      <th width="10%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedGroups().map(([groupId, group]) => {
                      const isExpanded = expandedGroups[groupId] || false;
                      const transferDate = new Date(
                        group.transportDate
                      ).toLocaleDateString();
                      const washingStations = getWashingStations(group.records);
                      const totalKgs = calculateTotalKgs(group.records);
                      const totalBags = calculateTotalBags(group.records);

                      // Calculate quality metrics
                      const cupProfiles = new Set();
                      group.records.forEach((record) => {
                        if (record.gradeDetails) {
                          Object.values(record.gradeDetails).forEach(
                            (detail) => {
                              if (detail.cupProfile) {
                                cupProfiles.add(detail.cupProfile);
                              }
                            }
                          );
                        }
                      });

                      // Determine if the group is completed (all records are COMPLETED)
                      const isCompleted = group.records.every(
                        (record) => record.status === "COMPLETED"
                      );

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
                                {isExpanded ? "▼" : "►"}
                              </Button>
                            </td>
                            <td className="align-middle">{transferDate}</td>
                            <td className="align-middle">{washingStations}</td>
                            <td className="align-middle">
                              {group.truckNumber}
                            </td>
                            <td className="align-middle">
                              {totalKgs.toLocaleString(2)} kg
                            </td>
                            <td className="align-middle">
                              {Array.from(cupProfiles).map((profile) => (
                                <Badge
                                  key={profile}
                                  bg="info"
                                  className="me-1"
                                  style={{
                                    backgroundColor:
                                      profile === "C1"
                                        ? "#28a745"
                                        : profile === "C2"
                                        ? "#ffc107"
                                        : "#17a2b8",
                                  }}
                                >
                                  {profile}
                                </Badge>
                              ))}
                            </td>
                            <td className="align-middle">
                              {group.records.length} batch
                              {group.records.length !== 1 ? "es" : ""}
                              {group.records.some((r) => r.isGrouped) && (
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
                              <Badge bg={isCompleted ? "success" : "warning"}>
                                {isCompleted ? "COMPLETED" : "PENDING"}
                              </Badge>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="table-light">
                              <td colSpan="8" className="py-3">
                                <div className="px-4">
                                  <Row>
                                    <Col md={6}>
                                      <h6 className="mb-3">
                                        Transport Group Details
                                      </h6>
                                      <div className="mb-2">
                                        <strong>Truck Number:</strong>{" "}
                                        {group.truckNumber}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Driver:</strong>{" "}
                                        {group.driverName}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Phone:</strong>{" "}
                                        {group.driverPhone || "N/A"}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Total KGs:</strong>{" "}
                                        {totalKgs.toFixed(2)} kg
                                      </div>
                                      <div className="mb-2">
                                        <strong>Total Bags:</strong> {totalBags}
                                      </div>
                                      <div className="mb-2">
                                        <strong>Washing Stations:</strong>{" "}
                                        {washingStations}
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
                                              <th>Cup Profile</th>
                                              <th>KGs</th>
                                              <th>Bags</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {group.records.map((record) => {
                                              const grades = record.outputKgs
                                                ? Object.keys(
                                                    record.outputKgs
                                                  ).join(", ")
                                                : "N/A";
                                              const totalKgs = Object.values(
                                                record.outputKgs || {}
                                              ).reduce(
                                                (sum, kg) =>
                                                  sum + parseFloat(kg || 0),
                                                0
                                              );

                                              // Get cup profiles from gradeDetails
                                              const cupProfiles =
                                                record.gradeDetails
                                                  ? Object.values(
                                                      record.gradeDetails
                                                    )
                                                      .map((d) => d.cupProfile)
                                                      .filter(Boolean)
                                                      .join(", ")
                                                  : "N/A";

                                              return (
                                                <tr key={record.id}>
                                                  <td>{record.batchNo}</td>
                                                  <td>{grades}</td>
                                                  <td>
                                                    {cupProfiles !== "N/A" ? (
                                                      <Badge
                                                        bg={
                                                          cupProfiles === "C1"
                                                            ? "success"
                                                            : cupProfiles ===
                                                              "C2"
                                                            ? "warning"
                                                            : "info"
                                                        }
                                                      >
                                                        {cupProfiles}
                                                      </Badge>
                                                    ) : (
                                                      "N/A"
                                                    )}
                                                  </td>
                                                  <td>
                                                    {totalKgs.toFixed(2)} kg
                                                  </td>
                                                  <td>
                                                    {record.numberOfBags || 0}
                                                  </td>
                                                  <td>
                                                    <Badge
                                                      bg={
                                                        record.status ===
                                                        "COMPLETED"
                                                          ? "success"
                                                          : "warning"
                                                      }
                                                    >
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
                        <td colSpan="8" className="text-center py-3">
                          No transport groups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Showing{" "}
                  {Math.min(getPaginatedGroups().length, recordsPerPage)} of{" "}
                  {getFilteredGroups().length} total groups
                </div>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {[
                    ...Array(
                      Math.ceil(getFilteredGroups().length / recordsPerPage)
                    ),
                  ].map((_, idx) => (
                    <li
                      key={idx}
                      className={`page-item ${
                        currentPage === idx + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        style={
                          currentPage === idx + 1
                            ? {
                                backgroundColor: processingTheme.primary,
                                borderColor: processingTheme.primary,
                              }
                            : {}
                        }
                        onClick={() => paginate(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage >=
                      Math.ceil(getFilteredGroups().length / recordsPerPage)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Additional Insights Cards */}
      <Row className="mb-4">
        {/* Washing Station Performance */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
              <h5 style={{ color: processingTheme.primary }}>
                Washing Station Performance
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Station</th>
                      {/* <th>Batches</th> */}
                      <th>Total KGs</th>
                      <th>High Grade %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.washingStationStats).map(
                      ([station, stats]) => (
                        <tr key={station}>
                          <td>{station}</td>
                          {/* <td>{stats.batches}</td> */}
                          <td>{stats.totalKgs.toLocaleString(2)} kg</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {(
                                  (stats.highGradeKgs / stats.totalKgs) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                              <div
                                className="progress flex-grow-1"
                                style={{ height: "6px" }}
                              >
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${
                                      (stats.highGradeKgs / stats.totalKgs) *
                                      100
                                    }%`,
                                    backgroundColor: processingTheme.primary,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Grade Distribution */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
              <h5 style={{ color: processingTheme.primary }}>
                Grade Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>Total KGs</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.gradeDistribution)
                      .sort((a, b) => b[1] - a[1]) // Sort by kg value, descending
                      .map(([grade, kg]) => (
                        <tr key={grade}>
                          <td>
                            <Badge
                              bg={
                                GRADE_GROUPS.HIGH.includes(grade)
                                  ? "sucafina"
                                  : "secondary"
                              }
                              style={{
                                backgroundColor: GRADE_GROUPS.HIGH.includes(
                                  grade
                                )
                                  ? processingTheme.primary
                                  : "#6c757d",
                              }}
                            >
                              {grade}
                            </Badge>
                          </td>
                          <td>{kg.toLocaleString(2)} kg</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {(
                                  (kg / summaryData.totalKgs) *
                                  100
                                ).toLocaleString(1)}
                                %
                              </div>
                              <div
                                className="progress flex-grow-1"
                                style={{ height: "6px" }}
                              >
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${
                                      (kg / summaryData.totalKgs) * 100
                                    }%`,
                                    backgroundColor: GRADE_GROUPS.HIGH.includes(
                                      grade
                                    )
                                      ? processingTheme.primary
                                      : "#6c757d",
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Transport;
