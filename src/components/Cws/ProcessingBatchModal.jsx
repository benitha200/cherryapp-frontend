import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, Tab, Tabs, Placeholder, Table } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    accent: '#D95032',     // Complementary orange
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
    centralStation: '#008080'  // Main teal for central station badge
};

const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit, onComplete }) => {
    const [existingProcessing, setExistingProcessing] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [honeyOutputKgs, setHoneyOutputKgs] = useState({ H1: '' });
    const [naturalOutputKgs, setNaturalOutputKgs] = useState({
        N1: '', N2: '', B1: '', B2: ''
    });
    const [fullyWashedOutputKgs, setFullyWashedOutputKgs] = useState({
        A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
    });
    const [loading, setLoading] = useState(false);
    const [savedBaggingOffs, setSavedBaggingOffs] = useState([]);
    const [progressiveMode, setProgressiveMode] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const resetModalState = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        resetOutputs();
        setExistingProcessing(null);
        setSavedBaggingOffs([]);
        setIsEditing(false);
        setEditingRecord(null);
    };

    const resetOutputs = () => {
        setHoneyOutputKgs({ H1: '' });
        setNaturalOutputKgs({
            N1: '', N2: '', B1: '', B2: ''
        });
        setFullyWashedOutputKgs({
            A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
        });
    };

    const fetchExistingProcessingDetails = async (batchNo) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/processing/batch/${batchNo}`);

            if (response.data && response.data.length > 0) {
                setExistingProcessing(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching processing details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingDetails(batches[0].batchNo);
            resetOutputs();
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const handleHoneyOutputChange = (value) => {
        setHoneyOutputKgs({ H1: value });
    };

    const handleNaturalOutputChange = (field, value) => {
        setNaturalOutputKgs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFullyWashedOutputChange = (field, value) => {
        setFullyWashedOutputKgs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fetchExistingProcessingAndBaggingOffs = async (batchNo) => {
        try {
            setLoading(true);
            const [processingResponse, baggingOffsResponse] = await Promise.all([
                axios.get(`${API_URL}/processing/batch/${batchNo}`),
                axios.get(`${API_URL}/bagging-off/batch/${batchNo}`)
            ]);

            if (processingResponse.data?.[0]) {
                setExistingProcessing(processingResponse.data[0]);
            }

            if (baggingOffsResponse.data?.length > 0) {
                // Sort by date in descending order (most recent first)
                const sortedBaggingOffs = baggingOffsResponse.data.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSavedBaggingOffs(sortedBaggingOffs);

                // If not in edit mode, reset form
                if (!isEditing) {
                    resetOutputs();
                }
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareSubmissionData = (processingType, status) => {
        if (!batches?.[0]?.batchNo) return [];

        const submissions = [];
        const batchNo = batches[0].batchNo;

        if (processingType === 'HONEY') {
            if (honeyOutputKgs.H1) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: honeyOutputKgs,
                    processingType: 'HONEY',
                    existingProcessing, // Ensure this is included
                    batchNo,
                    status,
                    progressive: progressiveMode,
                    recordId: isEditing && editingRecord?.processingType === 'HONEY' ? editingRecord.id : null
                });
            }

            // Add fully washed submission if applicable
            if (Object.values(fullyWashedOutputKgs).some(v => v !== '')) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: fullyWashedOutputKgs,
                    processingType: 'FULLY WASHED',
                    existingProcessing, // Ensure this is included
                    batchNo,
                    status,
                    progressive: progressiveMode,
                    recordId: isEditing && editingRecord?.processingType === 'FULLY WASHED' ? editingRecord.id : null
                });
            }
        } else {
            const outputData = prepareOutputData(processingType, batchNo);
            if (Object.values(outputData).some(v => v !== '')) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: outputData,
                    processingType,
                    existingProcessing, // Ensure this is included
                    batchNo,
                    status,
                    progressive: progressiveMode,
                    recordId: isEditing ? editingRecord?.id : null
                });
            }
        }

        return submissions;
    };

    const calculateTotalsByProcessingType = () => {
        const totals = {
            'HONEY': { H1: 0 },
            'NATURAL': { N1: 0, N2: 0, B1: 0, B2: 0 },
            'FULLY WASHED': { A0: 0, A1: 0, A2: 0, A3: 0, B1: 0, B2: 0 },
            'FULLY_WASHED': { A0: 0, A1: 0, A2: 0, A3: 0, B1: 0, B2: 0 },
        };

        savedBaggingOffs.forEach(record => {
            if (record.processingType === 'HONEY') {
                if (record.outputKgs.H1) {
                    totals['HONEY'].H1 += parseFloat(record.outputKgs.H1);
                }
            } else if (record.processingType === 'NATURAL') {
                Object.keys(record.outputKgs).forEach(key => {
                    if (record.outputKgs[key]) {
                        totals['NATURAL'][key] = (totals['NATURAL'][key] || 0) + parseFloat(record.outputKgs[key]);
                    }
                });
            } else if (record.processingType === 'FULLY WASHED') {
                Object.keys(record.outputKgs).forEach(key => {
                    if (record.outputKgs[key]) {
                        totals['FULLY WASHED'][key] = (totals['FULLY WASHED'][key] || 0) + parseFloat(record.outputKgs[key]);
                    }
                });
            }
        });

        return totals;
    };

    const prepareOutputData = (processingType, batchNo) => {
        const isSecondaryBatch = batchNo.endsWith('-2') || batchNo.endsWith('B');

        switch (processingType) {
            case 'NATURAL':
                return isSecondaryBatch ?
                    { B1: naturalOutputKgs.B1, B2: naturalOutputKgs.B2 } :
                    { N1: naturalOutputKgs.N1, N2: naturalOutputKgs.N2 };
            case 'FULLY WASHED':
            case 'FULLY_WASHED':
                return isSecondaryBatch ?
                    { B1: fullyWashedOutputKgs.B1, B2: fullyWashedOutputKgs.B2 } :
                    {
                        A0: fullyWashedOutputKgs.A0,
                        A1: fullyWashedOutputKgs.A1,
                        A2: fullyWashedOutputKgs.A2,
                        A3: fullyWashedOutputKgs.A3
                    };
            default:
                return {};
        }
    };

    const handleSave = async () => {
        if (!batches?.[0]?.processingType) return;

        try {
            const submissions = prepareSubmissionData(
                batches[0].processingType.toUpperCase(),
                'PENDING'
            );

            if (submissions.length === 0) {
                alert('Please enter at least one output value');
                return;
            }

            setLoading(true);
            const results = await Promise.all(
                submissions.map(submission =>
                    axios.post(`${API_URL}/bagging-off`, submission)
                )
            );

            // Refresh the bagging offs data
            await fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);

            // Reset form and editing state
            resetOutputs();
            setIsEditing(false);
            setEditingRecord(null);

            alert('Data saved successfully');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save data');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteBaggingOff = async () => {
        if (!batches?.[0]?.batchNo) return;

        try {
            setLoading(true);

            // Get submissions if there are any new values entered
            const submissions = prepareSubmissionData(
                batches[0].processingType.toUpperCase(),
                'COMPLETED'
            );

            // If there are new entries, submit them
            if (submissions.length > 0) {
                await Promise.all(
                    submissions.map(submission =>
                        axios.post(`${API_URL}/bagging-off`, submission)
                    )
                );
            }

            // Always update existing bagging-off entries to "COMPLETED"
            if (savedBaggingOffs.length > 0) {
                await Promise.all(
                    savedBaggingOffs.map(entry =>
                        axios.put(`${API_URL}/bagging-off/${entry.id}`, {
                            ...entry,
                            status: 'COMPLETED'
                        })
                    )
                );
            }

            // Always call onComplete even if there are no new submissions
            if (onComplete && typeof onComplete === 'function') {
                await onComplete(batches[0].batchNo);
            }

            handleClose();
            alert('Bagging off completed successfully');
        } catch (error) {
            console.error('Complete bagging off error:', error);
            alert('Failed to complete bagging off');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setIsEditing(true);
        setEditingRecord(record);
        setSelectedDate(new Date(record.date).toISOString().split('T')[0]);

        // Reset all outputs first
        resetOutputs();

        // Set the outputs based on the record being edited
        if (record.processingType === 'HONEY') {
            setHoneyOutputKgs(record.outputKgs);
        } else if (record.processingType === 'NATURAL') {
            // Only set the fields that exist in the record
            const updatedNaturalOutputs = { ...naturalOutputKgs };
            Object.keys(record.outputKgs).forEach(key => {
                if (record.outputKgs[key]) {
                    updatedNaturalOutputs[key] = record.outputKgs[key];
                }
            });
            setNaturalOutputKgs(updatedNaturalOutputs);
        } else if (record.processingType === 'FULLY WASHED') {
            // Only set the fields that exist in the record
            const updatedFullyWashedOutputs = { ...fullyWashedOutputKgs };
            Object.keys(record.outputKgs).forEach(key => {
                if (record.outputKgs[key]) {
                    updatedFullyWashedOutputs[key] = record.outputKgs[key];
                }
            });
            setFullyWashedOutputKgs(updatedFullyWashedOutputs);
        }
    };

    // Add new function to handle deletion
    const handleDelete = async (recordId) => {
        if (!recordId) return;

        // Confirm deletion with user
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/bagging-off/${recordId}`);

            // Refresh the bagging offs data
            await fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);

            alert('Record deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete record');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingRecord(null);
        resetOutputs();
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header
                closeButton
                style={{
                    backgroundColor: processingTheme.neutral,
                    borderBottom: `1px solid ${processingTheme.primary}`
                }}
            >
                <Modal.Title style={{ color: processingTheme.primary }}>
                    {isEditing ? "Edit Bagging Off Record" : "Bagging Off Details"} {loading && '(Loading...)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {existingProcessing && (
                    <div className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}>
                        <h5 style={{ color: processingTheme.primary }}>Processing Details</h5>
                        <Row>
                            <Col md={4}>
                                <strong>Batch No:</strong> {existingProcessing.batchNo}
                            </Col>
                            <Col md={4}>
                                <strong>Processing Type:</strong> {existingProcessing.processingType}
                            </Col>
                            <Col md={4}>
                                <strong>Total KGs:</strong> {existingProcessing.totalKgs}
                            </Col>
                        </Row>
                    </div>
                )}

                {!isEditing && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="progressive-mode-switch"
                            label={<span className="text-warning">Progressive Drying Mode (Add new outputs without replacing previous entries)</span>}
                            checked={progressiveMode}
                            onChange={(e) => setProgressiveMode(e.target.checked)}
                            className="custom-switch"
                        />
                    </Form.Group>
                )}

                {/* Saved Bagging Offs List - Show if not editing */}
                {!isEditing && savedBaggingOffs.length > 0 && (
                    <div className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}>
                        <h5 style={{ color: processingTheme.primary }}>Previous Bagging Off Records</h5>

                        <Table size="sm" bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Processing Type</th>
                                    <th>Grades/Output</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedBaggingOffs.map((record, index) => (
                                    <tr key={record.id || index}>
                                        <td>{formatDate(record.date)}</td>
                                        <td>{record.processingType}</td>
                                        <td>
                                            {Object.entries(record.outputKgs)
                                                .filter(([_, value]) => value && parseFloat(value) > 0)
                                                .map(([grade, value]) => (
                                                    <div key={grade}>{grade}: {parseFloat(value).toFixed(2)} KGs</div>
                                                ))
                                            }
                                        </td>
                                        <td>{record.status}</td>
                                        <td>
                                            {record.status !== 'COMPLETED' && (
                                                <>
                                                    <Button
                                                        variant="outline-sucafina"
                                                        size="sm"
                                                        onClick={() => handleEdit(record)}
                                                        style={{
                                                            color: processingTheme.primary,
                                                            borderColor: processingTheme.primary,
                                                            marginRight: '5px'
                                                        }}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(record.id)}
                                                        style={{
                                                            color: '#dc3545',
                                                            borderColor: '#dc3545'
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Total summary after the individual records */}
                        <div className="mt-3">
                            <h6 style={{ color: processingTheme.primary }}>Total Accumulated Output</h6>
                            <Table size="sm" bordered>
                                <thead>
                                    <tr>
                                        <th>Processing Type</th>
                                        <th>Grade</th>
                                        <th>Total KGs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const totals = calculateTotalsByProcessingType();
                                        const rows = [];

                                        Object.keys(totals).forEach(procType => {
                                            Object.keys(totals[procType]).forEach((grade, idx) => {
                                                if (totals[procType][grade] > 0) {
                                                    rows.push(
                                                        <tr key={`${procType}-${grade}`}>
                                                            {idx === 0 ? <td rowSpan={Object.keys(totals[procType]).filter(g => totals[procType][g] > 0).length}>{procType}</td> : null}
                                                            <td>{grade}</td>
                                                            <td>{totals[procType][grade].toFixed(2)} KGs</td>
                                                        </tr>
                                                    );
                                                }
                                            });
                                        });

                                        return rows.length > 0 ? rows : (
                                            <tr>
                                                <td colSpan="3" className="text-center">No previous output recorded</td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                borderColor: processingTheme.secondary,
                                backgroundColor: processingTheme.neutral
                            }}
                        />
                    </Form.Group>

                    {/* Honey Processing Section */}
                    {(!isEditing || (isEditing && editingRecord?.processingType === 'HONEY')) &&
                        batches?.[0]?.processingType?.toUpperCase() === 'HONEY' && (
                            <>
                                <div className="mb-4">
                                    <Form.Label style={{ color: processingTheme.primary }}>
                                        Honey Processing Output
                                    </Form.Label>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Control
                                                type="number"
                                                placeholder="H1 KGs"
                                                value={honeyOutputKgs.H1}
                                                onChange={(e) => handleHoneyOutputChange(e.target.value)}
                                                required
                                                style={{
                                                    borderColor: processingTheme.secondary,
                                                    ':focus': { borderColor: processingTheme.primary }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Form.Label style={{ color: processingTheme.primary, marginBottom: 0 }}>
                                            Fully Washed Processing Output
                                        </Form.Label>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: processingTheme.accent
                                        }}>
                                            Was processed as Fully Washed
                                        </span>
                                    </div>
                                    <Row>
                                        {['A0', 'A1', 'A2', 'A3'].map((field) => (
                                            <Col md={3} key={field} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder={`${field} KGs`}
                                                    value={fullyWashedOutputKgs[field]}
                                                    onChange={(e) => handleFullyWashedOutputChange(field, e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </>
                        )}

                    {/* Natural Processing Section */}
                    {(!isEditing || (isEditing && editingRecord?.processingType === 'NATURAL')) &&
                        batches?.[0]?.processingType?.toUpperCase() === 'NATURAL' && (
                            <div className="mb-4">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Natural Processing Output
                                </Form.Label>
                                <Row>
                                    {(batches[0].batchNo.endsWith('-1') || batches[0].batchNo.endsWith('A')) ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="N1 KGs"
                                                    value={naturalOutputKgs.N1}
                                                    onChange={(e) => handleNaturalOutputChange('N1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="N2 KGs"
                                                    value={naturalOutputKgs.N2}
                                                    onChange={(e) => handleNaturalOutputChange('N2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B1 KGs"
                                                    value={naturalOutputKgs.B1}
                                                    onChange={(e) => handleNaturalOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B2 KGs"
                                                    value={naturalOutputKgs.B2}
                                                    onChange={(e) => handleNaturalOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )}

                    {/* Fully Washed Processing Section */}
                    {/* {(!isEditing || (isEditing && editingRecord?.processingType === 'FULLY WASHED')) &&
                        batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
                            <div className="mb-3">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Fully Washed Processing Output
                                </Form.Label>
                                <Row>
                                    {batches[0].batchNo.endsWith('-2') || batches[0].batchNo.endsWith('B') ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B1 KGs"
                                                    value={fullyWashedOutputKgs.B1}
                                                    onChange={(e) => handleFullyWashedOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B2 KGs"
                                                    value={fullyWashedOutputKgs.B2}
                                                    onChange={(e) => handleFullyWashedOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A0 KGs"
                                                    value={fullyWashedOutputKgs.A0}
                                                    onChange={(e) => handleFullyWashedOutputChange('A0', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A1 KGs"
                                                    value={fullyWashedOutputKgs.A1}
                                                    onChange={(e) => handleFullyWashedOutputChange('A1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A2 KGs"
                                                    value={fullyWashedOutputKgs.A2}
                                                    onChange={(e) => handleFullyWashedOutputChange('A2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A3 KGs"
                                                    value={fullyWashedOutputKgs.A3}
                                                    onChange={(e) => handleFullyWashedOutputChange('A3', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )} */}

                    {(!isEditing || (isEditing && editingRecord?.processingType === 'FULLY WASHED')) &&
                        batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
                            <div className="mb-3">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Fully Washed Processing Output
                                </Form.Label>
                                <Row>
                                    {batches[0].batchNo.endsWith('-2') || batches[0].batchNo.endsWith('B') ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B1 KGs"
                                                    value={fullyWashedOutputKgs.B1}
                                                    onChange={(e) => handleFullyWashedOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B2 KGs"
                                                    value={fullyWashedOutputKgs.B2}
                                                    onChange={(e) => handleFullyWashedOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            {/* Only show A2 and A3 if status is TRANSFERRED */}
                                            {(batches?.[0]?.status === "TRANSFERRED" || editingRecord?.status === "TRANSFERRED") ? (
                                                <>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A2 KGs"
                                                            value={fullyWashedOutputKgs.A2}
                                                            onChange={(e) => handleFullyWashedOutputChange('A2', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A3 KGs"
                                                            value={fullyWashedOutputKgs.A3}
                                                            onChange={(e) => handleFullyWashedOutputChange('A3', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                </>
                                            ) : (
                                                <>
                                                    <Col md={3} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A0 KGs"
                                                            value={fullyWashedOutputKgs.A0}
                                                            onChange={(e) => handleFullyWashedOutputChange('A0', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={3} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A1 KGs"
                                                            value={fullyWashedOutputKgs.A1}
                                                            onChange={(e) => handleFullyWashedOutputChange('A1', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={3} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A2 KGs"
                                                            value={fullyWashedOutputKgs.A2}
                                                            onChange={(e) => handleFullyWashedOutputChange('A2', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={3} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="A3 KGs"
                                                            value={fullyWashedOutputKgs.A3}
                                                            onChange={(e) => handleFullyWashedOutputChange('A3', e.target.value)}
                                                            required
                                                            style={{
                                                                borderColor: processingTheme.secondary,
                                                                ':focus': { borderColor: processingTheme.primary }
                                                            }}
                                                        />
                                                    </Col>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Row>
                            </div>
                        )
                    }
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
                {isEditing ? (
                    <>
                        <Button variant="secondary" onClick={cancelEdit}>
                            Cancel
                        </Button>
                        <Button
                            style={{
                                backgroundColor: processingTheme.primary,
                                borderColor: processingTheme.primary
                            }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Update Record'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            style={{
                                backgroundColor: processingTheme.primary,
                                borderColor: processingTheme.primary,
                                marginRight: '10px'
                            }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleCompleteBaggingOff}
                            disabled={loading || savedBaggingOffs.length === 0}
                        >
                            {loading ? 'Processing...' : 'Complete Bagging Off'}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ProcessingBatchModal;