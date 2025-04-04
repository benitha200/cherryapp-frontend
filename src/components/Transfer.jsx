
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Accordion } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// const processingTheme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
// };

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
//                 {['Batch No', 'Processing Type', 'Total KGs', 'Output KGs', 'Total Output KGs', 'CWS', 'Date', 'Status'].map((header) => (
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

//   useEffect(() => {
//     fetchUntransferredRecords();
//   }, []);

//   useEffect(() => {
//     // Extract all available grades from selected batches
//     const grades = {};
//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];
//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs).forEach(([grade, kg]) => {
//           if (!grades[grade]) {
//             grades[grade] = true;
//           }
//         });
//       });
//     });
//     setAvailableGrades(Object.keys(grades));

//     // Initialize selected grades if not already set
//     const newSelectedGrades = {};
//     Object.keys(grades).forEach(grade => {
//       if (!selectedGrades[grade]) {
//         newSelectedGrades[grade] = true;
//       }
//     });

//     setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));

//     // Calculate total selected KGs
//     calculateTotalSelectedKgs();
//   }, [selectedBatches, groupedRecords]);

//   // Calculate total KGs whenever selected batches or grades change
//   useEffect(() => {
//     calculateTotalSelectedKgs();
//   }, [selectedBatches, selectedGrades]);

//   // Update selectAllChecked when all visible batches are selected
//   useEffect(() => {
//     const visibleBatches = getFilteredBatches();
//     const allSelected = visibleBatches.length > 0 &&
//       visibleBatches.every(batch => selectedBatches.includes(batch));
//     setSelectAllChecked(allSelected);
//   }, [selectedBatches, searchTerm, currentPage]);

//   const calculateTotalSelectedKgs = () => {
//     let total = 0;
//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];
//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs).forEach(([grade, kg]) => {
//           if (selectedGrades[grade]) {
//             total += parseFloat(kg);
//           }
//         });
//       });
//     });
//     setTotalSelectedKgs(total);
//   };

//   const fetchUntransferredRecords = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
//       // Filter records with empty transfers array
//       const untransferred = response.data.filter(record => record.transfers.length === 0);

//       // Group records by base batch number (ignoring suffixes like A, B, -1, -2)
//       const grouped = untransferred.reduce((acc, record) => {
//         const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, ''); // Remove suffixes
//         if (!acc[baseBatchNo]) {
//           acc[baseBatchNo] = [];
//         }
//         acc[baseBatchNo].push(record);
//         return acc;
//       }, {});

//       setGroupedRecords(grouped);
//       setLoading(false);
//     } catch (error) {
//       setError('Error fetching untransferred records');
//       setLoading(false);
//     }
//   };

//   const handleBatchSelectionChange = (batchKey, isSelected) => {
//     if (isSelected) {
//       setSelectedBatches(prev => [...prev, batchKey]);
//     } else {
//       setSelectedBatches(prev => prev.filter(key => key !== batchKey));
//     }
//   };

//   const handleBatchToggleExpand = (batchKey, e) => {
//     e.stopPropagation();
//     setExpandedBatches(prev => ({
//       ...prev,
//       [batchKey]: !prev[batchKey]
//     }));
//   };

//   const handleSelectAllBatches = (isSelected) => {
//     const visibleBatches = getFilteredBatches();

//     if (isSelected) {
//       setSelectedBatches(prev => {
//         const newSelection = [...prev];
//         visibleBatches.forEach(batch => {
//           if (!newSelection.includes(batch)) {
//             newSelection.push(batch);
//           }
//         });
//         return newSelection;
//       });
//     } else {
//       setSelectedBatches(prev => prev.filter(batch => !visibleBatches.includes(batch)));
//     }

//     setSelectAllChecked(isSelected);
//   };

//   const handleGradeSelectionChange = (grade, isSelected) => {
//     setSelectedGrades(prev => ({
//       ...prev,
//       [grade]: isSelected
//     }));
//   };

//   const handleTransferClick = () => {
//     setShowTransferModal(true);
//   };

//   const handleTransferConfirm = async () => {
//     try {
//       // Collect all records to transfer based on selected batches and grades
//       const recordsToTransfer = [];

//       selectedBatches.forEach(batchKey => {
//         const batchRecords = groupedRecords[batchKey];
//         batchRecords.forEach(record => {
//           // Create a modified version of outputKgs with only selected grades
//           const filteredOutputKgs = {};
//           let hasSelectedGrades = false;

//           Object.entries(record.outputKgs).forEach(([grade, kg]) => {
//             if (selectedGrades[grade]) {
//               filteredOutputKgs[grade] = kg;
//               hasSelectedGrades = true;
//             }
//           });

//           // Only include this record if it has selected grades
//           if (hasSelectedGrades) {
//             recordsToTransfer.push({
//               ...record,
//               outputKgs: filteredOutputKgs
//             });
//           }
//         });
//       });

//       // Create transfer records for all selected processing types and grades
//       await Promise.all(recordsToTransfer.map(record =>
//         axios.post(`${API_URL}/transfer`, {
//           baggingOffId: record.id,
//           batchNo: record.batchNo,
//           date: new Date().toISOString(),
//           outputKgs: record.outputKgs // Only transfer selected grades
//         })
//       ));

//       await fetchUntransferredRecords();
//       setSelectedBatches([]);
//       setSelectedGrades({});
//       setShowTransferModal(false);
//       alert('Transfer completed successfully');
//     } catch (error) {
//       console.error('Transfer error:', error);
//       alert('Failed to complete transfer');
//     }
//   };

//   const renderOutputKgs = (outputKgs, isExpanded = false) => {
//     // If not expanded, sum up all grades
//     if (!isExpanded) {
//       const totalsByGrade = Object.entries(outputKgs)
//         .reduce((acc, [grade, kg]) => {
//           // Convert to number, handling empty strings
//           const numKg = kg === "" ? 0 : parseFloat(kg);
//           return {
//             ...acc,
//             [grade]: (acc[grade] || 0) + numKg
//           };
//         }, {});

//       return Object.entries(totalsByGrade)
//         .filter(([_, total]) => total > 0)
//         .map(([grade, total]) => (
//           <div key={grade} className="small">
//             {grade}: {total.toFixed(2)} kg
//           </div>
//         ));
//     }

//     // If expanded, show individual record output
//     return Object.entries(outputKgs)
//       .filter(([_, kg]) => kg !== "" && parseFloat(kg) > 0)
//       .map(([grade, kg]) => (
//         <div key={grade} className="small">
//           {grade}: {parseFloat(kg).toFixed(2)} kg
//         </div>
//       ));
//   };


//   const calculateOutturn = (records) => {
//     const uniqueProcessingIds = [...new Set(records.map(record => record.processingId))];

//     const totalProcessingKgs = uniqueProcessingIds.reduce((sum, processingId) => {
//       const record = records.find(r => r.processingId === processingId);
//       return sum + record.processing.totalKgs;
//     }, 0);

//     const totalOutputKgs = records.reduce((sum, record) => {
//       return sum + record.totalOutputKgs;
//     }, 0);

//     return totalProcessingKgs > 0 ? ((totalOutputKgs / totalProcessingKgs) * 100).toFixed(2) : 'N/A';
//   };



//   const getUniqueProcessingTypes = (records) => {
//     const uniqueTypes = [...new Set(records.map(record => record.processingType))];
//     return uniqueTypes.map(type => (
//       <div key={type} className="small">
//         {type}
//       </div>
//     ));
//   };



//   // Get total KGs per grade for selected batches
//   const getGradeTotals = () => {
//     const totals = {};

//     selectedBatches.forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];
//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs).forEach(([grade, kg]) => {
//           if (!totals[grade]) {
//             totals[grade] = 0;
//           }
//           totals[grade] += parseFloat(kg);
//         });
//       });
//     });

//     return totals;
//   };

//   // Filter batches based on search term
//   const getFilteredBatches = () => {
//     return Object.keys(groupedRecords).filter(batchKey => {
//       // Search in the batch number
//       if (batchKey.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return true;
//       }

//       // Search in sub-batch numbers
//       const subBatches = groupedRecords[batchKey].map(record => record.batchNo);
//       if (subBatches.some(subBatch => subBatch.toLowerCase().includes(searchTerm.toLowerCase()))) {
//         return true;
//       }

//       // Search in processing types
//       const processingTypes = [...new Set(groupedRecords[batchKey].map(record => record.processingType))];
//       if (processingTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))) {
//         return true;
//       }

//       // Search in grades
//       for (const record of groupedRecords[batchKey]) {
//         const grades = Object.keys(record.outputKgs);
//         if (grades.some(grade => grade.toLowerCase().includes(searchTerm.toLowerCase()))) {
//           return true;
//         }
//       }

//       return false;
//     });
//   };

//   // Get paginated batches
//   const getPaginatedBatches = () => {
//     const filteredBatches = getFilteredBatches();
//     const indexOfLastBatch = currentPage * batchesPerPage;
//     const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
//     return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
//   };

//   // Handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   if (loading) return <LoadingSkeleton />;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   const filteredBatches = getFilteredBatches();
//   const paginatedBatches = getPaginatedBatches();
//   const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);
//   const gradeTotals = getGradeTotals();

//   return (
//     <div className="container-fluid py-4">
//       {/* New Transfer Panel at the top */}
//       <Card className="mb-4">
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <span className="h5" style={{ color: processingTheme.primary }}>
//             Transport to HQ
//           </span>
//         </Card.Header>
//         <Card.Body>
//           <div className="row">
//             <div className="col-md-8">
//               <div className="mb-3">
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <strong>Selected Batches ({selectedBatches.length})</strong>
//                   {selectedBatches.length > 0 && (
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => setSelectedBatches([])}
//                     >
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
//                         <Badge
//                           key={batchKey}
//                           bg={processingTheme.neutral}
//                           className="me-2 mb-2 p-2 bg-sucafina"
//                         // style={{ backgroundColor: processingTheme.primary }}
//                         >
//                           {batchKey} ({groupedRecords[batchKey].reduce((sum, r) => sum + r.totalOutputKgs, 0).toFixed(2)} kg)
//                           <Button
//                             size="sm"
//                             variant="link"
//                             className="p-0 ms-1"
//                             onClick={() => handleBatchSelectionChange(batchKey, false)}
//                             style={{ color: 'white' }}
//                           >
//                             ×
//                           </Button>
//                         </Badge>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {selectedBatches.length > 0 && (
//                 <div className="mb-3">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <strong>Selected Grades</strong>
//                     <div>
//                       <Button
//                         variant="outline-sucafina"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => {
//                           const allSelected = Object.values(selectedGrades).every(value => value);
//                           const newSelectedGrades = {};
//                           availableGrades.forEach(grade => {
//                             newSelectedGrades[grade] = !allSelected;
//                           });
//                           setSelectedGrades(newSelectedGrades);
//                         }}
//                         style={{ borderColor: processingTheme.primary, color: processingTheme.primary }}
//                       >
//                         {Object.values(selectedGrades).every(value => value) ? 'Deselect All' : 'Select All'}
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="grades-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
//                     <div className="row">
//                       {availableGrades.map((grade) => (
//                         <div className="col-md-4 col-6 mb-2" key={grade}>
//                           <Form.Check
//                             type="checkbox"
//                             id={`grade-${grade}`}
//                             label={`${grade} (${gradeTotals[grade]?.toFixed(2) || 0} kg)`}
//                             checked={selectedGrades[grade] || false}
//                             onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="col-md-4">
//               <Card style={{ backgroundColor: processingTheme.neutral }}>
//                 <Card.Body>
//                   <h5>Transfer Summary</h5>
//                   <p><strong>Selected Batches:</strong> {selectedBatches.length}</p>
//                   <p><strong>Selected Grades:</strong> {Object.entries(selectedGrades).filter(([_, isSelected]) => isSelected).length}</p>
//                   <p><strong>Total KGs:</strong> {totalSelectedKgs.toFixed(2)} kg</p>

//                   {totalSelectedKgs > 10000 && (
//                     <Alert variant="danger">
//                       The total exceeds the 10,000 kg transfer limit
//                     </Alert>
//                   )}

//                   <div className="d-grid gap-2">
//                     <Button
//                       variant="primary"
//                       disabled={selectedBatches.length === 0 || totalSelectedKgs === 0 || totalSelectedKgs > 10000}
//                       onClick={handleTransferClick} // Add this onClick handler
//                       style={{
//                         backgroundColor: processingTheme.primary,
//                         borderColor: processingTheme.primary
//                       }}
//                     >
//                       Transport to HQ
//                     </Button>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>

//       {/* Batches Table */}
//       <Card>
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center">
//             <span className="h5" style={{ color: processingTheme.primary }}>
//               Available Batches for Transfer ({Object.keys(groupedRecords).length})
//             </span>
//             <div className="d-flex">
//               <Form.Select
//                 size="sm"
//                 className="me-2"
//                 style={{ width: 'auto' }}
//               >
//                 <option value={10}>10 per page</option>
//                 <option value={25}>25 per page</option>
//                 <option value={50}>50 per page</option>
//               </Form.Select>
//               <InputGroup size="sm" className="mb-3">
//                 <Form.Control
//                   placeholder="Search batches..."
//                   value={modalBatchSearch}
//                   onChange={(e) => setModalBatchSearch(e.target.value)}
//                 />
//                 {modalBatchSearch && (
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setModalBatchSearch('')}
//                   >
//                     ×
//                   </Button>
//                 )}
//               </InputGroup>
//             </div>
//           </div>
//         </Card.Header>
//         <Card.Body className="p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead style={{ backgroundColor: processingTheme.neutral, position: 'sticky', top: 0, zIndex: 1 }}>
//                 <tr>
//                   <th style={{ width: '30px', position: 'sticky', left: 0, backgroundColor: processingTheme.neutral, zIndex: 2 }}>
//                     <Form.Check
//                       type="checkbox"
//                       checked={selectAllChecked}
//                       onChange={(e) => setSelectAllChecked(e.target.checked)}
//                       title="Select All Visible Batches"
//                     />
//                   </th>
//                   <th style={{ position: 'sticky', left: '30px', backgroundColor: processingTheme.neutral, zIndex: 2 }}>Batch No</th>
//                   <th>Processing Types</th>
//                   <th>Total Processing KGs</th>
//                   <th style={{ minWidth: '180px' }}>Output KGs</th>
//                   <th>Total Output KGs</th>
//                   <th>Outturn</th>
//                   <th>CWS</th>
//                   <th>Date</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.keys(groupedRecords).map((baseBatchNo) => {
//                   const records = groupedRecords[baseBatchNo];
//                   const isExpanded = expandedBatches[baseBatchNo];
//                   const isSelected = selectedBatches.includes(baseBatchNo);

//                   const aggregatedOutputKgs = records.reduce((acc, record) => {
//                     Object.entries(record.outputKgs).forEach(([grade, kg]) => {
//                       const numKg = kg === "" ? 0 : parseFloat(kg);
//                       acc[grade] = (acc[grade] || 0) + numKg;
//                     });
//                     return acc;
//                   }, {});

//                   // Total output KGs
//                   const totalOutputKgs = records.reduce((sum, record) => sum + record.totalOutputKgs, 0);

//                   return (
//                     <React.Fragment key={baseBatchNo}>
//                       <tr
//                         className={isSelected ? 'table-active' : ''}
//                         onClick={() => handleBatchSelectionChange(baseBatchNo, !isSelected)}
//                         style={{ cursor: 'pointer' }}
//                       >
//                         <td style={{ position: 'sticky', left: 0, backgroundColor: isSelected ? '#e2e6ea' : 'white' }}>
//                           <Form.Check
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={(e) => e.stopPropagation()}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleBatchSelectionChange(baseBatchNo, !isSelected);
//                             }}
//                           />
//                         </td>
//                         <td style={{ position: 'sticky', left: '30px', backgroundColor: isSelected ? '#e2e6ea' : 'white' }}>
//                           <div className="d-flex align-items-center">
//                             <div>
//                               <strong>{baseBatchNo}</strong>
//                               <div className="small text-muted">
//                                 {records.length > 1 ? `${records.length} sub-batches` : '1 sub-batch'}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td>
//                           {getUniqueProcessingTypes(records)}
//                         </td>
//                         <td>
//                           {(() => {
//                             // Get unique processing IDs
//                             const uniqueProcessingIds = [...new Set(records.map(record => record.processingId))];

//                             // Sum up total KGs from each unique processing
//                             const totalProcessingKgs = uniqueProcessingIds.reduce((sum, processingId) => {
//                               const record = records.find(r => r.processingId === processingId);
//                               return sum + record.processing.totalKgs;
//                             }, 0);

//                             return `${totalProcessingKgs.toFixed(2)} kg`;
//                           })()}
//                         </td>
//                         <td>
//                           {Object.entries(aggregatedOutputKgs)
//                             .filter(([_, kg]) => kg > 0)
//                             .map(([grade, kg]) => (
//                               <div key={grade} className="small">
//                                 {grade}: {kg.toFixed(2)} kg
//                               </div>
//                             ))}
//                         </td>
//                         <td>
//                           {totalOutputKgs.toFixed(1)} kg
//                         </td>
//                         <td>
//                           {calculateOutturn(records)}%
//                         </td>
//                         <td>{records[0].processing.cws.name}</td>
//                         <td>{new Date(records[0].date).toLocaleDateString()}</td>
//                         <td>
//                           <span
//                             className="badge"
//                             style={{
//                               backgroundColor: processingTheme.primary,
//                               color: 'white'
//                             }}
//                           >
//                             {records[0].status}
//                           </span>
//                         </td>
//                       </tr>

//                       {isExpanded && (
//                         <tr className="table-light">
//                           <td colSpan={10} className="p-0">
//                             <div className="p-3">
//                               <h6>Sub-batches</h6>
//                               <table className="table table-sm">
//                                 <thead>
//                                   <tr>
//                                     <th>Batch No</th>
//                                     <th>Processing Type</th>
//                                     <th>Total KGs</th>
//                                     <th>Output KGs</th>
//                                     <th>Total Output KGs</th>
//                                     <th>Date</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {records.map(record => (
//                                     <tr key={record.id}>
//                                       <td>{record.batchNo}</td>
//                                       <td>{record.processingType}</td>
//                                       <td>{record.processing.totalKgs.toFixed(2)} kg</td>
//                                       <td>
//                                         {Object.entries(record.outputKgs)
//                                           .filter(([_, kg]) => kg !== "" && parseFloat(kg) > 0)
//                                           .map(([grade, kg]) => (
//                                             <div key={grade} className="small">
//                                               {grade}: {parseFloat(kg).toFixed(2)} kg
//                                             </div>
//                                           ))}
//                                       </td>
//                                       <td>{record.totalOutputKgs.toFixed(2)} kg</td>
//                                       <td>{new Date(record.date).toLocaleDateString()}</td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </Card.Body>
//       </Card>

//       <Modal
//         show={showTransferModal}
//         onHide={() => setShowTransferModal(false)}
//         size="lg"
//         fullscreen="lg-down"
//       >
//         <Modal.Header
//           closeButton
//           style={{ backgroundColor: processingTheme.neutral }}
//         >
//           <Modal.Title style={{ color: processingTheme.primary }}>
//             Confirm Transfer
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-0">
//           <div className="container-fluid">
//             <div className="row">
//               {/* Left side - Batches */}
//               <div className="col-lg-6 p-3" style={{
//                 borderRight: `1px solid ${processingTheme.neutral}`,
//                 maxHeight: '70vh',
//                 overflowY: 'auto'
//               }}>
//                 <h5 style={{ color: processingTheme.primary }}>Selected Batches ({selectedBatches.length})</h5>

//                 <InputGroup size="sm" className="mb-3">
//                   <Form.Control
//                     placeholder="Search batches..."
//                     onChange={(e) => {
//                       // You can add batch search functionality here
//                       // This is just the UI component
//                     }}
//                   />
//                 </InputGroup>

//                 <div className="batch-list">
//                   {selectedBatches.length === 0 ? (
//                     <Alert variant="info" style={{ backgroundColor: processingTheme.neutral }}>
//                       No batches selected
//                     </Alert>
//                   ) : (
//                     <Accordion defaultActiveKey="0">
//                       {selectedBatches.map((batchKey, index) => (
//                         <Accordion.Item
//                           key={batchKey}
//                           eventKey={index.toString()}
//                           className="mb-2"
//                           style={{ borderColor: processingTheme.neutral }}
//                         >
//                           <Accordion.Header>
//                             <div className="d-flex justify-content-between align-items-center w-100 pe-3">
//                               <span>
//                                 <strong>{batchKey}</strong>
//                                 <span className="ms-2 badge" style={{
//                                   backgroundColor: processingTheme.secondary,
//                                   color: 'white'
//                                 }}>
//                                   {groupedRecords[batchKey].length} sub-batches
//                                 </span>
//                               </span>
//                               <span>
//                                 {groupedRecords[batchKey].reduce((sum, record) => sum + record.totalOutputKgs, 0).toFixed(2)} kg
//                               </span>
//                             </div>
//                           </Accordion.Header>
//                           <Accordion.Body style={{ backgroundColor: processingTheme.neutral, padding: '0.5rem' }}>
//                             <table className="table table-sm mb-0">
//                               <thead>
//                                 <tr>
//                                   <th>Sub-batch</th>
//                                   <th>Processing</th>
//                                   <th>KGs</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {groupedRecords[batchKey].map(record => (
//                                   <tr key={record.id}>
//                                     <td>{record.batchNo}</td>
//                                     <td>{record.processingType}</td>
//                                     <td>{record.totalOutputKgs.toFixed(2)} kg</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </Accordion.Body>
//                         </Accordion.Item>
//                       ))}
//                     </Accordion>
//                   )}
//                 </div>
//               </div>

//               {/* Right side - Grades and Summary */}
//               <div className="col-lg-6 p-3">
//                 {/* Grades section */}
//                 <div className="mb-4">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h5 style={{ color: processingTheme.primary }}>Selected Grades</h5>
//                     <Button
//                       variant="outline-sucafina"
//                       size="sm"
//                       onClick={() => {
//                         const allSelected = Object.values(selectedGrades).every(value => value);
//                         const newSelectedGrades = {};
//                         availableGrades.forEach(grade => {
//                           newSelectedGrades[grade] = !allSelected;
//                         });
//                         setSelectedGrades(newSelectedGrades);
//                       }}
//                     >
//                       {Object.values(selectedGrades).every(value => value) ? 'Deselect All' : 'Select All'}
//                     </Button>
//                   </div>

//                   <div style={{
//                     maxHeight: '200px',
//                     overflowY: 'auto',
//                     border: `1px solid ${processingTheme.neutral}`,
//                     borderRadius: '0.25rem'
//                   }}>
//                     <table className="table table-sm table-hover mb-0">
//                       <thead style={{
//                         position: 'sticky',
//                         top: 0,
//                         backgroundColor: processingTheme.neutral,
//                         zIndex: 1
//                       }}>
//                         <tr>
//                           <th style={{ width: '30px' }}></th>
//                           <th>Grade</th>
//                           <th className="text-end">Total KGs</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {Object.entries(gradeTotals).map(([grade, kg]) => (
//                           <tr key={grade}>
//                             <td>
//                               <Form.Check
//                                 type="checkbox"
//                                 checked={selectedGrades[grade] || false}
//                                 onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
//                               />
//                             </td>
//                             <td>{grade}</td>
//                             <td className="text-end">{kg.toFixed(2)} kg</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Transfer summary */}
//                 <Card style={{ backgroundColor: processingTheme.neutral }}>
//                   <Card.Body>
//                     <h5 style={{ color: processingTheme.primary }}>Transfer Summary</h5>

//                     <table className="table table-sm">
//                       <tbody>
//                         <tr>
//                           <td><strong>FROM:</strong></td>
//                           <td>{selectedBatches.length > 0 && groupedRecords[selectedBatches[0]][0].processing.cws.name}</td>
//                         </tr>
//                         <tr>
//                           <td><strong>TO:</strong></td>
//                           <td>RWACOF HQ</td>
//                         </tr>
//                         <tr>
//                           <td><strong>Date:</strong></td>
//                           <td>{new Date().toLocaleDateString()}</td>
//                         </tr>
//                         <tr style={{
//                           backgroundColor: processingTheme.secondary,
//                           color: 'white'
//                         }}>
//                           <td><strong>Total KGs:</strong></td>
//                           <td><strong>{totalSelectedKgs.toFixed(2)} kg</strong></td>
//                         </tr>
//                       </tbody>
//                     </table>

//                     {totalSelectedKgs > 10000 && (
//                       <Alert variant="danger" className="mb-3">
//                         <i className="fa fa-exclamation-triangle me-2"></i>
//                         The total exceeds the 10,000 kg transfer limit
//                       </Alert>
//                     )}
//                   </Card.Body>
//                 </Card>
//               </div>
//             </div>
//           </div>
//         </Modal.Body>
//         <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowTransferModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleTransferConfirm}
//             disabled={selectedBatches.length === 0 || totalSelectedKgs === 0 || totalSelectedKgs > 10000}
//             style={{
//               backgroundColor: processingTheme.primary,
//               borderColor: processingTheme.primary
//             }}
//           >
//             Confirm Transfer
//           </Button>
//         </Modal.Footer>
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

const CUP_PROFILES = ['C1', 'C2', 'S86', 'S87', 'S88'];

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
                {['Batch No', 'Processing Type', 'Total KGs', 'Output KGs', 'Total Output KGs', 'CWS', 'Date', 'Status'].map((header) => (
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

  const [transportDetails, setTransportDetails] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: '',
    numberOfBags: '',
    cupProfile: CUP_PROFILES[0],
    cupProfilePercentage: '',
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
  }, [selectedBatches, groupedRecords]);

  useEffect(() => {
    calculateTotalSelectedKgs();
  }, [selectedGrades, transferMode]);

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

      // Filter could be extended here for additional criteria
      // For example, filtering by processing type, status, etc.

      return true;
    });

    // Return all filtered batches
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
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
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
    const totals = getGradeTotals();

    return Object.entries(totals)
      .filter(([grade, _]) => GRADE_GROUPS[gradeGroup].includes(grade))
      .reduce((sum, [_, kg]) => sum + kg, 0);
  };

  const handleGradeSelectionChange = (grade, isSelected) => {
    setSelectedGrades(prev => ({
      ...prev,
      [grade]: isSelected
    }));
  };


  const fetchUntransferredRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
      const untransferred = response.data.filter(record => record.transfers.length === 0);

      const grouped = untransferred.reduce((acc, record) => {
        const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, '');
        if (!acc[baseBatchNo]) {
          acc[baseBatchNo] = [];
        }
        acc[baseBatchNo].push(record);
        return acc;
      }, {});

      setGroupedRecords(grouped);
      setLoading(false);
    } catch (error) {
      setError('Error fetching untransferred records');
      setLoading(false);
    }
  };

  const updateAvailableGrades = () => {
    const grades = {};
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          if (!grades[grade]) {
            grades[grade] = true;
          }
        });
      });
    });
    setAvailableGrades(Object.keys(grades));

    // Initialize selected grades if not already set
    const newSelectedGrades = {};
    Object.keys(grades).forEach(grade => {
      if (!selectedGrades[grade]) {
        newSelectedGrades[grade] = true;
      }
    });
    setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));
  };

  const calculateTotalSelectedKgs = () => {
    let total = 0;
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          // Only count if grade is selected and matches transfer mode
          if (selectedGrades[grade]) {
            if (transferMode === 'BOTH') {
              total += parseFloat(kg) || 0;
            } else if (transferMode === 'HIGH' && GRADE_GROUPS.HIGH.includes(grade)) {
              total += parseFloat(kg) || 0;
            } else if (transferMode === 'LOW' && GRADE_GROUPS.LOW.includes(grade)) {
              total += parseFloat(kg) || 0;
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

  const handleTransferConfirm = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const transferPromises = [];
      const commonDetails = {
        truckNumber: transportDetails.truckNumber,
        driverName: transportDetails.driverName,
        driverPhone: transportDetails.driverPhone,
        numberOfBags: parseInt(transportDetails.numberOfBags),
        cupProfile: transportDetails.cupProfile,
        cupProfilePercentage: parseInt(transportDetails.cupProfilePercentage),
        notes: transportDetails.notes
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
        numberOfBags: '',
        cupProfile: CUP_PROFILES[0],
        cupProfilePercentage: '',
        notes: ''
      });
      setShowTransferModal(false);
      setValidated(false);
      alert('Transfer completed successfully');
    } catch (error) {
      console.error('Transfer error:', error);
      alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
    }
  };

  const createGradeGroupTransfers = (gradeGroup) => {
    const transfers = [];

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey];
      const baseBatchNo = batchKey.replace(/[A-Za-z-]\d*$/, '');
      const suffix = gradeGroup === 'HIGH' ? '-HG' : '-LG';

      batchRecords.forEach(record => {
        const filteredOutputKgs = {};
        let hasGrades = false;

        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;
          if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS[gradeGroup].includes(grade)) {
            filteredOutputKgs[grade] = kgValue;
            hasGrades = true;
          }
        });

        if (hasGrades) {
          transfers.push({
            baggingOffId: record.id,
            batchNo: baseBatchNo + suffix,
            gradeGroup,
            date: new Date().toISOString(),
            outputKgs: filteredOutputKgs,
            ...transportDetails
          });
        }
      });
    });

    return transfers;
  };

  const renderGradeBadge = (grade, kg) => {
    const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
    const badgeColor = isHighGrade ? processingTheme.primary : '#6c757d';

    return (
      <div key={grade} className="small mb-1">
        <Badge bg={badgeColor} className="me-1">{grade}</Badge>
        <span>{kg.toFixed(2)} kg</span>
        {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
      </div>
    );
  };

  const renderOutputKgs = (outputKgs, isExpanded = false) => {
    const totalsByGrade = Object.entries(outputKgs)
      .reduce((acc, [grade, kg]) => {
        const numKg = kg === "" ? 0 : parseFloat(kg);
        return {
          ...acc,
          [grade]: (acc[grade] || 0) + numKg
        };
      }, {});

    return Object.entries(totalsByGrade)
      .filter(([_, total]) => total > 0)
      .map(([grade, total]) => renderGradeBadge(grade, total));
  };

  const calculateOutturn = (totalKgs, outputKgs) => {
    const totalOutputKgs = Object.values(outputKgs).reduce((sum, kg) => sum + (parseFloat(kg) || 0), 0);
    return totalKgs > 0 ? ((totalOutputKgs / totalKgs) * 100).toFixed(2) : '0.00';
  };

  const getUniqueProcessingTypes = (records) => {
    const types = new Set();
    records.forEach(record => types.add(record.processingType));
    return Array.from(types).join(', ');
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
    return groupedRecords[batchKey].reduce((sum, record) => sum + record.totalKgs, 0);
  };

  const calculateOverallOutputKgs = (batchKey) => {
    return groupedRecords[batchKey].reduce((sum, record) => sum + record.totalOutputKgs, 0);
  };

  return (
    <div className="container-fluid py-4">
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
                          {batchKey} ({groupedRecords[batchKey].reduce((sum, r) => sum + r.totalOutputKgs, 0).toFixed(2)} kg)
                          <Button size="sm" variant="link" className="p-0 ms-1" onClick={() => handleBatchSelectionChange(batchKey, false)} style={{ color: 'white' }}>
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Grades Section */}
              {selectedBatches.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Selected Grades</strong>
                    <div>
                      <Button
                        variant="outline-sucafina"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          const allSelected = Object.values(selectedGrades).every(value => value);
                          const newSelectedGrades = {};
                          availableGrades.forEach(grade => {
                            newSelectedGrades[grade] = !allSelected;
                          });
                          setSelectedGrades(newSelectedGrades);
                        }}
                        style={{ borderColor: processingTheme.primary, color: processingTheme.primary }}
                      >
                        {Object.values(selectedGrades).every(value => value) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                  </div>

                  <div className="grades-container mb-3" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                    <div className="d-flex mb-2">
                      <Badge bg="primary" className="me-2">High Grade: A0, A1</Badge>
                      <Badge bg="secondary">Low Grade: A2, A3, B1, B2</Badge>
                    </div>
                    <div className="row">
                      {availableGrades.map((grade) => {
                        const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
                        const badgeClass = isHighGrade ? "bg-primary" : "bg-secondary";
                        const gradeTotals = getGradeTotals();

                        return (
                          <div className="col-md-4 col-6 mb-2" key={grade}>
                            <Form.Check
                              type="checkbox"
                              id={`grade-${grade}`}
                              label={
                                <span>
                                  {grade} <Badge className={badgeClass} pill>{gradeTotals[grade]?.toFixed(2) || 0} kg</Badge>
                                </span>
                              }
                              checked={selectedGrades[grade] || false}
                              onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
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

                  {totalSelectedKgs > 10000 && (
                    <Alert variant="danger">
                      The total exceeds the 10,000 kg transfer limit
                    </Alert>
                  )}

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      disabled={selectedBatches.length === 0 || totalSelectedKgs === 0 || totalSelectedKgs > 10000}
                      onClick={() => handleTransferClick('BOTH')}
                      style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
                    >
                      Transfer All Grades
                    </Button>

                    <Button
                      variant="outline-primary"
                      disabled={selectedBatches.length === 0 || getGradeGroupTotal('HIGH') === 0}
                      onClick={() => handleTransferClick('HIGH')}
                    >
                      Transfer Only High Grades
                    </Button>

                    <Button
                      variant="outline-secondary"
                      disabled={selectedBatches.length === 0 || getGradeGroupTotal('LOW') === 0}
                      onClick={() => handleTransferClick('LOW')}
                    >
                      Transfer Only Low Grades
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Batches Table - The missing code */}
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5" style={{ color: processingTheme.primary }}>Available Batches</span>
            <div className="d-flex">
              <InputGroup className="me-2" style={{ width: '300px' }}>
                <Form.Control
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
              <Form.Select
                style={{ width: '100px' }}
                value={batchesPerPage}
                onChange={(e) => setBatchesPerPage(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr style={{ backgroundColor: processingTheme.neutral }}>
                    <th width="40">
                      <Form.Check
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(e) => handleSelectAllBatches(e.target.checked)}
                      />
                    </th>
                    <th>Batch No</th>
                    <th>Processing Type</th>
                    <th className="text-end">Total KGs</th>
                    <th className="text-center">Grades</th>
                    <th className="text-end">Total Output KGs</th>
                    <th className="text-end">Outturn %</th>
                    <th width="80"></th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedBatches().length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    getPaginatedBatches().map(batchKey => {
                      const batchRecords = groupedRecords[batchKey];
                      const isExpanded = expandedBatches[batchKey];
                      const totalKgs = calculateOverallTotalKgs(batchKey);
                      const totalOutputKgs = calculateOverallOutputKgs(batchKey);
                      const outturn = (totalOutputKgs / totalKgs * 100).toFixed(2);

                      // Combine output kgs from all batch records
                      const combinedOutputKgs = batchRecords.reduce((acc, record) => {
                        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
                          const numKg = parseFloat(kg) || 0;
                          acc[grade] = (acc[grade] || 0) + numKg;
                        });
                        return acc;
                      }, {});

                      return (
                        <React.Fragment key={batchKey}>
                          <tr style={{ backgroundColor: selectedBatches.includes(batchKey) ? processingTheme.tableHover : 'inherit' }}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedBatches.includes(batchKey)}
                                onChange={(e) => handleBatchSelectionChange(batchKey, e.target.checked)}
                              />
                            </td>
                            <td>
                              <strong>{batchKey}</strong>
                              {batchRecords.length > 1 && (
                                <Badge bg="light" text="dark" className="ms-2">
                                  {batchRecords.length} sub-batches
                                </Badge>
                              )}
                            </td>
                            <td>{getUniqueProcessingTypes(batchRecords)}</td>
                            <td className="text-end">{totalKgs.toFixed(2)}</td>
                            <td className="text-center">
                              <div className="d-flex flex-wrap justify-content-center">
                                {renderOutputKgs(combinedOutputKgs)}
                              </div>
                            </td>
                            <td className="text-end">{totalOutputKgs.toFixed(2)}</td>
                            <td className="text-end">{outturn}%</td>
                            <td>
                              {batchRecords.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => toggleBatchExpansion(batchKey)}
                                >
                                  {isExpanded ? 'Hide' : 'Details'}
                                </Button>
                              )}
                            </td>
                          </tr>
                          {isExpanded && batchRecords.map((record, idx) => (
                            <tr key={record.id} style={{ backgroundColor: '#f9f9f9' }}>
                              <td></td>
                              <td className="ps-4">{record.batchNo}</td>
                              <td>{record.processingType}</td>
                              <td className="text-end">{record.totalKgs.toFixed(2)}</td>
                              <td className="text-center">
                                <div className="d-flex flex-wrap justify-content-center">
                                  {renderOutputKgs(record.outputKgs)}
                                </div>
                              </td>
                              <td className="text-end">{record.totalOutputKgs.toFixed(2)}</td>
                              <td className="text-end">
                                {calculateOutturn(record.totalKgs, record.outputKgs)}%
                              </td>
                              <td></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {Math.min((currentPage - 1) * batchesPerPage + 1, getFilteredBatches().length)} to {Math.min(currentPage * batchesPerPage, getFilteredBatches().length)} of {getFilteredBatches().length} batches
            </div>
            <div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>

                  <Button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                </li>
                {Array.from({ length: Math.ceil(getFilteredBatches().length / batchesPerPage) }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  // Show limited page numbers with ellipsis
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(getFilteredBatches().length / batchesPerPage) ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <Button className="page-link" onClick={() => paginate(pageNumber)}>
                          {pageNumber}
                        </Button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={pageNumber} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                })}
                <li className={`page-item ${currentPage === Math.ceil(getFilteredBatches().length / batchesPerPage) ? 'disabled' : ''}`}>
                  <Button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(getFilteredBatches().length / batchesPerPage)}
                  >
                    Next
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Transfer Modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
          <Modal.Title>
            {transferMode === 'BOTH' && 'Transfer All Grades'}
            {transferMode === 'HIGH' && 'Transfer High Grades Only'}
            {transferMode === 'LOW' && 'Transfer Low Grades Only'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Truck Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="truckNumber"
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
                <Form.Group className="mb-3">
                  <Form.Label>Number of Bags <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfBags"
                    value={transportDetails.numberOfBags}
                    onChange={handleTransportDetailsChange}
                    required
                    min="1"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid number of bags.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Driver Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="driverName"
                    value={transportDetails.driverName}
                    onChange={handleTransportDetailsChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide the driver's name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Driver Phone <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="driverPhone"
                    value={transportDetails.driverPhone}
                    onChange={handleTransportDetailsChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide the driver's phone number.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cup Profile <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="cupProfile"
                    value={transportDetails.cupProfile}
                    onChange={handleTransportDetailsChange}
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cup Profile Percentage <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="cupProfilePercentage"
                      value={transportDetails.cupProfilePercentage}
                      onChange={handleTransportDetailsChange}
                      required
                      min="1"
                      max="100"
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid percentage (1-100).
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={transportDetails.notes}
                onChange={handleTransportDetailsChange}
              />
            </Form.Group>

            <Alert variant="info">
              <strong>Selected Batches:</strong> {selectedBatches.length}
              <br />
              <strong>Total KGs to Transfer:</strong>{' '}
              {transferMode === 'BOTH' && totalSelectedKgs.toFixed(2) + ' kg'}
              {transferMode === 'HIGH' && getGradeGroupTotal('HIGH').toFixed(2) + ' kg (High Grade)'}
              {transferMode === 'LOW' && getGradeGroupTotal('LOW').toFixed(2) + ' kg (Low Grade)'}
            </Alert>

            <div className="selected-batches mb-3">
              <Form.Label>Selected Batches:</Form.Label>
              <InputGroup className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Search batches..."
                  value={modalBatchSearch}
                  onChange={(e) => setModalBatchSearch(e.target.value)}
                />
              </InputGroup>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                {selectedBatches
                  .filter(batch => batch.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                  .map(batch => (
                    <Badge key={batch} bg="light" text="dark" className="me-2 mb-2 p-2">
                      {batch}
                    </Badge>
                  ))}
              </div>
            </div>

            <Tabs
              activeKey={activeGradeTab}
              onSelect={(k) => setActiveGradeTab(k)}
              className="mb-3"
            >
              <Tab eventKey="high" title="High Grade">
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th className="text-end">KGs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(getGradeTotals())
                        .filter(([grade, _]) => GRADE_GROUPS.HIGH.includes(grade))
                        .sort(([gradeA], [gradeB]) => gradeA.localeCompare(gradeB))
                        .map(([grade, kg]) => (
                          <tr key={grade}>
                            <td>{grade}</td>
                            <td className="text-end">{kg.toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>Total</th>
                        <th className="text-end">{getGradeGroupTotal('HIGH').toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Tab>
              <Tab eventKey="low" title="Low Grade">
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th className="text-end">KGs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(getGradeTotals())
                        .filter(([grade, _]) => GRADE_GROUPS.LOW.includes(grade))
                        .sort(([gradeA], [gradeB]) => gradeA.localeCompare(gradeB))
                        .map(([grade, kg]) => (
                          <tr key={grade}>
                            <td>{grade}</td>
                            <td className="text-end">{kg.toFixed(2)}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>Total</th>
                        <th className="text-end">{getGradeGroupTotal('LOW').toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
            >
              Confirm Transfer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Transfer;