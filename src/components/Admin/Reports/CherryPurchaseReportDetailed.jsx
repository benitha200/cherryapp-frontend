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

    const itemsPerPage = 10;

    // Function to get the first and last day of the current month
    const getCurrentMonthDates = () => {
        const firstDay = new Date(2025, 0, 1); // January 1, 2025
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
        const { startDate, endDate } = getCurrentMonthDates();
        setStartDate(startDate);
        setEndDate(endDate);
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
                    </style>
                </head>
                <body>
                    <div class="title">Detailed Cherry Purchase Report</div>
                    <div>Period: ${startDate} to ${endDate}</div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>CWS Name</th>
                                <th>Batch No</th>
                                <th>Delivery Type</th>
                                <th>Grade</th>
                                <th class="text-end">KGs</th>
                                <th class="text-end">Price/Kg</th>
                                <th class="text-end">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchases.map(purchase => `
                                <tr>
                                    <td>${new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td>${purchase.cws.name}</td>
                                    <td>${purchase.batchNo}</td>
                                    <td>${purchase.deliveryType.replace('_', ' ')}</td>
                                    <td>${purchase.grade}</td>
                                    <td class="text-end">${purchase.totalKgs.toLocaleString()}</td>
                                    <td class="text-end">${purchase.cherryPrice.toLocaleString()}</td>
                                    <td class="text-end">${purchase.totalPrice.toLocaleString()}</td>
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

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Detailed Cherry Purchase Report</h2>
                {!loading && !error && purchases.length > 0 && (
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
                                    <th>Grade</th>
                                    <th className="text-end">KGs</th>
                                    <th className="text-end">Price/Kg</th>
                                    <th className="text-end">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <SkeletonRow key={index} cols={8} />
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
                                            <td>{purchase.grade}</td>
                                            <td className="text-end">{purchase.totalKgs.toLocaleString()}</td>
                                            <td className="text-end">{purchase.cherryPrice.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalPrice.toLocaleString()}</td>
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
                                            } : {}}
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