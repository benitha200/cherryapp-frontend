import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Accordion, Row, Col } from 'react-bootstrap';
import API_URL from '../../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    success: '#28a745',    // Success green
    warning: '#ffc107',    // Warning yellow
    danger: '#dc3545',     // Danger red
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
                                {['Batch No', 'Source CWS', 'Processing Type', 'Total KGs', 'Grades', 'Date', 'Status'].map((header) => (
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
                                    {[...Array(7)].map((_, cellIdx) => (
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

const WetTransferReceiver = () => {
    const [pendingTransfers, setPendingTransfers] = useState([]);
    const [completedTransfers, setCompletedTransfers] = useState([]);
    const [groupedPendingTransfers, setGroupedPendingTransfers] = useState({});
    const [groupedCompletedTransfers, setGroupedCompletedTransfers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [transferNotes, setTransferNotes] = useState('');
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [expandedBatches, setExpandedBatches] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedQualityAttributes, setSelectedQualityAttributes] = useState({
        moisture: '',
        defectPercentage: '',
        cleanCupScore: ''
    });
    const userInfo = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTransfers();
    }, [refreshKey]);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            // Get transfers where this CWS is the destination
            const response = await axios.get(`${API_URL}/wet-transfer/destination/${userInfo.cwsId}`);

            // Separate pending and completed transfers
            const pending = response.data.filter(transfer => transfer.status === "PENDING");
            const completed = response.data.filter(transfer => transfer.status === "RECEIVED" || transfer.status === "REJECTED");

            setPendingTransfers(pending);
            setCompletedTransfers(completed);
            
            // Group pending transfers by batchNo
            const pendingByBatch = groupTransfersByBatch(pending);
            setGroupedPendingTransfers(pendingByBatch);
            
            // Group completed transfers by batchNo
            const completedByBatch = groupTransfersByBatch(completed);
            setGroupedCompletedTransfers(completedByBatch);
            
            setLoading(false);
        } catch (error) {
            setError('Error fetching wet transfers');
            console.error('Fetch error:', error);
            setLoading(false);
        }
    };

    const groupTransfersByBatch = (transfers) => {
        return transfers.reduce((acc, transfer) => {
            if (!acc[transfer.batchNo]) {
                acc[transfer.batchNo] = {
                    batchNo: transfer.batchNo,
                    processingId: transfer.processingId,
                    sourceCws: transfer.sourceCws,
                    destinationCws: transfer.destinationCws,
                    processingType: transfer.processingType,
                    date: transfer.date,
                    totalKgs: transfer.totalKgs,
                    status: transfer.status,
                    transfers: []
                };
            }
            
            acc[transfer.batchNo].transfers.push(transfer);
            return acc;
        }, {});
    };

    const handleReceiveTransfers = async () => {
        try {
            // Get all transfer IDs from selected batches
            const transferIds = selectedBatches.flatMap(batchNo => 
                groupedPendingTransfers[batchNo].transfers.map(t => t.id)
            );
            
            await Promise.all(transferIds.map(transferId => {
                const transfer = pendingTransfers.find(t => t.id === transferId);
                return axios.post(`${API_URL}/wet-transfer/receive`, {
                    transferId: transferId,
                    receivedDate: new Date().toISOString(),
                    receivingCwsId: userInfo.cwsId,
                    sourceCwsId: transfer.sourceCwsId,
                    notes: transferNotes,
                    moisture: selectedQualityAttributes.moisture,
                    defectPercentage: selectedQualityAttributes.defectPercentage,
                    cleanCupScore: selectedQualityAttributes.cleanCupScore
                });
            }));

            // Reset state and refresh data
            setSelectedBatches([]);
            setTransferNotes('');
            setSelectedQualityAttributes({
                moisture: '',
                defectPercentage: '',
                cleanCupScore: ''
            });
            setShowReceiveModal(false);
            setRefreshKey(prev => prev + 1); // Trigger a refresh
            alert('Transfers received successfully');
        } catch (error) {
            console.error('Error receiving transfers:', error);
            alert('Failed to receive transfers');
        }
    };

    const handleRejectBatch = async (batchNo) => {
        if (window.confirm(`Are you sure you want to reject all transfers from batch ${batchNo}?`)) {
            try {
                const transferIds = groupedPendingTransfers[batchNo].transfers.map(t => t.id);
                
                await Promise.all(transferIds.map(transferId => {
                    return axios.post(`${API_URL}/wet-transfer/reject`, {
                        transferId: transferId,
                        rejectionDate: new Date().toISOString(),
                        rejectionReason: 'Rejected by receiver',
                        receivingCwsId: userInfo.cwsId
                    });
                }));

                setRefreshKey(prev => prev + 1); // Trigger a refresh
                alert('Batch rejected successfully');
            } catch (error) {
                console.error('Error rejecting batch:', error);
                alert('Failed to reject batch');
            }
        }
    };

    const handleBatchToggleExpand = (batchNo, e) => {
        e.stopPropagation();
        setExpandedBatches(prev => ({
            ...prev,
            [batchNo]: !prev[batchNo]
        }));
    };

    const handleBatchSelectionChange = (batchNo, isSelected) => {
        if (isSelected) {
            setSelectedBatches(prev => [...prev, batchNo]);
        } else {
            setSelectedBatches(prev => prev.filter(b => b !== batchNo));
        }
    };

    const handleSelectAllBatches = (isSelected) => {
        const visibleBatches = Object.keys(getFilteredBatches());

        if (isSelected) {
            setSelectedBatches(visibleBatches);
        } else {
            setSelectedBatches([]);
        }

        setSelectAllChecked(isSelected);
    };

    // Filter batches based on search term
    const getFilteredBatches = () => {
        const searchTermLower = searchTerm.toLowerCase();
        const batchesToFilter = activeTab === 'pending' ? groupedPendingTransfers : groupedCompletedTransfers;

        return Object.entries(batchesToFilter)
            .filter(([_, batch]) => {
                return (
                    batch.batchNo?.toLowerCase().includes(searchTermLower) ||
                    batch.processingType?.toLowerCase().includes(searchTermLower) ||
                    batch.sourceCws?.name?.toLowerCase().includes(searchTermLower) ||
                    batch.status?.toLowerCase().includes(searchTermLower) ||
                    batch.transfers.some(t => 
                        t.grade?.toLowerCase().includes(searchTermLower)
                    )
                );
            })
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    };

    // Get status badge
    const getStatusBadge = (status) => {
        let bg, text;

        switch (status) {
            case 'PENDING':
                bg = processingTheme.warning;
                text = 'dark';
                break;
            case 'RECEIVED':
                bg = processingTheme.success;
                text = 'white';
                break;
            case 'REJECTED':
                bg = processingTheme.danger;
                text = 'white';
                break;
            default:
                bg = processingTheme.neutral;
                text = 'dark';
        }

        return (
            <Badge bg="custom" style={{ backgroundColor: bg, color: text }}>
                {status}
            </Badge>
        );
    };
    
    // Calculate total output KGs for a batch
    const calculateTotalOutputKgs = (transfers) => {
        return transfers.reduce((sum, transfer) => sum + parseFloat(transfer.outputKgs), 0).toFixed(2);
    };
    
    // Get grade summary for a batch
    const getGradeSummary = (transfers) => {
        return transfers.map(t => `${t.grade} (${parseFloat(t.outputKgs).toFixed(2)} kg)`).join(', ');
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const filteredBatches = getFilteredBatches();
    const batchCount = Object.keys(filteredBatches).length;
    const totalTransferCount = Object.values(filteredBatches).reduce((sum, batch) => sum + batch.transfers.length, 0);

    return (
        <div className="container-fluid py-4">
            {/* Pending Transfers Panel */}
            <div className="d-flex justify-content-between mb-3">
                <h4 style={{ color: processingTheme.primary }}>Wet Transfer Management</h4>
                <div>
                    <Button
                        variant={activeTab === 'pending' ? 'primary' : 'outline-primary'}
                        className="me-2"
                        onClick={() => setActiveTab('pending')}
                        style={{
                            backgroundColor: activeTab === 'pending' ? processingTheme.primary : 'white',
                            borderColor: processingTheme.primary,
                            color: activeTab === 'pending' ? 'white' : processingTheme.primary
                        }}
                    >
                        Pending Batches ({Object.keys(groupedPendingTransfers).length})
                    </Button>
                    <Button
                        variant={activeTab === 'completed' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveTab('completed')}
                        style={{
                            backgroundColor: activeTab === 'completed' ? processingTheme.primary : 'white',
                            borderColor: processingTheme.primary,
                            color: activeTab === 'completed' ? 'white' : processingTheme.primary
                        }}
                    >
                        History ({Object.keys(groupedCompletedTransfers).length})
                    </Button>
                </div>
            </div>

            {activeTab === 'pending' && Object.keys(groupedPendingTransfers).length > 0 && (
                <Card className="mb-4">
                    <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="h5" style={{ color: processingTheme.primary }}>
                                Receive Wet Transfer Batches
                            </span>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Alert variant="info">
                            <i className="fas fa-info-circle me-2"></i>
                            You have {Object.keys(groupedPendingTransfers).length} pending batch{Object.keys(groupedPendingTransfers).length !== 1 ? 'es' : ''} to receive.
                            Select the batches you would like to receive and click the "Receive Selected Batches" button.
                        </Alert>

                        <div className="selected-transfers-container mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span><strong>Selected Batches:</strong> {selectedBatches.length}</span>
                                {selectedBatches.length > 0 && (
                                    <div>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => setSelectedBatches([])}
                                        >
                                            Clear Selection
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            disabled={selectedBatches.length === 0}
                                            onClick={() => setShowReceiveModal(true)}
                                            style={{
                                                backgroundColor: processingTheme.primary,
                                                borderColor: processingTheme.primary
                                            }}
                                        >
                                            Receive Selected Batches
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {selectedBatches.length > 0 && (
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
                                    <div className="d-flex flex-wrap">
                                        {selectedBatches.map(batchNo => {
                                            const batch = groupedPendingTransfers[batchNo];
                                            const totalKgs = calculateTotalOutputKgs(batch.transfers);
                                            return (
                                                <Badge
                                                    key={batchNo}
                                                    bg="light"
                                                    text="dark"
                                                    className="me-2 mb-2 p-2"
                                                    style={{ backgroundColor: processingTheme.neutral }}
                                                >
                                                    {batch.batchNo} - {batch.processingType} ({totalKgs} kg)
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="p-0 ms-1"
                                                        onClick={() => handleBatchSelectionChange(batchNo, false)}
                                                        style={{ color: processingTheme.primary }}
                                                    >
                                                        ×
                                                    </Button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Transfers Table */}
            <Card>
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="h5" style={{ color: processingTheme.primary }}>
                            {activeTab === 'pending' ? 'Pending Batches' : 'Batch History'}
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
                                    {activeTab === 'pending' && (
                                        <th style={{ width: '30px' }}>
                                            <Form.Check
                                                type="checkbox"
                                                checked={selectAllChecked}
                                                onChange={(e) => handleSelectAllBatches(e.target.checked)}
                                                title="Select All Visible Batches"
                                            />
                                        </th>
                                    )}
                                    <th>Batch No</th>
                                    <th>Source CWS</th>
                                    <th>Processing Type</th>
                                    <th>Total KGs</th>
                                    <th>Grades</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    {activeTab === 'pending' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {batchCount === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={activeTab === 'pending' ? 9 : 8}
                                            className="text-center py-4"
                                            style={{
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            No {activeTab === 'pending' ? 'pending' : ''} batches found!
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(filteredBatches).map(([batchNo, batch]) => {
                                        const isExpanded = expandedBatches[batchNo];
                                        const isSelected = selectedBatches.includes(batchNo);
                                        const totalOutputKgs = calculateTotalOutputKgs(batch.transfers);

                                        return (
                                            <React.Fragment key={batchNo}>
                                                <tr
                                                    className={isSelected ? 'table-active' : ''}
                                                    onClick={() => activeTab === 'pending' && handleBatchSelectionChange(batchNo, !isSelected)}
                                                    style={{ cursor: activeTab === 'pending' ? 'pointer' : 'default' }}
                                                >
                                                    {activeTab === 'pending' && (
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleBatchSelectionChange(batchNo, e.target.checked);
                                                                }}
                                                            />
                                                        </td>
                                                    )}
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">{batch.batchNo}</span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-secondary"
                                                                className="py-0 px-1"
                                                                onClick={(e) => handleBatchToggleExpand(batchNo, e)}
                                                            >
                                                                {isExpanded ? '−' : '+'}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td>{batch.sourceCws?.name || 'Unknown'}</td>
                                                    <td>{batch.processingType}</td>
                                                    <td>{totalOutputKgs} kg</td>
                                                    <td>{getGradeSummary(batch.transfers)}</td>
                                                    <td>{new Date(batch.date).toLocaleDateString()}</td>
                                                    <td>{getStatusBadge(batch.status)}</td>
                                                    {activeTab === 'pending' && (
                                                        <td>
                                                            <div className="d-flex">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-success"
                                                                    className="me-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedBatches([batchNo]);
                                                                        setShowReceiveModal(true);
                                                                    }}
                                                                >
                                                                    Receive
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRejectBatch(batchNo);
                                                                    }}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="expanded-row">
                                                        <td colSpan={activeTab === 'pending' ? 9 : 8} className="p-0">
                                                            <div className="p-3" style={{ backgroundColor: processingTheme.tableHover }}>
                                                                <h6>Batch Details</h6>
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Transfer ID</th>
                                                                                <th>Grade</th>
                                                                                <th>Output KGs</th>
                                                                                <th>Moisture %</th>
                                                                                <th>Status</th>
                                                                                {batch.status !== 'PENDING' && (
                                                                                    <>
                                                                                        <th>Received/Rejected Date</th>
                                                                                        <th>Notes</th>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {batch.transfers.map(transfer => (
                                                                                <tr key={transfer.id}>
                                                                                    <td>WT-{transfer.id}</td>
                                                                                    <td>{transfer.grade}</td>
                                                                                    <td>{parseFloat(transfer.outputKgs).toFixed(2)} kg</td>
                                                                                    <td>{parseFloat(transfer.moistureContent).toFixed(1)}%</td>
                                                                                    <td>{getStatusBadge(transfer.status)}</td>
                                                                                    {batch.status !== 'PENDING' && (
                                                                                        <>
                                                                                            <td>
                                                                                                {transfer.receivedDate && new Date(transfer.receivedDate).toLocaleDateString()}
                                                                                                {transfer.rejectionDate && new Date(transfer.rejectionDate).toLocaleDateString()}
                                                                                            </td>
                                                                                            <td>{transfer.notes || (transfer.rejectionReason || '')}</td>
                                                                                        </>
                                                                                    )}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                
                                                                {batch.status !== 'PENDING' && batch.transfers.some(t => t.moistureAtReceival || t.defectPercentage || t.cleanCupScore) && (
                                                                    <div className="mt-3">
                                                                        <h6>Quality Assessment</h6>
                                                                        <div className="table-responsive">
                                                                            <table className="table table-sm">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Grade</th>
                                                                                        <th>Measured Moisture</th>
                                                                                        <th>Defect Percentage</th>
                                                                                        <th>Clean Cup Score</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {batch.transfers.map(transfer => (
                                                                                        <tr key={`quality-${transfer.id}`}>
                                                                                            <td>{transfer.grade}</td>
                                                                                            <td>{transfer.moistureAtReceival ? `${transfer.moistureAtReceival}%` : 'N/A'}</td>
                                                                                            <td>{transfer.defectPercentage ? `${transfer.defectPercentage}%` : 'N/A'}</td>
                                                                                            <td>{transfer.cleanCupScore || 'N/A'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                )}
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

            {/* Receive Modal */}
            <Modal
                show={showReceiveModal}
                onHide={() => setShowReceiveModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
                    <Modal.Title>Receive Wet Transfer Batches</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        You are about to receive {selectedBatches.length} batch{selectedBatches.length !== 1 ? 'es' : ''} 
                        with a total of {selectedBatches.reduce((count, batchNo) => count + groupedPendingTransfers[batchNo].transfers.length, 0)} transfer{selectedBatches.reduce((count, batchNo) => count + groupedPendingTransfers[batchNo].transfers.length, 0) !== 1 ? 's' : ''}.
                    </Alert>

                    <Accordion defaultActiveKey="0" className="mb-3">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Selected Batches ({selectedBatches.length})</Accordion.Header>
                            <Accordion.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedBatches.map(batchNo => {
                                    const batch = groupedPendingTransfers[batchNo];
                                    return (
                                        <div key={batchNo} className="mb-3">
                                            <h6>{batch.batchNo} - {batch.processingType}</h6>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Grade</th>
                                                        <th>Output KGs</th>
                                                        <th>Moisture %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {batch.transfers.map(transfer => (
                                                        <tr key={transfer.id}>
                                                            <td>{transfer.grade}</td>
                                                            <td>{parseFloat(transfer.outputKgs).toFixed(2)} kg</td>
                                                            <td>{parseFloat(transfer.moistureContent).toFixed(1)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label><strong>Quality Assessment</strong></Form.Label>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Measured Moisture (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={selectedQualityAttributes.moisture}
                                                onChange={(e) => setSelectedQualityAttributes({
                                                    ...selectedQualityAttributes,
                                                    moisture: e.target.value
                                                })}
                                                placeholder="Enter moisture %"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Defect Percentage (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={selectedQualityAttributes.defectPercentage}
                                                onChange={(e) => setSelectedQualityAttributes({
                                                    ...selectedQualityAttributes,
                                                    defectPercentage: e.target.value
                                                })}
                                                placeholder="Enter defect %"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Clean Cup Score</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={selectedQualityAttributes.cleanCupScore}
                                                onChange={(e) => setSelectedQualityAttributes({
                                                    ...selectedQualityAttributes,
                                                    cleanCupScore: e.target.value
                                                })}
                                                placeholder="Enter cup score"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Receiving Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={transferNotes}
                            onChange={(e) => setTransferNotes(e.target.value)}
                            placeholder="Add any notes about the received coffee..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowReceiveModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleReceiveTransfers}
                        style={{
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }}
                    >
                        Confirm Receipt
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WetTransferReceiver;