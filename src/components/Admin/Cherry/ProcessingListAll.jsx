
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, InputGroup, Badge, Placeholder } from 'react-bootstrap';
import API_URL from '../../../constants/Constants';

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
    return (
        <div className="container-fluid">
            {/* Header Skeleton */}
            <div className="mb-4" style={{ borderBottom: `2px solid ${processingTheme.primary}` }}>
                <Placeholder as="h2" animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
                <Placeholder as="p" animation="glow">
                    <Placeholder xs={8} />
                </Placeholder>
            </div>

            {/* Summary Cards Skeleton */}
            <Row className="mb-4">
                {[...Array(4)].map((_, idx) => (
                    <Col md={3} key={idx}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Placeholder as={Card.Title} animation="glow">
                                    <Placeholder xs={8} />
                                </Placeholder>
                                <Placeholder as="h2" animation="glow">
                                    <Placeholder xs={6} />
                                </Placeholder>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters Skeleton */}
            <Card className="mb-4">
                <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Placeholder animation="glow">
                                <Placeholder xs={12} />
                            </Placeholder>
                        </Col>
                    </Row>
                </Card.Body>

                {/* Table Skeleton */}
                <div className="table-responsive">
                    <table className="table">
                        <thead style={{ backgroundColor: processingTheme.neutral }}>
                            <tr>
                                {['Batch No', 'Total KGs', 'Grade', 'CWS', 'Processing Type', 'Status'].map(header => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, idx) => (
                                <tr key={idx}>
                                    {[...Array(6)].map((_, cellIdx) => (
                                        <td key={cellIdx}>
                                            <Placeholder animation="glow">
                                                <Placeholder xs={8} />
                                            </Placeholder>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};


const ProcessingListAll = () => {
    const [processingBatches, setProcessingBatches] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        processingType: '',
        grade: ''
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [summaryData, setSummaryData] = useState({
        totalBatches: 0,
        totalKgs: 0,
        fullyWashedKgs: 0,
        naturalKgs: 0
    });

    const statusOptions = ['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const processingTypes = ['All', 'FULLY_WASHED', 'NATURAL'];
    const gradeOptions = ['All', 'A', 'B'];

    const fetchAllBatches = async () => {
        try {
            const res = await axios.get(`${API_URL}/processing?limit=${pagination.total || 1000}`);
            const batchData = res.data.data;
            setAllBatches(batchData);
            
            // Calculate summary data immediately after fetching
            const totalKgs = batchData.reduce((sum, batch) => sum + (Number(batch.totalKgs) || 0), 0);
            const fullyWashedKgs = batchData
                .filter(batch => batch.processingType === 'FULLY_WASHED')
                .reduce((sum, batch) => sum + (Number(batch.totalKgs) || 0), 0);
            const naturalKgs = batchData
                .filter(batch => batch.processingType === 'NATURAL')
                .reduce((sum, batch) => sum + (Number(batch.totalKgs) || 0), 0);

            setSummaryData({
                totalBatches: batchData.length,
                totalKgs,
                fullyWashedKgs,
                naturalKgs
            });

            setPagination(prev => ({
                ...prev,
                total: res.data.pagination.total,
                totalPages: res.data.pagination.totalPages
            }));
        } catch (error) {
            console.error('Error fetching all batches:', error);
            setError('Error fetching batch data');
        }
    };

    const fetchProcessingBatches = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/processing?page=${page}&limit=${pagination.limit}`);
            setProcessingBatches(res.data.data);
            setPagination(prev => ({
                ...prev,
                ...res.data.pagination
            }));
        } catch (error) {
            setError('Error fetching processing batches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await fetchAllBatches();
            await fetchProcessingBatches();
            setLoading(false);
        };
        initializeData();
    }, []);

    const renderSummaryCards = () => {
        const cardStyle = {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
        };

        const cards = [
            {
                title: 'Total Batches',
                value: summaryData.totalBatches,
                color: processingTheme.primary,
                unit: ''
            },
            {
                title: 'Total Weight',
                value: summaryData.totalKgs,
                color: processingTheme.secondary,
                unit: 'kg'
            },
            // {
            //     title: 'Fully Washed',
            //     value: summaryData.fullyWashedKgs,
            //     color: processingTheme.accent,
            //     unit: 'kg'
            // },
            // {
            //     title: 'Natural',
            //     value: summaryData.naturalKgs,
            //     color: processingTheme.secondary,
            //     unit: 'kg'
            // }
        ];

        return (
            <Row className="mb-4">
                {cards.map((card, index) => (
                    <Col md={3} key={index}>
                        <Card
                            className="text-center h-100"
                            style={{
                                ...cardStyle,
                                borderTop: `3px solid ${card.color}`
                            }}
                        >
                            <Card.Body>
                                <Card.Title style={{ color: card.color }}>
                                    {card.title}
                                </Card.Title>
                                <h2 className="mb-0" style={{ color: processingTheme.primary }}>
                                    {typeof card.value === 'number' 
                                        ? card.value.toLocaleString()
                                        : '0'}{card.unit && ` ${card.unit}`}
                                </h2>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };


    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredBatches = (batches) => {
        return batches.filter(batch => {
            const matchesSearch = !filters.search ||
                Object.values(batch).some(value =>
                    String(value).toLowerCase().includes(filters.search.toLowerCase())
                );

            const matchesStatus = !filters.status || filters.status === 'All' ||
                batch.status === filters.status;

            const matchesType = !filters.processingType || filters.processingType === 'All' ||
                batch.processingType === filters.processingType;

            const matchesGrade = !filters.grade || filters.grade === 'All' ||
                batch.grade === filters.grade;

            return matchesSearch && matchesStatus && matchesType && matchesGrade;
        });
    };

    const sortedBatches = (batches) => {
        if (!sortConfig.key) return batches;

        return [...batches].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    useEffect(() => {
        const calculateSummaryData = () => {
            const fullyWashed = processingBatches.filter(batch =>
                batch.processingType === 'FULLY_WASHED'
            );
            const natural = processingBatches.filter(batch =>
                batch.processingType === 'NATURAL'
            );

            setSummaryData({
                totalBatches: processingBatches.length,
                totalKgs: processingBatches.reduce((sum, batch) => sum + batch.totalKgs, 0),
                fullyWashedBatches: fullyWashed.length,
                naturalBatches: natural.length
            });
        };

        calculateSummaryData();
    }, [processingBatches]);

    const renderHeader = () => {
        return (
            <div className="mb-4" style={{ borderBottom: `2px solid ${processingTheme.primary}` }}>
                <h2 style={{ color: processingTheme.primary }}>Processing Batches Overview</h2>
                <p className="text-muted">Track and manage all processing batches across stations</p>
            </div>
        );
    };

    const renderPagination = () => {
        return (
            <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                <div className="text-muted">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <nav>
                    <ul className="pagination mb-0">
                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                Previous
                            </button>
                        </li>
                        {[...Array(pagination.totalPages)].map((_, idx) => (
                            <li key={idx + 1} className={`page-item ${pagination.page === idx + 1 ? 'active' : ''}`}>
                                <button
                                    className="page-link bg-sucafina"
                                    onClick={() => setPagination(prev => ({ ...prev, page: idx + 1 }))}
                                >
                                    {idx + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    };


    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid">
            {renderHeader()}
            {renderSummaryCards()}
            <Card className="mb-4">
                <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search across all fields..."
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={8}>
                            <div className="d-flex gap-3">
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Form.Select>
                                <Form.Select
                                    value={filters.processingType}
                                    onChange={(e) => handleFilterChange('processingType', e.target.value)}
                                >
                                    {processingTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Form.Select>
                                <Form.Select
                                    value={filters.grade}
                                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                                >
                                    {gradeOptions.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>

                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead style={{ backgroundColor: processingTheme.neutral }}>
                            <tr>
                                {[
                                    { key: 'batchNo', label: 'Batch No' },
                                    { key: 'totalKgs', label: 'Total KGs' },
                                    { key: 'grade', label: 'Grade' },
                                    { key: 'cws', label: 'CWS' },
                                    { key: 'processingType', label: 'Processing Type' },
                                    { key: 'status', label: 'Status' }
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        className="cursor-pointer"
                                        onClick={() => handleSort(key)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            {label}
                                            <i className={`bi bi-arrow-${sortConfig.key === key ? (sortConfig.direction === 'asc' ? 'up' : 'down') : 'down-up'}`}></i>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedBatches(filteredBatches(processingBatches)).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
                                        No processing batches found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                sortedBatches(filteredBatches(processingBatches)).map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{batch.batchNo}</td>
                                        <td>{batch.totalKgs?.toLocaleString()} kg</td>
                                        <td>{batch.grade}</td>
                                        <td>{batch.cws.name}</td>
                                        <td>{batch.processingType}</td>
                                        <td>
                                            <Badge bg={
                                                batch.status === 'Completed' ? 'success' :
                                                    batch.status === 'In Progress' ? 'warning' : 'secondary'
                                            }>
                                                {batch.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination()}
            </Card>
        </div>
    );
};

export default ProcessingListAll;