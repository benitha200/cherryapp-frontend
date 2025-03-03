import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Accordion } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
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
                {['Batch No', 'Processing Type', 'Total KGs', 'Output KGs', 'Total Output KGs', 'Outturn', 'CWS', 'Date', 'Status'].map((header) => (
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

  useEffect(() => {
    fetchUntransferredRecords();
  }, []);

  useEffect(() => {
    // Extract all available grades from selected batches
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

    // Calculate total selected KGs
    calculateTotalSelectedKgs();
  }, [selectedBatches, groupedRecords]);

  // Calculate total KGs whenever selected batches or grades change
  useEffect(() => {
    calculateTotalSelectedKgs();
  }, [selectedBatches, selectedGrades]);

  // Update selectAllChecked when all visible batches are selected
  useEffect(() => {
    const visibleBatches = getFilteredBatches();
    const allSelected = visibleBatches.length > 0 &&
      visibleBatches.every(batch => selectedBatches.includes(batch));
    setSelectAllChecked(allSelected);
  }, [selectedBatches, searchTerm, currentPage]);

  const calculateTotalSelectedKgs = () => {
    let total = 0;
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          if (selectedGrades[grade]) {
            total += parseFloat(kg);
          }
        });
      });
    });
    setTotalSelectedKgs(total);
  };

  const fetchUntransferredRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
      // Filter records with empty transfers array
      const untransferred = response.data.filter(record => record.transfers.length === 0);

      // Group records by base batch number (ignoring suffixes like A, B, -1, -2)
      const grouped = untransferred.reduce((acc, record) => {
        const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, ''); // Remove suffixes
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

  const handleBatchSelectionChange = (batchKey, isSelected) => {
    if (isSelected) {
      setSelectedBatches(prev => [...prev, batchKey]);
    } else {
      setSelectedBatches(prev => prev.filter(key => key !== batchKey));
    }
  };

  const handleBatchToggleExpand = (batchKey, e) => {
    e.stopPropagation();
    setExpandedBatches(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }));
  };

  const handleSelectAllBatches = (isSelected) => {
    const visibleBatches = getFilteredBatches();

    if (isSelected) {
      setSelectedBatches(prev => {
        const newSelection = [...prev];
        visibleBatches.forEach(batch => {
          if (!newSelection.includes(batch)) {
            newSelection.push(batch);
          }
        });
        return newSelection;
      });
    } else {
      setSelectedBatches(prev => prev.filter(batch => !visibleBatches.includes(batch)));
    }

    setSelectAllChecked(isSelected);
  };

  const handleGradeSelectionChange = (grade, isSelected) => {
    setSelectedGrades(prev => ({
      ...prev,
      [grade]: isSelected
    }));
  };

  const handleTransferClick = () => {
    setShowTransferModal(true);
  };

  const handleTransferConfirm = async () => {
    try {
      // Collect all records to transfer based on selected batches and grades
      const recordsToTransfer = [];

      selectedBatches.forEach(batchKey => {
        const batchRecords = groupedRecords[batchKey];
        batchRecords.forEach(record => {
          // Create a modified version of outputKgs with only selected grades
          const filteredOutputKgs = {};
          let hasSelectedGrades = false;

          Object.entries(record.outputKgs).forEach(([grade, kg]) => {
            if (selectedGrades[grade]) {
              filteredOutputKgs[grade] = kg;
              hasSelectedGrades = true;
            }
          });

          // Only include this record if it has selected grades
          if (hasSelectedGrades) {
            recordsToTransfer.push({
              ...record,
              outputKgs: filteredOutputKgs
            });
          }
        });
      });

      // Create transfer records for all selected processing types and grades
      await Promise.all(recordsToTransfer.map(record =>
        axios.post(`${API_URL}/transfer`, {
          baggingOffId: record.id,
          batchNo: record.batchNo,
          date: new Date().toISOString(),
          outputKgs: record.outputKgs // Only transfer selected grades
        })
      ));

      await fetchUntransferredRecords();
      setSelectedBatches([]);
      setSelectedGrades({});
      setShowTransferModal(false);
      alert('Transfer completed successfully');
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Failed to complete transfer');
    }
  };

  const renderOutputKgs = (outputKgs) => {
    return Object.entries(outputKgs).map(([grade, kg]) => (
      <div key={grade} className="small">
        {grade}: {kg} kg
      </div>
    ));
  };

  const calculateOutturn = (records) => {
    const totalProcessingKgs = records.reduce((sum, record) => {
      if (record.processingType !== 'NATURAL') {
        return sum + record.processing.totalKgs;
      }
      return sum;
    }, 0);

    const totalOutputKgs = records.reduce((sum, record) => {
      if (record.processingType !== 'NATURAL') {
        return sum + record.totalOutputKgs;
      }
      return sum;
    }, 0);

    return totalProcessingKgs > 0 ? ((totalOutputKgs / totalProcessingKgs) * 100).toFixed(2) : 'N/A';
  };

  // Function to get unique processing types from records
  const getUniqueProcessingTypes = (records) => {
    const uniqueTypes = [...new Set(records.map(record => record.processingType))];
    return uniqueTypes.map(type => (
      <div key={type} className="small">
        {type}
      </div>
    ));
  };

  // Function to calculate total processing KGs
  const calculateTotalProcessingKgs = (records) => {
    const total = records.reduce((sum, record) => sum + record.processing.totalKgs, 0);
    return `${total.toFixed(2)} kg`;
  };

  // Get total KGs per grade for selected batches
  const getGradeTotals = () => {
    const totals = {};

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs).forEach(([grade, kg]) => {
          if (!totals[grade]) {
            totals[grade] = 0;
          }
          totals[grade] += parseFloat(kg);
        });
      });
    });

    return totals;
  };

  // Filter batches based on search term
  const getFilteredBatches = () => {
    return Object.keys(groupedRecords).filter(batchKey => {
      // Search in the batch number
      if (batchKey.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // Search in sub-batch numbers
      const subBatches = groupedRecords[batchKey].map(record => record.batchNo);
      if (subBatches.some(subBatch => subBatch.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return true;
      }

      // Search in processing types
      const processingTypes = [...new Set(groupedRecords[batchKey].map(record => record.processingType))];
      if (processingTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return true;
      }

      // Search in grades
      for (const record of groupedRecords[batchKey]) {
        const grades = Object.keys(record.outputKgs);
        if (grades.some(grade => grade.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return true;
        }
      }

      return false;
    });
  };

  // Get paginated batches
  const getPaginatedBatches = () => {
    const filteredBatches = getFilteredBatches();
    const indexOfLastBatch = currentPage * batchesPerPage;
    const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
    return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const filteredBatches = getFilteredBatches();
  const paginatedBatches = getPaginatedBatches();
  const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);
  const gradeTotals = getGradeTotals();

  return (
    <div className="container-fluid py-4">
      {/* New Transfer Panel at the top */}
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <span className="h5" style={{ color: processingTheme.primary }}>
            Create New Transfer
          </span>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-8">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Selected Batches ({selectedBatches.length})</strong>
                  {selectedBatches.length > 0 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setSelectedBatches([])}
                    >
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
                        <Badge
                          key={batchKey}
                          bg={processingTheme.neutral}
                          className="me-2 mb-2 p-2 bg-sucafina"
                        // style={{ backgroundColor: processingTheme.primary }}
                        >
                          {batchKey} ({groupedRecords[batchKey].reduce((sum, r) => sum + r.totalOutputKgs, 0).toFixed(2)} kg)
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => handleBatchSelectionChange(batchKey, false)}
                            style={{ color: 'white' }}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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

                  <div className="grades-container" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                    <div className="row">
                      {availableGrades.map((grade) => (
                        <div className="col-md-4 col-6 mb-2" key={grade}>
                          <Form.Check
                            type="checkbox"
                            id={`grade-${grade}`}
                            label={`${grade} (${gradeTotals[grade]?.toFixed(2) || 0} kg)`}
                            checked={selectedGrades[grade] || false}
                            onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                          />
                        </div>
                      ))}
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
                  <p><strong>Total KGs:</strong> {totalSelectedKgs.toFixed(2)} kg</p>

                  {totalSelectedKgs > 10000 && (
                    <Alert variant="danger">
                      The total exceeds the 10,000 kg transfer limit
                    </Alert>
                  )}

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      disabled={selectedBatches.length === 0 || totalSelectedKgs === 0 || totalSelectedKgs > 10000}
                      onClick={handleTransferClick} // Add this onClick handler
                      style={{
                        backgroundColor: processingTheme.primary,
                        borderColor: processingTheme.primary
                      }}
                    >
                      Create Transfer
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Batches Table */}
      <Card>
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5" style={{ color: processingTheme.primary }}>
              Available Batches for Transfer ({Object.keys(groupedRecords).length})
            </span>
            <div className="d-flex">
              <Form.Select
                size="sm"
                className="me-2"
                style={{ width: 'auto' }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </Form.Select>
              <InputGroup size="sm" className="mb-3">
                <Form.Control
                  placeholder="Search batches..."
                  value={modalBatchSearch}
                  onChange={(e) => setModalBatchSearch(e.target.value)}
                />
                {modalBatchSearch && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setModalBatchSearch('')}
                  >
                    ×
                  </Button>
                )}
              </InputGroup>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: processingTheme.neutral, position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: '30px', position: 'sticky', left: 0, backgroundColor: processingTheme.neutral, zIndex: 2 }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectAllChecked}
                      onChange={(e) => setSelectAllChecked(e.target.checked)}
                      title="Select All Visible Batches"
                    />
                  </th>
                  <th style={{ position: 'sticky', left: '30px', backgroundColor: processingTheme.neutral, zIndex: 2 }}>Batch No</th>
                  <th>Processing Types</th>
                  <th>Total Processing KGs</th>
                  <th style={{ minWidth: '180px' }}>Output KGs</th>
                  <th>Total Output KGs</th>
                  <th>Outturn</th>
                  <th>CWS</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedRecords).map((baseBatchNo) => {
                  const records = groupedRecords[baseBatchNo];
                  const isExpanded = expandedBatches[baseBatchNo];
                  const isSelected = selectedBatches.includes(baseBatchNo);

                  return (
                    <React.Fragment key={baseBatchNo}>
                      <tr
                        className={isSelected ? 'table-active' : ''}
                        onClick={() => handleBatchSelectionChange(baseBatchNo, !isSelected)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ position: 'sticky', left: 0, backgroundColor: isSelected ? '#e2e6ea' : 'white' }}>
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBatchSelectionChange(baseBatchNo, !isSelected);
                            }}
                          />
                        </td>
                        <td style={{ position: 'sticky', left: '30px', backgroundColor: isSelected ? '#e2e6ea' : 'white' }}>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="link"
                              className="p-0 me-2"
                              onClick={(e) => handleBatchToggleExpand(baseBatchNo, e)}
                              style={{ color: processingTheme.primary }}
                            >
                              <span style={{ fontSize: '16px' }}>
                                {isExpanded ? '−' : '+'}
                              </span>
                            </Button>
                            <div>
                              <strong>{baseBatchNo}</strong>
                              <div className="small text-muted">
                                {records.length > 1 ? `${records.length} sub-batches` : '1 sub-batch'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {getUniqueProcessingTypes(records)}
                        </td>
                        <td>
                          {records[0].processing.totalKgs.toFixed(2)} kg
                        </td>
                        <td>
                          {renderOutputKgs(records[0].outputKgs)}
                        </td>
                        <td>
                          {records.reduce((sum, record) => sum + record.totalOutputKgs, 0).toFixed(2)} kg
                        </td>
                        <td>
                          {calculateOutturn(records)}%
                        </td>
                        <td>{records[0].processing.cws.name}</td>
                        <td>{new Date(records[0].date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: processingTheme.primary,
                              color: 'white'
                            }}
                          >
                            {records[0].status}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="table-light">
                          <td colSpan={10} className="p-0">
                            <div className="p-3">
                              <h6>Sub-batches</h6>
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Batch No</th>
                                    <th>Processing Type</th>
                                    <th>Total KGs</th>
                                    <th>Output KGs</th>
                                    <th>Total Output KGs</th>
                                    <th>Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {records.map(record => (
                                    <tr key={record.id}>
                                      <td>{record.batchNo}</td>
                                      <td>{record.processingType}</td>
                                      <td>{record.processing.totalKgs.toFixed(2)} kg</td>
                                      <td>{renderOutputKgs(record.outputKgs)}</td>
                                      <td>{record.totalOutputKgs.toFixed(2)} kg</td>
                                      <td>{new Date(record.date).toLocaleDateString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
        size="lg"
        fullscreen="lg-down"
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: processingTheme.neutral }}
        >
          <Modal.Title style={{ color: processingTheme.primary }}>
            Confirm Transfer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="container-fluid">
            <div className="row">
              {/* Left side - Batches */}
              <div className="col-lg-6 p-3" style={{
                borderRight: `1px solid ${processingTheme.neutral}`,
                maxHeight: '70vh',
                overflowY: 'auto'
              }}>
                <h5 style={{ color: processingTheme.primary }}>Selected Batches ({selectedBatches.length})</h5>

                <InputGroup size="sm" className="mb-3">
                  <Form.Control
                    placeholder="Search batches..."
                    onChange={(e) => {
                      // You can add batch search functionality here
                      // This is just the UI component
                    }}
                  />
                </InputGroup>

                <div className="batch-list">
                  {selectedBatches.length === 0 ? (
                    <Alert variant="info" style={{ backgroundColor: processingTheme.neutral }}>
                      No batches selected
                    </Alert>
                  ) : (
                    <Accordion defaultActiveKey="0">
                      {selectedBatches.map((batchKey, index) => (
                        <Accordion.Item
                          key={batchKey}
                          eventKey={index.toString()}
                          className="mb-2"
                          style={{ borderColor: processingTheme.neutral }}
                        >
                          <Accordion.Header>
                            <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                              <span>
                                <strong>{batchKey}</strong>
                                <span className="ms-2 badge" style={{
                                  backgroundColor: processingTheme.secondary,
                                  color: 'white'
                                }}>
                                  {groupedRecords[batchKey].length} sub-batches
                                </span>
                              </span>
                              <span>
                                {groupedRecords[batchKey].reduce((sum, record) => sum + record.totalOutputKgs, 0).toFixed(2)} kg
                              </span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body style={{ backgroundColor: processingTheme.neutral, padding: '0.5rem' }}>
                            <table className="table table-sm mb-0">
                              <thead>
                                <tr>
                                  <th>Sub-batch</th>
                                  <th>Processing</th>
                                  <th>KGs</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupedRecords[batchKey].map(record => (
                                  <tr key={record.id}>
                                    <td>{record.batchNo}</td>
                                    <td>{record.processingType}</td>
                                    <td>{record.totalOutputKgs.toFixed(2)} kg</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </div>
              </div>

              {/* Right side - Grades and Summary */}
              <div className="col-lg-6 p-3">
                {/* Grades section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 style={{ color: processingTheme.primary }}>Selected Grades</h5>
                    <Button
                      variant="outline-sucafina"
                      size="sm"
                      onClick={() => {
                        const allSelected = Object.values(selectedGrades).every(value => value);
                        const newSelectedGrades = {};
                        availableGrades.forEach(grade => {
                          newSelectedGrades[grade] = !allSelected;
                        });
                        setSelectedGrades(newSelectedGrades);
                      }}
                    >
                      {Object.values(selectedGrades).every(value => value) ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: `1px solid ${processingTheme.neutral}`,
                    borderRadius: '0.25rem'
                  }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: processingTheme.neutral,
                        zIndex: 1
                      }}>
                        <tr>
                          <th style={{ width: '30px' }}></th>
                          <th>Grade</th>
                          <th className="text-end">Total KGs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(gradeTotals).map(([grade, kg]) => (
                          <tr key={grade}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedGrades[grade] || false}
                                onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                              />
                            </td>
                            <td>{grade}</td>
                            <td className="text-end">{kg.toFixed(2)} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transfer summary */}
                <Card style={{ backgroundColor: processingTheme.neutral }}>
                  <Card.Body>
                    <h5 style={{ color: processingTheme.primary }}>Transfer Summary</h5>

                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>FROM:</strong></td>
                          <td>{selectedBatches.length > 0 && groupedRecords[selectedBatches[0]][0].processing.cws.name}</td>
                        </tr>
                        <tr>
                          <td><strong>TO:</strong></td>
                          <td>RWACOF HQ</td>
                        </tr>
                        <tr>
                          <td><strong>Date:</strong></td>
                          <td>{new Date().toLocaleDateString()}</td>
                        </tr>
                        <tr style={{
                          backgroundColor: processingTheme.secondary,
                          color: 'white'
                        }}>
                          <td><strong>Total KGs:</strong></td>
                          <td><strong>{totalSelectedKgs.toFixed(2)} kg</strong></td>
                        </tr>
                      </tbody>
                    </table>

                    {totalSelectedKgs > 10000 && (
                      <Alert variant="danger" className="mb-3">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        The total exceeds the 10,000 kg transfer limit
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowTransferModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleTransferConfirm}
            disabled={selectedBatches.length === 0 || totalSelectedKgs === 0 || totalSelectedKgs > 10000}
            style={{
              backgroundColor: processingTheme.primary,
              borderColor: processingTheme.primary
            }}
          >
            Confirm Transfer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transfer;