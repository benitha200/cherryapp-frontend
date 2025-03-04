import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Accordion, Row, Col } from 'react-bootstrap';
import API_URL from '../../constants/Constants';
import AlertModal from '../CwsManager/AlertModal';

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
                                {['Batch No', 'Processing Type', 'Total KGs', 'Output KGs', 'Moisture', 'CWS', 'Date', 'Status'].map((header) => (
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
                                    {[...Array(8)].map((_, cellIdx) => (
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

const WetTransfer = () => {
    const [groupedRecords, setGroupedRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState({});
    const [availableGrades, setAvailableGrades] = useState([]);
    const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedBatches, setExpandedBatches] = useState({});
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [cwsList, setCwsList] = useState([]);
    const [selectedDestinationCws, setSelectedDestinationCws] = useState('');
    const [modalBatchSearch, setModalBatchSearch] = useState('');
    const [moistureValues, setMoistureValues] = useState({});
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const [honeyOutputKgs, setHoneyOutputKgs] = useState({ H1: '' });
    const [naturalOutputKgs, setNaturalOutputKgs] = useState({
        N1: '', N2: '', B1: '', B2: ''
    });
    const [fullyWashedOutputKgs, setFullyWashedOutputKgs] = useState({
        A0: '', A1: ''
    });

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    // Define allowed grades based on processing type
    const getOutputGradesForProcessingType = (processingType, grade) => {
        // Default case
        return ['A0', 'A1'];
    };

    const getFilteredBatches = () => {
        const searchTermLower = searchTerm.toLowerCase();
        return Object.keys(groupedRecords).filter(uniqueKey => {
            const record = groupedRecords[uniqueKey][0];
            const batchNo = record.batchNo; // Extract batchNo from the unique key

            // Filter out batches where batchNo ends with "B" and "-2"
            if (batchNo.endsWith("B") || batchNo.endsWith("-2")) {
                return false;
            }

            return batchNo.toLowerCase().includes(searchTermLower) ||
                record.processingType.toLowerCase().includes(searchTermLower) ||
                record.grade.toLowerCase().includes(searchTermLower);
        });
    };

    const filteredBatches = getFilteredBatches();

    useEffect(() => {
        fetchProcessingRecords();
        fetchCwsList();
    }, []);

    // Get processing types for a batch
    const getProcessingTypesForBatch = (batchKey) => {
        const records = groupedRecords[batchKey] || [];
        return [...new Set(records.map(record => record.processingType))];
    };

    useEffect(() => {
        // Extract all available grades from selected batches based on processing type
        const grades = {};
        selectedBatches.forEach(uniqueKey => {
            const batchRecords = groupedRecords[uniqueKey] || [];
            batchRecords.forEach(record => {
                const processingType = record.processingType;
                const gradePrefix = record.grade.charAt(0);
                const allowedGrades = getOutputGradesForProcessingType(processingType, gradePrefix);

                allowedGrades.forEach(grade => {
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
            if (selectedGrades[grade] === undefined) {
                newSelectedGrades[grade] = true;
            }
        });

        setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));
    }, [selectedBatches, groupedRecords]);

    useEffect(() => {
        // Initialize moisture values for each grade if not already set
        const newMoistureValues = { ...moistureValues };
        let moistureValuesChanged = false;

        selectedBatches.forEach(uniqueKey => {
            const batchRecords = groupedRecords[uniqueKey] || [];
            batchRecords.forEach(record => {
                const processingType = record.processingType;
                const gradePrefix = record.grade.charAt(0);
                const allowedGrades = getOutputGradesForProcessingType(processingType, gradePrefix);

                allowedGrades.forEach(grade => {
                    const key = `${uniqueKey}-${grade}`;
                    if (!newMoistureValues[key]) {
                        newMoistureValues[key] = '0.0'; // Default moisture value
                        moistureValuesChanged = true;
                    }
                });
            });
        });

        if (moistureValuesChanged) {
            setMoistureValues(newMoistureValues);
        }
    }, [selectedBatches, groupedRecords]);

    useEffect(() => {
        // Initialize output quantities for each grade if not already set
        const newHoneyOutputKgs = { ...honeyOutputKgs };
        const newNaturalOutputKgs = { ...naturalOutputKgs };
        const newFullyWashedOutputKgs = { ...fullyWashedOutputKgs };
        let outputKgsChanged = false;

        selectedBatches.forEach(uniqueKey => {
            const batchRecords = groupedRecords[uniqueKey] || [];
            batchRecords.forEach(record => {
                const processingType = record.processingType;
                const gradePrefix = record.grade.charAt(0);
                const allowedGrades = getOutputGradesForProcessingType(processingType, gradePrefix);

                allowedGrades.forEach(grade => {
                    if (grade.startsWith('H') && !newHoneyOutputKgs[grade]) {
                        newHoneyOutputKgs[grade] = '';
                        outputKgsChanged = true;
                    } else if ((grade.startsWith('N') || grade.startsWith('B')) && !newNaturalOutputKgs[grade]) {
                        newNaturalOutputKgs[grade] = '';
                        outputKgsChanged = true;
                    } else if (!newFullyWashedOutputKgs[grade]) {
                        newFullyWashedOutputKgs[grade] = '';
                        outputKgsChanged = true;
                    }
                });
            });
        });

        if (outputKgsChanged) {
            setHoneyOutputKgs(newHoneyOutputKgs);
            setNaturalOutputKgs(newNaturalOutputKgs);
            setFullyWashedOutputKgs(newFullyWashedOutputKgs);
        }
    }, [selectedBatches, groupedRecords]);

    useEffect(() => {
        // Calculate total selected KGs
        calculateTotalSelectedKgs();
    }, [selectedBatches, selectedGrades, honeyOutputKgs, naturalOutputKgs, fullyWashedOutputKgs]);

    const calculateTotalSelectedKgs = () => {
        // First check if there are any output KGs entered
        let hasOutputKgsEntered = false;

        // Check if any output KGs have been entered for any selected grade
        Object.keys(selectedGrades).forEach(grade => {
            if (selectedGrades[grade]) {
                const kgsValue = grade.startsWith('H') ? honeyOutputKgs[grade] :
                    grade.startsWith('N') || grade.startsWith('B') ? naturalOutputKgs[grade] :
                        fullyWashedOutputKgs[grade];

                if (kgsValue && parseFloat(kgsValue) > 0) {
                    hasOutputKgsEntered = true;
                }
            }
        });

        // If output KGs are entered, use those values instead of the original batch totals
        if (hasOutputKgsEntered) {
            let total = 0;
            Object.keys(selectedGrades).forEach(grade => {
                if (selectedGrades[grade]) {
                    const kgsValue = grade.startsWith('H') ? honeyOutputKgs[grade] :
                        grade.startsWith('N') || grade.startsWith('B') ? naturalOutputKgs[grade] :
                            fullyWashedOutputKgs[grade];

                    if (kgsValue && !isNaN(parseFloat(kgsValue))) {
                        total += parseFloat(kgsValue);
                    }
                }
            });
            setTotalSelectedKgs(total);
        } else {
            // Fall back to the original calculation if no output KGs entered
            let total = 0;
            selectedBatches.forEach(uniqueKey => {
                const batchRecords = groupedRecords[uniqueKey] || [];
                batchRecords.forEach(record => {
                    if (selectedGrades[record.grade]) {
                        total += parseFloat(record.totalKgs);
                    }
                });
            });
            setTotalSelectedKgs(total);
        }
    };

    const fetchProcessingRecords = async () => {
        try {
            const response = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`);

            // Filter records where processingType is FULLY_WASHED and status is IN_PROGRESS
            const filteredRecords = response.data.filter(record =>
                record.status === "IN_PROGRESS" &&
                (record.processingType === "FULLY_WASHED" || record.processingType === "FULLY WASHED")
            );

            // Group by batchNo and ensure unique keys by appending the record id
            setGroupedRecords(filteredRecords.reduce((acc, record) => {
                const uniqueKey = `${record.batchNo}-${record.id}`; // Combine batchNo and id
                acc[uniqueKey] = [record]; // Use the unique key
                return acc;
            }, {}));
            setLoading(false);
        } catch (error) {
            setError('Error fetching processing records');
            console.error('Fetch error:', error);
            setLoading(false);
        }
    };

    const fetchCwsList = async () => {
        try {
            // Fetch all CWS locations except the current one
            const response = await axios.get(`${API_URL}/cws`);
            const filteredCws = response.data.filter(cws =>
                cws.id !== userInfo.cwsId && cws.name !== "TEST"
            );
            setCwsList(filteredCws);

            // Set default destination CWS if available
            if (filteredCws.length > 0) {
                setSelectedDestinationCws(filteredCws[0].id);
            }
        } catch (error) {
            console.error('Error fetching CWS list:', error);
        }
    };

    const handleBatchSelectionChange = (uniqueKey, isSelected) => {
        if (isSelected) {
            setSelectedBatches(prev => [...prev, uniqueKey]);
        } else {
            setSelectedBatches(prev => prev.filter(key => key !== uniqueKey));
        }
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

    const handleMoistureChange = (uniqueKey, grade, value) => {
        // Validate moisture content (between 0-100)
        const moisture = parseFloat(value);
        if (isNaN(moisture) || moisture < 0 || moisture > 100) {
            return;
        }

        setMoistureValues(prev => ({
            ...prev,
            [`${uniqueKey}-${grade}`]: value
        }));
    };

    const handleTransferClick = () => {
        setShowTransferModal(true);
    };

    const handleTransferConfirm = async () => {
        try {
            const recordsToTransfer = [];

            selectedBatches.forEach(uniqueKey => {
                const batchRecords = groupedRecords[uniqueKey];
                batchRecords.forEach(record => {
                    const processingType = record.processingType;
                    const gradePrefix = record.grade.charAt(0);
                    const allowedGrades = getOutputGradesForProcessingType(processingType, gradePrefix);

                    // Only include this record if its grade is selected and is an allowed output grade
                    allowedGrades.forEach(grade => {
                        if (selectedGrades[grade]) {
                            recordsToTransfer.push({
                                ...record,
                                grade: grade,
                                moistureContent: parseFloat(moistureValues[`${uniqueKey}-${grade}`] || 0.0),
                                outputKgs: parseFloat(fullyWashedOutputKgs[grade] || 0
                                )
                            });
                        }
                    });
                });
            });

            await Promise.all(recordsToTransfer.map(record =>
                axios.post(`${API_URL}/wet-transfer`, {
                    processingId: record.id,
                    batchNo: record.batchNo,
                    date: new Date().toISOString(),
                    sourceCwsId: userInfo.cwsId,
                    destinationCwsId: selectedDestinationCws,
                    totalKgs: record.totalKgs,
                    outputKgs: record.outputKgs,
                    grade: record.grade,
                    processingType: record.processingType,
                    moistureContent: record.moistureContent
                })
            ));

            await fetchProcessingRecords();
            setSelectedBatches([]);
            setSelectedGrades({});
            setMoistureValues({});
            setHoneyOutputKgs({ H1: '' });
            setNaturalOutputKgs({ N1: '', N2: '', B1: '', B2: '' });
            setFullyWashedOutputKgs({ A0: '', A1: '', A2: '', A3: '', B1: '', B2: '' });
            setShowTransferModal(false);


            setAlertTitle('Success');
            setAlertMessage('Wet Transfer completed successfully');
            setShowAlertModal(true);
        } catch (error) {
            console.error('Transfer error:', error);
            setAlertTitle('Error');
            setAlertMessage('Failed to complete wet transfer');
            setShowAlertModal(true);
        }
    };

    // Get unique processing types from records
    const getUniqueProcessingTypes = (records) => {
        const uniqueTypes = [...new Set(records.map(record => record.processingType))];
        return uniqueTypes.map(type => (
            <div key={type} className="small">
                {type}
            </div>
        ));
    };

    // Get total KGs per grade for selected batches
    const getGradeTotals = () => {
        const totals = {};

        selectedBatches.forEach(uniqueKey => {
            const batchRecords = groupedRecords[uniqueKey] || [];
            batchRecords.forEach(record => {
                const grade = record.grade;
                if (!totals[grade]) {
                    totals[grade] = 0;
                }
                totals[grade] += parseFloat(record.totalKgs);
            });
        });

        return totals;
    };

    // Get all available grades for the selected batches based on processing types
    const getAllowedGradesForSelectedBatches = () => {
        const allowedGrades = new Set();

        selectedBatches.forEach(uniqueKey => {
            const batchRecords = groupedRecords[uniqueKey] || [];
            batchRecords.forEach(record => {
                const processingType = record.processingType;
                const gradePrefix = record.grade.charAt(0);
                const grades = getOutputGradesForProcessingType(processingType, gradePrefix);

                grades.forEach(grade => allowedGrades.add(grade));
            });
        });

        return Array.from(allowedGrades);
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const gradeTotals = getGradeTotals();
    const sourceCwsName = selectedBatches.length > 0 && groupedRecords[selectedBatches[0]][0].cws?.name;
    const destinationCwsName = cwsList.find(cws => cws.id === selectedDestinationCws)?.name;


    return (
        <div className="container-fluid py-4">
            {/* New Wet Transfer Panel at the top */}
            <Card className="mb-4">
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className="h5" style={{ color: processingTheme.primary }}>
                        Create New Wet Transfer
                    </span>
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Destination CWS</strong></Form.Label>
                                    <Form.Select
                                        value={selectedDestinationCws}
                                        onChange={(e) => setSelectedDestinationCws(e.target.value)}
                                    >
                                        {cwsList.map(cws => (
                                            <option key={cws.id} value={cws.id}>{cws.name}</option>
                                        ))}
                                        {cwsList.length === 0 && (
                                            <option disabled>No CWS locations available</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>

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
                                            {selectedBatches.map(uniqueKey => (
                                                <Badge
                                                    key={uniqueKey}
                                                    bg="light"
                                                    text="dark"
                                                    className="me-2 mb-2 p-2"
                                                    style={{ backgroundColor: processingTheme.neutral }}
                                                >
                                                    {groupedRecords[uniqueKey][0].batchNo} ({groupedRecords[uniqueKey].reduce((sum, r) => sum + r.totalKgs, 0).toFixed(2)} kg)
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="p-0 ms-1"
                                                        onClick={() => handleBatchSelectionChange(uniqueKey, false)}
                                                        style={{ color: processingTheme.primary }}
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
                                        <strong>Output Grades</strong>
                                        <div>
                                            <Button
                                                variant="outline-sucafina"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => {
                                                    const allSelected = Object.values(selectedGrades).every(value => value);
                                                    const newSelectedGrades = {};
                                                    getAllowedGradesForSelectedBatches().forEach(grade => {
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

                                    <div className="grades-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '30px' }}></th>
                                                    <th>Grade</th>
                                                    <th>Processing Type</th>
                                                    <th>Transfered KGs</th>
                                                    <th>Moisture %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getAllowedGradesForSelectedBatches().map((grade) => {
                                                    // Display associated processing type
                                                    let associatedProcessingType = "";
                                                    if (grade.startsWith('H')) {
                                                        associatedProcessingType = "Honey";
                                                    } else if (grade.startsWith('N')) {
                                                        associatedProcessingType = "Natural";
                                                    } else if (grade.startsWith('A')) {
                                                        associatedProcessingType = "Fully Washed";
                                                    }

                                                    return (
                                                        <tr key={grade}>
                                                            <td>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    id={`grade-${grade}`}
                                                                    checked={selectedGrades[grade] || false}
                                                                    onChange={(e) => handleGradeSelectionChange(grade, e.target.checked)}
                                                                />
                                                            </td>
                                                            <td>{grade}</td>
                                                            <td>{associatedProcessingType}</td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    size="sm"
                                                                    style={{ width: '80px' }}
                                                                    value={
                                                                        grade.startsWith('H') ? honeyOutputKgs[grade] :
                                                                            grade.startsWith('N') || grade.startsWith('B') ? naturalOutputKgs[grade] :
                                                                                fullyWashedOutputKgs[grade] || ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (grade.startsWith('H')) {
                                                                            setHoneyOutputKgs(prev => ({ ...prev, [grade]: value }));
                                                                        } else if (grade.startsWith('N') || grade.startsWith('B')) {
                                                                            setNaturalOutputKgs(prev => ({ ...prev, [grade]: value }));
                                                                        } else {
                                                                            setFullyWashedOutputKgs(prev => ({ ...prev, [grade]: value }));
                                                                        }
                                                                    }}
                                                                    step="0.5"
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Form.Control
                                                                    type="number"
                                                                    size="sm"
                                                                    style={{ width: '80px' }}
                                                                    value={moistureValues[`${selectedBatches[0]}-${grade}`] || '0.0'}
                                                                    onChange={(e) => handleMoistureChange(selectedBatches[0], grade, e.target.value)}
                                                                    step="0.5"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-md-4">
                            <Card style={{ backgroundColor: processingTheme.neutral }}>
                                <Card.Body>
                                    <h5>Wet Transfer Summary</h5>
                                    <p><strong>From CWS:</strong> {sourceCwsName || 'Not selected'}</p>
                                    <p><strong>To CWS:</strong> {destinationCwsName || 'Not selected'}</p>
                                    <p><strong>Selected Batches:</strong> {selectedBatches.length}</p>
                                    <p><strong>Processing Types:</strong> {selectedBatches.length > 0 ?
                                        [...new Set(selectedBatches.flatMap(batch => getProcessingTypesForBatch(batch)))].join(', ') :
                                        'None'
                                    }</p>
                                    <p><strong>Selected Grades:</strong> {Object.entries(selectedGrades).filter(([_, isSelected]) => isSelected).length}</p>
                                    <p><strong>Total KGs:</strong> {totalSelectedKgs.toFixed(2)} kg</p>

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            disabled={
                                                selectedBatches.length === 0 ||
                                                totalSelectedKgs === 0 ||
                                                !selectedDestinationCws ||
                                                Object.entries(selectedGrades).some(([grade, isSelected]) => {
                                                    if (!isSelected || (grade !== 'A0' && grade !== 'A1')) {
                                                        return false; // Skip validation for non-selected grades or grades other than A0/A1
                                                    }

                                                    const transferredKgs = fullyWashedOutputKgs[grade];
                                                    const moistureContent = parseFloat(moistureValues[`${selectedBatches[0]}-${grade}`] || 0);

                                                    return !transferredKgs || parseFloat(transferredKgs) <= 0 || isNaN(moistureContent) || moistureContent <= 0;
                                                })
                                            }

                                            onClick={handleTransferClick}
                                            style={{
                                                backgroundColor: processingTheme.primary,
                                                borderColor: processingTheme.primary
                                            }}
                                        >
                                            Create Wet Transfer
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
                            Available Batches for Wet Transfer ({filteredBatches.length})
                        </span>
                        <div className="d-flex">
                            <InputGroup>
                                <Form.Control
                                    placeholder="Search batches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm('')}
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
                            <thead style={{ backgroundColor: processingTheme.neutral }}>
                                <tr>
                                    <th style={{ width: '30px' }}>
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectAllChecked}
                                            onChange={(e) => handleSelectAllBatches(e.target.checked)}
                                            title="Select All Visible Batches"
                                        />
                                    </th>
                                    <th>Batch No</th>
                                    <th>Processing Types</th>
                                    <th>Total KGs</th>
                                    <th>Grade</th>
                                    <th>CWS</th>
                                    <th>Start Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-4"
                                            style={{
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            No batches found for wet transfer!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBatches.map((uniqueKey) => {
                                        const records = groupedRecords[uniqueKey];
                                        const isExpanded = expandedBatches[uniqueKey];
                                        const isSelected = selectedBatches.includes(uniqueKey);

                                        return (
                                            <React.Fragment key={uniqueKey}>
                                                <tr
                                                    className={isSelected ? 'table-active' : ''}
                                                    onClick={() => handleBatchSelectionChange(uniqueKey, !isSelected)} style={{ cursor: 'pointer' }}
                                                >
                                                    <td>
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleBatchSelectionChange(uniqueKey, e.target.checked);
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{records[0].batchNo}</td>
                                                    <td>{getUniqueProcessingTypes(records)}</td>
                                                    <td>{records.reduce((total, r) => total + parseFloat(r.totalKgs || 0), 0).toFixed(2)} kg</td>
                                                    <td>
                                                        {[...new Set(records.map(r => r.grade))].join(', ')}
                                                    </td>
                                                    <td>{records[0]?.cws?.name || 'Unknown'}</td>
                                                    <td>{new Date(records[0]?.startDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <Badge
                                                            bg="info"
                                                            text="dark"
                                                            style={{
                                                                backgroundColor: processingTheme.neutral,
                                                                color: processingTheme.primary
                                                            }}
                                                        >
                                                            In Progress
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="expanded-row">
                                                        <td colSpan="8" className="p-0">
                                                            <div className="p-3" style={{ backgroundColor: processingTheme.tableHover }}>
                                                                <h6>Sub-Batches</h6>
                                                                <table className="table table-sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Batch No</th>
                                                                            <th>Processing Type</th>
                                                                            <th>Total KGs</th>
                                                                            <th>Grade</th>
                                                                            <th>Date</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {records.map((record) => (
                                                                            <tr key={record.id}>
                                                                                <td>{record.batchNo}</td>
                                                                                <td>{record.processingType}</td>
                                                                                <td>{parseFloat(record.totalKgs).toFixed(2)} kg</td>
                                                                                <td>{record.grade}</td>
                                                                                <td>{new Date(record.startDate).toLocaleDateString()}</td>
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
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            {/* Transfer Modal */}
            <Modal
                show={showTransferModal}
                onHide={() => setShowTransferModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
                    <Modal.Title>Confirm Wet Transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Accordion defaultActiveKey="0">

                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Selected Grades</Accordion.Header>
                            <Accordion.Body>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Grade</th>
                                            <th>Processing Type</th>
                                            <th>Transfered KGs</th>
                                            <th>Moisture %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAllowedGradesForSelectedBatches().map(grade => {
                                            if (!selectedGrades[grade]) return null;

                                            // Display associated processing type
                                            let associatedProcessingType = "";
                                            if (grade.startsWith('H')) {
                                                associatedProcessingType = "Honey";
                                            } else if (grade.startsWith('N')) {
                                                associatedProcessingType = "Natural";
                                            } else if (grade.startsWith('A')) {
                                                associatedProcessingType = "Fully Washed";
                                            }

                                            return (
                                                <tr key={grade}>
                                                    <td>{grade}</td>
                                                    <td>{associatedProcessingType}</td>
                                                    <td>
                                                        {grade.startsWith('H') ? honeyOutputKgs[grade] :
                                                            grade.startsWith('N') || grade.startsWith('B') ? naturalOutputKgs[grade] :
                                                                fullyWashedOutputKgs[grade] || 0} kg
                                                    </td>
                                                    <td>
                                                        {moistureValues[`${selectedBatches[0]}-${grade}`] || '0.0'}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Row className="mt-3">
                        <Col>
                        <Alert variant="warning">
                                Please confirm that you are about to transfer coffee from {sourceCwsName} to {destinationCwsName}.
                                This action cannot be undone.
                            </Alert>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleTransferConfirm}
                        style={{
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }}
                    >
                        Confirm Transfer
                    </Button>
                </Modal.Footer>
            </Modal>
            <AlertModal
                show={showAlertModal}
                onHide={() => setShowAlertModal(false)}
                title={alertTitle}
                message={alertMessage}
            />

        </div>
    );
};

export default WetTransfer;