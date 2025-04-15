// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Row, Col, Tab, Tabs } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// const processingTheme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
// };

// const GRADE_GROUPS = {
//   HIGH: ['A0', 'A1'],
//   LOW: ['A2', 'A3', 'B1', 'B2']
// };



// const CUP_PROFILES = ['S88','S87','S86','C1', 'C2'];

// const LoadingSkeleton = () => {
//   const placeholderStyle = {
//     opacity: 0.4,
//     backgroundColor: processingTheme.secondary
//   };

//   return (
//     <Card>
//       <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//         <Placeholder as="h2" animation="glow">
//           <Placeholder xs={4} style={placeholderStyle} />
//         </Placeholder>
//       </Card.Header>
//       <Card.Body className="p-0">
//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead>
//               <tr>
//                 {['Batch No', 'Processing Type', 'Output KGs', 'Total Output KGs', 'CWS', 'Date', 'Status'].map((header) => (
//                   <th key={header}>
//                     <Placeholder animation="glow">
//                       <Placeholder xs={6} style={placeholderStyle} />
//                     </Placeholder>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {[...Array(3)].map((_, idx) => (
//                 <tr key={idx}>
//                   {[...Array(9)].map((_, cellIdx) => (
//                     <td key={cellIdx}>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={6} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };


// const Transfer = () => {
//   const [groupedRecords, setGroupedRecords] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [selectedBatches, setSelectedBatches] = useState([]);
//   const [selectedGrades, setSelectedGrades] = useState({});
//   const [availableGrades, setAvailableGrades] = useState([]);
//   const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [batchesPerPage, setBatchesPerPage] = useState(30);
//   const [expandedBatches, setExpandedBatches] = useState({});
//   const [selectAllChecked, setSelectAllChecked] = useState(false);
//   const userInfo = JSON.parse(localStorage.getItem('user'));
//   const [modalBatchSearch, setModalBatchSearch] = useState('');
//   const [transferMode, setTransferMode] = useState('BOTH'); // 'BOTH', 'HIGH', 'LOW'
//   const [highGradeFullyTransferred, setHighGradeFullyTransferred] = useState({});

//   const [transportDetails, setTransportDetails] = useState({
//     truckNumber: '',
//     driverName: '',
//     driverPhone: '',
//     numberOfBags: '',
//     cupProfile: CUP_PROFILES[0],
//     cupProfilePercentage: '',
//     notes: ''
//   });

//   const [validated, setValidated] = useState(false);
//   const [activeGradeTab, setActiveGradeTab] = useState('high');

//   useEffect(() => {
//     fetchUntransferredRecords();
//   }, []);

//   useEffect(() => {
//     updateAvailableGrades();
//     calculateTotalSelectedKgs();
//   }, [selectedBatches, groupedRecords]);

//   useEffect(() => {
//     calculateTotalSelectedKgs();
//   }, [selectedGrades, transferMode]);

//   const handleTransportDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setTransportDetails(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const getFilteredBatches = () => {
//     // Filter batches based on search term
//     const filteredBatches = Object.keys(groupedRecords).filter(batchKey => {
//       // Check if batch key contains search term
//       if (searchTerm && !batchKey.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return false;
//       }

//       // Filter could be extended here for additional criteria
//       // For example, filtering by processing type, status, etc.

//       return true;
//     });

//     // Return all filtered batches
//     return filteredBatches;
//   };

//   useEffect(() => {
//     const visibleBatches = getFilteredBatches();
//     const allSelected = visibleBatches.length > 0 &&
//       visibleBatches.every(batch => selectedBatches.includes(batch));
//     setSelectAllChecked(allSelected);
//   }, [selectedBatches, searchTerm, currentPage]);



//   const getGradeTotals = (gradeGroup = null) => {
//     const totals = {};

//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];

//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//           // Parse kg as a number or default to 0 if it's undefined, null, or empty string
//           const kgValue = parseFloat(kg) || 0;

//           // Skip if not selected
//           if (!selectedGrades[grade]) return;

//           // Filter by grade group if specified
//           if (gradeGroup && !GRADE_GROUPS[gradeGroup].includes(grade)) return;

//           totals[grade] = (totals[grade] || 0) + kgValue;
//         });
//       });
//     });

//     return totals;
//   };

//   const getGradeGroupTotal = (gradeGroup) => {
//     let total = 0;
//     const totals = getGradeTotals();

//     Object.entries(totals)
//       .filter(([grade, _]) => GRADE_GROUPS[gradeGroup].includes(grade))
//       .forEach(([_, kg]) => {
//         total += kg;
//       });

//     return total;
//   };

//   const handleGradeSelectionChange = (grade, isSelected) => {
//     setSelectedGrades(prev => ({
//       ...prev,
//       [grade]: isSelected
//     }));
//   };

//   const updateAvailableGrades = () => {
//     const grades = {};
//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];
//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//           // Only include grades that haven't been fully transferred
//           if (!record.transferredGrades || !record.transferredGrades[grade]) {
//             if (parseFloat(kg) > 0) {
//               grades[grade] = true;
//             }
//           }
//         });
//       });
//     });
//     setAvailableGrades(Object.keys(grades));

//     // Initialize selected grades if not already set
//     const newSelectedGrades = {};
//     Object.keys(grades).forEach(grade => {
//       if (selectedGrades[grade] === undefined) {
//         newSelectedGrades[grade] = true;
//       }
//     });
//     setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));
//   };

//   const calculateTotalSelectedKgs = () => {
//     let total = 0;
//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];
//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//           // Only count if grade is selected and matches transfer mode
//           if (selectedGrades[grade]) {
//             const kgValue = parseFloat(kg) || 0;
//             if (transferMode === 'BOTH') {
//               total += kgValue;
//             } else if (transferMode === 'HIGH' && GRADE_GROUPS.HIGH.includes(grade)) {
//               total += kgValue;
//             } else if (transferMode === 'LOW' && GRADE_GROUPS.LOW.includes(grade)) {
//               total += kgValue;
//             }
//           }
//         });
//       });
//     });
//     setTotalSelectedKgs(total);
//   };

//   const handleBatchSelectionChange = (batchKey, isSelected) => {
//     if (isSelected) {
//       setSelectedBatches(prev => [...prev, batchKey]);
//     } else {
//       setSelectedBatches(prev => prev.filter(key => key !== batchKey));
//     }
//   };

//   const handleTransferClick = (mode = 'BOTH') => {
//     setTransferMode(mode);
//     setShowTransferModal(true);
//   };

//   const handleTransferConfirm = async (e) => {
//     const form = e.currentTarget;
//     e.preventDefault();

//     if (form.checkValidity() === false) {
//       e.stopPropagation();
//       setValidated(true);
//       return;
//     }

//     try {
//       const transferPromises = [];
//       const commonDetails = {
//         truckNumber: transportDetails.truckNumber,
//         driverName: transportDetails.driverName,
//         driverPhone: transportDetails.driverPhone,
//         numberOfBags: parseInt(transportDetails.numberOfBags),
//         cupProfile: transportDetails.cupProfile,
//         cupProfilePercentage: parseInt(transportDetails.cupProfilePercentage),
//         notes: transportDetails.notes,
//         transferMode: transferMode // Add transfer mode to request
//       };

//       // Process transfers based on the selected mode
//       if (transferMode === 'BOTH' || transferMode === 'HIGH') {
//         // High grade transfer
//         const highGradeTransfers = createGradeGroupTransfers('HIGH');
//         transferPromises.push(...highGradeTransfers);
//       }

//       if (transferMode === 'BOTH' || transferMode === 'LOW') {
//         // Low grade transfer
//         const lowGradeTransfers = createGradeGroupTransfers('LOW');
//         transferPromises.push(...lowGradeTransfers);
//       }

//       // Log what is being transferred for debugging
//       console.log(`Transferring in ${transferMode} mode:`,
//         transferPromises.map(transfer => ({
//           batchNo: transfer.batchNo,
//           gradeGroup: transfer.gradeGroup,
//           outputKgs: transfer.outputKgs
//         }))
//       );

//       await Promise.all(transferPromises.map(transfer =>
//         axios.post(`${API_URL}/transfer`, transfer)
//       ));

//       // Reset form and refresh data
//       await fetchUntransferredRecords();
//       setSelectedBatches([]);
//       setSelectedGrades({});
//       setTransportDetails({
//         truckNumber: '',
//         driverName: '',
//         driverPhone: '',
//         numberOfBags: '',
//         cupProfile: CUP_PROFILES[0],
//         cupProfilePercentage: '',
//         notes: ''
//       });
//       setShowTransferModal(false);
//       setValidated(false);

//       // Show more specific alert message
//       if (transferMode === 'HIGH') {
//         alert('High Grade transfer completed successfully');
//       } else if (transferMode === 'LOW') {
//         alert('Low Grade transfer completed successfully');
//       } else {
//         alert('Transfer completed successfully');
//       }
//     } catch (error) {
//       console.error('Transfer error:', error);
//       alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const createGradeGroupTransfers = (gradeGroup) => {
//     const transfers = [];

//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey];
//       // Use the original batchKey without adding any suffix
//       const batchNo = batchKey;

//       batchRecords.forEach(record => {
//         const filteredOutputKgs = {};
//         let hasGrades = false;

//         Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//           const kgValue = parseFloat(kg) || 0;
//           // Check if the grade belongs to this grade group, is selected, and hasn't been transferred yet
//           if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS[gradeGroup].includes(grade) &&
//             (!record.transferredGrades || !record.transferredGrades[grade])) {
//             filteredOutputKgs[grade] = kgValue;
//             hasGrades = true;
//           }
//         });

//         if (hasGrades) {
//           transfers.push({
//             baggingOffId: record.id,
//             batchNo: batchNo, // Use the batch number as is
//             gradeGroup,
//             date: new Date().toISOString(),
//             outputKgs: filteredOutputKgs,
//             ...transportDetails
//           });
//         }
//       });
//     });

//     return transfers;
//   };

//   // Check if all high grades for a batch have been transferred
//   const areAllHighGradesTransferred = (batchKey) => {
//     const batchRecords = groupedRecords[batchKey] || [];
//     let hasUntransferredHighGrade = false;

//     batchRecords.forEach(record => {
//       Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//         const kgValue = parseFloat(kg) || 0;
//         if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) && (!record.transferredGrades || !record.transferredGrades[grade])) {
//           hasUntransferredHighGrade = true;
//         }
//       });
//     });

//     return !hasUntransferredHighGrade;
//   };

//   // Modify the fetchUntransferredRecords function to track transferred grades
//   const fetchUntransferredRecords = async () => {
//     try {
//       console.log("Fetching bagging-off records...");
//       const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
//       console.log("Bagging-off response:", response.data);

//       // Get all transfers for the CWS
//       console.log("Fetching transfers...");
//       const transfersResponse = await axios.get(`${API_URL}/transfer/cws/${userInfo.cwsId}`);
//       console.log("Transfers response:", transfersResponse.data);
//       const allTransfers = transfersResponse.data || [];

//       // Create a map of all transfers by baggingOffId
//       const transfersByBaggingOff = {};
//       allTransfers.forEach(transfer => {
//         if (!transfersByBaggingOff[transfer.baggingOffId]) {
//           transfersByBaggingOff[transfer.baggingOffId] = [];
//         }
//         transfersByBaggingOff[transfer.baggingOffId].push(transfer);
//       });

//       // Process all bagging-off records
//       const processedRecords = (response.data || []).map(record => {
//         // Get transfers for this record
//         const recordTransfers = transfersByBaggingOff[record.id] || [];

//         // Check which grades have been transferred for this record
//         const transferredGrades = {};
//         recordTransfers.forEach(transfer => {
//           if (transfer.outputKgs) {
//             Object.keys(transfer.outputKgs).forEach(grade => {
//               transferredGrades[grade] = true;
//             });
//           }
//         });

//         // Add data about transferred grades to the record
//         return {
//           ...record,
//           transferredGrades,
//           hasTransferredGrades: Object.keys(transferredGrades).length > 0,
//           hasUntransferredGrades: record.outputKgs && Object.keys(record.outputKgs).some(grade =>
//             !transferredGrades[grade] && parseFloat(record.outputKgs[grade] || 0) > 0
//           )
//         };
//       });

//       // Filter and group records
//       console.log("Processed records:", processedRecords);
//       const untransferred = processedRecords.filter(record => record.hasUntransferredGrades);
//       console.log("Untransferred records:", untransferred);

//       const grouped = untransferred.reduce((acc, record) => {
//         if (record.batchNo) {
//           const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, '');
//           if (!acc[baseBatchNo]) {
//             acc[baseBatchNo] = [];
//           }
//           acc[baseBatchNo].push(record);
//         }
//         return acc;
//       }, {});

//       console.log("Grouped records:", grouped);
//       setGroupedRecords(grouped);

//       // Check which batches have all high grades transferred
//       const highGradeStatus = {};
//       Object.keys(grouped).forEach(batchKey => {
//         highGradeStatus[batchKey] = areAllHighGradesTransferred(batchKey);
//       });
//       setHighGradeFullyTransferred(highGradeStatus);

//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching records:", error);
//       console.error("Error details:", error.response?.data || error.message);
//       console.error("Error stack:", error.stack);
//       setError(`Error fetching untransferred records: ${error.message}`);
//       setLoading(false);
//     }
//   };

//   // Update the rendering of grades in the table to show which ones are already transferred
//   const renderOutputKgs = (outputKgs, transferredGrades = {}) => {
//     const totalsByGrade = {};

//     if (!outputKgs) return [];

//     Object.entries(outputKgs).forEach(([grade, kg]) => {
//       const numKg = kg === "" ? 0 : parseFloat(kg) || 0;
//       if (numKg > 0) {
//         totalsByGrade[grade] = numKg;
//       }
//     });

//     return Object.entries(totalsByGrade)
//       .map(([grade, total]) => {
//         const isTransferred = transferredGrades[grade];
//         return renderGradeBadge(grade, total, isTransferred);
//       });
//   };

//   // Modified grade badge renderer to show transferred status
//   const renderGradeBadge = (grade, kg, isTransferred = false) => {
//     const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
//     let badgeColor = isHighGrade ? processingTheme.primary : '#008080';

//     // Style for transferred grades
//     const containerStyle = isTransferred ? {
//       opacity: 0.5,
//       textDecoration: 'line-through'
//     } : {};

//     return (
//       <div key={grade} className="small mb-1" style={containerStyle}>
//         <Badge 
//           className="me-1"
//           bg="sucafina"
//           variant="secondary" 
//           style={{ backgroundColor: badgeColor, color: 'white' }}
//         >
//           {grade}
//         </Badge>
//         <span>{kg.toFixed(2)} kg</span>
//         {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
//         {isTransferred && <Badge bg="info" className="ms-1" pill>Transferred</Badge>}
//       </div>
//     );
//   };

//   const calculateOutturn = (totalKgs, outputKgs) => {
//     if (!outputKgs) return '0.00';
//     const totalOutputKgs = Object.values(outputKgs).reduce((sum, kg) => sum + (parseFloat(kg) || 0), 0);
//     return totalKgs > 0 ? ((totalOutputKgs / totalKgs) * 100).toFixed(2) : '0.00';
//   };

//   const getUniqueProcessingTypes = (records) => {
//     const types = new Set();
//     records.forEach(record => types.add(record.processingType));
//     return Array.from(types).join(', ');
//   };


//   // Add this helper function to get available grades for a batch
//   const getAvailableGrades = (batchKey) => {
//     const batchRecords = groupedRecords[batchKey] || [];
//     const availableGradeSet = {};

//     batchRecords.forEach(record => {
//       Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//         const kgValue = parseFloat(kg) || 0;
//         // Only include grades that haven't been transferred and have kg > 0
//         if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
//           if (!availableGradeSet[grade]) {
//             availableGradeSet[grade] = 0;
//           }
//           availableGradeSet[grade] += kgValue;
//         }
//       });
//     });

//     return availableGradeSet;
//   };

//   // Helper function to render grade pills for available grades
//   const renderAvailableGrades = (batchKey) => {
//     const availableGrades = getAvailableGrades(batchKey);

//     if (Object.keys(availableGrades).length === 0) {
//       return <span className="text-muted">None</span>;
//     }

//     return Object.entries(availableGrades).map(([grade, kg]) => {
//       const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);

//       return (
//         <Badge
//           key={grade}
//           className="me-1 mb-1"
//           bg='sucafina'
//           style={{
//             fontSize: '0.8rem',
//             backgroundColor: isHighGrade ? processingTheme.primary : '#008080',
//             color: 'white'
//           }}
//         >
//           {grade}: {kg.toFixed(2)} kg {isHighGrade && '★'}
//         </Badge>
//       );
//     });
//   };

//   const toggleBatchExpansion = (batchKey) => {
//     setExpandedBatches(prev => ({
//       ...prev,
//       [batchKey]: !prev[batchKey]
//     }));
//   };

//   const handleSelectAllBatches = (isSelected) => {
//     if (isSelected) {
//       setSelectedBatches(getFilteredBatches());
//     } else {
//       setSelectedBatches([]);
//     }
//     setSelectAllChecked(isSelected);
//   };

//   const getPaginatedBatches = () => {
//     const filteredBatches = getFilteredBatches();
//     const indexOfLastBatch = currentPage * batchesPerPage;
//     const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
//     return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const calculateOverallTotalKgs = (batchKey) => {
//     return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalKgs || 0), 0);
//   };

//   const calculateOverallOutputKgs = (batchKey) => {
//     return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalOutputKgs || 0), 0);
//   };

//   const hasTransferableHighGrades = (batchKey) => {
//     return !highGradeFullyTransferred[batchKey];
//   };

//   const hasTransferableLowGrades = (batchKey) => {
//     const batchRecords = groupedRecords[batchKey] || [];
//     let hasUntransferredLowGrade = false;

//     batchRecords.forEach(record => {
//       Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//         const kgValue = parseFloat(kg) || 0;
//         if (kgValue > 0 && GRADE_GROUPS.LOW.includes(grade) && (!record.transferredGrades || !record.transferredGrades[grade])) {
//           hasUntransferredLowGrade = true;
//         }
//       });
//     });

//     return hasUntransferredLowGrade;
//   };

//   return (
//     <div className="container-fluid py-4">
//       <Card className="mb-4">
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <span className="h5" style={{ color: processingTheme.primary }}>
//             Transport to HQ
//           </span>
//         </Card.Header>
//         <Card.Body>
//           <div className="row">
//             <div className="col-md-8">
//               {/* Selected Batches Section */}
//               <div className="mb-3">
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Selected Batches ({selectedBatches.length})</strong>
//                   {selectedBatches.length > 0 && (
//                     <Button variant="outline-danger" size="sm" onClick={() => setSelectedBatches([])}>
//                       Clear All
//                     </Button>
//                   )}
//                 </div>
//                 <div className="selected-batches-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
//                   {selectedBatches.length === 0 ? (
//                     <div className="text-muted">No batches selected</div>
//                   ) : (
//                     <div className="d-flex flex-wrap">
//                       {selectedBatches.map(batchKey => (
//                         <Badge key={batchKey} bg={processingTheme.neutral} className="me-2 mb-2 p-2 bg-sucafina">
//                           {batchKey} ({(calculateOverallOutputKgs(batchKey) || 0).toFixed(2)} kg)
//                           <Button size="sm" variant="link" className="p-0 ms-1" onClick={() => handleBatchSelectionChange(batchKey, false)} style={{ color: 'white' }}>
//                             ×
//                           </Button>
//                         </Badge>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <Card style={{ backgroundColor: processingTheme.neutral }}>
//                 <Card.Body>
//                   <h5>Transfer Summary</h5>
//                   <p><strong>Selected Batches:</strong> {selectedBatches.length}</p>
//                   <p><strong>Selected Grades:</strong> {Object.entries(selectedGrades).filter(([_, isSelected]) => isSelected).length}</p>

//                   <div className="d-flex justify-content-between mb-2">
//                     <span><strong>High Grades (A0, A1):</strong></span>
//                     <span>{getGradeGroupTotal('HIGH').toFixed(2)} kg</span>
//                   </div>

//                   <div className="d-flex justify-content-between mb-2">
//                     <span><strong>Low Grades (A2-B2):</strong></span>
//                     <span>{getGradeGroupTotal('LOW').toFixed(2)} kg</span>
//                   </div>

//                   <div className="d-flex justify-content-between mb-3" style={{ fontWeight: 'bold' }}>
//                     <span>Total KGs:</span>
//                     <span>{totalSelectedKgs.toFixed(2)} kg</span>
//                   </div>

//                   {totalSelectedKgs > 10000 && (
//                     <Alert variant="danger">
//                       The total exceeds the 10,000 kg transfer limit
//                     </Alert>
//                   )}

//                   <div className="d-grid gap-2">
//                     {/* Only show High Grade transfer button if there are untransferred high grades */}
//                     {getGradeGroupTotal('HIGH') > 0 && (
//                       <Button
//                         variant="success"
//                         disabled={selectedBatches.length === 0 || getGradeGroupTotal('HIGH') === 0}
//                         onClick={() => handleTransferClick('HIGH')}
//                         className="mt-2"
//                       >
//                         <i className="bi bi-star-fill me-1"></i>
//                         <strong>Transfer High Grades</strong>
//                         <Badge bg="light" text="dark" className="ms-2">{getGradeGroupTotal('HIGH').toFixed(2)} kg</Badge>
//                       </Button>
//                     )}

//                     <Button
//                       variant="warning"
//                       disabled={selectedBatches.length === 0 || getGradeGroupTotal('LOW') === 0}
//                       onClick={() => handleTransferClick('LOW')}
//                       className="mt-2"
//                     >
//                       <i className="bi bi-box me-1"></i>
//                       <strong>Transfer Low Grades</strong>
//                       <Badge bg="light" text="dark" className="ms-2">{getGradeGroupTotal('LOW').toFixed(2)} kg</Badge>
//                     </Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Batches Table */}
//       <Card className="mb-4">
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center">
//             <span className="h5" style={{ color: processingTheme.primary }}>Available Batches</span>
//             <div className="d-flex">
//               <InputGroup className="me-2" style={{ width: '300px' }}>
//                 <Form.Control
//                   placeholder="Search batches..."
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                 />
//                 {searchTerm && (
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setSearchTerm('')}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </InputGroup>
//               <Form.Select
//                 style={{ width: '100px' }}
//                 value={batchesPerPage}
//                 onChange={(e) => setBatchesPerPage(Number(e.target.value))}
//               >
//                 <option value="10">10</option>
//                 <option value="30">30</option>
//                 <option value="50">50</option>
//                 <option value="100">100</option>
//               </Form.Select>
//             </div>
//           </div>
//         </Card.Header>
//         <Card.Body className="p-0">
//           {loading ? (
//             <LoadingSkeleton />
//           ) : error ? (
//             <Alert variant="danger">{error}</Alert>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-hover mb-0">
//                 <thead>
//                   <tr style={{ backgroundColor: processingTheme.neutral }}>
//                     <th width="40">
//                       <Form.Check
//                         type="checkbox"
//                         checked={selectAllChecked}
//                         onChange={(e) => handleSelectAllBatches(e.target.checked)}
//                       />
//                     </th>
//                     <th>Batch No</th>
//                     <th>Processing Type</th>
//                     {/* <th>Total KGs</th> */}
//                     <th>Output KGs</th>
//                     {/* <th>Outturn</th> */}
//                     <th>Status</th>
//                     <th>Available Grades</th>
//                     {/* <th>Actions</th> */}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {getPaginatedBatches().map(batchKey => {
//                     const batchRecords = groupedRecords[batchKey] || [];
//                     const isExpanded = expandedBatches[batchKey] || false;
//                     const isBatchSelected = selectedBatches.includes(batchKey);
//                     const totalKgs = calculateOverallTotalKgs(batchKey);
//                     const outputKgs = calculateOverallOutputKgs(batchKey);
//                     const outturn = totalKgs > 0 ? ((outputKgs / totalKgs) * 100).toFixed(2) : '0.00';

//                     // Check which grade types are available
//                     const hasHighGrades = hasTransferableHighGrades(batchKey);
//                     const hasLowGrades = hasTransferableLowGrades(batchKey);

//                     return (
//                       <React.Fragment key={batchKey}>
//                         <tr
//                           className={isBatchSelected ? 'table-active' : ''}
//                           style={{ backgroundColor: isBatchSelected ? processingTheme.tableHover : 'inherit' }}
//                         >
//                           <td>
//                             <Form.Check
//                               type="checkbox"
//                               checked={isBatchSelected}
//                               onChange={(e) => handleBatchSelectionChange(batchKey, e.target.checked)}
//                             />
//                           </td>
//                           <td>
//                             <div className="d-flex align-items-center">
//                               <span
//                                 className="me-2"
//                                 style={{ cursor: 'pointer' }}
//                                 onClick={() => toggleBatchExpansion(batchKey)}
//                               >
//                                 <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
//                               </span>
//                               <strong>{batchKey}</strong>
//                             </div>
//                           </td>
//                           <td>{getUniqueProcessingTypes(batchRecords)}</td>
//                           {/* <td>{totalKgs.toFixed(2)}</td> */}
//                           <td>{outputKgs.toFixed(2)}</td>
//                           {/* <td>{outturn}%</td> */}
//                           <td>
//                             {batchRecords.some(record => record.hasUntransferredGrades) ? (
//                               <Badge bg="success">Ready for Transfer</Badge>
//                             ) : (
//                               <Badge bg="secondary">Fully Transferred</Badge>
//                             )}
//                           </td>
//                           <td>
//                             <div className="d-flex flex-wrap">
//                               {renderAvailableGrades(batchKey)}
//                             </div>
//                           </td>
//                         </tr>
//                         {isExpanded && batchRecords.map((record, idx) => (
//                           <tr key={`${batchKey}-${idx}`} className="table-light">
//                             <td></td>
//                             <td colSpan="2">
//                               <div className="ms-4">
//                                 <small>Sub-batch: {record.batchNo}</small>
//                               </div>
//                             </td>
//                             <td>{record.totalKgs?.toFixed(2) || '0.00'}</td>
//                             <td>{record.totalOutputKgs?.toFixed(2) || '0.00'}</td>
//                             <td>{calculateOutturn(record.totalKgs, record.outputKgs)}%</td>
//                             <td colSpan="3">
//                               <div className="d-flex flex-wrap">
//                                 {renderOutputKgs(record.outputKgs, record.transferredGrades)}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </React.Fragment>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </Card.Body>
//         {!loading && !error && (
//           <Card.Footer>
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 Showing {getPaginatedBatches().length} of {getFilteredBatches().length} batches
//               </div>
//               <ul className="pagination mb-0">
//                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                   <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
//                 </li>
//                 {Array.from({ length: Math.ceil(getFilteredBatches().length / batchesPerPage) }, (_, i) => (
//                   <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
//                     <button className="page-link bg-sucafina border-sucafina" onClick={() => paginate(i + 1)}>{i + 1}</button>
//                   </li>
//                 ))}
//                 <li className={`page-item ${currentPage === Math.ceil(getFilteredBatches().length / batchesPerPage) ? 'disabled' : ''}`}>
//                   <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
//                 </li>
//               </ul>
//             </div>
//           </Card.Footer>
//         )}
//       </Card>

//       {/* Transfer Modal */}
//       <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
//         <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
//           <Modal.Title>
//             {transferMode === 'HIGH' ? 'Transfer High Grades' :
//               transferMode === 'LOW' ? 'Transfer Low Grades' :
//                 'Transfer All Grades'}
//           </Modal.Title>
//         </Modal.Header>
//         <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
//           <Modal.Body>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Card className="h-100">
//                   <Card.Header style={{ backgroundColor: processingTheme.neutral }}>Transfer Details</Card.Header>
//                   <Card.Body>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Truck Number</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="truckNumber"
//                         value={transportDetails.truckNumber}
//                         onChange={handleTransportDetailsChange}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         Please provide a truck number.
//                       </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Driver Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="driverName"
//                         value={transportDetails.driverName}
//                         onChange={handleTransportDetailsChange}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         Please provide a driver name.
//                       </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Driver Phone</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="driverPhone"
//                         value={transportDetails.driverPhone}
//                         onChange={handleTransportDetailsChange}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         Please provide a driver phone number.
//                       </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Number of Bags</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="numberOfBags"
//                         value={transportDetails.numberOfBags}
//                         onChange={handleTransportDetailsChange}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         Please provide the number of bags.
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               <Col md={6}>
//                 <Card className="h-100">
//                   <Card.Header style={{ backgroundColor: processingTheme.neutral }}>Quality Details</Card.Header>
//                   <Card.Body>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Cup Profile</Form.Label>
//                       <Form.Select
//                         name="cupProfile"
//                         value={transportDetails.cupProfile}
//                         onChange={handleTransportDetailsChange}
//                         required
//                       >
//                         {CUP_PROFILES.map(profile => (
//                           <option key={profile} value={profile}>{profile}</option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Moisture Content</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="cupProfilePercentage"
//                         value={transportDetails.cupProfilePercentage}
//                         onChange={handleTransportDetailsChange}
//                         required
//                         min="1"
//                         max="100"
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         Please provide a percentage (1-100).
//                       </Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Notes</Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={3}
//                         name="notes"
//                         value={transportDetails.notes}
//                         onChange={handleTransportDetailsChange}
//                       />
//                     </Form.Group>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={12}>
//                 <Card>
//                   <Card.Header style={{ backgroundColor: processingTheme.neutral }}>Selected Batches & Grades</Card.Header>
//                   <Card.Body>
//                     <InputGroup className="mb-3">
//                       <Form.Control
//                         placeholder="Search batches..."
//                         value={modalBatchSearch}
//                         onChange={(e) => setModalBatchSearch(e.target.value)}
//                       />
//                       {modalBatchSearch && (
//                         <Button variant="outline-secondary" onClick={() => setModalBatchSearch('')}>
//                           Clear
//                         </Button>
//                       )}
//                     </InputGroup>

//                     <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                       <table className="table table-sm">
//                         <thead>
//                           <tr>
//                             <th>Batch No</th>
//                             <th>Processing Type</th>
//                             <th>Grades</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {selectedBatches
//                             .filter(batchKey => modalBatchSearch ? batchKey.toLowerCase().includes(modalBatchSearch.toLowerCase()) : true)
//                             .map(batchKey => {
//                               const batchRecords = groupedRecords[batchKey] || [];
//                               return (
//                                 <tr key={batchKey}>
//                                   <td>{batchKey}</td>
//                                   <td>{getUniqueProcessingTypes(batchRecords)}</td>
//                                   <td>
//                                     <div className="d-flex flex-wrap">
//                                       {batchRecords.flatMap(record =>
//                                         renderOutputKgs(record.outputKgs, record.transferredGrades)
//                                           .filter(badge => {
//                                             // Filter based on transfer mode
//                                             if (transferMode === 'HIGH') {
//                                               return badge.key && GRADE_GROUPS.HIGH.includes(badge.key);
//                                             } else if (transferMode === 'LOW') {
//                                               return badge.key && GRADE_GROUPS.LOW.includes(badge.key);
//                                             }
//                                             return true;
//                                           })
//                                       )}
//                                     </div>
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="d-flex justify-content-between mt-3">
//                       <div>
//                         <strong>Total Selected Batches:</strong> {selectedBatches.length}
//                       </div>
//                       <div>
//                         <strong>Total KGs to Transfer:</strong> {totalSelectedKgs.toFixed(2)} kg
//                       </div>
//                     </div>

//                     {totalSelectedKgs > 10000 && (
//                       <Alert variant="danger" className="mt-3">
//                         Warning: The total exceeds the 10,000 kg transfer limit!
//                       </Alert>
//                     )}
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
//               Cancel
//             </Button>
//             <Button
//               variant={transferMode === 'HIGH' ? 'success' : transferMode === 'LOW' ? 'warning' : 'success'} 
//               type="submit"
//               disabled={selectedBatches.length === 0 || totalSelectedKgs === 0}
//             >
//               Confirm Transfer
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Transfer;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Row, Col, Tab, Tabs } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
};

const GRADE_GROUPS = {
  HIGH: ['A0', 'A1'],
  LOW: ['A2', 'A3', 'B1', 'B2']
};

const CUP_PROFILES = ['S88', 'S87', 'S86', 'C1', 'C2'];



const Transfer = () => {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState({});
  const [availableGrades, setAvailableGrades] = useState([]);
  const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage, setBatchesPerPage] = useState(30);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [modalBatchSearch, setModalBatchSearch] = useState('');
  const [transferMode, setTransferMode] = useState('BOTH'); // 'BOTH', 'HIGH', 'LOW'
  const [highGradeFullyTransferred, setHighGradeFullyTransferred] = useState({});

  // Track quality details per grade per batch
  const [gradeQualityDetails, setGradeQualityDetails] = useState({});

  // Common transport details
  const [transportDetails, setTransportDetails] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const [validated, setValidated] = useState(false);
  const [activeGradeTab, setActiveGradeTab] = useState('high');

  useEffect(() => {
    fetchUntransferredRecords();
  }, []);

  useEffect(() => {
    updateAvailableGrades();
    calculateTotalSelectedKgs();
    initializeGradeQualityDetails();
  }, [selectedBatches, groupedRecords]);

  useEffect(() => {
    calculateTotalSelectedKgs();
  }, [selectedGrades, transferMode]);

  // Initialize quality details for each grade in each batch
  const initializeGradeQualityDetails = () => {
    const newGradeDetails = {};

    selectedBatches.forEach(batchKey => {
      if (!newGradeDetails[batchKey]) {
        newGradeDetails[batchKey] = {};
      }

      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          if (parseFloat(kg) > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
            if (!newGradeDetails[batchKey][grade]) {
              newGradeDetails[batchKey][grade] = {
                numberOfBags: '',
                cupProfile: CUP_PROFILES[0],
                moistureContent: ''
              };
            }
          }
        });
      });
    });

    setGradeQualityDetails(prevDetails => ({
      ...prevDetails,
      ...newGradeDetails
    }));
  };

  const handleQualityDetailsChange = (batchKey, grade, field, value) => {
    setGradeQualityDetails(prevDetails => ({
      ...prevDetails,
      [batchKey]: {
        ...(prevDetails[batchKey] || {}),
        [grade]: {
          ...(prevDetails[batchKey]?.[grade] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleTransportDetailsChange = (e) => {
    const { name, value } = e.target;
    setTransportDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getFilteredBatches = () => {
    // Filter batches based on search term
    const filteredBatches = Object.keys(groupedRecords).filter(batchKey => {
      // Check if batch key contains search term
      if (searchTerm && !batchKey.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });

    return filteredBatches;
  };

  useEffect(() => {
    const visibleBatches = getFilteredBatches();
    const allSelected = visibleBatches.length > 0 &&
      visibleBatches.every(batch => selectedBatches.includes(batch));
    setSelectAllChecked(allSelected);
  }, [selectedBatches, searchTerm, currentPage]);

  const getGradeTotals = (gradeGroup = null) => {
    const totals = {};

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          // Parse kg as a number or default to 0 if it's undefined, null, or empty string
          const kgValue = parseFloat(kg) || 0;

          // Skip if not selected
          if (!selectedGrades[grade]) return;

          // Filter by grade group if specified
          if (gradeGroup && !GRADE_GROUPS[gradeGroup].includes(grade)) return;

          totals[grade] = (totals[grade] || 0) + kgValue;
        });
      });
    });

    return totals;
  };

  const getGradeGroupTotal = (gradeGroup) => {
    let total = 0;
    const totals = getGradeTotals();

    Object.entries(totals)
      .filter(([grade, _]) => GRADE_GROUPS[gradeGroup].includes(grade))
      .forEach(([_, kg]) => {
        total += kg;
      });

    return total;
  };

  const handleGradeSelectionChange = (grade, isSelected) => {
    setSelectedGrades(prev => ({
      ...prev,
      [grade]: isSelected
    }));
  };

  const updateAvailableGrades = () => {
    const grades = {};
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          // Only include grades that haven't been fully transferred
          if (!record.transferredGrades || !record.transferredGrades[grade]) {
            if (parseFloat(kg) > 0) {
              grades[grade] = true;
            }
          }
        });
      });
    });
    setAvailableGrades(Object.keys(grades));

    // Initialize selected grades if not already set
    const newSelectedGrades = {};
    Object.keys(grades).forEach(grade => {
      // Only set if it's undefined (don't override user selections)
      if (selectedGrades[grade] === undefined) {
        newSelectedGrades[grade] = true;
      }
    });
    if (Object.keys(newSelectedGrades).length > 0) {
      setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));
    }
  };


  const calculateTotalSelectedKgs = () => {
    let total = 0;
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          // Only count if grade is selected and matches transfer mode
          if (selectedGrades[grade]) {
            const kgValue = parseFloat(kg) || 0;
            if (transferMode === 'BOTH') {
              total += kgValue;
            } else if (transferMode === 'HIGH' && GRADE_GROUPS.HIGH.includes(grade)) {
              total += kgValue;
            } else if (transferMode === 'LOW' && GRADE_GROUPS.LOW.includes(grade)) {
              total += kgValue;
            }
          }
        });
      });
    });
    setTotalSelectedKgs(total);
  };

  const handleBatchSelectionChange = (batchKey, isSelected) => {
    if (isSelected) {
      setSelectedBatches(prev => [...prev, batchKey]);
    } else {
      setSelectedBatches(prev => prev.filter(key => key !== batchKey));
    }
  };

  const handleTransferClick = (mode = 'BOTH') => {
    setTransferMode(mode);
    setShowTransferModal(true);
  };

  const validateQualityDetails = () => {
    // For HIGH or BOTH modes, validate that all high grades have quality details
    if (transferMode === 'LOW') {
      return true; // No validation needed for low grades
    }

    let isValid = true;

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;

          // Only validate high grades that are selected and not transferred
          if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS.HIGH.includes(grade) &&
            (!record.transferredGrades || !record.transferredGrades[grade])) {

            const details = gradeQualityDetails[batchKey]?.[grade];

            if (!details ||
              !details.numberOfBags ||
              !details.cupProfile ||
              !details.moistureContent) {
              isValid = false;
            }
          }
        });
      });
    });

    return isValid;
  };

  const handleTransferConfirm = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Additional validation for quality details
    if (!validateQualityDetails()) {
      alert('Please fill in all quality details for high grade coffee.');
      return;
    }

    try {
      const transferPromises = [];
      const commonDetails = {
        truckNumber: transportDetails.truckNumber,
        driverName: transportDetails.driverName,
        driverPhone: transportDetails.driverPhone,
        notes: transportDetails.notes,
        transferMode: transferMode
      };

      // Process transfers based on the selected mode
      if (transferMode === 'BOTH' || transferMode === 'HIGH') {
        // High grade transfer
        const highGradeTransfers = createGradeGroupTransfers('HIGH');
        transferPromises.push(...highGradeTransfers);
      }

      if (transferMode === 'BOTH' || transferMode === 'LOW') {
        // Low grade transfer
        const lowGradeTransfers = createGradeGroupTransfers('LOW');
        transferPromises.push(...lowGradeTransfers);
      }

      // Log what is being transferred for debugging
      console.log(`Transferring in ${transferMode} mode:`,
        transferPromises.map(transfer => ({
          batchNo: transfer.batchNo,
          gradeGroup: transfer.gradeGroup,
          outputKgs: transfer.outputKgs
        }))
      );

      await Promise.all(transferPromises.map(transfer =>
        axios.post(`${API_URL}/transfer`, transfer)
      ));

      // Reset form and refresh data
      await fetchUntransferredRecords();
      setSelectedBatches([]);
      setSelectedGrades({});
      setTransportDetails({
        truckNumber: '',
        driverName: '',
        driverPhone: '',
        notes: ''
      });
      setGradeQualityDetails({});
      setShowTransferModal(false);
      setValidated(false);

      // Show more specific alert message
      if (transferMode === 'HIGH') {
        alert('High Grade transfer completed successfully');
      } else if (transferMode === 'LOW') {
        alert('Low Grade transfer completed successfully');
      } else {
        alert('Transfer completed successfully');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
    }
  };

  const createGradeGroupTransfers = (gradeGroup) => {
    const transfers = [];

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey];
      const batchNo = batchKey;

      batchRecords.forEach(record => {
        const filteredOutputKgs = {};
        let hasGrades = false;

        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;
          // Check if the grade belongs to this grade group, is selected, and hasn't been transferred yet
          if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS[gradeGroup].includes(grade) &&
            (!record.transferredGrades || !record.transferredGrades[grade])) {
            filteredOutputKgs[grade] = kgValue;
            hasGrades = true;
          }
        });

        if (hasGrades) {
          const gradeDetails = {};

          // Add quality details for each grade
          Object.keys(filteredOutputKgs).forEach(grade => {
            const details = gradeQualityDetails[batchKey]?.[grade] || {};

            // For high grades, include all quality details
            if (GRADE_GROUPS.HIGH.includes(grade)) {
              gradeDetails[grade] = {
                numberOfBags: parseInt(details.numberOfBags || 0),
                cupProfile: details.cupProfile || CUP_PROFILES[0],
                moistureContent: parseInt(details.moistureContent || 0)
              };
            } else {
              // For low grades, only include number of bags
              gradeDetails[grade] = {
                numberOfBags: parseInt(details.numberOfBags || 0)
              };
            }
          });

          transfers.push({
            baggingOffId: record.id,
            batchNo: batchNo,
            gradeGroup,
            date: new Date().toISOString(),
            outputKgs: filteredOutputKgs,
            gradeDetails: gradeDetails,
            ...transportDetails
          });
        }
      });
    });

    return transfers;
  };

  // Check if all high grades for a batch have been transferred
  const areAllHighGradesTransferred = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredHighGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) && (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredHighGrade = true;
        }
      });
    });

    return !hasUntransferredHighGrade;
  };

  // Modify the fetchUntransferredRecords function to track transferred grades
  const fetchUntransferredRecords = async () => {
    try {
      console.log("Fetching bagging-off records...");
      const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
      console.log("Bagging-off response:", response.data);

      // Get all transfers for the CWS
      console.log("Fetching transfers...");
      const transfersResponse = await axios.get(`${API_URL}/transfer/cws/${userInfo.cwsId}`);
      console.log("Transfers response:", transfersResponse.data);
      const allTransfers = transfersResponse.data || [];

      // Create a map of all transfers by baggingOffId
      const transfersByBaggingOff = {};
      allTransfers.forEach(transfer => {
        if (!transfersByBaggingOff[transfer.baggingOffId]) {
          transfersByBaggingOff[transfer.baggingOffId] = [];
        }
        transfersByBaggingOff[transfer.baggingOffId].push(transfer);
      });

      // Process all bagging-off records
      const processedRecords = (response.data || []).map(record => {
        // Get transfers for this record
        const recordTransfers = transfersByBaggingOff[record.id] || [];

        // Check which grades have been transferred for this record
        const transferredGrades = {};
        recordTransfers.forEach(transfer => {
          if (transfer.outputKgs) {
            Object.keys(transfer.outputKgs).forEach(grade => {
              transferredGrades[grade] = true;
            });
          }
        });

        // Add data about transferred grades to the record
        return {
          ...record,
          transferredGrades,
          hasTransferredGrades: Object.keys(transferredGrades).length > 0,
          hasUntransferredGrades: record.outputKgs && Object.keys(record.outputKgs).some(grade =>
            !transferredGrades[grade] && parseFloat(record.outputKgs[grade] || 0) > 0
          )
        };
      });

      // Filter and group records
      console.log("Processed records:", processedRecords);
      const untransferred = processedRecords.filter(record => record.hasUntransferredGrades);
      console.log("Untransferred records:", untransferred);

      const grouped = untransferred.reduce((acc, record) => {
        if (record.batchNo) {
          const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, '');
          if (!acc[baseBatchNo]) {
            acc[baseBatchNo] = [];
          }
          acc[baseBatchNo].push(record);
        }
        return acc;
      }, {});

      console.log("Grouped records:", grouped);
      setGroupedRecords(grouped);

      // Check which batches have all high grades transferred
      const highGradeStatus = {};
      Object.keys(grouped).forEach(batchKey => {
        highGradeStatus[batchKey] = areAllHighGradesTransferred(batchKey);
      });
      setHighGradeFullyTransferred(highGradeStatus);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Error stack:", error.stack);
      setError(`Error fetching untransferred records: ${error.message}`);
      setLoading(false);
    }
  };

  // Update the rendering of grades in the table to show which ones are already transferred
  const renderOutputKgs = (outputKgs, transferredGrades = {}) => {
    const totalsByGrade = {};

    if (!outputKgs) return [];

    Object.entries(outputKgs).forEach(([grade, kg]) => {
      const numKg = kg === "" ? 0 : parseFloat(kg) || 0;
      if (numKg > 0) {
        totalsByGrade[grade] = numKg;
      }
    });

    return Object.entries(totalsByGrade)
      .map(([grade, total]) => {
        const isTransferred = transferredGrades[grade];
        return renderGradeBadge(grade, total, isTransferred);
      });
  };

  // Modified grade badge renderer to show transferred status
  const renderGradeBadge = (grade, kg, isTransferred = false) => {
    const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
    let badgeColor = isHighGrade ? processingTheme.primary : '#008080';

    // Style for transferred grades
    const containerStyle = isTransferred ? {
      opacity: 0.5,
      textDecoration: 'line-through'
    } : {};

    return (
      <div key={grade} className="small mb-1" style={containerStyle}>
        <Badge
          className="me-1"
          bg="sucafina"
          variant="secondary"
          style={{ backgroundColor: badgeColor, color: 'white' }}
        >
          {grade}
        </Badge>
        <span>{kg.toFixed(2)} kg</span>
        {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
        {isTransferred && <Badge bg="info" className="ms-1" pill>Transferred</Badge>}
      </div>
    );
  };

  const calculateOutturn = (totalKgs, outputKgs) => {
    if (!outputKgs) return '0.00';
    const totalOutputKgs = Object.values(outputKgs).reduce((sum, kg) => sum + (parseFloat(kg) || 0), 0);
    return totalKgs > 0 ? ((totalOutputKgs / totalKgs) * 100).toFixed(2) : '0.00';
  };

  const getUniqueProcessingTypes = (records) => {
    const types = new Set();
    records.forEach(record => types.add(record.processingType));
    return Array.from(types).join(', ');
  };

  // Add this helper function to get available grades for a batch
  const getAvailableGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    const availableGradeSet = {};

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        // Only include grades that haven't been transferred and have kg > 0
        if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
          if (!availableGradeSet[grade]) {
            availableGradeSet[grade] = 0;
          }
          availableGradeSet[grade] += kgValue;
        }
      });
    });

    return availableGradeSet;
  };

  // Helper function to render grade pills for available grades
  const renderAvailableGrades = (batchKey) => {
    const availableGrades = getAvailableGrades(batchKey);

    if (Object.keys(availableGrades).length === 0) {
      return <span className="text-muted">None</span>;
    }

    return Object.entries(availableGrades).map(([grade, kg]) => {
      const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);

      return (
        <Badge
          key={grade}
          className="me-1 mb-1"
          bg='sucafina'
          style={{
            fontSize: '0.8rem',
            backgroundColor: isHighGrade ? processingTheme.primary : '#008080',
            color: 'white'
          }}
        >
          {grade}: {kg.toFixed(2)} kg {isHighGrade && '★'}
        </Badge>
      );
    });
  };

  const toggleBatchExpansion = (batchKey) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }));
  };

  const handleSelectAllBatches = (isSelected) => {
    if (isSelected) {
      setSelectedBatches(getFilteredBatches());
    } else {
      setSelectedBatches([]);
    }
    setSelectAllChecked(isSelected);
  };

  const getPaginatedBatches = () => {
    const filteredBatches = getFilteredBatches();
    const indexOfLastBatch = currentPage * batchesPerPage;
    const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
    return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const calculateOverallTotalKgs = (batchKey) => {
    return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalKgs || 0), 0);
  };

  const calculateOverallOutputKgs = (batchKey) => {
    return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalOutputKgs || 0), 0);
  };

  const hasTransferableHighGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredHighGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) &&
          (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredHighGrade = true;
        }
      });
    });

    return hasUntransferredHighGrade;
  };

  const hasTransferableLowGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredLowGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.LOW.includes(grade) &&
          (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredLowGrade = true;
        }
      });
    });

    return hasUntransferredLowGrade;
  };

  return (
    <div className="container-fluid py-4">

      {/* Transfer Modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
        <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
          <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
            <Modal.Title>
              {transferMode === 'HIGH' ? 'Transfer High Grades' :
                transferMode === 'LOW' ? 'Transfer Low Grades' :
                  'Transfer Coffee'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBatches.length === 0 ? (
              <Alert variant="warning">No batches selected for transfer</Alert>
            ) : (
              <>
                <Alert variant="info">
                  You are about to transfer coffee from {selectedBatches.length} batch(es).
                  <br />
                  Total KGs: <strong>{totalSelectedKgs.toFixed(2)} kg</strong>
                </Alert>

                <h5>Transport Details</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="truckNumber">
                      <Form.Label>Truck Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="truckNumber"
                        placeholder="Enter truck number"
                        value={transportDetails.truckNumber}
                        onChange={handleTransportDetailsChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a truck number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="driverName">
                      <Form.Label>Driver Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="driverName"
                        placeholder="Enter driver name"
                        value={transportDetails.driverName}
                        onChange={handleTransportDetailsChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a driver name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="driverPhone">
                      <Form.Label>Driver Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="driverPhone"
                        placeholder="Enter driver phone"
                        value={transportDetails.driverPhone}
                        onChange={handleTransportDetailsChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a driver phone number.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="notes">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="notes"
                        placeholder="Enter any notes"
                        value={transportDetails.notes}
                        onChange={handleTransportDetailsChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Search batches..."
                    value={modalBatchSearch}
                    onChange={(e) => setModalBatchSearch(e.target.value)}
                  />
                </InputGroup>

                <Tabs
                  id="grade-tabs"
                  activeKey={activeGradeTab}
                  onSelect={(k) => setActiveGradeTab(k)}
                  className="mb-3"
                >
                  {/* Only show the high grade tab if we're transferring high grades */}
                  {(transferMode === 'HIGH' || transferMode === 'BOTH') && (
                    <Tab eventKey="high" title="High Grades">
                      {selectedBatches
                        .filter(batch => batch.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                        .map(batchKey => {
                          // Get all available grades for this batch
                          const availableGradeSet = {};
                          const batchRecords = groupedRecords[batchKey] || [];

                          batchRecords.forEach(record => {
                            Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
                              const kgValue = parseFloat(kg) || 0;
                              // Only include high grades that haven't been transferred and have kg > 0
                              if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) &&
                                (!record.transferredGrades || !record.transferredGrades[grade])) {
                                if (!availableGradeSet[grade]) {
                                  availableGradeSet[grade] = 0;
                                }
                                availableGradeSet[grade] += kgValue;
                              }
                            });
                          });

                          const highGrades = Object.entries(availableGradeSet);

                          if (highGrades.length === 0) return null;

                          return (
                            <Card key={`high-${batchKey}`} className="mb-3">
                              <Card.Header>
                                <strong>{batchKey}</strong>
                              </Card.Header>
                              <Card.Body>
                                {highGrades.map(([grade, kg]) => (
                                  <div key={`${batchKey}-${grade}`} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <Badge
                                        bg="sucafina"
                                        className="p-2"
                                        style={{ backgroundColor: processingTheme.primary }}
                                      >
                                        {grade}: {kg.toFixed(2)} kg
                                      </Badge>
                                      <Form.Check
                                        type="checkbox"
                                        hidden
                                        checked={selectedGrades[grade] !== false} // Default to true if undefined
                                        onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                                      />
                                    </div>

                                    {selectedGrades[grade] !== false && (
                                      <Row>
                                        <Col md={4}>
                                          <Form.Group controlId={`${batchKey}-${grade}-bags`}>
                                            <Form.Label>Number of Bags</Form.Label>
                                            <Form.Control
                                              type="number"
                                              min="1"
                                              placeholder="Enter number of bags"
                                              value={gradeQualityDetails[batchKey]?.[grade]?.numberOfBags || ''}
                                              onChange={(e) => handleQualityDetailsChange(batchKey, grade, 'numberOfBags', e.target.value)}
                                              required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                              Please provide the number of bags.
                                            </Form.Control.Feedback>
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group controlId={`${batchKey}-${grade}-cupProfile`}>
                                            <Form.Label>Cup Profile</Form.Label>
                                            <Form.Select
                                              value={gradeQualityDetails[batchKey]?.[grade]?.cupProfile || CUP_PROFILES[0]}
                                              onChange={(e) => handleQualityDetailsChange(batchKey, grade, 'cupProfile', e.target.value)}
                                              required
                                            >
                                              {CUP_PROFILES.map(profile => (
                                                <option key={profile} value={profile}>{profile}</option>
                                              ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                              Please select a cup profile.
                                            </Form.Control.Feedback>
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group controlId={`${batchKey}-${grade}-moisture`}>
                                            <Form.Label>Moisture Content (%)</Form.Label>
                                            <Form.Control
                                              type="number"
                                              min="0"
                                              max="20"
                                              step="0.1"
                                              placeholder="Enter moisture %"
                                              value={gradeQualityDetails[batchKey]?.[grade]?.moistureContent || ''}
                                              onChange={(e) => handleQualityDetailsChange(batchKey, grade, 'moistureContent', e.target.value)}
                                              required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                              Please provide the moisture content.
                                            </Form.Control.Feedback>
                                          </Form.Group>
                                        </Col>
                                      </Row>
                                    )}
                                  </div>
                                ))}
                              </Card.Body>
                            </Card>
                          );
                        })}
                    </Tab>
                  )}

                  {/* Only show the low grade tab if we're transferring low grades */}
                  {(transferMode === 'LOW' || transferMode === 'BOTH') && (
                    <Tab eventKey="low" title="Low Grades">
                      {selectedBatches
                        .filter(batch => batch.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                        .map(batchKey => {
                          // Get all available grades for this batch
                          const availableGradeSet = {};
                          const batchRecords = groupedRecords[batchKey] || [];

                          batchRecords.forEach(record => {
                            Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
                              const kgValue = parseFloat(kg) || 0;
                              // Only include low grades that haven't been transferred and have kg > 0
                              if (kgValue > 0 && GRADE_GROUPS.LOW.includes(grade) &&
                                (!record.transferredGrades || !record.transferredGrades[grade])) {
                                if (!availableGradeSet[grade]) {
                                  availableGradeSet[grade] = 0;
                                }
                                availableGradeSet[grade] += kgValue;
                              }
                            });
                          });

                          const lowGrades = Object.entries(availableGradeSet);

                          if (lowGrades.length === 0) return null;

                          return (
                            <Card key={`low-${batchKey}`} className="mb-3">
                              <Card.Header>
                                <strong>{batchKey}</strong>
                              </Card.Header>
                              <Card.Body>
                                {lowGrades.map(([grade, kg]) => (
                                  <div key={`${batchKey}-${grade}`} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <Badge
                                        bg="sucafina"
                                        className="p-2"
                                        style={{ backgroundColor: '#008080' }}
                                      >
                                        {grade}: {kg.toFixed(2)} kg
                                      </Badge>
                                      <Form.Check
                                        type="checkbox"
                                        hidden
                                        checked={selectedGrades[grade] !== false} // Default to true if undefined
                                        onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                                      />
                                    </div>

                                    {selectedGrades[grade] !== false && (
                                      <Row>
                                        <Col md={6}>
                                          <Form.Group controlId={`${batchKey}-${grade}-bags`}>
                                            <Form.Label>Number of Bags</Form.Label>
                                            <Form.Control
                                              type="number"
                                              min="1"
                                              placeholder="Enter number of bags"
                                              value={gradeQualityDetails[batchKey]?.[grade]?.numberOfBags || ''}
                                              onChange={(e) => handleQualityDetailsChange(batchKey, grade, 'numberOfBags', e.target.value)}
                                              required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                              Please provide the number of bags.
                                            </Form.Control.Feedback>
                                          </Form.Group>
                                        </Col>
                                      </Row>
                                    )}
                                  </div>
                                ))}
                              </Card.Body>
                            </Card>
                          );
                        })}
                    </Tab>
                  )}
                </Tabs>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}>
              Confirm Transfer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>


      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <span className="h5" style={{ color: processingTheme.primary }}>
            Transport to HQ
          </span>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-8">
              {/* Selected Batches Section */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Selected Batches ({selectedBatches.length})</strong>
                  {selectedBatches.length > 0 && (
                    <Button variant="outline-danger" size="sm" onClick={() => setSelectedBatches([])}>
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="selected-batches-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                  {selectedBatches.length === 0 ? (
                    <div className="text-muted">No batches selected</div>
                  ) : (
                    <div className="d-flex flex-wrap">
                      {selectedBatches.map(batchKey => (
                        <Badge key={batchKey} bg={processingTheme.neutral} className="me-2 mb-2 p-2 bg-sucafina">
                          {batchKey} ({(calculateOverallOutputKgs(batchKey) || 0).toFixed(2)} kg)
                          <Button size="sm" variant="link" className="p-0 ms-1" onClick={() => handleBatchSelectionChange(batchKey, false)} style={{ color: 'white' }}>
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <Card style={{ backgroundColor: processingTheme.neutral }}>
                <Card.Body>
                  <h5>Transfer Summary</h5>
                  <p><strong>Selected Batches:</strong> {selectedBatches.length}</p>
                  <p><strong>Selected Grades:</strong> {Object.entries(selectedGrades).filter(([_, isSelected]) => isSelected).length}</p>

                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>High Grades (A0, A1):</strong></span>
                    <span>{getGradeGroupTotal('HIGH').toFixed(2)} kg</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span><strong>Low Grades (A2-B2):</strong></span>
                    <span>{getGradeGroupTotal('LOW').toFixed(2)} kg</span>
                  </div>

                  <div className="d-flex justify-content-between mb-3" style={{ fontWeight: 'bold' }}>
                    <span>Total KGs:</span>
                    <span>{totalSelectedKgs.toFixed(2)} kg</span>
                  </div>

                  <div className="d-grid gap-2">
                    <div className="d-flex gap-2">
                      <Button
                        className="flex-grow-1"
                        variant="outline-sucafina"
                        disabled={selectedBatches.length === 0 || !selectedBatches.some(batchKey => hasTransferableHighGrades(batchKey))}
                        onClick={() => handleTransferClick('HIGH')}
                        style={{ color: processingTheme.primary, borderColor: processingTheme.primary }}
                      >
                        High Grades Only
                      </Button>
                      <Button
                        className="flex-grow-1"
                        variant="outline-secondary"
                        disabled={selectedBatches.length === 0 || !selectedBatches.some(batchKey => hasTransferableLowGrades(batchKey))}
                        onClick={() => handleTransferClick('LOW')}
                      >
                        Low Grades Only
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>




      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card>
          <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="h5" style={{ color: processingTheme.primary }}>Untransferred Batches</span>
              <div className="d-flex">
                <InputGroup>
                  <Form.Control
                    placeholder="Search by batch number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="me-2"
                    style={{ maxWidth: '250px' }}
                  />
                </InputGroup>
              </div>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th width="10%">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={(e) => handleSelectAllBatches(e.target.checked)}
                          id="selectAllCheckbox"
                        />
                        <label className="form-check-label" htmlFor="selectAllCheckbox">
                          Select All
                        </label>
                      </div>
                    </th>
                    <th width="20%">Batch No</th>
                    <th width="20%">Processing Type</th>
                    <th width="20%">Output KGs</th>
                    <th width="30%">Available Grades</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedBatches().map((batchKey) => {
                    const records = groupedRecords[batchKey] || [];
                    const isExpanded = expandedBatches[batchKey] || false;
                    const totalInputKgs = calculateOverallTotalKgs(batchKey);
                    const totalOutputKgs = calculateOverallOutputKgs(batchKey);
                    const overallOutturn = calculateOutturn(totalInputKgs, { all: totalOutputKgs });
                    const cwsName = (records[0]?.cwsName) || 'N/A';
                    const processingTypes = getUniqueProcessingTypes(records);
                    const isSelected = selectedBatches.includes(batchKey);

                    return (
                      <React.Fragment key={batchKey}>
                        <tr className={isSelected ? 'table-success' : ''}>
                          <td className="align-middle">
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleBatchSelectionChange(batchKey, e.target.checked)}
                            />
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center">
                              <Button
                                variant="link"
                                className="p-0 me-2"
                                onClick={() => toggleBatchExpansion(batchKey)}
                                style={{ color: processingTheme.primary }}
                              >
                                {isExpanded ? '▼' : '►'}
                              </Button>
                              <span>{batchKey}</span>
                            </div>
                          </td>
                          <td className="align-middle">{processingTypes}</td>
                          <td className="align-middle">{totalOutputKgs.toFixed(2)} kg</td>
                          <td className="align-middle">
                            <div className="d-flex flex-wrap gap-1">
                              {renderAvailableGrades(batchKey)}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && records.map((record, idx) => (
                          <tr key={`${batchKey}-detail-${idx}`} className="table-light">
                            <td colSpan="5" className="py-3">
                              <div className="px-4">
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="mb-2">
                                      <strong>Total Output KGs:</strong> {record.totalOutputKgs?.toFixed(2) || '0.00'} kg
                                    </div>
                                    <div className="mb-2">
                                      <strong>Batch No:</strong> {record.batchNo}
                                    </div>
                                    <div className="mb-2">
                                      <strong>Processing Type:</strong> {record.processingType}
                                    </div>
                                  </div>
                                  <div className="col-md-8">
                                    <div className="mb-2">
                                      <strong>Grades:</strong>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                      {renderOutputKgs(record.outputKgs, record.transferredGrades)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {getPaginatedBatches().length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-3">No untransferred batches found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                Showing {(currentPage - 1) * batchesPerPage + 1} to {Math.min(currentPage * batchesPerPage, getFilteredBatches().length)} of {getFilteredBatches().length} batches
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                </li>
                {[...Array(Math.ceil(getFilteredBatches().length / batchesPerPage))].map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(idx + 1)}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage >= Math.ceil(getFilteredBatches().length / batchesPerPage) ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </div>
          </Card.Footer>
        </Card>
      )}


    </div>
  );
};
const LoadingSkeleton = () => {
  const placeholderStyle = {
    opacity: 0.4,
    backgroundColor: processingTheme.secondary
  };

  return (
    <Card>
      <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
        <Placeholder as="h2" animation="glow">
          <Placeholder xs={4} style={placeholderStyle} />
        </Placeholder>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                {['Batch No', 'Processing Type', 'Output KGs', 'Total Output KGs', 'CWS', 'Date', 'Status'].map((header) => (
                  <th key={header}>
                    <Placeholder animation="glow">
                      <Placeholder xs={6} style={placeholderStyle} />
                    </Placeholder>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  {[...Array(9)].map((_, cellIdx) => (
                    <td key={cellIdx}>
                      <Placeholder animation="glow">
                        <Placeholder xs={6} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Transfer;