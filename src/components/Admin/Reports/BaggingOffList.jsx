import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../constants/Constants';

const theme = {
    primary: '#008080',
    secondary: '#4FB3B3',
    accent: '#D95032',
    neutral: '#E6F3F3',
    tableHover: '#F8FAFA'
};

// Skeleton loading component
const SkeletonRow = ({ cols }) => (
    <tr>
        {Array(cols).fill(0).map((_, index) => (
            <td key={index}>
                <div className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                </div>
            </td>
        ))}
    </tr>
);

// Empty state component
const EmptyState = ({ message }) => (
    <tr>
        <td colSpan="100%" className="text-center py-4">
            <div className="d-flex flex-column align-items-center">
                <i className="bi bi-bag-check fs-1 text-muted mb-2"></i>
                <p className="text-muted">
                    {message || "No bagging-off records found"}
                </p>
            </div>
        </td>
    </tr>
);

const BaggingOffList = () => {
    const [baggingOffData, setBaggingOffData] = useState([]);
    const [expandedData, setExpandedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totals, setTotals] = useState({
        totalRecords: 0,
        totalOutputKgs: 0
    });

    const itemsPerPage = 10;

    const getCurrentMonthDates = () => {
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Format dates as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];

        return {
            startDate: formatDate(firstDay),
            endDate: formatDate(lastDay)
        };
    };

    // Transform the original data to expand grades into separate rows
    const expandGrades = (data) => {
        let expandedRows = [];

        data.forEach(item => {
            if (!item.outputKgs || Object.keys(item.outputKgs).length === 0) {
                // If no grades, add a single row with no grade info
                expandedRows.push({
                    ...item,
                    expandedId: `${item.id}-none`,
                    displayGrade: 'None',
                    gradeKgs: 0,
                    isFirstRow: true,
                    rowCount: 1
                });
            } else {
                // Filter out empty grade entries
                const grades = Object.entries(item.outputKgs).filter(([_, value]) => value && value !== '');
                
                if (grades.length === 0) {
                    // If all grades are empty, add a single row with no grade info
                    expandedRows.push({
                        ...item,
                        expandedId: `${item.id}-none`,
                        displayGrade: 'None',
                        gradeKgs: 0,
                        isFirstRow: true,
                        rowCount: 1
                    });
                } else {
                    // Add a row for each grade
                    grades.forEach(([grade, kgs], index) => {
                        expandedRows.push({
                            ...item,
                            expandedId: `${item.id}-${grade}`,
                            displayGrade: grade,
                            gradeKgs: parseFloat(kgs) || 0,
                            isFirstRow: index === 0,
                            rowCount: grades.length
                        });
                    });
                }
            }
        });

        return expandedRows;
    };

    // Set default dates on component mount
    useEffect(() => {
        const { startDate: start, endDate: end } = getCurrentMonthDates();
        setStartDate(start);
        setEndDate(end);
        fetchBaggingOffData();
    }, []);

    const fetchBaggingOffData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/bagging-off`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.length === 0) {
                setError('No bagging-off records found');
            } else {
                setBaggingOffData(response.data);
                
                // Calculate totals
                const totalOutputKgs = response.data.reduce((sum, item) => sum + item.totalOutputKgs, 0);
                setTotals({
                    totalRecords: response.data.length,
                    totalOutputKgs
                });
                
                // Expand grades into separate rows
                setExpandedData(expandGrades(response.data));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching bagging-off data');
            console.error('Error fetching bagging-off data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredData = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/bagging-off`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.length === 0) {
                setError(`No bagging-off data found for the period ${startDate} to ${endDate}`);
            }

            setBaggingOffData(response.data);
            
            // Calculate totals
            const totalOutputKgs = response.data.reduce((sum, item) => sum + item.totalOutputKgs, 0);
            setTotals({
                totalRecords: response.data.length,
                totalOutputKgs
            });
            
            // Expand grades into separate rows
            setExpandedData(expandGrades(response.data));
            
            setCurrentPage(1);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching bagging-off data');
            console.error('Error fetching bagging-off data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = expandedData.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const downloadTableAsExcel = () => {
        if (baggingOffData.length === 0) return;

        const formattedStartDate = startDate ? startDate.replace(/-/g, '') : 'all';
        const formattedEndDate = endDate ? endDate.replace(/-/g, '') : 'current';
        const filename = `bagging_off_report_${formattedStartDate}_${formattedEndDate}.xls`;

        const htmlContent = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: ${theme.neutral}; }
                        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        .summary { margin: 20px 0; }
                        .text-end { text-align: right; }
                        .text-center { text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="title">Bagging-Off Report</div>
                    <div>Period: ${startDate || 'All time'} to ${endDate || 'Current'}</div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Batch No</th>
                                <th>CWS</th>
                                <th>Processing Type</th>
                                <th>Status</th>
                                <th>Grade</th>
                                <th class="text-end">Grade KGs</th>
                                <th class="text-end">Total Output KGs</th>
                                <th class="text-end">Transaction Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expandedData.map(item => `
                                <tr>
                                    <td>${item.isFirstRow ? new Date(item.date).toLocaleDateString() : ''}</td>
                                    <td>${item.isFirstRow ? item.batchNo : ''}</td>
                                    <td>${item.isFirstRow ? (item.processing?.cws?.name || '-') : ''}</td>
                                    <td>${item.isFirstRow ? item.processingType.replace('_', ' ') : ''}</td>
                                    <td>${item.isFirstRow ? item.status : ''}</td>
                                    <td>${item.displayGrade}</td>
                                    <td class="text-end">${item.gradeKgs || 0}</td>
                                    <td class="text-end">${item.isFirstRow ? item.totalOutputKgs.toLocaleString() : ''}</td>
                                    <td class="text-end">
                                        ${item.isFirstRow ? new Date(item.createdAt).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadTableAsCSV = () => {
        if (baggingOffData.length === 0) return;

        const formattedStartDate = startDate ? startDate.replace(/-/g, '') : 'all';
        const formattedEndDate = endDate ? endDate.replace(/-/g, '') : 'current';
        const filename = `bagging_off_report_${formattedStartDate}_${formattedEndDate}.csv`;

        // Define headers
        const headers = [
            'Date',
            'Batch No',
            'CWS',
            'Processing Type',
            'Status',
            'Grade',
            'Grade KGs',
            'Total Output KGs',
            'Transaction Date'
        ];

        // Convert data to CSV format
        const csvData = expandedData.map(item => [
            item.isFirstRow ? new Date(item.date).toLocaleDateString() : '',
            item.isFirstRow ? item.batchNo : '',
            item.isFirstRow ? (item.processing?.cws?.name || '-') : '',
            item.isFirstRow ? item.processingType.replace('_', ' ') : '',
            item.isFirstRow ? item.status : '',
            item.displayGrade,
            item.gradeKgs || 0,
            item.isFirstRow ? item.totalOutputKgs : '',
            item.isFirstRow ? new Date(item.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : ''
        ]);

        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Bagging-Off Report</h2>
                {!loading && !error && baggingOffData.length > 0 && (
                    <div className="btn-group">
                        <button
                            className="btn btn-primary"
                            onClick={downloadTableAsExcel}
                            style={{
                                backgroundColor: theme.primary,
                                borderColor: theme.primary
                            }}
                        >
                            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                            Download Excel
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={downloadTableAsCSV}
                            style={{
                                backgroundColor: theme.secondary,
                                borderColor: theme.secondary
                            }}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Download CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Date Range Selection */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button
                                className="btn btn-primary"
                                onClick={fetchFilteredData}
                                style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {!loading && !error && baggingOffData.length > 0 && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Records</h6>
                                <h4 className="card-text">{totals.totalRecords}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Output KGs</h6>
                                <h4 className="card-text">{totals.totalOutputKgs.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr style={{ backgroundColor: theme.neutral }}>
                                    <th>Date</th>
                                    <th>Batch No</th>
                                    <th>CWS</th>
                                    <th>Processing Type</th>
                                    <th>Status</th>
                                    <th>Grade</th>
                                    <th className="text-end">Grade KGs</th>
                                    <th className="text-end">Total Output KGs</th>
                                    <th className="text-end">Transaction Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <SkeletonRow key={index} cols={9} />
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan="9" className="text-center text-danger">{error}</td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((item) => (
                                        <tr key={item.expandedId}>
                                            <td>{item.isFirstRow ? new Date(item.date).toLocaleDateString() : ''}</td>
                                            <td>{item.isFirstRow ? item.batchNo : ''}</td>
                                            <td>{item.isFirstRow ? (item.processing?.cws?.name || '-') : ''}</td>
                                            <td>{item.isFirstRow ? item.processingType.replace('_', ' ') : ''}</td>
                                            <td>
                                                {item.isFirstRow ? (
                                                    <span className={`badge bg-${item.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                                        {item.status}
                                                    </span>
                                                ) : ''}
                                            </td>
                                            <td style={item.isFirstRow ? {} : { paddingLeft: '2rem' }}>
                                                {item.displayGrade}
                                            </td>
                                            <td className="text-end">{item.gradeKgs || 0}</td>
                                            <td className="text-end">{item.isFirstRow ? item.totalOutputKgs.toLocaleString() : ''}</td>
                                            <td className="text-end" style={{ color: theme.secondary }}>
                                                {item.isFirstRow ? new Date(item.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                }) : ''}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState />
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && !error && expandedData.length > itemsPerPage && (
                        <nav>
                            <ul className="pagination justify-content-center mt-4">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{ color: theme.primary }}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(Math.ceil(expandedData.length / itemsPerPage))].map((_, index) => (
                                    <li
                                        key={index + 1}
                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(index + 1)}
                                            style={currentPage === index + 1 ? {
                                                backgroundColor: theme.primary,
                                                borderColor: theme.primary
                                            } : { color: theme.primary }}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === Math.ceil(expandedData.length / itemsPerPage) ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === Math.ceil(expandedData.length / itemsPerPage)}
                                        style={{ color: theme.primary }}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BaggingOffList;