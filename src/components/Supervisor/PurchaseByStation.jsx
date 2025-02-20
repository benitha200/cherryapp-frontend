import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';


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

const SkeletonRow = ({ cols }) => (
    <tr>
        {Array(cols).fill(0).map((_, index) => (
            <td key={index} className="p-3">
                <div className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                </div>
            </td>
        ))}
    </tr>
);

const EmptyState = ({ message = "No records found" }) => (
    <tr>
        <td colSpan="100%" className="text-center py-4">
            <div className="d-flex flex-column align-items-center">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="text-muted mt-2">{message}</p>
            </div>
        </td>
    </tr>
);

const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

const PurchaseByStation = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
    const [cwsList, setCwsList] = useState([]);
    const [selectedCws, setSelectedCws] = useState('');
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [totals, setTotals] = useState({
        totalKgs: 0,
        totalPrice: 0,
        totalCherryPrice: 0,
        totalTransportFee: 0,
        totalCommissionFee: 0,
        averagePricePerKg: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter CWS list based on search term
    const filteredCwsList = cwsList.filter(cws =>
        cws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cws.id.toString().includes(searchTerm)
    );

    // Handle CWS selection
    const handleCwsSelect = (cwsId) => {
        setSelectedCws(cwsId);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };





    useEffect(() => {
        const fetchCwsList = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/cws`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCwsList(response.data);
            } catch (error) {
                console.error('Error fetching CWS list:', error);
            }
        };
        fetchCwsList();
    }, []);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const formattedDate = selectedDate.toISOString().split('T')[0];
                const response = await axios.get(`${API_URL}/purchases/date/${formattedDate}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Flatten the cwsData array and add cwsName and cwsCode to each purchase
                const flattenedPurchases = response.data.cwsData.flatMap(cwsGroup =>
                    cwsGroup.purchases.map(purchase => ({
                        ...purchase,
                        cwsName: cwsGroup.name,
                        cwsCode: purchase.cws.code
                    }))
                );

                // Aggregate purchases by CWS
                const aggregatedPurchases = flattenedPurchases.reduce((acc, purchase) => {
                    const { cwsName, cwsCode, totalKgs, totalPrice, cherryPrice, transportFee, commissionFee } = purchase;

                    if (!acc[cwsName]) {
                        acc[cwsName] = {
                            cwsName,
                            cwsCode,
                            totalKgs: 0,
                            totalPrice: 0,
                            totalCherryPrice: 0,
                            totalTransportFee: 0,
                            totalCommissionFee: 0
                        };
                    }

                    acc[cwsName].totalKgs += totalKgs;
                    acc[cwsName].totalPrice += totalPrice;
                    acc[cwsName].totalCherryPrice += totalKgs * cherryPrice;
                    acc[cwsName].totalTransportFee += totalKgs * transportFee;
                    acc[cwsName].totalCommissionFee += totalKgs * commissionFee;

                    return acc;
                }, {});

                // Convert the aggregated object back to an array
                const aggregatedPurchasesArray = Object.values(aggregatedPurchases);

                setPurchases(aggregatedPurchasesArray);
                updateFilteredPurchases(aggregatedPurchasesArray, selectedCws);
            } catch (err) {
                setError('Error fetching purchase data');
                console.error('Error fetching purchase data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate) {
            fetchPurchases();
        }
    }, [selectedDate]);

    const updateFilteredPurchases = (purchases, cwsId) => {
        const filtered = cwsId
            ? purchases.filter(p => p.cwsCode === cwsId)
            : purchases;

        setFilteredPurchases(filtered);

        const newTotals = filtered.reduce((acc, item) => ({
            totalKgs: acc.totalKgs + item.totalKgs,
            totalPrice: acc.totalPrice + item.totalPrice,
            totalCherryPrice: acc.totalCherryPrice + item.totalCherryPrice,
            totalTransportFee: acc.totalTransportFee + item.totalTransportFee,
            totalCommissionFee: acc.totalCommissionFee + item.totalCommissionFee
        }), {
            totalKgs: 0,
            totalPrice: 0,
            totalCherryPrice: 0,
            totalTransportFee: 0,
            totalCommissionFee: 0
        });

        // Calculate average price per kg
        newTotals.averagePricePerKg = newTotals.totalKgs > 0
            ? newTotals.totalPrice / newTotals.totalKgs
            : 0;

        setTotals(newTotals);
        setCurrentPage(1);
    };

    useEffect(() => {
        updateFilteredPurchases(purchases, selectedCws);
    }, [selectedCws, purchases]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Purchases By Station</h2>

                <div className="d-flex gap-3 align-items-end">
                    <div>
                        <label className="form-label" style={{ color: theme.primary }}>Select Date</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                            style={{
                                borderColor: theme.primary,
                                '&:focus': {
                                    borderColor: theme.secondary,
                                    boxShadow: `0 0 0 0.2rem ${theme.neutral}`
                                }
                            }}
                        />
                    </div>

                    <div className="dropdown" style={{ width: '400px' }}> {/* Adjust width here */}
                        <label className="form-label" style={{ color: theme.primary }}>Filter by CWS</label>
                        <div className="position-relative">
                            <button
                                className="form-select d-flex justify-content-between align-items-center"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                type="button"
                                aria-expanded={isDropdownOpen}
                                style={{
                                    borderColor: theme.primary,
                                    color: theme.primary,
                                    backgroundColor: isDropdownOpen ? theme.neutral : 'white',
                                    width: '100%' // Ensure the button takes full width
                                }}
                            >
                                {selectedCws ? cwsList.find(cws => cws.id.toString() === selectedCws)?.name : 'All CWS'}
                            </button>

                            <div
                                className={`dropdown-menu w-100 ${isDropdownOpen ? 'show' : ''}`}
                                style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    borderColor: theme.primary,
                                    width: '100%'
                                }}
                            >
                                <div className="px-3 py-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search CWS..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ borderColor: theme.primary }}
                                    />
                                </div>
                                <div className="dropdown-divider"></div>
                                <button
                                    className={`dropdown-item ${!selectedCws ? 'active' : ''}`}
                                    onClick={() => handleCwsSelect('')}
                                    style={{
                                        backgroundColor: !selectedCws ? theme.primary : 'transparent',
                                        color: !selectedCws ? 'white' : 'inherit'
                                    }}
                                >
                                    All CWS
                                </button>
                                {filteredCwsList.map(cws => (
                                    <button
                                        key={cws.id}
                                        className={`dropdown-item ${selectedCws === cws.id.toString() ? 'active' : ''}`}
                                        onClick={() => handleCwsSelect(cws.id.toString())}
                                        style={{
                                            backgroundColor: selectedCws === cws.id.toString() ? theme.primary : 'transparent',
                                            color: selectedCws === cws.id.toString() ? 'white' : 'inherit'
                                        }}
                                    >
                                        {cws.name}
                                    </button>
                                ))}
                                {filteredCwsList.length === 0 && (
                                    <div className="dropdown-item text-muted">No results found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2">Total KGs</h6>
                            <h4 className="card-title mb-0">{totals.totalKgs.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2">Total (RWF)</h6>
                            <h4 className="card-title mb-0">{totals.totalPrice.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral, borderColor: theme.primary }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2" style={{ color: theme.primary }}>Average Price/Kg (RWF)</h6>
                            <h4 className="card-title mb-0">{totals?.averagePricePerKg?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2">Cherry (RWF)</h6>
                            <h4 className="card-title mb-0">{totals.totalCherryPrice.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2">Transport  (RWF)</h6>
                            <h4 className="card-title mb-0">{totals.totalTransportFee.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card h-100" style={{ backgroundColor: theme.neutral }}>
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2">Commission  (RWF)</h6>
                            <h4 className="card-title mb-0">{totals.totalCommissionFee.toLocaleString()}</h4>
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
                                        <SkeletonRow key={index} cols={8} />
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-danger">{error}</td>
                                    </tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((purchase, index) => (
                                        <tr key={index}>
                                            <td>{purchase.cwsName}</td>
                                            <td>{purchase.cwsCode}</td>
                                            {/* <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td> */}
                                            <td className='text-end'>{selectedDate ? "" : ""}</td>
                                            <td className="text-end">{purchase.totalKgs.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalPrice.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalCherryPrice.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalTransportFee.toLocaleString()}</td>
                                            <td className="text-end">{purchase.totalCommissionFee.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState />
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination with updated styling */}
                    {!loading && !error && filteredPurchases.length > itemsPerPage && (
                        <nav className="d-flex justify-content-center mt-4">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            color: theme.primary,
                                            borderColor: theme.primary
                                        }}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(Math.ceil(filteredPurchases.length / itemsPerPage))].map((_, index) => (
                                    <li
                                        key={index + 1}
                                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(index + 1)}
                                            style={{
                                                backgroundColor: currentPage === index + 1 ? theme.primary : 'white',
                                                borderColor: theme.primary,
                                                color: currentPage === index + 1 ? 'white' : theme.primary
                                            }}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === Math.ceil(filteredPurchases.length / itemsPerPage) ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === Math.ceil(filteredPurchases.length / itemsPerPage)}
                                        style={{
                                            color: theme.primary,
                                            borderColor: theme.primary
                                        }}
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

