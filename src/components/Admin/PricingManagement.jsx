import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../constants/Constants';

const theme = {
    primary: '#008080',
    secondary: '#4FB3B3',
    accent: '#D95032',
    neutral: '#E6F3F3',
    tableHover: '#F8FAFA'
};

const PricingManagement = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isInitialSetup, setIsInitialSetup] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [cwsList, setCWSList] = useState([]);
    const [selectedCWS, setSelectedCWS] = useState(null);
    const [siteCollections, setSiteCollections] = useState([]);

    const [globalFees, setGlobalFees] = useState({
        commissionFee: 0,
        transportFee: 0
    });

    const [cwsPricing, setCWSPricing] = useState({
        gradeAPrice: 0,
        transportFee: 0
    });

    const [siteCollectionFees, setSiteCollectionFees] = useState([]);

    const [editingGlobal, setEditingGlobal] = useState(false);
    const [editingCWS, setEditingCWS] = useState(false);
    const [editingSites, setEditingSites] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUserInfo(parsedUser);
                    await fetchGlobalFees();
                    if (parsedUser.role === 'ADMIN' || parsedUser.role === 'SUPER_ADMIN') {
                        await fetchCWSList();
                    }
                }
            } catch (err) {
                console.error('Error initializing:', err);
                setError('Error loading initial data');
            }
        };

        initializeData();
    }, []);

    const fetchCWSPricing = async (cwsId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !cwsId) return;

            const response = await axios.get(`${API_URL}/pricing/cws-pricing/${cwsId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                setCWSPricing(response.data);
            }
        } catch (err) {
            console.error('Error fetching CWS pricing:', err);
            setError(err.response?.data?.message || 'Error fetching CWS pricing');
        }
    };

    const fetchGlobalFees = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(`${API_URL}/pricing/global`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data === null) {
                setIsInitialSetup(true);
                setEditingGlobal(true);
            } else {
                setGlobalFees(response.data);
                setIsInitialSetup(false);
            }
        } catch (err) {
            console.error('Error fetching global fees:', err);
            setError(err.response?.data?.message || 'Error fetching global fees');
        }
    };

    const handleGlobalFeesSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pricing/global`, {
                commissionFee: globalFees.commissionFee,
                transportFee: globalFees.transportFee
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchGlobalFees();
            setEditingGlobal(false);
        } catch (err) {
            setError('Error updating global fees');
        } finally {
            setLoading(false);
        }
    };

    const fetchCWSList = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/cws`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCWSList(response.data || []);
        } catch (err) {
            console.error('Error fetching CWS list:', err);
            setError('Error loading CWS list');
        }
    };

    const calculateTotalCollections = (purchases) => {
        if (!purchases) return 0;

        // Group purchases by batchNo to avoid counting duplicates
        const uniquePurchases = purchases.reduce((acc, curr) => {
            if (!acc[curr.batchNo]) {
                acc[curr.batchNo] = curr;
            }
            return acc;
        }, {});

        return Object.keys(uniquePurchases).length;
    };

    useEffect(() => {
        if (siteCollections?.length > 0) {
            fetchSiteCollectionFees(siteCollections.map(site => site.id));
        }
    }, [siteCollections]);


    const fetchSiteCollections = async (cwsId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !cwsId) {
                console.log('Missing token or CWS ID for site collections fetch');
                return;
            }

            console.log(`Fetching site collections for CWS ID: ${cwsId}`);

            const response = await axios.get(`${API_URL}/site-collections/cws/${cwsId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Site collections response:', response.data);

            // Handle single site object by converting it to an array
            const siteData = Array.isArray(response.data) ? response.data : [response.data];
            setSiteCollections(siteData);

            if (siteData.length > 0) {
                console.log(`Found ${siteData.length} site collections, fetching fees...`);
                await fetchSiteCollectionFees(siteData.map(site => site.id));
            } else {
                console.log('No site collections found for this CWS');
                setSiteCollectionFees([]);
            }
        } catch (err) {
            console.error('Error fetching site collections:', err);
            const errorMessage = err.response?.data?.message || 'Error loading site collections';
            setError(errorMessage);
            setSiteCollections([]);
            setSiteCollectionFees([]);
        }
    };

    const fetchSiteCollectionFees = async (siteIds) => {
        if (!siteIds || siteIds.length === 0) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const feesPromises = siteIds.map(siteId =>
                axios.get(`${API_URL}/pricing/site-fees/${siteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            const responses = await Promise.all(feesPromises);
            const fees = responses.map(response => response.data);
            setSiteCollectionFees(fees);
        } catch (err) {
            console.error('Error fetching site collection fees:', err);
            setError('Error loading site collection fees');
        } finally {
            setLoading(false);
        }
    };


    const handleCWSSelect = async (cwsId) => {
        console.log(`CWS selected: ${cwsId}`);
        setSelectedCWS(cwsId);
        if (cwsId) {
            await fetchCWSPricing(cwsId);
            await fetchSiteCollections(cwsId);
        } else {
            setSiteCollections([]);
            setSiteCollectionFees([]);
        }
    };

    const handleSiteFeesSubmit = async (siteId, transportFee) => {
        if (!siteId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            await axios.post(`${API_URL}/pricing/site-fees`, {
                siteCollectionId: siteId,
                transportFee: transportFee
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh fees after update
            await fetchSiteCollectionFees(siteCollections.map(site => site.id));
            setEditingSites(false);
        } catch (err) {
            console.error('Error updating site fee:', err);
            setError('Error updating transport fee');
        } finally {
            setLoading(false);
        }
    };

    const handleCWSPricingSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/pricing/cws-pricing`, {
                cwsId: selectedCWS,
                ...cwsPricing
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingCWS(false);
        } catch (err) {
            setError('Error updating CWS pricing');
        } finally {
            setLoading(false);
        }
    };

    const renderGlobalPricingSection = () => (
        <div className="card mb-4" style={{ borderColor: theme.accent }}>
            <div className="card-header" style={{ backgroundColor: theme.neutral }}>
                <h5 className="card-title mb-0">Global Pricing Configuration</h5>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <h3 className="h5">Commission Fee</h3>
                        {editingGlobal ? (
                            <input
                                type="number"
                                className="form-control"
                                value={globalFees.commissionFee}
                                onChange={e => setGlobalFees({ ...globalFees, commissionFee: parseFloat(e.target.value) || 0 })}
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        ) : (
                            <p className="h4">{globalFees.commissionFee}</p>
                        )}
                        <small className="text-muted">Applies to all site collections</small>
                    </div>
                    <div className="col-md-6">
                        <h3 className="h5">Default Transport Fee (RWF/kg)</h3>
                        {editingGlobal ? (
                            <input
                                type="number"
                                className="form-control"
                                value={globalFees.transportFee}
                                onChange={e => setGlobalFees({ ...globalFees, transportFee: parseFloat(e.target.value) || 0 })}
                                min="0"
                            />
                        ) : (
                            <p className="h4">{globalFees.transportFee} RWF</p>
                        )}
                        <small className="text-muted">Default fee for direct delivery and supplier</small>
                    </div>
                </div>

                <div className="text-end mt-3">
                    {editingGlobal ? (
                        <>
                            <button
                                className="btn me-2"
                                style={{ backgroundColor: theme.neutral, color: theme.primary }}
                                onClick={() => setEditingGlobal(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ backgroundColor: theme.accent, color: 'white' }}
                                onClick={handleGlobalFeesSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn"
                            style={{ backgroundColor: theme.accent, color: 'white' }}
                            onClick={() => setEditingGlobal(true)}
                        >
                            Edit default Stations Pricing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCWSSelector = () => (
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: theme.neutral }}>
            <label className="form-label h5">Select CWS Station</label>
            <select
                className="form-select"
                onChange={(e) => handleCWSSelect(parseInt(e.target.value) || null)}
                value={selectedCWS || ''}
            >
                <option value="">Choose a station...</option>
                {cwsList.map(cws => (
                    <option key={cws.id} value={cws.id}>{cws.name}</option>
                ))}
            </select>
        </div>
    );

    const renderSiteCollectionPricing = () => (
        <div className="card mt-4" style={{ borderColor: theme.secondary }}>
            <div className="card-header" style={{ backgroundColor: theme.neutral }}>
                <h5 className="card-title mb-0">Site Collection Fees</h5>
                <small className="text-muted">
                    Managing fees for {siteCollections[0]?.cws?.name || 'Selected CWS'}
                </small>
            </div>
            <div className="card-body">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {siteCollections?.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Site Name</th>
                                    <th>Location</th>
                                    <th>Total Collections</th>
                                    <th>Transport Fee (RWF/kg)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siteCollections.map(site => {
                                    const siteFee = siteCollectionFees.find(fee => fee?.siteCollectionId === site.id);
                                    const uniquePurchases = new Set(site.purchases?.map(p => p.batchNo) || []);
                                    const isEditing = editingId === site.id;

                                    return (
                                        <tr key={`site-${site.id}`}>
                                            <td>{site.name}</td>
                                            <td>{site.cws?.location || 'N/A'}</td>
                                            <td>{uniquePurchases.size} purchases</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="form-control w-32"
                                                        value={siteFee?.transportFee || 0}
                                                        onChange={(e) => {
                                                            const newFees = [...siteCollectionFees];
                                                            const index = newFees.findIndex(f => f?.siteCollectionId === site.id);
                                                            const newFee = {
                                                                siteCollectionId: site.id,
                                                                transportFee: parseFloat(e.target.value) || 0
                                                            };

                                                            if (index >= 0) {
                                                                newFees[index] = newFee;
                                                            } else {
                                                                newFees.push(newFee);
                                                            }
                                                            setSiteCollectionFees(newFees);
                                                        }}
                                                        min="0"
                                                    />
                                                ) : (
                                                    <span>{siteFee?.transportFee || 0} RWF</span>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ backgroundColor: theme.primary, color: 'white' }}
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            await handleSiteFeesSubmit(site.id, siteFee?.transportFee || 0);
                                                            setEditingId(null);
                                                            setLoading(false);
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Saving...' : 'Save'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ backgroundColor: theme.secondary, color: 'white' }}
                                                        onClick={() => setEditingId(site.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="alert alert-info">
                        No site collections found for this CWS.
                    </div>
                )}
            </div>
        </div>
    );

    if (!userInfo) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info d-flex align-items-center" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    <div>Loading user information...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    <div>
                        {error}
                        <button
                            type="button"
                            className="btn-close float-end"
                            onClick={() => setError('')}
                            aria-label="Close"
                        />
                    </div>
                </div>
            )}

            {/* Render global pricing section for both ADMIN and SUPER_ADMIN roles */}
            {(userInfo?.role === 'SUPER_ADMIN' || userInfo?.role === 'ADMIN') && renderGlobalPricingSection()}

            {/* Render CWS-specific pricing sections for ADMIN role */}
            {userInfo?.role === 'ADMIN' && (
                <>
                    {renderCWSSelector()}
                    {selectedCWS && (
                        <>
                            <div className="card mb-4" style={{ borderColor: theme.primary }}>
                                <div className="card-header" style={{ backgroundColor: theme.neutral }}>
                                    <h5 className="card-title mb-0">CWS Pricing Configuration</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h3 className="h5">Grade A Price</h3>
                                            {editingCWS ? (
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={cwsPricing.gradeAPrice}
                                                    onChange={e => setCWSPricing({ ...cwsPricing, gradeAPrice: parseFloat(e.target.value) || 0 })}
                                                    min="0"
                                                />
                                            ) : (
                                                <p className="h4">{cwsPricing.gradeAPrice} RWF</p>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <h3 className="h5">Transport Fee</h3>
                                            {editingCWS ? (
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={cwsPricing.transportFee}
                                                    onChange={e => setCWSPricing({ ...cwsPricing, transportFee: parseFloat(e.target.value) || 0 })}
                                                    min="0"
                                                />
                                            ) : (
                                                <p className="h4">{cwsPricing.transportFee} RWF</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-end mt-3">
                                        {editingCWS ? (
                                            <>
                                                <button
                                                    className="btn me-2"
                                                    style={{ backgroundColor: theme.neutral, color: theme.primary }}
                                                    onClick={() => setEditingCWS(false)}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ backgroundColor: theme.primary, color: 'white' }}
                                                    onClick={handleCWSPricingSubmit}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn"
                                                style={{ backgroundColor: theme.primary, color: 'white' }}
                                                onClick={() => setEditingCWS(true)}
                                            >
                                                Edit Pricing
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {renderSiteCollectionPricing()}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default PricingManagement;