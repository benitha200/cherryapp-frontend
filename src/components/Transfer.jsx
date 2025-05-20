import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Row, Col, Nav, Tab } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
};

const GRADE_GROUPS = {
  HIGH: ['A0', 'A1', 'N1', 'H2'],
  LOW: ['A2', 'A3', 'B1', 'B2', 'N2'],
  BOTH: ['A0', 'A1', 'N1', 'N2', 'H2', 'A2', 'A3', 'B1', 'B2']
};

const CUP_PROFILES = ['Select Cup Profile', 'S88', 'S87', 'S86', 'C1', 'C2'];

const Transfer = () => {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedGradeItems, setSelectedGradeItems] = useState([]);
  const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage, setBatchesPerPage] = useState(30);
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [transferMode, setTransferMode] = useState('BOTH');
  const [gradeQualityDetails, setGradeQualityDetails] = useState({});
  const [transportDetails, setTransportDetails] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });
  const [validated, setValidated] = useState(false);
  const [lowGradeBags, setLowGradeBags] = useState('');
  const [selectedLowGrade, setSelectedLowGrade] = useState(null);
  const [activeGradeTab, setActiveGradeTab] = useState(null);
  // New state for low grade batch grouping
  const [lowGradeGrouping, setLowGradeGrouping] = useState({});
  const [combinedLowGradeBags, setCombinedLowGradeBags] = useState({});

  // Flatten batch records into grade-specific items
  const flattenBatchRecords = () => {
    const individualRows = [];

    Object.keys(groupedRecords).forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;

          if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
            const uniqueId = `${record.id}-${grade}`;
            const gradeKey = `${batchKey}-${grade}`;

            individualRows.push({
              id: uniqueId,
              batchKey: batchKey,
              gradeKey: gradeKey,
              batchNo: record.batchNo,
              displayId: `${record.batchNo}(${grade})`,
              grade: grade,
              kgValue: kgValue,
              isHighGrade: GRADE_GROUPS.HIGH.includes(grade),
              processingType: record.processingType,
              totalKgs: record.totalKgs,
              recordId: record.id,
              record: record
            });
          }
        });
      });
    });

    // Group identical batch & grade combinations
    const groupedItems = {};
    individualRows.forEach(row => {
      const combinedKey = `${row.batchNo}-${row.grade}`;

      if (!groupedItems[combinedKey]) {
        groupedItems[combinedKey] = {
          ...row,
          combinedGradeKey: combinedKey,
          records: [row],
          recordCount: 1
        };
      } else {
        groupedItems[combinedKey].kgValue += row.kgValue;
        groupedItems[combinedKey].records.push(row);
        groupedItems[combinedKey].recordCount += 1;
      }
    });

    // Sort by grade and date
    const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];
    return Object.values(groupedItems).sort((a, b) => {
      const gradeAIndex = gradeOrder.indexOf(a.grade);
      const gradeBIndex = gradeOrder.indexOf(b.grade);
      if (gradeAIndex !== gradeBIndex) return gradeAIndex - gradeBIndex;

      const dateA = extractDateFromBatch(a.batchNo);
      const dateB = extractDateFromBatch(b.batchNo);
      if (dateA.month !== dateB.month) return dateA.month - dateB.month;
      if (dateA.day !== dateB.day) return dateA.day - dateB.day;

      return a.batchNo.localeCompare(b.batchNo);
    });
  };

  const extractDateFromBatch = (batchNo) => {
    const dateMatch = batchNo.match(/(\d{2})(\d{2})/);
    return dateMatch ? { day: parseInt(dateMatch[1], 10), month: parseInt(dateMatch[2], 10) } : { day: 0, month: 0 };
  };

  const handleGradeItemSelection = (gradeKey, isSelected) => {
    setSelectedGradeItems(prev =>
      isSelected ? [...prev, gradeKey] : prev.filter(key => key !== gradeKey)
    );
  };

  const isGradeItemSelected = (gradeKey) => {
    return selectedGradeItems.includes(gradeKey);
  };

  const handleSelectAllGradeItems = (isSelected) => {
    setSelectedGradeItems(isSelected ? flattenBatchRecords().map(item => item.gradeKey) : []);
  };

  const getSelectedGradeItems = () => {
    return flattenBatchRecords().filter(item => selectedGradeItems.includes(item.gradeKey));
  };

  // Calculate totals for each grade
  const getGradeTotals = () => {
    const totals = {};
    getSelectedGradeItems().forEach(item => {
      totals[item.grade] = (totals[item.grade] || 0) + item.kgValue;
    });
    return totals;
  };

  // Calculate total selected KGs
  useEffect(() => {
    const total = getSelectedGradeItems().reduce((sum, item) => sum + item.kgValue, 0);
    setTotalSelectedKgs(total);

    // Set active tab to first grade if there are selections
    const selectedGrades = Object.keys(getGradeTotals());
    if (selectedGrades.length > 0 && !activeGradeTab) {
      setActiveGradeTab(selectedGrades[0]);
    }
  }, [selectedGradeItems]);

  const handleTransferClick = () => {
    setShowTransferModal(true);

    // Set the first grade as the active tab
    const selectedGrades = Object.keys(getGradeTotals());
    if (selectedGrades.length > 0) {
      setActiveGradeTab(selectedGrades[0]);
    }

    // Initialize low grade grouping state
    const lowGrades = selectedGrades.filter(grade => GRADE_GROUPS.LOW.includes(grade));
    const initialLowGradeGrouping = {};

    // For each low grade, group all items by default
    lowGrades.forEach(grade => {
      initialLowGradeGrouping[grade] = {
        isGrouped: true,
        numberOfBags: '',
        items: getItemsGroupedByGradeAndBatch()[grade] || []
      };
    });

    setLowGradeGrouping(initialLowGradeGrouping);
  };

  // Group selected items by grade and then by batch
  const getItemsGroupedByGradeAndBatch = () => {
    const gradeGroups = {};

    getSelectedGradeItems().forEach(item => {
      if (!gradeGroups[item.grade]) {
        gradeGroups[item.grade] = [];
      }
      gradeGroups[item.grade].push(item);
    });

    // Sort batches within each grade
    Object.keys(gradeGroups).forEach(grade => {
      gradeGroups[grade].sort((a, b) => {
        const dateA = extractDateFromBatch(a.batchNo);
        const dateB = extractDateFromBatch(b.batchNo);
        if (dateA.month !== dateB.month) return dateA.month - dateB.month;
        if (dateA.day !== dateB.day) return dateA.day - dateB.day;
        return a.batchNo.localeCompare(b.batchNo);
      });
    });

    return gradeGroups;
  };

  // Handle changes to the low grade grouping settings
  const handleLowGradeGroupingChange = (grade, field, value) => {
    setLowGradeGrouping(prev => ({
      ...prev,
      [grade]: {
        ...prev[grade],
        [field]: value
      }
    }));

    // If grouping is enabled, clear individual batch bag counts
    if (field === 'isGrouped' && value === true) {
      const gradeItems = getItemsGroupedByGradeAndBatch()[grade] || [];
      const updatedGradeQualityDetails = { ...gradeQualityDetails };

      // Clear individual batch bag counts
      gradeItems.forEach(item => {
        item.records.forEach(record => {
          const batchGradeKey = `${record.recordId}-${grade}`;
          if (updatedGradeQualityDetails[batchGradeKey]) {
            delete updatedGradeQualityDetails[batchGradeKey];
          }
        });
      });

      setGradeQualityDetails(updatedGradeQualityDetails);
    }
  };

  // Handle changes to combined low grade bags
  const handleCombinedBagsChange = (grade, value) => {
    setCombinedLowGradeBags(prev => ({
      ...prev,
      [grade]: value
    }));
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
      // Generate a unique transportGroupId first
      const transportGroupId = `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const transferPromises = [];
      const gradeTotals = getGradeTotals();
      const itemsByGradeAndBatch = getItemsGroupedByGradeAndBatch();
      const completedTransfers = [];

      // Process all selected grades
      Object.keys(itemsByGradeAndBatch).forEach(grade => {
        const gradeItems = itemsByGradeAndBatch[grade];
        const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
        const isGroupedLowGrade = !isHighGrade && lowGradeGrouping[grade]?.isGrouped;

        // For grouped low grades, create a single transfer with all batches
        if (isGroupedLowGrade) {
          const combinedGradeDetails = {};
          const combinedOutputKgs = {};
          const batchIds = [];
          let totalKgs = 0;

          // Combine all batches for this grade
          gradeItems.forEach(groupedItem => {
            groupedItem.records.forEach(originalRecord => {
              batchIds.push(originalRecord.recordId);
              totalKgs += originalRecord.kgValue;
              combinedOutputKgs[originalRecord.grade] = (combinedOutputKgs[originalRecord.grade] || 0) + originalRecord.kgValue;
            });
          });

          // Set the combined bag count
          combinedGradeDetails[grade] = {
            numberOfBags: parseInt(combinedLowGradeBags[grade] || 0)
          };

          // Create a single transfer for all batches of this grade
          transferPromises.push(
            axios.post(`${API_URL}/transfer`, {
              baggingOffId: batchIds,  // Send all batch IDs as an array
              batchNo: `${grade}-${new Date().toISOString().slice(0, 10)}`,  // Use a combined batch name with date
              gradeGroup: 'LOW',
              outputKgs: combinedOutputKgs,
              gradeDetails: combinedGradeDetails,
              isGroupedTransfer: true,  // Important flag for backend to process as grouped transfer
              transportGroupId: transportGroupId, // Pass the consistent transportGroupId
              truckNumber: transportDetails.truckNumber,
              driverName: transportDetails.driverName,
              driverPhone: transportDetails.driverPhone,
              notes: transportDetails.notes
            }).then(response => {
              completedTransfers.push(response.data);
              return response;
            })
          );
        } else {
          // Handle individual batch transfers
          gradeItems.forEach(groupedItem => {
            groupedItem.records.forEach(originalRecord => {
              const gradeDetails = {};
              const batchId = originalRecord.recordId;
              const batchGradeKey = `${batchId}-${grade}`;

              gradeDetails[originalRecord.grade] = {
                numberOfBags: parseInt(gradeQualityDetails[batchGradeKey]?.numberOfBags || 0),
                ...(isHighGrade ? {
                  cupProfile: gradeQualityDetails[batchGradeKey]?.cupProfile || CUP_PROFILES[0],
                  moistureContent: parseFloat(gradeQualityDetails[batchGradeKey]?.moistureContent || 0)
                } : {})
              };

              const outputKgs = {};
              outputKgs[originalRecord.grade] = originalRecord.kgValue;

              transferPromises.push(
                axios.post(`${API_URL}/transfer`, {
                  baggingOffId: originalRecord.recordId,
                  batchNo: originalRecord.batchKey,
                  gradeGroup: isHighGrade ? 'HIGH' : 'LOW',
                  outputKgs: outputKgs,
                  gradeDetails: gradeDetails,
                  isGroupedTransfer: false,
                  transportGroupId: transportGroupId, // Pass the consistent transportGroupId
                  truckNumber: transportDetails.truckNumber,
                  driverName: transportDetails.driverName,
                  driverPhone: transportDetails.driverPhone,
                  notes: transportDetails.notes
                }).then(response => {
                  completedTransfers.push(response.data);
                  return response;
                })
              );
            });
          });
        }
      });

      // Wait for all transfers to complete
      await Promise.all(transferPromises);

      // Refresh untransferred records
      await fetchUntransferredRecords();
      // Refresh transfer history to include the new transfers
      await fetchTransferHistory();

      // Reset form and selections
      setSelectedGradeItems([]);
      setGradeQualityDetails({});
      setTransportDetails({
        truckNumber: '',
        driverName: '',
        driverPhone: '',
        notes: ''
      });
      setLowGradeBags('');
      setSelectedLowGrade(null);
      setShowTransferModal(false);
      setValidated(false);
      setActiveGradeTab(null);
      setLowGradeGrouping({});
      setCombinedLowGradeBags({});

      // Show success message with transport group ID for reference
      alert(`Transfer completed successfully!\nTransport Group ID: ${transportGroupId}`);
    } catch (error) {
      console.error('Transfer error:', error);
      alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
    }
  }

  const handleQualityDetailsChange = (batchId, grade, field, value) => {
    const batchGradeKey = `${batchId}-${grade}`;
    setGradeQualityDetails(prev => ({
      ...prev,
      [batchGradeKey]: {
        ...(prev[batchGradeKey] || {}),
        [field]: value
      }
    }));
  };

  const handleTransportDetailsChange = (e) => {
    const { name, value } = e.target;
    setTransportDetails(prev => ({ ...prev, [name]: value }));
  };

  const fetchUntransferredRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
      const transfersResponse = await axios.get(`${API_URL}/transfer/cws/${userInfo.cwsId}`);
      const allTransfers = transfersResponse.data || [];

      const transfersByBaggingOff = {};
      allTransfers.forEach(transfer => {
        if (!transfersByBaggingOff[transfer.baggingOffId]) {
          transfersByBaggingOff[transfer.baggingOffId] = [];
        }
        transfersByBaggingOff[transfer.baggingOffId].push(transfer);
      });

      const processedRecords = (response.data || []).map(record => {
        const recordTransfers = transfersByBaggingOff[record.id] || [];
        const transferredGrades = {};
        recordTransfers.forEach(transfer => {
          if (transfer.outputKgs) {
            Object.keys(transfer.outputKgs).forEach(grade => {
              transferredGrades[grade] = true;
            });
          }
        });

        return {
          ...record,
          transferredGrades,
          hasTransferredGrades: Object.keys(transferredGrades).length > 0,
          hasUntransferredGrades: record.outputKgs && Object.keys(record.outputKgs).some(grade =>
            !transferredGrades[grade] && parseFloat(record.outputKgs[grade] || 0) > 0
          )
        };
      });

      const untransferred = processedRecords.filter(record => record.hasUntransferredGrades);
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

      setGroupedRecords(grouped);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(`Error fetching untransferred records: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUntransferredRecords();
  }, []);

  const getPaginatedBatches = () => {
    const filtered = flattenBatchRecords().filter(item =>
      searchTerm ? item.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.processingType.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );

    const indexOfLastBatch = currentPage * batchesPerPage;
    const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
    return filtered.slice(indexOfFirstBatch, indexOfLastBatch);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total KGs for a grade group
  const calculateGradeGroupTotal = (grade) => {
    const items = getItemsGroupedByGradeAndBatch()[grade] || [];
    return items.reduce((sum, item) => sum + item.kgValue, 0);
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
          <div className="d-flex flex-column flex-md-row justify-content-between">
            {/* Left Column - Summary Information */}
            <div className="mb-3 mb-md-0">
              <h5 className="mb-2">Transport Summary</h5>

              {/* Basic Stats Row */}
              <div className="d-flex flex-wrap gap-4 mb-2">
                <div><strong>Batches:</strong> {new Set(getSelectedGradeItems().map(item => item.batchNo)).size}</div>
                <div><strong>Grades:</strong> {new Set(getSelectedGradeItems().map(item => item.grade)).size}</div>
              </div>

              {/* Grade Breakdown */}
              {Object.entries(getGradeTotals()).length > 0 && (
                <div className="mb-3">
                  <strong className="d-block mb-1">Grade Breakdown:</strong>
                  <div className="d-flex flex-wrap gap-3">
                    {Object.entries(getGradeTotals()).map(([grade, total]) => (
                      <div key={grade} className="d-flex align-items-center">
                        <Badge bg={GRADE_GROUPS.HIGH.includes(grade) ? "success" : "info"} className="me-1">
                          {grade}
                        </Badge>
                        <span>{total.toFixed(2)} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlighted Total KGs */}
              <div className="p-2 rounded-3" style={{
                backgroundColor: processingTheme.primaryLight || '#e6f2ff',
                border: `1px solid ${processingTheme.primary}`,
                display: 'inline-block'
              }}>
                <span className="fs-6 fw-bold" style={{ color: processingTheme.primary }}>
                  Total Kgs: {totalSelectedKgs.toFixed(2)} kg
                </span>
              </div>
            </div>

            {/* Right Column - Grade Summary and Action Button */}
            <div className="d-flex flex-column justify-content-between">
              <div className="mb-3">
                <div className="mb-2">
                  <strong>High Grades:</strong> {getSelectedGradeItems()
                    .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
                    .reduce((sum, item) => sum + item.kgValue, 0)
                    .toFixed(2)} kg
                </div>
                <div>
                  <strong>Low Grades:</strong> {getSelectedGradeItems()
                    .filter(item => GRADE_GROUPS.LOW.includes(item.grade))
                    .reduce((sum, item) => sum + item.kgValue, 0)
                    .toFixed(2)} kg
                </div>
              </div>

              <Button
                size="md"
                variant="sucafina"
                disabled={getSelectedGradeItems().length === 0}
                onClick={handleTransferClick}
                style={{
                  backgroundColor: processingTheme.primary,
                  borderColor: processingTheme.primary,
                  alignSelf: 'flex-end'
                }}
              >
                Transport To HQ
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      {/* Transfer Modal with Tabbed Interface */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
        <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
          <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
            <Modal.Title>Transfer Parchment</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {getSelectedGradeItems().length === 0 ? (
              <Alert variant="warning">No grade items selected for transfer</Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Batch & Grade</th>
                        <th>Processing</th>
                        <th>Weight (kg)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSelectedGradeItems()
                        .sort((a, b) => {
                          const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];
                          const gradeAIndex = gradeOrder.indexOf(a.grade);
                          const gradeBIndex = gradeOrder.indexOf(b.grade);
                          if (gradeAIndex !== gradeBIndex) return gradeAIndex - gradeBIndex;

                          const dateA = extractDateFromBatch(a.batchNo);
                          const dateB = extractDateFromBatch(b.batchNo);
                          if (dateA.month !== dateB.month) return dateA.month - dateB.month;
                          if (dateA.day !== dateB.day) return dateA.day - dateB.day;

                          return a.batchNo.localeCompare(b.batchNo);
                        })
                        .map((item) => (
                          <tr key={item.id}
                            style={{
                              backgroundColor: item.isHighGrade ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
                              borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
                            }}
                          >
                            <td>
                              <div className="d-flex align-items-center">
                                <div>
                                  <div className="fw-bold">
                                    {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
                                  </div>
                                  <Badge
                                    bg={item.isHighGrade ? "success" : "info"}
                                    className="me-1"
                                  >
                                    {item.isHighGrade ? "High Grade" : "Low Grade"}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td>{item.processingType}</td>
                            <td>{item.kgValue.toFixed(2)} kg</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleGradeItemSelection(item.gradeKey, false)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Quality Details - Tabbed interface */}
                <Card className="mt-3">
                  <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className="h5" style={{ color: processingTheme.primary }}>Details</span>
                  </Card.Header>
                  <Card.Body>
                    <Tab.Container activeKey={activeGradeTab} onSelect={(k) => setActiveGradeTab(k)}>
                      <Nav variant="tabs" className="mb-3">
                        {Object.keys(getItemsGroupedByGradeAndBatch()).map(grade => (
                          <Nav.Item key={grade}>
                            <Nav.Link eventKey={grade}>
                              <Badge bg={GRADE_GROUPS.HIGH.includes(grade) ? "success" : "info"} className="me-2">
                                {grade}
                              </Badge>
                              <span className="fw-bold">{getItemsGroupedByGradeAndBatch()[grade].reduce((sum, item) => sum + item.kgValue, 0).toFixed(2)} kg</span>
                            </Nav.Link>
                          </Nav.Item>
                        ))}
                      </Nav>
                      <Tab.Content>
                        {Object.entries(getItemsGroupedByGradeAndBatch()).map(([grade, items]) => {
                          const isLowGrade = GRADE_GROUPS.LOW.includes(grade);
                          return (
                            <Tab.Pane key={grade} eventKey={grade}>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h5>
                                    {grade} - {items.reduce((sum, item) => sum + item.kgValue, 0).toFixed(2)} kg
                                  </h5>

                                  {/* Low Grade Grouping Toggle */}
                                  {isLowGrade && (
                                    <Form.Check
                                      type="switch"
                                      id={`combine-${grade}`}
                                      // label="Combine batches in bag"
                                      checked={lowGradeGrouping[grade]?.isGrouped || false}
                                      onChange={(e) => handleLowGradeGroupingChange(grade, 'isGrouped', e.target.checked)}
                                      className="mb-0"
                                      hidden
                                    />
                                  )}
                                </div>

                                {/* Combined Low Grade Bags Input */}
                                {isLowGrade && lowGradeGrouping[grade]?.isGrouped && (
                                  <Card className="mb-4 border-info">
                                    <Card.Header className="bg-info text-white">
                                      Combined Bags for {grade}
                                    </Card.Header>
                                    <Card.Body>
                                      <p className="mb-3">
                                        All {items.length} batches of grade {grade} ({calculateGradeGroupTotal(grade).toFixed(2)} kg)
                                        will be combined into a single bagging group.
                                      </p>

                                      {/* Contributing Batches List */}
                                      <div className="mb-4">
                                        <h6 className="mb-2">Contributing Batches:</h6>
                                        <div className="table-responsive">
                                          <table className="table table-sm table-bordered">
                                            <thead>
                                              <tr>
                                                <th>Batch</th>
                                                <th>Weight (kg)</th>
                                                <th>Processing</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {items.map(item => (
                                                <tr key={item.id}>
                                                  <td>{item.batchNo}</td>
                                                  <td>{item.kgValue.toFixed(2)} kg</td>
                                                  <td>{item.processingType}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>

                                      <Form.Group controlId={`combined-bags-${grade}`}>
                                        <Form.Label>Total Number of Bags({grade})</Form.Label>
                                        <Form.Control
                                          type="number"
                                          required
                                          min="1"
                                          value={combinedLowGradeBags[grade] || ''}
                                          onChange={(e) => handleCombinedBagsChange(grade, e.target.value)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          Please enter the number of bags
                                        </Form.Control.Feedback>
                                      </Form.Group>
                                    </Card.Body>
                                  </Card>
                                )}

                                {/* Individual Batch Quality Details */}
                                {(!isLowGrade || !lowGradeGrouping[grade]?.isGrouped) && items.map(item => (
                                  <div key={item.id} className="mb-4">
                                    <h6 className="border-bottom pb-2">
                                      Batch: {item.batchNo} - {item.kgValue.toFixed(2)} kg
                                    </h6>

                                    <Row>
                                      <Col md={6}>
                                        <Form.Group className="mb-3" controlId={`bags-${item.id}`}>
                                          <Form.Label>Number of Bags</Form.Label>
                                          <Form.Control
                                            type="number"
                                            min="1"
                                            required
                                            value={gradeQualityDetails[`${item.recordId}-${grade}`]?.numberOfBags || ''}
                                            onChange={(e) => handleQualityDetailsChange(
                                              item.recordId,
                                              grade,
                                              'numberOfBags',
                                              e.target.value
                                            )}
                                          />
                                          <Form.Control.Feedback type="invalid">
                                            Please enter the number of bags
                                          </Form.Control.Feedback>
                                        </Form.Group>
                                      </Col>

                                      {isLowGrade ? null : (
                                        <>
                                          <Col md={6}>
                                            <Form.Group className="mb-3" controlId={`moisture-${item.id}`}>
                                              <Form.Label>Moisture Content (%)</Form.Label>
                                              <Form.Control
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="20"
                                                required
                                                value={gradeQualityDetails[`${item.recordId}-${grade}`]?.moistureContent || ''}
                                                onChange={(e) => handleQualityDetailsChange(
                                                  item.recordId,
                                                  grade,
                                                  'moistureContent',
                                                  e.target.value
                                                )}
                                              />
                                              <Form.Control.Feedback type="invalid">
                                                Please enter a valid moisture content (0-20%)
                                              </Form.Control.Feedback>
                                            </Form.Group>
                                          </Col>
                                          <Col md={6}>
                                            <Form.Group className="mb-3" controlId={`profile-${item.id}`}>
                                              <Form.Label>Cup Profile</Form.Label>
                                              <Form.Select
                                                required
                                                value={gradeQualityDetails[`${item.recordId}-${grade}`]?.cupProfile || CUP_PROFILES[0]}
                                                onChange={(e) => handleQualityDetailsChange(
                                                  item.recordId,
                                                  grade,
                                                  'cupProfile',
                                                  e.target.value
                                                )}
                                              >
                                                {CUP_PROFILES.map(profile => (
                                                  <option key={profile} value={profile}>{profile}</option>
                                                ))}
                                              </Form.Select>
                                              <Form.Control.Feedback type="invalid">
                                                Please select a cup profile
                                              </Form.Control.Feedback>
                                            </Form.Group>
                                          </Col>
                                        </>
                                      )}
                                    </Row>
                                  </div>
                                ))}
                              </div>
                            </Tab.Pane>
                          );
                        })}
                      </Tab.Content>
                    </Tab.Container>
                  </Card.Body>
                </Card>

                {/* Transport Details */}
                <Card className="mt-3">
                  <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className="h5" style={{ color: processingTheme.primary }}>Transport Details</span>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="truckNumber">
                          <Form.Label>Truck Number</Form.Label>
                          <Form.Control
                            type="text"
                            required
                            name="truckNumber"
                            value={transportDetails.truckNumber}
                            onChange={handleTransportDetailsChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter the truck number
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="driverName">
                          <Form.Label>Driver Name</Form.Label>
                          <Form.Control
                            type="text"
                            required
                            name="driverName"
                            value={transportDetails.driverName}
                            onChange={handleTransportDetailsChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter the driver's name
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="driverPhone">
                          <Form.Label>Driver Phone</Form.Label>
                          <Form.Control
                            type="text"
                            required
                            name="driverPhone"
                            value={transportDetails.driverPhone}
                            onChange={handleTransportDetailsChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please enter the driver's phone number
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="notes">
                          <Form.Label>Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="notes"
                            value={transportDetails.notes}
                            onChange={handleTransportDetailsChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="sucafina"
              style={{
                backgroundColor: processingTheme.primary,
                borderColor: processingTheme.primary
              }}
              disabled={getSelectedGradeItems().length === 0}
            >
              Confirm Transfer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Main table of grades */}
      <Card>
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <span className="h5 mb-2 mb-md-0" style={{ color: processingTheme.primary }}>
              Untransferred Batches
            </span>
            <div className="d-flex align-items-center gap-3">
              <Form.Group className="mb-0 d-flex align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Search batches"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: '200px' }}
                />
              </Form.Group>
              <div>
                <Form.Check
                  type="checkbox"
                  id="selectAll"
                  label="Select All"
                  // className='m-4'
                  checked={selectedGradeItems.length === flattenBatchRecords().length && flattenBatchRecords().length > 0}
                  onChange={(e) => handleSelectAllGradeItems(e.target.checked)}
                />
              </div>
              <Badge bg="primary">
                {selectedGradeItems.length} of {flattenBatchRecords().length} selected
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <Placeholder as="p" animation="glow">
              <Placeholder xs={12} />
              <Placeholder xs={12} />
              <Placeholder xs={12} />
            </Placeholder>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th className="checkbox-column">
                        <Form.Check
                          type="checkbox"
                          id="selectAll"
                          aria-label="Select All"
                          title="Select All"
                          checked={selectedGradeItems.length === flattenBatchRecords().length && flattenBatchRecords().length > 0}
                          onChange={(e) => handleSelectAllGradeItems(e.target.checked)}
                          className="compact-checkbox"
                        />
                      </th>
                      <th>Batch & Grade</th>
                      <th>Processing</th>
                      <th>Weight (kg)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedBatches().map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: isGradeItemSelected(item.gradeKey)
                            ? `${processingTheme.neutral}`
                            : item.isHighGrade
                              ? 'rgba(0, 128, 128, 0.05)'
                              : 'transparent',
                          borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
                        }}
                      >
                        <td className="checkbox-column">
                          <Form.Check
                            type="checkbox"
                            id={`check-${item.id}`}
                            aria-label={`Select batch ${item.displayId}`}
                            checked={isGradeItemSelected(item.gradeKey)}
                            onChange={(e) => handleGradeItemSelection(item.gradeKey, e.target.checked)}
                            className="compact-checkbox"
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="fw-bold">
                                {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
                              </div>
                              <Badge
                                bg={item.isHighGrade ? "success" : "info"}
                                className="me-1"
                              >
                                {item.isHighGrade ? "High Grade" : "Low Grade"}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td>{item.processingType}</td>
                        <td>{item.kgValue.toFixed(2)} kg</td>
                        <td>
                          <Button
                            size="sm"
                            variant={isGradeItemSelected(item.gradeKey) ? "outline-danger" : "outline-primary"}
                            onClick={() => handleGradeItemSelection(item.gradeKey, !isGradeItemSelected(item.gradeKey))}
                          >
                            {isGradeItemSelected(item.gradeKey) ? "Deselect" : "Select"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Form.Select
                    value={batchesPerPage}
                    onChange={(e) => {
                      setBatchesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{ width: '100px' }}
                  >
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                </div>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: Math.ceil(flattenBatchRecords().length / batchesPerPage) }).map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.ceil(flattenBatchRecords().length / batchesPerPage) ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(flattenBatchRecords().length / batchesPerPage)}
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
    </div>
  );
};

export default Transfer;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Row, Col, Nav, Tab } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// const processingTheme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
// };

// const GRADE_GROUPS = {
//   HIGH: ['A0', 'A1', 'N1', 'N2', 'H2'],
//   LOW: ['A2', 'A3', 'B1', 'B2'],
//   BOTH: ['A0', 'A1', 'N1', 'N2', 'H2', 'A2', 'A3', 'B1', 'B2']
// };

// // Modified to remove the placeholder selection option
// // const CUP_PROFILES = ['S88', 'S87', 'S86', 'C1', 'C2'];
// const CUP_PROFILES = ['', 'S88', 'S87', 'S86', 'C1', 'C2'];

// const Transfer = () => {
//   const [groupedRecords, setGroupedRecords] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [selectedGradeItems, setSelectedGradeItems] = useState([]);
//   const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [batchesPerPage, setBatchesPerPage] = useState(30);
//   const userInfo = JSON.parse(localStorage.getItem('user'));
//   const [transferMode, setTransferMode] = useState('BOTH');
//   const [gradeQualityDetails, setGradeQualityDetails] = useState({});
//   const [transportDetails, setTransportDetails] = useState({
//     truckNumber: '',
//     driverName: '',
//     driverPhone: '',
//     notes: ''
//   });
//   const [validated, setValidated] = useState(false);
//   const [lowGradeBags, setLowGradeBags] = useState('');
//   const [selectedLowGrade, setSelectedLowGrade] = useState(null);
//   const [activeGradeTab, setActiveGradeTab] = useState(null);
//   // New state for low grade batch grouping
//   const [lowGradeGrouping, setLowGradeGrouping] = useState({});
//   const [combinedLowGradeBags, setCombinedLowGradeBags] = useState({});

//   // Flatten batch records into grade-specific items
//   const flattenBatchRecords = () => {
//     const individualRows = [];

//     Object.keys(groupedRecords).forEach(batchKey => {
//       const batchRecords = groupedRecords[batchKey] || [];

//       batchRecords.forEach(record => {
//         Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
//           const kgValue = parseFloat(kg) || 0;

//           if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
//             const uniqueId = `${record.id}-${grade}`;
//             const gradeKey = `${batchKey}-${grade}`;

//             individualRows.push({
//               id: uniqueId,
//               batchKey: batchKey,
//               gradeKey: gradeKey,
//               batchNo: record.batchNo,
//               displayId: `${record.batchNo}(${grade})`,
//               grade: grade,
//               kgValue: kgValue,
//               isHighGrade: GRADE_GROUPS.HIGH.includes(grade),
//               processingType: record.processingType,
//               totalKgs: record.totalKgs,
//               recordId: record.id,
//               record: record
//             });
//           }
//         });
//       });
//     });

//     // Group identical batch & grade combinations
//     const groupedItems = {};
//     individualRows.forEach(row => {
//       const combinedKey = `${row.batchNo}-${row.grade}`;

//       if (!groupedItems[combinedKey]) {
//         groupedItems[combinedKey] = {
//           ...row,
//           combinedGradeKey: combinedKey,
//           records: [row],
//           recordCount: 1
//         };
//       } else {
//         groupedItems[combinedKey].kgValue += row.kgValue;
//         groupedItems[combinedKey].records.push(row);
//         groupedItems[combinedKey].recordCount += 1;
//       }
//     });

//     // Sort by grade and date
//     const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];
//     return Object.values(groupedItems).sort((a, b) => {
//       const gradeAIndex = gradeOrder.indexOf(a.grade);
//       const gradeBIndex = gradeOrder.indexOf(b.grade);
//       if (gradeAIndex !== gradeBIndex) return gradeAIndex - gradeBIndex;

//       const dateA = extractDateFromBatch(a.batchNo);
//       const dateB = extractDateFromBatch(b.batchNo);
//       if (dateA.month !== dateB.month) return dateA.month - dateB.month;
//       if (dateA.day !== dateB.day) return dateA.day - dateB.day;

//       return a.batchNo.localeCompare(b.batchNo);
//     });
//   };

//   const extractDateFromBatch = (batchNo) => {
//     const dateMatch = batchNo.match(/(\d{2})(\d{2})/);
//     return dateMatch ? { day: parseInt(dateMatch[1], 10), month: parseInt(dateMatch[2], 10) } : { day: 0, month: 0 };
//   };

//   const handleGradeItemSelection = (gradeKey, isSelected) => {
//     setSelectedGradeItems(prev =>
//       isSelected ? [...prev, gradeKey] : prev.filter(key => key !== gradeKey)
//     );
//   };

//   const isGradeItemSelected = (gradeKey) => {
//     return selectedGradeItems.includes(gradeKey);
//   };

//   const handleSelectAllGradeItems = (isSelected) => {
//     setSelectedGradeItems(isSelected ? flattenBatchRecords().map(item => item.gradeKey) : []);
//   };

//   const getSelectedGradeItems = () => {
//     return flattenBatchRecords().filter(item => selectedGradeItems.includes(item.gradeKey));
//   };

//   // Calculate totals for each grade
//   const getGradeTotals = () => {
//     const totals = {};
//     getSelectedGradeItems().forEach(item => {
//       totals[item.grade] = (totals[item.grade] || 0) + item.kgValue;
//     });
//     return totals;
//   };

//   // Calculate total selected KGs
//   useEffect(() => {
//     const total = getSelectedGradeItems().reduce((sum, item) => sum + item.kgValue, 0);
//     setTotalSelectedKgs(total);

//     // Set active tab to first grade if there are selections
//     const selectedGrades = Object.keys(getGradeTotals());
//     if (selectedGrades.length > 0 && !activeGradeTab) {
//       setActiveGradeTab(selectedGrades[0]);
//     }
//   }, [selectedGradeItems]);

//   const handleTransferClick = () => {
//     setShowTransferModal(true);

//     // Set the first grade as the active tab
//     const selectedGrades = Object.keys(getGradeTotals());
//     if (selectedGrades.length > 0) {
//       setActiveGradeTab(selectedGrades[0]);
//     }

//     // Initialize low grade grouping state
//     const lowGrades = selectedGrades.filter(grade => GRADE_GROUPS.LOW.includes(grade));
//     const initialLowGradeGrouping = {};

//     // For each low grade, group all items by default
//     lowGrades.forEach(grade => {
//       initialLowGradeGrouping[grade] = {
//         isGrouped: true,
//         numberOfBags: '',
//         items: getItemsGroupedByGradeAndBatch()[grade] || []
//       };
//     });

//     setLowGradeGrouping(initialLowGradeGrouping);
//   };

//   // Group selected items by grade and then by batch
//   const getItemsGroupedByGradeAndBatch = () => {
//     const gradeGroups = {};

//     getSelectedGradeItems().forEach(item => {
//       if (!gradeGroups[item.grade]) {
//         gradeGroups[item.grade] = [];
//       }
//       gradeGroups[item.grade].push(item);
//     });

//     // Sort batches within each grade
//     Object.keys(gradeGroups).forEach(grade => {
//       gradeGroups[grade].sort((a, b) => {
//         const dateA = extractDateFromBatch(a.batchNo);
//         const dateB = extractDateFromBatch(b.batchNo);
//         if (dateA.month !== dateB.month) return dateA.month - dateB.month;
//         if (dateA.day !== dateB.day) return dateA.day - dateB.day;
//         return a.batchNo.localeCompare(b.batchNo);
//       });
//     });

//     return gradeGroups;
//   };

//   // Handle changes to the low grade grouping settings
//   const handleLowGradeGroupingChange = (grade, field, value) => {
//     setLowGradeGrouping(prev => ({
//       ...prev,
//       [grade]: {
//         ...prev[grade],
//         [field]: value
//       }
//     }));

//     // If grouping is enabled, clear individual batch bag counts
//     if (field === 'isGrouped' && value === true) {
//       const gradeItems = getItemsGroupedByGradeAndBatch()[grade] || [];
//       const updatedGradeQualityDetails = { ...gradeQualityDetails };

//       // Clear individual batch bag counts
//       gradeItems.forEach(item => {
//         item.records.forEach(record => {
//           const batchGradeKey = `${record.recordId}-${grade}`;
//           if (updatedGradeQualityDetails[batchGradeKey]) {
//             delete updatedGradeQualityDetails[batchGradeKey];
//           }
//         });
//       });

//       setGradeQualityDetails(updatedGradeQualityDetails);
//     }
//   };

//   // Handle changes to combined low grade bags
//   const handleCombinedBagsChange = (grade, value) => {
//     setCombinedLowGradeBags(prev => ({
//       ...prev,
//       [grade]: value
//     }));
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
//       // Generate a unique transportGroupId first
//       // const transportGroupResponse = await axios.post(`${API_URL}/transfer/generate-group-id`);
//       // const transportGroupId = transportGroupResponse.data.transportGroupId;
//       const transportGroupId = `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//       const transferPromises = [];
//       const gradeTotals = getGradeTotals();
//       const itemsByGradeAndBatch = getItemsGroupedByGradeAndBatch();
//       const completedTransfers = [];

//       // Process all selected grades
//       Object.keys(itemsByGradeAndBatch).forEach(grade => {
//         const gradeItems = itemsByGradeAndBatch[grade];
//         const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
//         const isGroupedLowGrade = !isHighGrade && lowGradeGrouping[grade]?.isGrouped;

//         // For grouped low grades, create a single transfer with all batches
//         if (isGroupedLowGrade) {
//           const combinedGradeDetails = {};
//           const combinedOutputKgs = {};
//           const batchIds = [];
//           let totalKgs = 0;

//           // Combine all batches for this grade
//           gradeItems.forEach(groupedItem => {
//             groupedItem.records.forEach(originalRecord => {
//               batchIds.push(originalRecord.recordId);
//               totalKgs += originalRecord.kgValue;
//               combinedOutputKgs[originalRecord.grade] = (combinedOutputKgs[originalRecord.grade] || 0) + originalRecord.kgValue;
//             });
//           });

//           // Set the combined bag count
//           combinedGradeDetails[grade] = {
//             numberOfBags: parseInt(combinedLowGradeBags[grade] || 0)
//           };

//           // Create a single transfer for all batches of this grade
//           transferPromises.push(
//             axios.post(`${API_URL}/transfer`, {
//               baggingOffId: batchIds,  // Send all batch IDs as an array
//               batchNo: `${grade}-${new Date().toISOString().slice(0, 10)}`,  // Use a combined batch name with date
//               gradeGroup: 'LOW',
//               outputKgs: combinedOutputKgs,
//               gradeDetails: combinedGradeDetails,
//               isGroupedTransfer: true,  // Important flag for backend to process as grouped transfer
//               transportGroupId: transportGroupId, // Pass the consistent transportGroupId
//               truckNumber: transportDetails.truckNumber,
//               driverName: transportDetails.driverName,
//               driverPhone: transportDetails.driverPhone,
//               notes: transportDetails.notes
//             }).then(response => {
//               completedTransfers.push(response.data);
//               return response;
//             })
//           );
//         } else {
//           // Handle individual batch transfers
//           gradeItems.forEach(groupedItem => {
//             groupedItem.records.forEach(originalRecord => {
//               const gradeDetails = {};
//               const batchId = originalRecord.recordId;
//               const batchGradeKey = `${batchId}-${grade}`;

//               gradeDetails[originalRecord.grade] = {
//                 numberOfBags: parseInt(gradeQualityDetails[batchGradeKey]?.numberOfBags || 0),
//                 ...(isHighGrade ? {
//                   cupProfile: gradeQualityDetails[batchGradeKey]?.cupProfile || CUP_PROFILES[0],
//                   moistureContent: parseFloat(gradeQualityDetails[batchGradeKey]?.moistureContent || 0)
//                 } : {})
//               };

//               const outputKgs = {};
//               outputKgs[originalRecord.grade] = originalRecord.kgValue;

//               transferPromises.push(
//                 axios.post(`${API_URL}/transfer`, {
//                   baggingOffId: originalRecord.recordId,
//                   batchNo: originalRecord.batchKey,
//                   gradeGroup: isHighGrade ? 'HIGH' : 'LOW',
//                   outputKgs: outputKgs,
//                   gradeDetails: gradeDetails,
//                   isGroupedTransfer: false,
//                   transportGroupId: transportGroupId, // Pass the consistent transportGroupId
//                   truckNumber: transportDetails.truckNumber,
//                   driverName: transportDetails.driverName,
//                   driverPhone: transportDetails.driverPhone,
//                   notes: transportDetails.notes
//                 }).then(response => {
//                   completedTransfers.push(response.data);
//                   return response;
//                 })
//               );
//             });
//           });
//         }
//       });

//       // Wait for all transfers to complete
//       await Promise.all(transferPromises);

//       // Refresh untransferred records
//       await fetchUntransferredRecords();
//       // Refresh transfer history to include the new transfers
//       await fetchTransferHistory();

//       // Reset form and selections
//       setSelectedGradeItems([]);
//       setGradeQualityDetails({});
//       setTransportDetails({
//         truckNumber: '',
//         driverName: '',
//         driverPhone: '',
//         notes: ''
//       });
//       setLowGradeBags('');
//       setSelectedLowGrade(null);
//       setShowTransferModal(false);
//       setValidated(false);
//       setActiveGradeTab(null);
//       setLowGradeGrouping({});
//       setCombinedLowGradeBags({});

//       // Show success message with transport group ID for reference
//       // alert(`Transfer completed successfully!\nTransport Group ID: ${transportGroupId}`);
//     } catch (error) {
//       console.error('Transfer error:', error);
//       alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
//     }
//   }

//   const handleQualityDetailsChange = (batchId, grade, field, value) => {
//     const batchGradeKey = `${batchId}-${grade}`;
//     setGradeQualityDetails(prev => ({
//       ...prev,
//       [batchGradeKey]: {
//         ...(prev[batchGradeKey] || {}),
//         [field]: value
//       }
//     }));
//   };

//   const handleTransportDetailsChange = (e) => {
//     const { name, value } = e.target;
//     setTransportDetails(prev => ({ ...prev, [name]: value }));
//   };

//   const fetchUntransferredRecords = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
//       const transfersResponse = await axios.get(`${API_URL}/transfer/cws/${userInfo.cwsId}`);
//       const allTransfers = transfersResponse.data || [];

//       const transfersByBaggingOff = {};
//       allTransfers.forEach(transfer => {
//         if (!transfersByBaggingOff[transfer.baggingOffId]) {
//           transfersByBaggingOff[transfer.baggingOffId] = [];
//         }
//         transfersByBaggingOff[transfer.baggingOffId].push(transfer);
//       });

//       const processedRecords = (response.data || []).map(record => {
//         const recordTransfers = transfersByBaggingOff[record.id] || [];
//         const transferredGrades = {};
//         recordTransfers.forEach(transfer => {
//           if (transfer.outputKgs) {
//             Object.keys(transfer.outputKgs).forEach(grade => {
//               transferredGrades[grade] = true;
//             });
//           }
//         });

//         return {
//           ...record,
//           transferredGrades,
//           hasTransferredGrades: Object.keys(transferredGrades).length > 0,
//           hasUntransferredGrades: record.outputKgs && Object.keys(record.outputKgs).some(grade =>
//             !transferredGrades[grade] && parseFloat(record.outputKgs[grade] || 0) > 0
//           )
//         };
//       });

//       const untransferred = processedRecords.filter(record => record.hasUntransferredGrades);
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

//       setGroupedRecords(grouped);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching records:", error);
//       setError(`Error fetching untransferred records: ${error.message}`);
//       setLoading(false);
//     }
//   };

//   // This function is referenced but never defined in the original code
//   // Adding a stub implementation
//   const fetchTransferHistory = async () => {
//     // Stub implementation
//     console.log("Fetching transfer history");
//     // In a real implementation, you would make an API call here
//   };

//   useEffect(() => {
//     fetchUntransferredRecords();
//   }, []);

//   const getPaginatedBatches = () => {
//     const filtered = flattenBatchRecords().filter(item =>
//       searchTerm ? item.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.processingType.toLowerCase().includes(searchTerm.toLowerCase()) : true
//     );

//     const indexOfLastBatch = currentPage * batchesPerPage;
//     const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
//     return filtered.slice(indexOfFirstBatch, indexOfLastBatch);
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Calculate total KGs for a grade group
//   const calculateGradeGroupTotal = (grade) => {
//     const items = getItemsGroupedByGradeAndBatch()[grade] || [];
//     return items.reduce((sum, item) => sum + item.kgValue, 0);
//   };

//   return (
//     <div className="container-fluid py-4">
//       <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
//         <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
//           <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
//             <Modal.Title>Transfer Parchment</Modal.Title>
//           </Modal.Header>
//           <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
//             {getSelectedGradeItems().length === 0 ? (
//               <Alert variant="warning">No grade items selected for transfer</Alert>
//             ) : (
//               <>
//                 <div className="table-responsive">
//                   <table className="table table-hover">
//                     <thead>
//                       <tr>
//                         <th>Batch & Grade</th>
//                         <th>Processing</th>
//                         <th>Weight (kg)</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getSelectedGradeItems()
//                         .sort((a, b) => {
//                           const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];
//                           const gradeAIndex = gradeOrder.indexOf(a.grade);
//                           const gradeBIndex = gradeOrder.indexOf(b.grade);
//                           if (gradeAIndex !== gradeBIndex) return gradeAIndex - gradeBIndex;

//                           const dateA = extractDateFromBatch(a.batchNo);
//                           const dateB = extractDateFromBatch(b.batchNo);
//                           if (dateA.month !== dateB.month) return dateA.month - dateB.month;
//                           if (dateA.day !== dateB.day) return dateA.day - dateB.day;

//                           return a.batchNo.localeCompare(b.batchNo);
//                         })
//                         .map((item) => (
//                           <tr key={item.id}
//                             style={{
//                               backgroundColor: item.isHighGrade ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
//                               borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
//                             }}
//                           >
//                             <td>
//                               <div className="d-flex align-items-center">
//                                 <div>
//                                   <div className="fw-bold">
//                                     {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
//                                   </div>
//                                   <Badge
//                                     bg={item.isHighGrade ? "success" : "info"}
//                                     className="me-1"
//                                   >
//                                     {item.isHighGrade ? "High Grade" : "Low Grade"}
//                                   </Badge>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>{item.processingType}</td>
//                             <td>{item.kgValue.toFixed(2)} kg</td>
//                             <td>
//                               <Button
//                                 size="sm"
//                                 variant="outline-danger"
//                                 onClick={() => handleGradeItemSelection(item.gradeKey, false)}
//                               >
//                                 Remove
//                               </Button>
//                             </td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Quality Details - Tabbed interface */}
//                 <Card className="mt-3">
//                   <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//                     <span className="h5" style={{ color: processingTheme.primary }}>Details</span>
//                   </Card.Header>
//                   <Card.Body>
//                     <Tab.Container activeKey={activeGradeTab} onSelect={(k) => setActiveGradeTab(k)}>
//                       <Nav variant="tabs" className="mb-3">
//                         {Object.keys(getItemsGroupedByGradeAndBatch()).map(grade => (
//                           <Nav.Item key={grade}>
//                             <Nav.Link eventKey={grade}>
//                               <Badge bg={GRADE_GROUPS.HIGH.includes(grade) ? "success" : "info"} className="me-2">
//                                 {grade}
//                               </Badge>
//                               <span className="fw-bold">{getItemsGroupedByGradeAndBatch()[grade].reduce((sum, item) => sum + item.kgValue, 0).toFixed(2)} kg</span>
//                             </Nav.Link>
//                           </Nav.Item>
//                         ))}
//                       </Nav>
//                       <Tab.Content>
//                         {Object.entries(getItemsGroupedByGradeAndBatch()).map(([grade, items]) => {
//                           const isLowGrade = GRADE_GROUPS.LOW.includes(grade);
//                           return (
//                             <Tab.Pane key={grade} eventKey={grade}>
//                               <div className="mb-3">
//                                 <div className="d-flex justify-content-between align-items-center mb-3">
//                                   <h5>
//                                     {grade} - {items.reduce((sum, item) => sum + item.kgValue, 0).toFixed(2)} kg
//                                   </h5>

//                                   {/* Low Grade Grouping Toggle */}
//                                   {isLowGrade && (
//                                     <Form.Check
//                                       type="switch"
//                                       id={`combine-${grade}`}
//                                       // label="Combine batches in bag"
//                                       checked={lowGradeGrouping[grade]?.isGrouped || false}
//                                       onChange={(e) => handleLowGradeGroupingChange(grade, 'isGrouped', e.target.checked)}
//                                       className="mb-0"
//                                       hidden
//                                     />
//                                   )}
//                                 </div>

//                                 {/* Combined Low Grade Bags Input */}
//                                 {isLowGrade && lowGradeGrouping[grade]?.isGrouped && (
//                                   <div className="mb-3">
//                                     <Form.Group controlId={`combined-bags-${grade}`}>
//                                       <Form.Label>Number of Bags (Combined {grade})</Form.Label>
//                                       <Form.Control
//                                         type="number"
//                                         min="1"
//                                         required
//                                         value={combinedLowGradeBags[grade] || ''}
//                                         onChange={(e) => handleCombinedBagsChange(grade, e.target.value)}
//                                       />
//                                       <Form.Control.Feedback type="invalid">
//                                         Please enter the number of bags.
//                                       </Form.Control.Feedback>
//                                     </Form.Group>
//                                   </div>
//                                 )}

//                                 {/* Individual Batch Details */}
//                                 {!isLowGrade || !lowGradeGrouping[grade]?.isGrouped ? (
//                                   <div className="table-responsive">
//                                     <table className="table table-sm">
//                                       <thead>
//                                         <tr>
//                                           <th>Batch</th>
//                                           <th>Weight (kg)</th>
//                                           <th>Bags</th>
//                                           {!isLowGrade && (
//                                             <>
//                                               <th>Cup Profile</th>
//                                               <th>Moisture %</th>
//                                             </>
//                                           )}
//                                         </tr>
//                                       </thead>
//                                       <tbody>
//                                         {items.map((item) => (
//                                           item.records.map((record) => {
//                                             const batchGradeKey = `${record.recordId}-${grade}`;
//                                             return (
//                                               <tr key={record.id}>
//                                                 <td>{record.batchNo}</td>
//                                                 <td>{record.kgValue.toFixed(2)} kg</td>
//                                                 <td style={{ minWidth: '100px' }}>
//                                                   <Form.Control
//                                                     type="number"
//                                                     size="sm"
//                                                     min="1"
//                                                     required
//                                                     value={gradeQualityDetails[batchGradeKey]?.numberOfBags || ''}
//                                                     onChange={(e) => handleQualityDetailsChange(record.recordId, grade, 'numberOfBags', e.target.value)}
//                                                   />
//                                                 </td>
//                                                 {!isLowGrade && (
//                                                   <>
//                                                     <td style={{ minWidth: '120px' }}>
//                                                       <Form.Select
//                                                         size="sm"
//                                                         required
//                                                         value={gradeQualityDetails[batchGradeKey]?.cupProfile || CUP_PROFILES[0]}
//                                                         onChange={(e) => handleQualityDetailsChange(record.recordId, grade, 'cupProfile', e.target.value)}
//                                                       >
//                                                         {CUP_PROFILES.map(profile => (
//                                                           <option key={profile} value={profile}>{profile}</option>
//                                                         ))}
//                                                       </Form.Select>
//                                                     </td>
//                                                     <td style={{ minWidth: '100px' }}>
//                                                       <Form.Control
//                                                         type="number"
//                                                         size="sm"
//                                                         step="0.01"
//                                                         min="0"
//                                                         max="20"
//                                                         required
//                                                         value={gradeQualityDetails[batchGradeKey]?.moistureContent || ''}
//                                                         onChange={(e) => handleQualityDetailsChange(record.recordId, grade, 'moistureContent', e.target.value)}
//                                                       />
//                                                     </td>
//                                                   </>
//                                                 )}
//                                               </tr>
//                                             );
//                                           })
//                                         ))}
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                 ) : (
//                                   <Alert variant="info">
//                                     All {grade} batches will be combined into {combinedLowGradeBags[grade] || '0'} bags
//                                   </Alert>
//                                 )}
//                               </div>
//                             </Tab.Pane>
//                           );
//                         })}
//                       </Tab.Content>
//                     </Tab.Container>
//                   </Card.Body>
//                 </Card>

//                 {/* Transport Details Form */}
//                 <Card className="mt-3">
//                   <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//                     <span className="h5" style={{ color: processingTheme.primary }}>Transport Information</span>
//                   </Card.Header>
//                   <Card.Body>
//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3" controlId="truckNumber">
//                           <Form.Label>Truck Number</Form.Label>
//                           <Form.Control
//                             type="text"
//                             required
//                             name="truckNumber"
//                             value={transportDetails.truckNumber}
//                             onChange={handleTransportDetailsChange}
//                           />
//                           <Form.Control.Feedback type="invalid">
//                             Please enter the truck number.
//                           </Form.Control.Feedback>
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group className="mb-3" controlId="driverName">
//                           <Form.Label>Driver Name</Form.Label>
//                           <Form.Control
//                             type="text"
//                             required
//                             name="driverName"
//                             value={transportDetails.driverName}
//                             onChange={handleTransportDetailsChange}
//                           />
//                           <Form.Control.Feedback type="invalid">
//                             Please enter the driver's name.
//                           </Form.Control.Feedback>
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3" controlId="driverPhone">
//                           <Form.Label>Driver Phone</Form.Label>
//                           <Form.Control
//                             type="text"
//                             required
//                             name="driverPhone"
//                             value={transportDetails.driverPhone}
//                             onChange={handleTransportDetailsChange}
//                           />
//                           <Form.Control.Feedback type="invalid">
//                             Please enter the driver's phone number.
//                           </Form.Control.Feedback>
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group className="mb-3" controlId="notes">
//                           <Form.Label>Notes</Form.Label>
//                           <Form.Control
//                             as="textarea"
//                             rows={2}
//                             name="notes"
//                             value={transportDetails.notes}
//                             onChange={handleTransportDetailsChange}
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>
//               </>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               variant="sucafina"
//               disabled={getSelectedGradeItems().length === 0}
//               style={{
//                 backgroundColor: processingTheme.primary,
//                 borderColor: processingTheme.primary
//               }}
//             >
//               Confirm Transfer
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//       <Card className="mb-4">
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <span className="h5" style={{ color: processingTheme.primary }}>
//             Transport to HQ
//           </span>
//         </Card.Header>
//         <Card.Body>
//           <div className="d-flex flex-column flex-md-row justify-content-between">
//             {/* Left Column - Summary Information */}
//             <div className="mb-3 mb-md-0">
//               <h5 className="mb-2">Transport Summary</h5>

//               {/* Basic Stats Row */}
//               <div className="d-flex flex-wrap gap-4 mb-2">
//                 <div><strong>Batches:</strong> {new Set(getSelectedGradeItems().map(item => item.batchNo)).size}</div>
//                 <div><strong>Grades:</strong> {new Set(getSelectedGradeItems().map(item => item.grade)).size}</div>
//               </div>

//               {/* Grade Breakdown */}
//               {Object.entries(getGradeTotals()).length > 0 && (
//                 <div className="mb-3">
//                   <strong className="d-block mb-1">Grade Breakdown:</strong>
//                   <div className="d-flex flex-wrap gap-3">
//                     {Object.entries(getGradeTotals()).map(([grade, total]) => (
//                       <div key={grade} className="d-flex align-items-center">
//                         <Badge bg={GRADE_GROUPS.HIGH.includes(grade) ? "success" : "info"} className="me-1">
//                           {grade}
//                         </Badge>
//                         <span>{total.toFixed(2)} kg</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Highlighted Total KGs */}
//               <div className="p-2 rounded-3" style={{
//                 backgroundColor: processingTheme.primaryLight || '#e6f2ff',
//                 border: `1px solid ${processingTheme.primary}`,
//                 display: 'inline-block'
//               }}>
//                 <span className="fs-6 fw-bold" style={{ color: processingTheme.primary }}>
//                   Total Kgs: {totalSelectedKgs.toFixed(2)} kg
//                 </span>
//               </div>
//             </div>

//             {/* Right Column - Grade Summary and Action Button */}
//             <div className="d-flex flex-column justify-content-between">
//               <div className="mb-3">
//                 <div className="mb-2">
//                   <strong>High Grades:</strong> {getSelectedGradeItems()
//                     .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
//                     .reduce((sum, item) => sum + item.kgValue, 0)
//                     .toFixed(2)} kg
//                 </div>
//                 <div>
//                   <strong>Low Grades:</strong> {getSelectedGradeItems()
//                     .filter(item => GRADE_GROUPS.LOW.includes(item.grade))
//                     .reduce((sum, item) => sum + item.kgValue, 0)
//                     .toFixed(2)} kg
//                 </div>
//               </div>

//               <Button
//                 size="md"
//                 variant="sucafina"
//                 disabled={getSelectedGradeItems().length === 0}
//                 onClick={handleTransferClick}
//                 style={{
//                   backgroundColor: processingTheme.primary,
//                   borderColor: processingTheme.primary,
//                   alignSelf: 'flex-end'
//                 }}
//               >
//                 Transport To HQ
//               </Button>
//             </div>
//           </div>
//         </Card.Body>
//       </Card>
//       {/* Transfer Modal with Tabbed Interface */}
      

//       {/* Batch Selection Table */}
//       <Card>
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <div className="d-flex justify-content-between align-items-center">
//             <span className="h5" style={{ color: processingTheme.primary }}>
//               Available Parchment Batches
//             </span>
//             <div className="d-flex align-items-center">
//               <InputGroup className="me-2" style={{ width: '250px' }}>
//                 <InputGroup.Text>
//                   <i className="bi bi-search"></i>
//                 </InputGroup.Text>
//                 <Form.Control
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </InputGroup>
//               <Form.Check
//                 type="checkbox"
//                 label="Select All"
//                 onChange={(e) => handleSelectAllGradeItems(e.target.checked)}
//                 checked={selectedGradeItems.length === flattenBatchRecords().length && flattenBatchRecords().length > 0}
//               />
//             </div>
//           </div>
//         </Card.Header>
//         <Card.Body>
//           {loading ? (
//             <Placeholder as="div" animation="glow">
//               <Placeholder xs={12} style={{ height: '1.5rem', marginBottom: '0.5rem' }} />
//               <Placeholder xs={12} style={{ height: '1.5rem', marginBottom: '0.5rem' }} />
//               <Placeholder xs={12} style={{ height: '1.5rem', marginBottom: '0.5rem' }} />
//             </Placeholder>
//           ) : error ? (
//             <Alert variant="danger">{error}</Alert>
//           ) : (
//             <>
//               <div className="table-responsive">
//                 <table className="table table-hover">
//                   <thead>
//                     <tr>
//                       <th style={{ width: '40px' }}></th>
//                       <th>Batch & Grade</th>
//                       <th>Processing</th>
//                       <th>Weight (kg)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getPaginatedBatches().map((item) => (
//                       <tr key={item.id}
//                         onClick={() => handleGradeItemSelection(item.gradeKey, !isGradeItemSelected(item.gradeKey))}
//                         style={{
//                           backgroundColor: isGradeItemSelected(item.gradeKey) ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         <td>
//                           <Form.Check
//                             type="checkbox"
//                             checked={isGradeItemSelected(item.gradeKey)}
//                             onChange={(e) => handleGradeItemSelection(item.gradeKey, e.target.checked)}
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </td>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <div>
//                               <div className="fw-bold">
//                                 {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
//                               </div>
//                               <Badge
//                                 bg={item.isHighGrade ? "success" : "info"}
//                                 className="me-1"
//                               >
//                                 {item.isHighGrade ? "High Grade" : "Low Grade"}
//                               </Badge>
//                               {item.recordCount > 1 && (
//                                 <Badge bg="secondary" className="me-1">
//                                   {item.recordCount} batches
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td>{item.processingType}</td>
//                         <td>{item.kgValue.toFixed(2)} kg</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {flattenBatchRecords().length > batchesPerPage && (
//                 <nav>
//                   <ul className="pagination">
//                     <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                       <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
//                     </li>
//                     {[...Array(Math.ceil(flattenBatchRecords().length / batchesPerPage)).keys()].map(number => (
//                       <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
//                         <button
//                           className="page-link"
//                           onClick={() => paginate(number + 1)}
//                           style={currentPage === number + 1 ? { backgroundColor: processingTheme.primary, borderColor: processingTheme.primary } : {}}
//                         >
//                           {number + 1}
//                         </button>
//                       </li>
//                     ))}
//                     <li className={`page-item ${currentPage === Math.ceil(flattenBatchRecords().length / batchesPerPage) ? 'disabled' : ''}`}>
//                       <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
//                     </li>
//                   </ul>
//                 </nav>
//               )}

//               {flattenBatchRecords().length === 0 && (
//                 <Alert variant="info">
//                   No untransferred batches found. All batches have been transferred or there are no batches available.
//                 </Alert>
//               )}
//             </>
//           )}
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Transfer;
