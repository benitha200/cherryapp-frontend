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
  HIGH: ['A0', 'A1','N1','N2','H2'],
  LOW: ['A2', 'A3', 'B1', 'B2']
};

const Transport = () => {
  const [transferRecords, setTransferRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [expandedRecords, setExpandedRecords] = useState({});
  const [filterType, setFilterType] = useState('ALL');
  const [groupByEnabled, setGroupByEnabled] = useState(true); // Default to grouping enabled
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTransferRecords();
  }, []);

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

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const toggleGrouping = () => {
    setGroupByEnabled(!groupByEnabled);
    setCurrentPage(1);
  };

  const getFilteredRecords = () => {
    return transferRecords.filter(record => {
      // Filter by search term
      if (searchTerm && !record.batchNo.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by grade group
      if (filterType === 'HIGH' && record.gradeGroup !== 'HIGH') {
        return false;
      }
      if (filterType === 'LOW' && record.gradeGroup !== 'LOW') {
        return false;
      }
      
      return true;
    });
  };

  // Create consolidated records grouped by batchNo, date, and gradeGroup
  const getConsolidatedRecords = () => {
    const filteredRecords = getFilteredRecords();
    
    if (!groupByEnabled) {
      return filteredRecords;
    }
    
    const groupedMap = new Map();
    
    filteredRecords.forEach(record => {
      const date = new Date(record.transferDate).toLocaleDateString();
      const key = `${record.batchNo}_${date}_${record.gradeGroup}`;
      
      if (!groupedMap.has(key)) {
        // Create a new consolidated record as the base
        groupedMap.set(key, {
          ...record,
          // Special fields for consolidation
          originalRecords: [record],
          consolidatedKgs: calculateTotalKgs(record.outputKgs),
          consolidatedBags: record.numberOfBags || 0,
          isConsolidated: false
        });
      } else {
        // Update the existing consolidated record
        const existing = groupedMap.get(key);
        existing.originalRecords.push(record);
        existing.consolidatedKgs += calculateTotalKgs(record.outputKgs);
        existing.consolidatedBags += (record.numberOfBags || 0);
        existing.isConsolidated = true;
        
        // Merge outputKgs
        if (record.outputKgs) {
          Object.entries(record.outputKgs).forEach(([grade, kg]) => {
            if (!existing.outputKgs) existing.outputKgs = {};
            existing.outputKgs[grade] = (parseFloat(existing.outputKgs[grade] || 0) + parseFloat(kg)).toString();
          });
        }
        
        // Merge gradeDetails if available
        if (record.gradeDetails) {
          if (!existing.gradeDetails) existing.gradeDetails = {};
          Object.entries(record.gradeDetails).forEach(([grade, details]) => {
            if (!existing.gradeDetails[grade]) {
              existing.gradeDetails[grade] = { ...details };
            } else {
              // Merge details (bags count, etc.)
              existing.gradeDetails[grade].numberOfBags = 
                (parseInt(existing.gradeDetails[grade].numberOfBags || 0) + 
                parseInt(details.numberOfBags || 0)).toString();
            }
          });
        }
      }
    });
    
    return Array.from(groupedMap.values());
  };

  const getPaginatedRecords = () => {
    const consolidatedRecords = getConsolidatedRecords();
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return consolidatedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderGradeBadge = (grade, kg, isHighGrade) => {
    const badgeColor = isHighGrade ? processingTheme.primary : '#008080';

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
    const filteredData = getFilteredRecords();
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coffee_transfers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    // Define headers
    const headers = [
      'ID', 'Date', 'Batch No', 'Grade Group', 'Truck Number', 'Driver', 'Status',
      'Total KGs', 'Number of Bags', 'Cup Profile'
    ];
    
    // Create CSV rows
    const rows = data.map(record => {
      const totalKgs = calculateTotalKgs(record.outputKgs);
      
      return [
        record.id,
        new Date(record.transferDate).toLocaleDateString(),
        record.batchNo,
        record.gradeGroup,
        record.truckNumber,
        record.driverName,
        record.status,
        totalKgs.toFixed(2),
        record.numberOfBags,
        record.cupProfile || 'N/A'
      ].join(',');
    });
    
    // Combine headers and rows
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
              <div className="skeleton-cell" style={{ height: '20px', width: '20%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '30%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '20%', background: '#eee', marginRight: '10px' }}></div>
              <div className="skeleton-cell" style={{ height: '20px', width: '30%', background: '#eee' }}></div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  const calculateTotalKgs = (outputKgs) => {
    if (!outputKgs) return 0;
    return Object.values(outputKgs).reduce((sum, kg) => sum + parseFloat(kg || 0), 0);
  };

  return (
    <div className="container-fluid py-4">
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5" style={{ color: processingTheme.primary }}>Parchment Transport</span>
            <div className="d-flex">
              {/* <Button 
                variant={groupByEnabled ? "success" : "outline-success"}
                className="me-2"
                onClick={toggleGrouping}
              >
                <i className="bi bi-grid me-1"></i> {groupByEnabled ? "Grouped View" : "Detailed View"}
              </Button> */}
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
                      {/* <th width="5%"></th> */}
                      <th width="15%">Date</th>
                      <th width="15%">Batch No</th>
                      <th width="15%">Grade Group</th>
                      <th width="15%">Total KGs</th>
                      <th width="20%">Transport</th>
                      <th width="15%">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedRecords().map((record) => {
                      const isExpanded = expandedRecords[record.id] || false;
                      const totalKgs = record.isConsolidated ? record.consolidatedKgs : calculateTotalKgs(record.outputKgs);
                      const transferDate = new Date(record.transferDate).toLocaleDateString();
                      const recordCount = record.originalRecords ? record.originalRecords.length : 1;
                      
                      return (
                        <React.Fragment key={record.id}>
                          <tr className={record.isConsolidated ? "table-light" : ""}>
                            {/* <td className="align-middle">
                              <Button
                                variant="link"
                                className="p-0"
                                onClick={() => toggleRecordExpansion(record.id)}
                                style={{ color: processingTheme.primary }}
                              >
                                {isExpanded ? '▼' : '►'}
                              </Button>
                            </td> */}
                            <td className="align-middle">{transferDate}</td>
                            <td className="align-middle">
                              {record.batchNo}
                              {/* {record.isConsolidated && (
                                <Badge 
                                  bg="info" 
                                  pill 
                                  className="ms-2"
                                  title={`${recordCount} transfers consolidated`}
                                >
                                  {recordCount}
                                </Badge>
                              )} */}
                            </td>
                            <td className="align-middle">
                              <Badge
                                bg={record.gradeGroup === 'HIGH' ? 'sucafina' : 'secondary'}
                                style={{ 
                                  backgroundColor: record.gradeGroup === 'HIGH' ? processingTheme.primary : '#6c757d' 
                                }}
                              >
                                {record.gradeGroup}
                              </Badge>
                            </td>
                            <td className="align-middle">{totalKgs.toFixed(2)} kg</td>
                            <td className="align-middle">
                              <div className="small">
                                <div>Truck: {record.truckNumber}</div>
                                <div>Driver: {record.driverName}</div>
                              </div>
                            </td>
                            <td className="align-middle">
                              <Badge
                                bg={record.status === 'COMPLETED' ? 'success' : 'warning'}
                              >
                                {record.status}
                              </Badge>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="table-light">
                              <td colSpan="7" className="py-3">
                                <div className="px-4">
                                  {record.isConsolidated ? (
                                    <>
                                      <h6 className="mb-3">Consolidated Transfer Details ({recordCount} transfers)</h6>
                                      <Row>
                                        <Col md={6}>
                                          <div className="mb-2">
                                            <strong>Batch No:</strong> {record.batchNo}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Grade Group:</strong> {record.gradeGroup}
                                          </div>
                                          <div className="mb-2">
                                            <strong>Total Bags:</strong> {record.consolidatedBags}
                                          </div>
                                          {record.cupProfile && (
                                            <div className="mb-2">
                                              <strong>Cup Profile:</strong> {record.cupProfile}
                                            </div>
                                          )}
                                        </Col>
                                        <Col md={6}>
                                          <h6 className="mb-3">Grade Details</h6>
                                          <div>
                                            {renderOutputGrades(record.outputKgs, record.gradeDetails)}
                                          </div>
                                        </Col>
                                      </Row>
                                      
                                      <h6 className="mt-4 mb-3">Individual Transfers</h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                          <thead>
                                            <tr>
                                              <th>ID</th>
                                              <th>Date</th>
                                              <th>Truck</th>
                                              <th>Driver</th>
                                              <th>KGs</th>
                                              <th>Bags</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {record.originalRecords.map(subRecord => (
                                              <tr key={subRecord.id}>
                                                <td>{subRecord.id}</td>
                                                <td>{new Date(subRecord.transferDate).toLocaleDateString()}</td>
                                                <td>{subRecord.truckNumber}</td>
                                                <td>{subRecord.driverName}</td>
                                                <td>{calculateTotalKgs(subRecord.outputKgs).toFixed(2)} kg</td>
                                                <td>{subRecord.numberOfBags || 0}</td>
                                                <td>
                                                  <Badge
                                                    bg={subRecord.status === 'COMPLETED' ? 'success' : 'warning'}
                                                    className="small"
                                                  >
                                                    {subRecord.status}
                                                  </Badge>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </>
                                  ) : (
                                    <Row>
                                      <Col md={6}>
                                        <h6 className="mb-3">Transfer Details</h6>
                                        <div className="mb-2">
                                          <strong>Transfer ID:</strong> {record.id}
                                        </div>
                                        <div className="mb-2">
                                          <strong>Batch No:</strong> {record.batchNo}
                                        </div>
                                        <div className="mb-2">
                                          <strong>Grade Group:</strong> {record.gradeGroup}
                                        </div>
                                        <div className="mb-2">
                                          <strong>Total Bags:</strong> {record.numberOfBags || 0}
                                        </div>
                                        {record.cupProfile && (
                                          <div className="mb-2">
                                            <strong>Cup Profile:</strong> {record.cupProfile}
                                          </div>
                                        )}
                                        <div className="mb-2">
                                          <strong>Notes:</strong> {record.notes || 'No notes'}
                                        </div>
                                      </Col>
                                      <Col md={6}>
                                        <h6 className="mb-3">Grade Details</h6>
                                        <div>
                                          {renderOutputGrades(record.outputKgs, record.gradeDetails)}
                                        </div>
                                        <h6 className="mb-2 mt-3">Transport Details</h6>
                                        <div className="mb-2">
                                          <strong>Truck Number:</strong> {record.truckNumber}
                                        </div>
                                        <div className="mb-2">
                                          <strong>Driver:</strong> {record.driverName}
                                        </div>
                                        <div className="mb-2">
                                          <strong>Phone:</strong> {record.driverPhone}
                                        </div>
                                      </Col>
                                    </Row>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {getPaginatedRecords().length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-3">No transfer records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Showing {Math.min(getPaginatedRecords().length, recordsPerPage)} of {getConsolidatedRecords().length} {groupByEnabled ? 'grouped' : 'total'} records
                </div>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(Math.ceil(getConsolidatedRecords().length / recordsPerPage))].map((_, idx) => (
                    <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                      <button className="page-link bg-sucafina" onClick={() => paginate(idx + 1)}>{idx + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage >= Math.ceil(getConsolidatedRecords().length / recordsPerPage) ? 'disabled' : ''}`}>
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