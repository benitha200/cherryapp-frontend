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
}

const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit }) => {
    const [existingProcessing, setExistingProcessing] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [outputKgs, setOutputKgs] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingDetails(batches[0].batchNo);
            // Initialize outputKgs based on grade
            initializeOutputKgs(batches[0].grade);
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const initializeOutputKgs = (grade) => {
        if (grade === 'A') {
            setOutputKgs({
                A0: '', A1: '', A2: '', A3: ''
            });
        } else if (grade === 'B') {
            setOutputKgs({
                B1: '', B2: ''
            });
        }
    };

    const resetModalState = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setOutputKgs({});
        setExistingProcessing(null);
    };

    const fetchExistingProcessingDetails = async (batchNo) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/processing/batch/${batchNo}`);

            if (response.data && response.data.length > 0) {
                setExistingProcessing(response.data[0]);
                initializeOutputKgs(response.data[0].grade);
            }
        } catch (error) {
            console.error('Error fetching processing details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOutputKgsChange = (key, value) => {
        setOutputKgs(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        const grade = batches[0].grade;
        const requiredInputs = grade === 'A' ? ['A0', 'A1', 'A2', 'A3'] : ['B1', 'B2'];

        requiredInputs.forEach(input => {
            if (!outputKgs[input] || parseFloat(outputKgs[input]) <= 0) {
                outputKgs[input] = '0';
            }
        });

        const submissionData = {
            date: selectedDate,
            outputKgs,
            existingProcessing,
            batches
        };

        onSubmit(submissionData);
        handleClose();
    };

    const renderOutputFields = () => {
        const grade = batches?.[0]?.grade;
        const outputs = grade === 'A' ? ['A0', 'A1', 'A2', 'A3'] : ['B1', 'B2'];

        return (
            <Row>
                {outputs.map((input) => (
                    <Col md={grade === 'A' ? 3 : 6} key={input} className="mb-2">
                        <Form.Control
                            type="number"
                            placeholder={`${input} KGs`}
                            value={outputKgs[input] || ''}
                            onChange={(e) => handleOutputKgsChange(input, e.target.value)}
                            required
                            style={{
                                borderColor: processingTheme.secondary,
                                ':focus': { borderColor: processingTheme.primary }
                            }}
                        />
                    </Col>
                ))}
            </Row>
        );
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
                    Bagging Off Details {loading && '(Loading...)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {existingProcessing && (
                    <div
                        className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}
                    >
                        <h5 style={{ color: processingTheme.primary }}>Processing Details</h5>
                        <Row>
                            <Col md={4}>
                                <strong>Batch No:</strong> {existingProcessing.batchNo}
                            </Col>
                            <Col md={4}>
                                <strong>Grade:</strong> {existingProcessing.grade}
                            </Col>
                            <Col md={4}>
                                <strong>Processing Type:</strong> {existingProcessing.processingType}
                            </Col>
                            <Col md={4}>
                                <strong>Total KGs:</strong> {existingProcessing.totalKgs}
                            </Col>
                            <Col md={4}>
                                <strong>Status:</strong> {existingProcessing.status}
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

                    <div className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Output Kilograms</Form.Label>
                        {renderOutputFields()}
                    </div>
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
                        borderColor: processingTheme.primary,
                        '&:hover': {
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }
                    }}
                >
                    Submit Bagging Off
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const LoadingSkeleton = () => {
    const placeholderStyle = {
        opacity: 0.4, // Make placeholders lighter
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

const ProcessingList = () => {
    const [processingBatches, setProcessingBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('user'));

    // Function to check if a batch number includes a hyphen
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

    const handleProcessSubmit = async (processingDetails) => {
        try {
            const { existingProcessing, batches, ...otherDetails } = processingDetails;

            const submissionData = {
                ...otherDetails,
                batchNo: batches[0].batchNo,
                cwsId: 1,
                existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
            };

            await axios.post(`${API_URL}/bagging-off`, submissionData);
            fetchProcessingBatches();
            alert('Bagging off processed successfully');
        } catch (error) {
            console.error('Bagging off submission error:', error);
            alert('Failed to process bagging off');
        }
    };

    // Check if any batch has a hyphen to determine whether to show grade column
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