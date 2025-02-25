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
const EmptyState = ({ message, startDate, endDate }) => (
    <tr>
        <td colSpan="100%" className="text-center py-4">
            <div className="d-flex flex-column align-items-center">
                <i className="bi bi-calendar3 fs-1 text-muted mb-2"></i>
                <p className="text-muted">
                    {message || `No records found for the period ${startDate} to ${endDate}`}
                </p>
            </div>
        </td>
    </tr>
);

const CherryPurchaseReportDetailed = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totals, setTotals] = useState({
        totalKgs: 0,
        totalPrice: 0
    });

    const itemsPerPage = 100;

    const getCurrentMonthDates = () => {
        const firstDay = new Date(new Date().getFullYear(), 0, 1);
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Format dates as YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];

        return {
            startDate: formatDate(firstDay),
            endDate: formatDate(lastDay)
        };
    };

    // Set default dates on component mount
    useEffect(() => {
        const { startDate: start, endDate: end } = getCurrentMonthDates();
        setStartDate(start);
        setEndDate(end);

        // Create an async function to handle the fetch
        const initialFetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/purchases/date-range`, {
                    params: { startDate: start, endDate: end },
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.purchases.length === 0) {
                    setError(`No purchase data found for the period ${start} to ${end}`);
                }

                setPurchases(response.data.purchases);
                setTotals(response.data.totals);
                setCurrentPage(1);
            } catch (err) {
                setError(err.response?.data?.error || 'Error fetching purchase data');
                console.error('Error fetching purchase data:', err);
            } finally {
                setLoading(false);
            }
        };

        initialFetch();
    }, []);

    const fetchPurchaseReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/purchases/date-range`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.purchases.length === 0) {
                setError(`No purchase data found for the period ${startDate} to ${endDate}`);
            }

            setPurchases(response.data.purchases);
            setTotals(response.data.totals);
            setCurrentPage(1);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching purchase data');
            console.error('Error fetching purchase data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const downloadTableAsExcel = () => {
        if (purchases.length === 0) return;

        const formattedStartDate = startDate.replace(/-/g, '');
        const formattedEndDate = endDate.replace(/-/g, '');
        const filename = `cherry_purchase_detailed_${formattedStartDate}_${formattedEndDate}.xls`;

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
                        .secondary-text { color: ${theme.secondary}; }
                    </style>
                </head>
                <body>
                    <div class="title">Cherry Purchase Report</div>
                    <div>Period: ${startDate} to ${endDate}</div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>CWS Name</th>
                                <th>Batch No</th>
                                <th>Delivery Type</th>
                                <th>Site Collection</th>
                                <th>Grade</th>
                                <th class="text-end">KGs</th>
                                <th class="text-end">Total Cherry Price</th>
                                <th class="text-end">Total Transport</th>
                                <th class="text-end">Total Commission</th>
                                <th class="text-end">Total Amount</th>
                                <th class="text-end">Transaction Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchases.map(purchase => `
                                <tr>
                                    <td>${new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td>${purchase.cws.name}</td>
                                    <td>${purchase.batchNo}</td>
                                    <td>${purchase.deliveryType.replace('_', ' ')}</td>
                                    <td class="text-center">${purchase.siteCollection?.name || '_'}</td>
                                    <td class="text-center">${purchase.grade}</td>
                                    <td class="text-end">${purchase.totalKgs.toLocaleString()}</td>
                                    <td class="text-end">${(purchase.totalKgs * purchase.cherryPrice).toLocaleString()}</td>
                                    <td class="text-end">${(purchase.totalKgs * purchase.transportFee).toLocaleString()}</td>
                                    <td class="text-end">${(purchase.totalKgs * purchase.commissionFee).toLocaleString()}</td>
                                    <td class="text-end">${purchase.totalPrice.toLocaleString()}</td>
                                    <td class="text-end">
                                        ${new Date(purchase.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })}
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
        if (purchases.length === 0) return;

        const formattedStartDate = startDate.replace(/-/g, '');
        const formattedEndDate = endDate.replace(/-/g, '');
        const filename = `cherry_purchase_detailed_${formattedStartDate}_${formattedEndDate}.csv`;

        // Define headers
        const headers = [
            'Date',
            'CWS Name',
            'Batch No',
            'Delivery Type',
            'Site Collection',
            'Grade',
            'KGs',
            'Total Cherry Price',
            'Total Transport',
            'Total Commission',
            'Total Amount',
            'Transaction Date'
        ];

        // Convert data to CSV format
        const csvData = purchases.map(purchase => [
            new Date(purchase.purchaseDate).toLocaleDateString(),
            purchase.cws.name,
            purchase.batchNo,
            purchase.deliveryType.replace('_', ' '),
            purchase.siteCollection?.name || '_',
            purchase.grade,
            purchase.totalKgs,
            (purchase.totalKgs * purchase.cherryPrice),
            (purchase.totalKgs * purchase.transportFee),
            (purchase.totalKgs * purchase.commissionFee),
            purchase.totalPrice,
            new Date(purchase.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
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
                <h2>Cherry Purchase Report</h2>
                {!loading && !error && purchases.length > 0 && (
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
                                onClick={fetchPurchaseReport}
                                style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {!loading && !error && purchases.length > 0 && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Records</h6>
                                <h4 className="card-text">{purchases.length}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total KGs</h6>
                                <h4 className="card-text">{totals.totalKgs.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Amount</h6>
                                <h4 className="card-text">{totals.totalPrice.toLocaleString()}</h4>
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
                                    <th>CWS Name</th>
                                    <th>Batch No</th>
                                    <th>Delivery Type</th>
                                    <th>Site Collection</th>
                                    <th>Grade</th>
                                    <th className="text-end">KGs</th>
                                    <th className="text-end">Total Cherry Price</th>
                                    <th className="text-end">Total Transport</th>
                                    <th className="text-end">Total Commission</th>
                                    <th className="text-end">Total Amount</th>
                                    <th className="text-end">Transaction Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <SkeletonRow key={index} cols={12} />
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-danger">{error}</td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                            <td>{purchase.cws.name}</td>
                                            <td>{purchase.batchNo}</td>
                                            <td>{purchase.deliveryType.replace('_', ' ')}</td>
                                            <td className='text-center'>{purchase.siteCollection?.name || '_'}</td>
                                            <td className='text-center'>{purchase.grade}</td>
                                            <td className="text-end">{purchase.totalKgs.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalKgs * purchase.cherryPrice}</td>
                                            <td className="text-end">{purchase.totalKgs * purchase.commissionFee}</td>
                                            <td className="text-end">{purchase.totalKgs * purchase.transportFee}</td>
                                            <td className="text-end">{purchase.totalPrice.toLocaleString()}</td>
                                            <td className="text-end" style={{ color: theme.secondary }}>
                                                {new Date(purchase.createdAt).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: true, // Adjusts for AM/PM format
                                                })}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState startDate={startDate} endDate={endDate} />
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && !error && purchases.length > itemsPerPage && (
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
                                {[...Array(Math.ceil(purchases.length / itemsPerPage))].map((_, index) => (
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
                                <li className={`page-item ${currentPage === Math.ceil(purchases.length / itemsPerPage) ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)}
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

export default CherryPurchaseReportDetailed;