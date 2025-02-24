import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, Tab, Tabs, Placeholder } from 'react-bootstrap';
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
                    <table className="table mb-0">
                        <thead style={{ backgroundColor: processingTheme.neutral }}>
                            <tr>
                                <th>Batch No</th>
                                <th>Total KGs</th>
                                <th>CWS</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, index) => (
                                <tr key={index}>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={6} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={4} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={3} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={5} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled
                                            style={{
                                                color: processingTheme.primary,
                                                borderColor: processingTheme.primary,
                                                opacity: 0.4,
                                                backgroundColor: 'transparent',
                                                cursor: 'default'
                                            }}
                                        >
                                            Bag Off
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card.Body>
        </Card>
    );
};

const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit }) => {
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

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingDetails(batches[0].batchNo);
            resetOutputs();
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const resetOutputs = () => {
        setHoneyOutputKgs({ H1: '' });
        setNaturalOutputKgs({
            N1: '', N2: '', B1: '', B2: ''
        });
        setFullyWashedOutputKgs({
            A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''  // Added B1 and B2
        });
    };

    const resetModalState = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        resetOutputs();
        setExistingProcessing(null);
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

    const handleSubmit = () => {
        if (!batches || batches.length === 0) return;

        const batch = batches[0];
        const processingType = batch.processingType?.toUpperCase();
        const batchNo = batch.batchNo;

        if (processingType === 'HONEY') {
            const honeySubmission = {
                date: selectedDate,
                outputKgs: honeyOutputKgs,
                processingType: 'HONEY',
                existingProcessing,
                batches
            };

            const fullyWashedSubmission = {
                date: selectedDate,
                outputKgs: fullyWashedOutputKgs,
                processingType: 'FULLY WASHED',
                existingProcessing,
                batches
            };

            onSubmit([honeySubmission, fullyWashedSubmission]);
        } else if (processingType === 'NATURAL') {
            let outputData = {};
            if (batchNo.endsWith('-1') || batchNo.endsWith('A')) {
                outputData = {
                    N1: naturalOutputKgs.N1,
                    N2: naturalOutputKgs.N2
                };
            } else if (batchNo.endsWith('-2') || batchNo.endsWith('B')) {
                outputData = {
                    B1: naturalOutputKgs.B1,
                    B2: naturalOutputKgs.B2
                };
            }

            const naturalSubmission = {
                date: selectedDate,
                outputKgs: outputData,
                processingType: 'NATURAL',
                existingProcessing,
                batches
            };
            onSubmit([naturalSubmission]);
        } else {
            let outputData = {};
            if (batchNo.endsWith('-2') || batchNo.endsWith('B')) {
                outputData = {
                    B1: fullyWashedOutputKgs.B1,
                    B2: fullyWashedOutputKgs.B2
                };
            } else {
                outputData = {
                    A0: fullyWashedOutputKgs.A0,
                    A1: fullyWashedOutputKgs.A1,
                    A2: fullyWashedOutputKgs.A2,
                    A3: fullyWashedOutputKgs.A3
                };
            }

            const fullyWashedSubmission = {
                date: selectedDate,
                outputKgs: outputData,
                processingType: 'FULLY WASHED',
                existingProcessing,
                batches
            };
            onSubmit([fullyWashedSubmission]);
        }
        handleClose();
    };

    // Render modal content here
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
                    Bagging Off Details {loading && '(Loading...)'}
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
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={() => { }}
                            readOnly
                            style={{
                                borderColor: processingTheme.secondary,
                                backgroundColor: processingTheme.neutral
                            }}
                        />
                    </Form.Group>

                    {/* Honey Processing Section */}
                    {batches?.[0]?.processingType?.toUpperCase() === 'HONEY' && (
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
                                        Will be processed as Fully Washed
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
                    {batches?.[0]?.processingType?.toUpperCase() === 'NATURAL' && (
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
                    {batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
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
                                    ['A0', 'A1', 'A2', 'A3'].map((field) => (
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
                                    ))
                                )}
                            </Row>
                        </div>
                    )}

                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    style={{
                        backgroundColor: processingTheme.secondary,
                        borderColor: processingTheme.secondary
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        backgroundColor: processingTheme.primary,
                        borderColor: processingTheme.primary
                    }}
                >
                    Submit Bagging Off
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const ProcessingList = () => {
    const [processingBatches, setProcessingBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('user'));

    const shouldHideGradeColumn = (batches) => {
        if (!batches || batches.length === 0) return false;
        return batches.some(batch => batch.batchNo && batch.batchNo.includes('-'));
    };

    useEffect(() => {
        fetchProcessingBatches();
    }, []);

    const fetchProcessingBatches = async () => {
        try {
            const res = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`);
            const mappedBatches = res.data
                .filter(processing => processing.status !== 'COMPLETED')
                .map(processing => ({
                    id: processing.id,
                    batchNo: processing.batchNo,
                    totalKgs: processing.totalKgs,
                    grade: processing.grade,
                    cws: processing.cws.name,
                    status: processing.status,
                    processingType: processing.processingType,
                    batches: [processing]
                }));
            setProcessingBatches(mappedBatches);
            setLoading(false);
        } catch (error) {
            setError('Error fetching processing batches');
            setLoading(false);
        }
    };

    const startProcessing = (batches) => {
        setSelectedBatches(batches);
        setShowModal(true);
    };

    const handleProcessSubmit = async (processingDetailsArray) => {
        try {
            if (!userInfo?.cwsId) {
                throw new Error('User CWS ID not found');
            }
    
            for (const processingDetails of processingDetailsArray) {
                const { existingProcessing, batches, ...otherDetails } = processingDetails;
    
                const submissionData = {
                    ...otherDetails,
                    batchNo: batches[0].batchNo,
                    cwsId: userInfo.cwsId,
                    existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
                };
    
                await axios.post(`${API_URL}/bagging-off`, submissionData);
            }
            
            fetchProcessingBatches();
            alert('Bagging off processed successfully');
        } catch (error) {
            console.error('Bagging off submission error:', error);
            alert(error.message || 'Failed to process bagging off');
        }
    };

    const hideGradeColumn = shouldHideGradeColumn(processingBatches);

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <ProcessingBatchModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                batches={selectedBatches}
                onSubmit={handleProcessSubmit}
            />

            <Card>
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className='h5' style={{ color: processingTheme.primary }}>Processing Batches</span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table mb-0">
                            <thead style={{ backgroundColor: processingTheme.neutral }}>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Total KGs</th>
                                    {!hideGradeColumn && <th>Grade</th>}
                                    <th>CWS</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processingBatches.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={hideGradeColumn ? 5 : 6}
                                            className="text-center py-4"
                                            style={{
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            No Processing batches found!
                                        </td>
                                    </tr>
                                ) : (processingBatches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{batch.batchNo}</td>
                                        <td>{batch?.totalKgs.toLocaleString()} kg</td>
                                        {!hideGradeColumn && <td>{batch.grade}</td>}
                                        <td>{batch.cws}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: processingTheme.secondary,
                                                    color: 'white'
                                                }}
                                            >
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => startProcessing(batch.batches)}
                                                style={{
                                                    color: processingTheme.primary,
                                                    borderColor: processingTheme.primary,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                Bag Off
                                            </Button>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProcessingList;