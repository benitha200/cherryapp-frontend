import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../constants/Constants';
// import API_URL from '../../constants/Constants';

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

const CherryPurchaseReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totals, setTotals] = useState({
        totalKgs: 0,
        totalPrice: 0,
        totalCherryPrice: 0,
        totalTransportFee: 0,
        totalCommissionFee: 0,
        numberOfCWS: 0
    });

    const itemsPerPage = 10;

    const fetchPurchaseReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }
    
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/purchases/cws-aggregated/date-range`, {
                params: { startDate, endDate },
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.data.data.length === 0) {
                setError(`No purchase data found for the period ${startDate} to ${endDate}`);
            }
            
            setPurchases(response.data.data);
            setTotals(response.data.overallTotals);
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

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Cherry Purchase Report</h2>

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
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total CWS</h6>
                                <h4 className="card-text">{totals.numberOfCWS}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total KGs</h6>
                                <h4 className="card-text">{totals.totalKgs.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Amount (RWF)</h6>
                                <h4 className="card-text">{totals.totalPrice.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Cherry Amount (RWF)</h6>
                                <h4 className="card-text">{totals.totalCherryPrice.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Transport Amount (RWF)</h6>
                                <h4 className="card-text">{totals.totalTransportFee.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 mb-3">
                        <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Commission Amount (RWF)</h6>
                                <h4 className="card-text">{totals.totalCommissionFee.toLocaleString()}</h4>
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
                                    <th>CWS Name</th>
                                    <th>CWS Code</th>
                                    <th className="text-end">Total KGs</th>
                                    <th className="text-end">Total Amount (RWF)</th>
                                    <th className="text-end">Cherry Amount (RWF)</th>
                                    <th className="text-end">Transport Amount (RWF)</th>
                                    <th className="text-end">Commission Amount (RWF)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <SkeletonRow key={index} cols={7} />
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-danger">{error}</td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((purchase, index) => (
                                        <tr key={`${purchase.cwsId}-${index}`}>
                                            <td>{purchase.cwsName}</td>
                                            <td>{purchase.cwsCode}</td>
                                            <td className="text-end">{purchase.totalKgs.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalPrice.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalCherryPrice.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalTransportFee.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalCommissionFee.toLocaleString()}</td>
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

export default CherryPurchaseReport;