import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Pagination, Dropdown, Row, Col } from 'react-bootstrap';
import API_URL from '../../../constants/Constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import * as XLSX from 'xlsx';

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
                                {['Batch No', 'Source CWS', 'Destination CWS', 'Processing Type', 'Total KGs', 'Grades', 'Date', 'Status', 'Actions'].map((header) => (
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

const WetTransferAdmin = () => {
    const [allTransfers, setAllTransfers] = useState([]);
    const [groupedTransfers, setGroupedTransfers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedBatches, setExpandedBatches] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [notes, setNotes] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // New filter states
    const [showFilters, setShowFilters] = useState(false);
    const [sourceCwsList, setSourceCwsList] = useState([]);
    const [destinationCwsList, setDestinationCwsList] = useState([]);
    const [selectedSourceCws, setSelectedSourceCws] = useState('');
    const [selectedDestinationCws, setSelectedDestinationCws] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [processingTypes, setProcessingTypes] = useState([]);
    const [selectedProcessingType, setSelectedProcessingType] = useState('');

    useEffect(() => {
        fetchTransfers();
        fetchCwsList();
    }, []);

    const fetchCwsList = async () => {
        try {
            // Assuming there's an API endpoint for getting CWS list
            const response = await axios.get(`${API_URL}/cws`);

            // Extract unique source and destination CWS
            const sourceCws = [...new Set(allTransfers.map(t => t.sourceCws?.name))].filter(Boolean);
            const destinationCws = [...new Set(allTransfers.map(t => t.destinationCws?.name))].filter(Boolean);
            const types = [...new Set(allTransfers.map(t => t.processingType))].filter(Boolean);

            setSourceCwsList(response.data || sourceCws);
            setDestinationCwsList(response.data || destinationCws);
            setProcessingTypes(types);
        } catch (error) {
            console.error('Error fetching CWS list:', error);

            // Fallback to extracting from transfers if API fails
            const sourceCws = [...new Set(allTransfers.map(t => t.sourceCws?.name))].filter(Boolean);
            const destinationCws = [...new Set(allTransfers.map(t => t.destinationCws?.name))].filter(Boolean);
            const types = [...new Set(allTransfers.map(t => t.processingType))].filter(Boolean);

            setSourceCwsList(sourceCws);
            setDestinationCwsList(destinationCws);
            setProcessingTypes(types);
        }
    };

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/wet-transfer`);
            setAllTransfers(response.data);

            // Group transfers by batchNo
            const grouped = groupTransfersByBatch(response.data);
            setGroupedTransfers(grouped);

            // Extract unique processing types
            const types = [...new Set(response.data.map(t => t.processingType))].filter(Boolean);
            setProcessingTypes(types);

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
                    status: transfer.status,
                    transfers: []
                };
            }

            acc[transfer.batchNo].transfers.push(transfer);
            return acc;
        }, {});
    };

    const handleBatchToggleExpand = (batchNo, e) => {
        e.stopPropagation();
        setExpandedBatches(prev => ({
            ...prev,
            [batchNo]: !prev[batchNo]
        }));
    };

    const handleUpdateTransfer = (transfer) => {
        setSelectedTransfer(transfer);
        setUpdateStatus(transfer.status);
        setNotes(transfer.notes || '');
        setShowUpdateModal(true);
    };

    const submitUpdateTransfer = async () => {
        try {
            await axios.put(`${API_URL}/wet-transfer/${selectedTransfer.id}`, {
                status: updateStatus,
                notes: notes
            });

            setShowUpdateModal(false);
            fetchTransfers(); // Refresh data
            alert('Transfer updated successfully');
        } catch (error) {
            console.error('Error updating transfer:', error);
            alert('Failed to update transfer');
        }
    };

    const resetFilters = () => {
        setSelectedSourceCws('');
        setSelectedDestinationCws('');
        setStartDate(null);
        setEndDate(null);
        setSelectedProcessingType('');
        setCurrentPage(1);
    };

    // Filter batches based on search term, active tab and advanced filters
    const getFilteredBatches = () => {
        const searchTermLower = searchTerm.toLowerCase();

        // Filter by status if a specific tab is selected
        let filteredByStatus = Object.entries(groupedTransfers);
        if (activeTab === 'pending') {
            filteredByStatus = filteredByStatus.filter(([_, batch]) => batch.status === 'PENDING');
        } else if (activeTab === 'received') {
            filteredByStatus = filteredByStatus.filter(([_, batch]) => batch.status === 'RECEIVED');
        } 

        // Apply advanced filters
        let filtered = filteredByStatus.filter(([_, batch]) => {
            // Source CWS filter
            if (selectedSourceCws && batch.sourceCws?.name !== selectedSourceCws) {
                return false;
            }

            // Destination CWS filter
            if (selectedDestinationCws && batch.destinationCws?.name !== selectedDestinationCws) {
                return false;
            }

            // Processing Type filter
            if (selectedProcessingType && batch.processingType !== selectedProcessingType) {
                return false;
            }

            // Date range filter
            if (startDate && endDate) {
                const batchDate = new Date(batch.date);
                if (batchDate < startDate || batchDate > endDate) {
                    return false;
                }
            }

            return true;
        });

        // Then filter by search term
        return filtered
            .filter(([_, batch]) => {
                return (
                    batch.batchNo?.toLowerCase().includes(searchTermLower) ||
                    batch.processingType?.toLowerCase().includes(searchTermLower) ||
                    batch.sourceCws?.name?.toLowerCase().includes(searchTermLower) ||
                    batch.destinationCws?.name?.toLowerCase().includes(searchTermLower) ||
                    batch.status?.toLowerCase().includes(searchTermLower) ||
                    batch.transfers.some(t => t.grade?.toLowerCase().includes(searchTermLower))
                );
            })
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    };

    // Export functions
    // const prepareExportData = () => {
    //     const filteredBatches = getFilteredBatches();

    //     // Prepare data for export
    //     return Object.values(filteredBatches).map(batch => {
    //         const totalOutputKgs = calculateTotalOutputKgs(batch.transfers);
    //         const grades = getGradeSummary(batch.transfers);

    //         return {
    //             'Batch No': batch.batchNo,
    //             'Source CWS': batch.sourceCws?.name || 'Unknown',
    //             'Destination CWS': batch.destinationCws?.name || 'Unknown',
    //             'Processing Type': batch.processingType,
    //             'Total KGs': totalOutputKgs,
    //             'Grades': grades,
    //             'Date': new Date(batch.date).toLocaleDateString(),
    //             'Status': batch.status
    //         };
    //     });
    // };

    // const exportToExcel = () => {
    //     const data = prepareExportData();
    //     const worksheet = XLSX.utils.json_to_sheet(data);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Wet Transfers');

    //     // Generate file name with date
    //     const dateStr = new Date().toISOString().split('T')[0];
    //     const fileName = `wet_transfers_${dateStr}.xlsx`;

    //     // Write and download
    //     XLSX.writeFile(workbook, fileName);
    // };

    // const exportToCSV = () => {
    //     const data = prepareExportData();
    //     const worksheet = XLSX.utils.json_to_sheet(data);
    //     const csv = XLSX.utils.sheet_to_csv(worksheet);

    //     // Create blob and download link
    //     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //     const url = URL.createObjectURL(blob);
    //     const dateStr = new Date().toISOString().split('T')[0];
    //     const fileName = `wet_transfers_${dateStr}.csv`;

    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', fileName);
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };

    // Export functions
    const prepareExportData = () => {
        const filteredBatches = getFilteredBatches();

        // Prepare data for export
        return Object.values(filteredBatches).map(batch => {
            const totalOutputKgs = calculateTotalOutputKgs(batch.transfers);
            const grades = getGradeSummary(batch.transfers);

            return {
                'Batch No': batch.batchNo,
                'Source CWS': batch.sourceCws?.name || 'Unknown',
                'Destination CWS': batch.destinationCws?.name || 'Unknown',
                'Processing Type': batch.processingType,
                'Total KGs': totalOutputKgs,
                'Grades': grades,
                'Date': new Date(batch.date).toLocaleDateString(),
                'Status': batch.status
            };
        });
    };

    const exportToExcel = () => {
        const data = prepareExportData();
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `wet_transfers_${dateStr}.xls`;

        // Create HTML table from data
        let htmlContent = `
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: ${processingTheme.neutral}; }
                </style>
            </head>
            <body>
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `;

        // Create blob and trigger download
        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToCSV = () => {
        const data = prepareExportData();
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `wet_transfers_${dateStr}.csv`;

        // Create CSV content
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row =>
            Object.values(row).map(value =>
                // Escape special characters and wrap in quotes
                `"${String(value).replace(/"/g, '""')}"`
            ).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');

        // Create blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                bg = processingTheme.primary;
                text = 'white';
                break;
            case 'RECEIVER_COMPLETED':
                bg = processingTheme.secondary;
                text = 'white';
                break;
            case 'COMPLETED':
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

    // Pagination logic
    const filteredBatches = getFilteredBatches();
    const batchCount = Object.keys(filteredBatches).length;
    const totalPages = Math.ceil(batchCount / itemsPerPage);

    // Get current page batches
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBatches = Object.entries(filteredBatches).slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next or previous page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Custom pagination component
    const PaginationComponent = () => {
        let items = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Always show first page
        if (startPage > 1) {
            items.push(
                <Pagination.Item
                    key={1}
                    onClick={() => paginate(1)}
                    style={{
                        backgroundColor: 'white',
                        borderColor: processingTheme.primary,
                        color: processingTheme.primary
                    }}
                >
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(
                    <Pagination.Ellipsis
                        key="ellipsis-1"
                        style={{
                            borderColor: processingTheme.primary,
                            color: processingTheme.primary
                        }}
                    />
                );
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                    className='bg-sucafina'
                    style={{
                        backgroundColor: i === currentPage ? processingTheme.primary : 'white',
                        borderColor: processingTheme.primary,
                        color: i === currentPage ? 'white' : processingTheme.primary
                    }}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(
                    <Pagination.Ellipsis
                        key="ellipsis-2"
                        style={{
                            borderColor: processingTheme.primary,
                            color: processingTheme.primary
                        }}
                    />
                );
            }
            items.push(
                <Pagination.Item
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    style={{
                        backgroundColor: 'white',
                        borderColor: processingTheme.primary,
                        color: processingTheme.primary
                    }}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return (
            <Pagination className="justify-content-center mt-3 mb-0">
                <Pagination.Prev
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    style={{
                        borderColor: processingTheme.primary,
                        color: processingTheme.primary
                    }}
                />
                {items}
                <Pagination.Next
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                        borderColor: processingTheme.primary,
                        color: processingTheme.primary
                    }}
                />
            </Pagination>
        );
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <Card className="shadow-sm mb-4">
                <Card.Header style={{ backgroundColor: processingTheme.primary, color: 'white', padding: '16px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Wet Transfer</h4>
                        <div className="d-flex align-items-center gap-3">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="light"
                                    id="export-dropdown"
                                    style={{
                                        backgroundColor: 'white',
                                        borderColor: processingTheme.secondary,
                                        color: processingTheme.primary
                                    }}
                                >
                                    <i className="bi bi-download me-2"></i> Export
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={exportToExcel}>
                                        Export to Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={exportToCSV}>
                                        Export to CSV
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Button
                                variant="light"
                                onClick={() => setShowFilters(!showFilters)}
                                style={{
                                    backgroundColor: showFilters ? processingTheme.neutral : 'white',
                                    borderColor: processingTheme.secondary,
                                    color: processingTheme.primary
                                }}
                            >
                                <i className="bi bi-funnel me-2"></i> Filters
                                {(selectedSourceCws || selectedDestinationCws || startDate || selectedProcessingType) && (
                                    <Badge
                                        pill
                                        bg="success"
                                        className="ms-2"
                                        style={{
                                            backgroundColor: processingTheme.secondary,
                                            color: 'white'
                                        }}
                                    >
                                        {[
                                            selectedSourceCws && 1,
                                            selectedDestinationCws && 1,
                                            (startDate && endDate) && 1,
                                            selectedProcessingType && 1
                                        ].filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>

                            <Form.Select
                                style={{ width: '140px' }}
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </Form.Select>

                            <InputGroup style={{ width: '220px' }}>
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
                                        variant="light"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <i className="bi bi-x"></i>
                                    </Button>
                                )}
                            </InputGroup>
                        </div>
                    </div>
                </Card.Header>

                {showFilters && (
                    <div className="p-3 border-bottom" style={{ backgroundColor: processingTheme.neutral }}>
                        <Row className="align-items-end g-3">
                            <Col xs={12} md={3}>
                                <Form.Group>
                                    <Form.Label className="mb-1">Source CWS</Form.Label>
                                    <Form.Select
                                        value={selectedSourceCws}
                                        onChange={(e) => {
                                            setSelectedSourceCws(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Source CWS</option>
                                        {sourceCwsList.map((cws, idx) => (
                                            <option key={idx} value={cws.name || cws}>
                                                {cws.name || cws}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} md={3}>
                                <Form.Group>
                                    <Form.Label className="mb-1">Destination CWS</Form.Label>
                                    <Form.Select
                                        value={selectedDestinationCws}
                                        onChange={(e) => {
                                            setSelectedDestinationCws(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Destination CWS</option>
                                        {destinationCwsList.map((cws, idx) => (
                                            <option key={idx} value={cws.name || cws}>
                                                {cws.name || cws}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} md={3}>
                                <Form.Group>
                                    <Form.Label className="mb-1">Processing Type</Form.Label>
                                    <Form.Select
                                        value={selectedProcessingType}
                                        onChange={(e) => {
                                            setSelectedProcessingType(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="">All Types</option>
                                        {processingTypes.map((type, idx) => (
                                            <option key={idx} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} md={3}>
                                <Form.Group>
                                    <Form.Label className="mb-1 pb-2">Date Range</Form.Label>
                                    <InputGroup>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            placeholderText="Start Date"
                                            className="form-control"
                                            dateFormat="yyyy-MM-dd"
                                            isClearable
                                        />
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            placeholderText="End Date"
                                            className="form-control mt-2"
                                            dateFormat="yyyy-MM-dd"
                                            isClearable
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-3">
                            <Button
                                variant="outline-secondary"
                                onClick={resetFilters}
                                className="me-2"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                )}

                <div className="bg-light p-3 border-bottom">
                    <div className="d-flex justify-content-center">
                        <Button
                            variant={activeTab === 'all' ? 'primary' : 'outline-primary'}
                            className="me-2"
                            onClick={() => {
                                setActiveTab('all');
                                setCurrentPage(1);
                            }}
                            style={{
                                backgroundColor: activeTab === 'all' ? processingTheme.primary : 'white',
                                borderColor: processingTheme.primary,
                                color: activeTab === 'all' ? 'white' : processingTheme.primary
                            }}
                        >
                            All Transfers
                        </Button>
                        <Button
                            variant={activeTab === 'pending' ? 'primary' : 'outline-primary'}
                            className="me-2"
                            onClick={() => {
                                setActiveTab('pending');
                                setCurrentPage(1);
                            }}
                            style={{
                                backgroundColor: activeTab === 'pending' ? processingTheme.primary : 'white',
                                borderColor: processingTheme.primary,
                                color: activeTab === 'pending' ? 'white' : processingTheme.primary
                            }}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={activeTab === 'received' ? 'primary' : 'outline-primary'}
                            className="me-2"
                            onClick={() => {
                                setActiveTab('received');
                                setCurrentPage(1);
                            }}
                            style={{
                                backgroundColor: activeTab === 'received' ? processingTheme.primary : 'white',
                                borderColor: processingTheme.primary,
                                color: activeTab === 'received' ? 'white' : processingTheme.primary
                            }}
                        >
                            Received
                        </Button>
                        
                    </div>
                </div>

                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: processingTheme.neutral }}>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Source CWS</th>
                                    <th>Destination CWS</th>
                                    <th>Processing Type</th>
                                    <th>Total KGs</th>
                                    <th>Grades</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    {/* <th>Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {batchCount === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-4"
                                            style={{
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            No transfers found!
                                        </td>
                                    </tr>
                                ) : (
                                    currentBatches.map(([batchNo, batch]) => {
                                        const isExpanded = expandedBatches[batchNo];
                                        const totalOutputKgs = calculateTotalOutputKgs(batch.transfers);

                                        return (
                                            <React.Fragment key={batchNo}>
                                                <tr style={{
                                                    backgroundColor: isExpanded ? processingTheme.neutral : 'inherit'
                                                }}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-secondary"
                                                                className="p-0 px-1 me-2"
                                                                onClick={(e) => handleBatchToggleExpand(batchNo, e)}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderColor: processingTheme.secondary
                                                                }}
                                                            >
                                                                <i className="bi bi-chevron-down" style={{
                                                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    transition: 'transform 0.2s'
                                                                }}></i>
                                                            </Button>
                                                            <span>{batch.batchNo}</span>
                                                        </div>
                                                    </td>
                                                    <td>{batch.sourceCws?.name || 'Unknown'}</td>
                                                    <td>{batch.destinationCws?.name || 'Unknown'}</td>
                                                    <td>{batch.processingType}</td>
                                                    <td>{totalOutputKgs} kg</td>
                                                    <td>{getGradeSummary(batch.transfers)}</td>
                                                    <td>{new Date(batch.date).toLocaleDateString()}</td>
                                                    <td>{getStatusBadge(batch.status)}</td>
                                                    {/* <td>
                                                        <div className="d-flex">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={() => handleUpdateTransfer(batch.transfers[0])}
                                                                style={{
                                                                    borderColor: processingTheme.primary,
                                                                    color: processingTheme.primary
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </td> */}
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="expanded-row">
                                                        <td colSpan={9} className="p-0">
                                                            <div className="p-3" style={{ backgroundColor: processingTheme.tableHover }}>
                                                                <h6 className="border-bottom pb-2 mb-3">Batch Details</h6>
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-striped">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Transfer ID</th>
                                                                                <th>Grade</th>
                                                                                <th>Output KGs</th>
                                                                                <th>Moisture %</th>
                                                                                <th>Status</th>
                                                                                {/* <th>Actions</th> */}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {batch.transfers.map(transfer => (
                                                                                <tr key={transfer.id}>
                                                                                    <td>{transfer.id}</td>
                                                                                    <td>{transfer.grade}</td>
                                                                                    <td>{parseFloat(transfer.outputKgs).toFixed(2)} kg</td>
                                                                                    <td>{parseFloat(transfer.moistureContent).toFixed(1)}%</td>
                                                                                    <td>{getStatusBadge(transfer.status)}</td>
                                                                                    {/* <td>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline-primary"
                                                                                            onClick={() => handleUpdateTransfer(transfer)}
                                                                                            style={{
                                                                                                borderColor: processingTheme.primary,
                                                                                                color: processingTheme.primary
                                                                                            }}
                                                                                        >
                                                                                            Edit
                                                                                        </Button>
                                                                                    </td> */}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                {batch.transfers.some(t => t.notes || t.moistureAtReceival || t.defectPercentage || t.cleanCupScore) && (
                                                                    <div className="mt-3">
                                                                        <h6 className="border-bottom pb-2 mb-3">Quality Assessment</h6>
                                                                        <div className="table-responsive">
                                                                            <table className="table table-sm table-striped">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Grade</th>
                                                                                        <th>Moisture at Receival</th>
                                                                                        <th>Defect %</th>
                                                                                        <th>Clean Cup Score</th>
                                                                                        <th>Notes</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {batch.transfers.map(transfer => (
                                                                                        <tr key={`quality-${transfer.id}`}>
                                                                                            <td>{transfer.grade}</td>
                                                                                            <td>{transfer.moistureAtReceival ? `${parseFloat(transfer.moistureAtReceival).toFixed(1)}%` : '-'}</td>
                                                                                            <td>{transfer.defectPercentage ? `${parseFloat(transfer.defectPercentage).toFixed(1)}%` : '-'}</td>
                                                                                            <td>{transfer.cleanCupScore || '-'}</td>
                                                                                            <td>{transfer.notes || '-'}</td>
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
                <Card.Footer className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            Showing {batchCount > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, batchCount)} of {batchCount} entries
                        </div>
                        {totalPages > 1 && <PaginationComponent />}
                    </div>
                </Card.Footer>
            </Card>

            {/* Update Transfer Modal */}
            <Modal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: processingTheme.neutral }}>
                    <Modal.Title>Update Transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTransfer && (
                        <>
                            <div className="mb-3">
                                <strong>Batch No:</strong> {selectedTransfer.batchNo}
                            </div>
                            <div className="mb-3">
                                <strong>Grade:</strong> {selectedTransfer.grade}
                            </div>
                            <div className="mb-3">
                                <strong>Output KGs:</strong> {parseFloat(selectedTransfer.outputKgs).toFixed(2)}
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={updateStatus}
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="RECEIVED">RECEIVED</option>
                                    <option value="REJECTED">REJECTED</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes about this transfer..."
                                />
                            </Form.Group>

                            {updateStatus === 'RECEIVED' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Moisture at Receival (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            placeholder="Enter moisture percentage"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Defect Percentage (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            placeholder="Enter defect percentage"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Clean Cup Score (0-10)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            placeholder="Enter clean cup score"
                                        />
                                    </Form.Group>
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowUpdateModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={submitUpdateTransfer}
                        style={{
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }}
                    >
                        Update Transfer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WetTransferAdmin;