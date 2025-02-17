import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';

const theme = {
    primary: '#008080',
    secondary: '#4FB3B3',
    accent: '#D95032',
    neutral: '#E6F3F3',
    tableHover: '#F8FAFA',
    directDelivery: '#4FB3B3',
    centralStation: '#008080',
    supplier: '#FFA500',
};

// Skeleton loading component
const SkeletonRow = ({ cols }) => (
    <tr>
        {Array(cols).fill(0).map((_, index) => (
            <td key={index}>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </td>
        ))}
    </tr>
);

// Empty state component
const EmptyState = ({ message = "No records found" }) => (
    <tr>
        <td colSpan="100%" className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-2">
                <i className="bi bi-inbox text-4xl text-gray-400"></i>
                <p className="text-gray-500">{message}</p>
            </div>
        </td>
    </tr>
);

const PurchaseByStation = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totals, setTotals] = useState({
        totalKgs: 0,
        totalPrice: 0,
        totalCherryPrice: 0,
        totalTransportFee: 0,
        totalCommissionFee: 0
    });

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/purchases/cws-aggregated`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPurchases(response.data);

                // Calculate totals
                const aggregatedTotals = response.data.reduce((acc, item) => {
                    return {
                        totalKgs: acc.totalKgs + item.totalKgs,
                        totalPrice: acc.totalPrice + item.totalPrice,
                        totalCherryPrice: acc.totalCherryPrice + item.totalCherryPrice,
                        totalTransportFee: acc.totalTransportFee + item.totalTransportFee,
                        totalCommissionFee: acc.totalCommissionFee + item.totalCommissionFee
                    };
                }, {
                    totalKgs: 0,
                    totalPrice: 0,
                    totalCherryPrice: 0,
                    totalTransportFee: 0,
                    totalCommissionFee: 0
                });

                setTotals(aggregatedTotals);
            } catch (err) {
                setError('Error fetching purchase data');
                console.error('Error fetching purchase data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Purchases By Station</h2>


            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-2 col-sm-6 mb-3">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-title">Total KGs</h6>
                            <h4 className="card-text">{totals.totalKgs.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-6 mb-3">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-title">Total Amount (RWF)</h6>
                            <h4 className="card-text">{totals.totalPrice.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-6 mb-3">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-title">Cherry Amount (RWF)</h6>
                            <h4 className="card-text">{totals.totalCherryPrice.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-6 mb-3">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-title">Transport Amount (RWF)</h6>
                            <h4 className="card-text">{totals.totalTransportFee.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-6 mb-3">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-title">Commission Amount (RWF)</h6>
                            <h4 className="card-text">{totals.totalCommissionFee.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
            </div>

         
            {/* Purchase Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr style={{ backgroundColor: theme.neutral }}>
                                    <th>CWS Name</th>
                                    <th>CWS Code</th>
                                    <th>Purchase Date</th>
                                    <th>Total KGs</th>
                                    <th>Total Amount (RWF)</th>
                                    <th>Cherry Amount (RWF)</th>
                                    <th>Transport Amount (RWF)</th>
                                    <th>Commission Amount (RWF)</th>
                                    {/* <th>Calculated Total (RWF)</th> */}
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
                                    currentItems.map((purchase, index) => {
                                        const purchaseDate = new Date(purchase.purchaseDate).toLocaleDateString();
                                        // const calculatedTotal = purchase.totalCherryPrice + purchase.totalTransportFee + purchase.totalCommissionFee;

                                        return (
                                            <tr key={`${purchase.cwsId}-${index}`}>
                                                <td>{purchase.cwsName}</td>
                                                <td>{purchase.cwsCode}</td>
                                                <td>{purchaseDate}</td>
                                                <td>{purchase.totalKgs.toLocaleString()}</td>
                                                <td>{purchase.totalPrice.toLocaleString()}</td>
                                                <td>{purchase.totalCherryPrice.toLocaleString()}</td>
                                                <td>{purchase.totalTransportFee.toLocaleString()}</td>
                                                <td>{purchase.totalCommissionFee.toLocaleString()}</td>
                                                {/* <td>{calculatedTotal.toLocaleString()}</td> */}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyState />
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && !error && purchases.length > 0 && (
                        <nav>
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(Math.ceil(purchases.length / itemsPerPage)).keys()].map(number => (
                                    <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(number + 1)}
                                            style={currentPage === number + 1 ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}}
                                        >
                                            {number + 1}
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

export default PurchaseByStation;