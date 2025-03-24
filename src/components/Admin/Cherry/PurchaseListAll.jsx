import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_URL from '../../../constants/Constants';

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

// Skeleton loading row component
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

const PurchaseListAll = () => {
    const [purchases, setPurchases] = useState([]);
    const [siteCollections, setSiteCollections] = useState([]);
    const [globalFees, setGlobalFees] = useState({ commissionFee: 0, transportFee: 0 });
    const [processingEntries, setProcessingEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [siteSpecificFees, setSiteSpecificFees] = useState({});
    const [cwsPricing, setCwsPricing] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState({
        purchases: true,
        siteCollections: true,
        processingEntries: true
    });
    const [prices, setPrices] = useState({
        A: 800,
        B: 200
    });
    const [editingPrice, setEditingPrice] = useState({
        A: false,
        B: false
    });
    const [processingType, setProcessingType] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const cwsInfo = JSON.parse(localStorage.getItem('cws'));
    const [specialBatchKgs, setSpecialBatchKgs] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [allCws, setAllCws] = useState([]);
    const [selectedCWS, setSelectedCWS] = useState(1);
    const [selectedDate, setSelectedDate] = useState(1);

    // Set today's date and yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const [newPurchase, setNewPurchase] = useState({
        cwsId: userInfo.cwsId,
        deliveryType: 'DIRECT_DELIVERY',
        totalKgs: '',
        totalPrice: '',
        grade: 'A',
        purchaseDate: yesterdayString,
        siteCollectionId: '',
        // batchNo: new Date().toISOString().split('T')[0] // Use date as batch number
    });
    const [batchesState, setBatchesState] = useState([]);

    useEffect(() => {
        if (selectedCWS) {
            fetchPurchases();
            // fetchSiteCollections();
            fetchProcessingEntries();
        }
    }, [selectedCWS]);

    // Fetch global fees
    const fetchGlobalFees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pricing/global`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGlobalFees(response.data || { commissionFee: 0, transportFee: 0 });
        } catch (err) {
            setError('Error fetching global fees');
        }
    };

    const calculatePrices = (data) => {
        const { deliveryType, siteCollectionId, grade, totalKgs } = data;
        let transportFee = 0;
        let cherryPrice = 0;
        let commissionFee = 0;

        // Get base cherry price based on grade
        let baseCherryPrice = grade === 'A' ?
            (cwsPricing ? cwsPricing.gradeAPrice : 800) :
            200; // Grade B fixed price is 200

        if (deliveryType === 'SITE_COLLECTION' && siteCollectionId) {
            // Only apply transport fee for site collections
            const siteFee = siteSpecificFees[siteCollectionId];
            transportFee = siteFee !== undefined ? siteFee : globalFees.transportFee;
            commissionFee = globalFees.commissionFee;
        } else {
            // For DIRECT_DELIVERY and SUPPLIER, set transport fee to 0
            transportFee = 0;
            commissionFee = 0;
        }

        cherryPrice = baseCherryPrice - (transportFee + commissionFee);
        // Calculate total price: (cherryPrice + transportFee) * totalKgs
        const totalPrice = (cherryPrice + transportFee + commissionFee) * parseFloat(totalKgs || 0);
        const commissionAmount = deliveryType === 'SITE_COLLECTION' ?
            (parseFloat(totalKgs || 0) * commissionFee) : 0;

        return {
            cherryPrice,
            transportFee,
            commissionFee,
            totalPrice,
            commissionAmount
        };
    };

    const hasGradeStartedProcessing = (processingEntries, grade, date) => {
        if (!date || !grade || !Array.isArray(processingEntries)) return false;

        try {
            const targetDate = new Date(date);
            // Check if date is valid
            if (isNaN(targetDate.getTime())) return false;

            const targetDateString = targetDate.toISOString().split('T')[0];

            return processingEntries.some(entry => {
                if (!entry.batchNo) return false;

                try {
                    const entryDate = new Date(entry.batchNo);
                    // Check if entry date is valid
                    if (isNaN(entryDate.getTime())) return false;

                    return entryDate.toISOString().split('T')[0] === targetDateString &&
                        entry.grade === grade &&
                        ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
                } catch (err) {
                    console.warn('Invalid entry date:', entry.batchNo);
                    return false;
                }
            });
        } catch (err) {
            console.warn('Invalid target date:', date);
            return false;
        }
    };


    const getAvailableGrades = () => {
        const grades = ['A', 'B'];
        return grades.filter(grade => !isGradeProcessing(grade, yesterdayString));
    };

    useEffect(() => {
        if (!isLoading.processingEntries) {
            setBatchesState(getBatchesByGrade());
        }
    }, [isLoading.processingEntries, purchases, processingEntries]);



    const isGradeProcessing = (grade, date, batchNo) => {
        if (!Array.isArray(processingEntries)) return false;

        return processingEntries.some(entry => {
            // If we have a specific batch number, use exact matching
            if (batchNo) {
                return entry.batchNo === batchNo &&
                    entry.grade === grade &&
                    ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
            }

            // For date-based checks, extract the date portion from the batch number
            // Assuming batch numbers are in format "YYMSHMMDDx" where x is the grade
            const dateFromBatch = entry.batchNo.substring(5, 9); // Extract MMDD
            const targetDate = new Date(date);
            const targetMMDD = `${String(targetDate.getMonth() + 1).padStart(2, '0')}${String(targetDate.getDate()).padStart(2, '0')}`;

            return dateFromBatch === targetMMDD &&
                entry.grade === grade &&
                ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
        });
    };


    useEffect(() => {
        if (newPurchase.totalKgs && newPurchase.grade) {
            const price = prices[newPurchase.grade];
            setNewPurchase(prev => ({
                ...prev,
                totalPrice: (parseFloat(prev.totalKgs) * price).toString()
            }));
        }
    }, [newPurchase.totalKgs, newPurchase.grade, prices]);

    const getBatchSuffix = (batchNo) => {
        return batchNo.split('-').pop();
    };

    // Function to determine available processing types
    const getProcessingOptions = () => {
        if (cwsInfo?.havespeciality) {
            const suffix = getBatchSuffix(selectedBatch.batchNo);
            if (suffix === '1') {
                return (
                    <>
                        <option value="NATURAL">Natural</option>
                        <option value="HONEY">Honey</option>
                        <option value="FULLY_WASHED">Fully Washed</option>
                    </>
                );
            } else if (suffix === '2') {
                return <option value="FULLY_WASHED">Fully Washed</option>;
            }
        }

        // Default case: only Fully Washed
        return <option value="FULLY_WASHED">Fully Washed</option>;
    };



    const handleNewPurchaseChange = async (e) => {
        const { name, value } = e.target;

        if (name === 'grade') {
            // Check if this grade is available
            if (hasGradeStartedProcessing(processingEntries, value, yesterdayString)) {
                const processingTime = getProcessingStartTime(value, yesterdayString);
                setValidationError(
                    <div className="alert alert-warning" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Cannot add purchase for Grade {value}.</strong>
                        <div className="mt-1">
                            Processing for Grade {value} cherries from yesterday has already started
                            {processingTime ? ` at ${processingTime}` : ''}.
                            Please contact your supervisor if you need to add more purchases for this grade.
                        </div>
                    </div>
                );
                return;
            } else {
                setValidationError(''); // Clear error if grade is valid
            }
        }

        setNewPurchase(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'totalKgs' && {
                totalPrice: (parseFloat(value || 0) * prices[prev.grade]).toString()
            })
        }));
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedPurchase = {
            ...newPurchase,
            [name]: value
        };

        const prices = calculatePrices(updatedPurchase);
        setNewPurchase({
            ...updatedPurchase,
            ...prices
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationError('');

        try {
            const prices = calculatePrices(newPurchase);

            const formattedPurchase = {
                // cwsId: parseInt(newPurchase.cwsId, 10),
                cwsId: parseInt(selectedCWS, 10),
                deliveryType: newPurchase.deliveryType,
                totalKgs: parseFloat(newPurchase.totalKgs),
                totalPrice: prices.totalPrice,
                cherryPrice: prices.cherryPrice,
                transportFee: prices.transportFee,
                commissionFee: prices.commissionFee,
                grade: newPurchase.grade,
                purchaseDate: selectedDate,
                batchNo: `${new Date(newPurchase.purchaseDate).getFullYear().toString().slice(-2)}${allCws.find(cws => cws.id === parseInt(selectedCWS, 10))?.code}${new Date(selectedDate).toISOString().slice(8, 10)}${new Date(selectedDate).toISOString().slice(5, 7)}${newPurchase.grade}`,
                siteCollectionId: newPurchase.siteCollectionId ?
                    parseInt(newPurchase.siteCollectionId, 10) : null
            };

            const response = await axios.post(`${API_URL}/purchases/new`, formattedPurchase, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setPurchases([response.data, ...purchases]);
            setNewPurchase(prev => ({
                ...prev,
                totalKgs: '',
                totalPrice: '',
            }));
            fetchPurchases();
        } catch (error) {
            console.error('Error adding purchase:', error);
            setValidationError(error.response?.data?.message || 'Error adding purchase');
        } finally {
            setLoading(false);
        }
    };

    const handleStartProcessing = async (batch) => {
        if (cwsInfo?.havespeciality) {
            // For specialty CWS, check if KGs have been set for special batches
            if (!batch.isSpecialBatch || (specialBatchKgs[batch.batchNo] || 0) > 0) {
                setSelectedBatch({
                    ...batch,
                    totalKgs: batch.isSpecialBatch ?
                        specialBatchKgs[batch.batchNo] :
                        batch.originalTotalKgs,
                    batchNo: batch.isSpecialBatch ? batch.batchNo : batch.originalBatchNo
                });
                setProcessingType('');
            } else {
                console.warn('Please set KGs before starting processing');
            }
        } else {
            // For non-specialty CWS, pass the accumulated values by grade
            setSelectedBatch({
                ...batch,
                totalKgs: batch.totalKgs,  // This should now be the accumulated value by grade
                batchNo: batch.batchNo     // This should be formatted as yesterdayString + grade
            });
            setProcessingType('');
        }
    };


    const handleProcessingSubmit = async () => {
        if (!processingType) {
            console.error('Please select a processing type');
            return;
        }

        try {
            const processingData = {
                batchNo: selectedBatch.batchNo,
                processingType: processingType,
                totalKgs: selectedBatch.totalKgs,
                grade: selectedBatch.grade,
                cwsId: parseInt(selectedCWS, 10)
            };

            const response = await axios.post(`${API_URL}/processing`, processingData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh data
            fetchPurchases();
            fetchProcessingEntries();

            // Reset states
            setSelectedBatch(null);
            setProcessingType('');

            console.log('Processing started successfully');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to start processing';
            console.error('Error starting processing:', errorMessage);
        }
    };


    const areAllGradesProcessing = () => {
        return getAvailableGrades(processingEntries, yesterdayString).length === 0;
    };

    const getBatchesByGrade = () => {
        const batches = {};
        const processingStatusMap = {};
        const totalKgsByGrade = {};
        const processedBatchBases = new Set();
      
        // Map processing statuses for the selected date
        processingEntries.forEach(entry => {
          const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
          if (entryDate === selectedDate) {
            const batchKey = `${entry.batchNo}-${entry.grade}`;
            processingStatusMap[batchKey] = entry.status;
      
            const batchBase = entry.batchNo.split('-')[0];
            if (processingEntries.some(e =>
              e.batchNo === `${batchBase}-1` &&
              e.batchNo === `${batchBase}-2`
            )) {
              processedBatchBases.add(batchBase);
            }
          }
        });
      
        // Get purchases for selected date
        const selectedDatePurchases = purchases.filter(purchase => {
          const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
          return purchaseDate === selectedDate;
        });
      
        // Calculate total KGs by grade from selected date's purchases
        selectedDatePurchases.forEach(purchase => {
          if (!totalKgsByGrade[purchase.grade]) {
            totalKgsByGrade[purchase.grade] = 0;
          }
          totalKgsByGrade[purchase.grade] += purchase.totalKgs;
        });
      
        // Group purchases by grade for non-specialty CWS
        if (!cwsInfo?.havespeciality) {
          const purchasesByGrade = {};
      
          selectedDatePurchases.forEach(purchase => {
            const batchKey = purchase.grade;
            const processingStatus = processingStatusMap[`${purchase.batchNo}-${purchase.grade}`] || 'NOT STARTED';
      
            if (processingStatus !== 'NOT STARTED') return;
      
            if (!purchasesByGrade[batchKey]) {
              purchasesByGrade[batchKey] = {
                batchNo: purchase.batchNo,
                grade: purchase.grade,
                totalKgs: 0,
                originalTotalKgs: totalKgsByGrade[purchase.grade],
                totalPrice: 0,
                purchases: [],
                processingStatus: processingStatus
              };
            }
      
            purchasesByGrade[batchKey].totalKgs += purchase.totalKgs;
            purchasesByGrade[batchKey].totalPrice += purchase.totalPrice;
            purchasesByGrade[batchKey].purchases.push(purchase);
          });
      
          return Object.values(purchasesByGrade);
        }
        else {
            selectedDatePurchases.forEach(purchase => {
              const batchBase = purchase.batchNo.slice(0, -1);
        
              if (processedBatchBases.has(batchBase)) {
                return;
              }
        
              const batchKey = `${purchase.batchNo}-${purchase.grade}`;
              const processingStatus = processingStatusMap[batchKey] || 'NOT STARTED';
              
              if (processingStatus !== 'NOT STARTED') return;
        
              const baseId = purchase.batchNo;
              const newBatch = baseId.substring(0, baseId.length - 1);
              const totalKgs = purchase.totalKgs;
              const totalPrice = purchase.totalPrice;
        
              if (processingStatusMap[`${newBatch}-1`] || processingStatusMap[`${newBatch}-2`]) {
                return;
              }
        
              batches[`${newBatch}-1`] = {
                batchNo: `${newBatch}-1`,
                originalBatchNo: baseId,
                grade: purchase.grade,
                totalKgs: totalKgs / 2,
                originalTotalKgs: totalKgsByGrade[purchase.grade],
                totalPrice: totalPrice / 2,
                purchases: [purchase],
                processingStatus: processingStatus,
                isSpecialBatch: true
              };
        
              batches[`${newBatch}-2`] = {
                batchNo: `${newBatch}-2`,
                originalBatchNo: baseId,
                grade: purchase.grade,
                totalKgs: totalKgs / 2,
                originalTotalKgs: totalKgsByGrade[purchase.grade],
                totalPrice: totalPrice / 2,
                purchases: [purchase],
                processingStatus: processingStatus,
                isSpecialBatch: true
              };
            });
        
            return Object.values(batches);
          }
        };


    // Updated getYesterdayPurchases function
    const getYesterdayPurchases = () => {
        const processingBatchNumbers = processingEntries.map(entry => entry.batchNo);

        return purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
            const batchBase = purchase.batchNo.slice(0, -1);

            // Hide if the batch base has both -1 and -2 variants in processing
            if (processingEntries.some(entry =>
                entry.batchNo === `${batchBase}-1` &&
                processingEntries.some(e => e.batchNo === `${batchBase}-2`)
            )) {
                return false;
            }

            return purchaseDate === yesterdayString &&
                !isGradeProcessing(purchase.grade, yesterdayString) &&
                !processingBatchNumbers.includes(purchase.batchNo);
        });
    };


    const calculateTotals = (purchase) => {
        const totalTransportFees = purchase.transportFee * purchase.totalKgs;
        const totalCommissionFees = purchase.commissionFee * purchase.totalKgs;
        const cherryAmount = purchase.cherryPrice * purchase.totalKgs;

        return {
            transportFees: totalTransportFees,
            commissionFees: totalCommissionFees,
            cherryAmount: cherryAmount
        };
    };

    const validateBatchKgsMatch = (batch) => {
        if (!batch.isSpecialBatch) return true;

        const batchBase = batch.batchNo.split('-')[0];
        const batch1 = `${batchBase}-1`;
        const batch2 = `${batchBase}-2`;

        const kg1 = parseFloat(specialBatchKgs[batch1]) || 0;
        const kg2 = parseFloat(specialBatchKgs[batch2]) || 0;
        const totalKgs = kg1 + kg2;

        // Find the original purchase
        const originalPurchase = purchases.find(p =>
            p.batchNo === batch.originalBatchNo ||
            p.batchNo === batchBase
        );

        if (!originalPurchase) return true;

        // Use the original purchase's cherry KGs
        const { cherryAmount } = calculateTotals(originalPurchase);
        const originalCherryKgs = cherryAmount / originalPurchase.cherryPrice;

        // Check if the sum matches the original total
        const isValid = Math.abs(totalKgs - originalCherryKgs) < 0.01;

        setValidationErrors(prev => ({
            ...prev,
            [batchBase]: isValid ? null : `Total KGs (${totalKgs.toLocaleString()}) must equal original cherry total (${originalCherryKgs.toLocaleString()})`
        }));

        return isValid;
    };

    const handleBatchKgChange = (batchNo, value) => {
        const newValue = parseFloat(value) || 0;
        const batchBase = batchNo.split('-')[0];

        setSpecialBatchKgs(prev => ({
            ...prev,
            [batchNo]: newValue
        }));

        const batch = batchesState.find(b => b.batchNo === batchNo);
        if (batch) {
            validateBatchKgsMatch(batch);
        }
    };


    const getBatchProcessingMessage = () => {
        // Check if we have any purchases from yesterday
        const yesterdayPurchases = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
            return purchaseDate === yesterdayString;
        });

        // If there are no yesterday purchases at all
        if (yesterdayPurchases.length === 0) {
            return "No purchases recorded for yesterday";
        }

        // Check if any batches from yesterday have started processing
        const hasStartedProcessing = processingEntries.some(entry => {
            const entryBatch = yesterdayPurchases.find(purchase =>
                purchase.batchNo === entry.batchNo &&
                purchase.grade === entry.grade
            );
            return entryBatch && ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
        });

        // Return appropriate message
        if (hasStartedProcessing) {
            return "Batches from yesterday have started processing";
        }

        return "No batches available for processing";
    };

    // useEffect(() => {
    //     console.log('Yesterday string:', yesterdayString);
    //     console.log('All purchases:', purchases);
    //     console.log('Yesterday purchases:', getYesterdayPurchases());
    // }, [purchases]);



    const renderProcessingStatusBadge = (status) => {
        const statusColors = {
            'PENDING': 'bg-secondary',
            'IN_PROGRESS': 'bg-warning',
            'COMPLETED': 'bg-success',
            'HALTED': 'bg-danger'
        };

        return (
            <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
                {status || 'PENDING'}
            </span>
        );
    };
    useEffect(() => {
        // Fetch CWS list on component mount
        const fetchCWS = async () => {
          try {
            const response = await axios.get(`${API_URL}/cws`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAllCws(response.data);
            // Set default selected CWS if user has cwsId in localStorage
            const userInfo = JSON.parse(localStorage.getItem('user'));
            if (userInfo?.cwsId) {
              setSelectedCWS(userInfo.cwsId);
            }
          } catch (error) {
            console.error('Error fetching CWS:', error);
          }
        };
    
        fetchCWS();
      }, []);
    
      useEffect(() => {
        if (selectedCWS && selectedDate) {
          fetchPurchases();
          fetchProcessingEntries();
        }
      }, [selectedCWS, selectedDate]);
    
      const fetchPurchases = async () => {
        try {
          setIsLoading(prev => ({ ...prev, purchases: true }));
          const response = await axios.get(`${API_URL}/purchases/cws/${selectedCWS}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setPurchases(response.data);
        } catch (error) {
          console.error('Error fetching purchases:', error);
        } finally {
          setIsLoading(prev => ({ ...prev, purchases: false }));
        }
      };
    
      const fetchProcessingEntries = async () => {
        try {
          setIsLoading(prev => ({ ...prev, processingEntries: true }));
          // Add date parameter to the API call
          const response = await axios.get(
            `${API_URL}/processing/cws/${selectedCWS}?date=${selectedDate}`, 
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          setProcessingEntries(response.data);
        } catch (error) {
          console.error('Error fetching processing entries:', error);
        } finally {
          setIsLoading(prev => ({ ...prev, processingEntries: false }));
        }
      };

      const getSelectedDatePurchases = () => {
        return purchases.filter(purchase => {
          const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
          return purchaseDate === selectedDate;
        });
      };

    const renderNewPurchaseForm = () => {
        return (
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <span className="card-title mb-3 h5" style={{ color: theme.primary }}>
                        New Purchase
                    </span>
                    <form onSubmit={handleSubmit} className="row g-3 mt-3 align-items-end">
                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">CWS</label>
                            <select
                                name="cwsId"
                                className="form-select"
                                value={selectedCWS}
                                disabled
                                required
                            >
                                <option value="">Select CWS</option>
                                {allCws.map(cws => (
                                    <option key={cws.id} value={cws.id}>{cws.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">Purchase Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="purchaseDate"
                                value={selectedDate}
                                disabled
                                required
                            />
                        </div>

                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">Delivery Type</label>
                            <select
                                name="deliveryType"
                                className="form-select"
                                value={newPurchase.deliveryType}
                                onChange={handleNewPurchaseChange}
                                required
                            >
                                <option value="DIRECT_DELIVERY">Direct</option>
                            </select>
                        </div>

                        {newPurchase.deliveryType === 'SITE_COLLECTION' && (
                            <div className="col-md-2 col-sm-6">
                                <label className="form-label">Site</label>
                                <select
                                    name="siteCollectionId"
                                    className="form-select"
                                    value={newPurchase.siteCollectionId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Site</option>
                                    {siteCollections.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">Grade</label>
                            {getAvailableGrades().length > 0 ? (
                                <select
                                    name="grade"
                                    className="form-select"
                                    value={newPurchase.grade}
                                    onChange={handleNewPurchaseChange}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {getAvailableGrades().map(grade => (
                                        <option key={grade} value={grade}>Grade {grade}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="alert alert-warning py-2 mb-0">
                                    All grades have started processing
                                </div>
                            )}
                        </div>

                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">Total KGs</label>
                            <input
                                type="number"
                                className="form-control"
                                name="totalKgs"
                                value={newPurchase.totalKgs}
                                onChange={handleNewPurchaseChange}
                                placeholder="Enter KGs"
                                required
                                disabled={getAvailableGrades().length === 0}
                            />
                        </div>

                        <div className="col-md-2 col-sm-6">
                            <label className="form-label">Cherry Price (RWF/kg)</label>
                            <div className="d-flex align-items-center">
                                <span className="form-control-plaintext">
                                    <strong>{newPurchase.cherryPrice}</strong>
                                    <small className="text-muted ms-2">
                                        ({newPurchase.grade === 'A' ? '800' : '200'} - ({newPurchase?.transportFee}+{newPurchase?.commissionFee}))
                                    </small>
                                </span>
                            </div>
                        </div>

                        <div className="col-md-2 col-sm-6">
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading || getAvailableGrades().length === 0}
                                style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : (
                                    <i className="bi bi-plus-lg me-2"></i>
                                )}
                                Add Purchase
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    const renderPurchaseTable = () => {
        const selectedDatePurchases = getSelectedDatePurchases();
    
        return (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Site</th>
                  <th className="p-3 text-left">Delivery Type</th>
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-left">Total KGs</th>
                  <th className="p-3 text-left">Transport Fees (RWF)</th>
                  <th className="p-3 text-left">Commission Fees (RWF)</th>
                  <th className="p-3 text-left">Cherry Amount (RWF)</th>
                  <th className="p-3 text-left">Final Price (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {isLoading.purchases ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4">Loading...</td>
                  </tr>
                ) : selectedDatePurchases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4">No purchases found for selected date</td>
                  </tr>
                ) : (
                  selectedDatePurchases.map(purchase => {
                    const totalTransportFees = purchase.transportFee * purchase.totalKgs;
                    const totalCommissionFees = purchase.commissionFee * purchase.totalKgs;
                    const cherryAmount = purchase.cherryPrice * purchase.totalKgs;
    
                    return (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{purchase.siteCollection?.name || 'Direct'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-white" style={{
                            backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' ? theme.directDelivery :
                              purchase.deliveryType === 'SUPPLIER' ? theme.supplier : theme.centralStation
                          }}>
                            {purchase.deliveryType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">Grade {purchase.grade}</td>
                        <td className="p-3">{purchase.totalKgs.toLocaleString()}</td>
                        <td className="p-3">{totalTransportFees.toLocaleString()}</td>
                        <td className="p-3">{totalCommissionFees.toLocaleString()}</td>
                        <td className="p-3">{cherryAmount.toLocaleString()}</td>
                        <td className="p-3">{purchase.totalPrice.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );
      };

    useEffect(() => {
        fetchGlobalFees();
    }, []);

    const getProcessingStartTime = (grade, date) => {
        if (!Array.isArray(processingEntries)) return null;

        const entry = processingEntries.find(entry => {
            const dateFromBatch = entry.batchNo.substring(5, 9); // Extract MMDD
            const targetDate = new Date(date);
            const targetMMDD = `${String(targetDate.getMonth() + 1).padStart(2, '0')}${String(targetDate.getDate()).padStart(2, '0')}`;

            return dateFromBatch === targetMMDD &&
                entry.grade === grade &&
                ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
        });

        return entry ? new Date(entry.createdAt).toLocaleTimeString() : null;
    };
    const renderSelectionHeader = () => (
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Select CWS</h5>
              </div>
              <div className="card-body">
                <select
                  className="form-select"
                  value={selectedCWS}
                  onChange={(e) => setSelectedCWS(e.target.value)}
                >
                  <option value="">Select CWS</option>
                  {allCws.map(cws => (
                    <option key={cws.id} value={cws.id}>{cws.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
      
          <div className="col-md-6 mb-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Select Date</h5>
              </div>
              <div className="card-body">
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      );
      

    return (
        <div className="container-fluid py-1">
            {renderSelectionHeader()}

            {selectedCWS ? (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title mb-0 h5" style={{ color: theme.primary }}>
                            Cherry Purchases & Processing
                        </span>
                    </div>

                    <div className="card-body">
                        {areAllGradesProcessing() ? (
                            <div className="alert alert-info">
                                All grades are currently being processed. New purchases cannot be added.
                            </div>
                        ) : null}

                        {renderNewPurchaseForm()}
                        {renderPurchaseTable()}
                    </div>
                </div>
            ) : (
                <div className="alert alert-info">
                    Please select a CWS to view purchases and processing information.
                </div>
            )}


            {/* Batches Section */}


            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <span className="card-title mb-3 h5" style={{ color: theme.primary }}>Batches</span>
                    <div className="table-responsive mt-2">
                        <table className="table table-hover">
                            <thead>
                                <tr style={{ backgroundColor: theme.neutral }}>
                                    <th>Batch</th>
                                    <th>Total KGs</th>
                                    <th>Processing Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading.processingEntries ? (
                                    Array(3).fill(0).map((_, index) => (
                                        <SkeletonRow key={index} cols={6} />
                                    ))
                                ) : batchesState.length > 0 ? (
                                    batchesState.map((batch, index) => {
                                        // Find matching processing entry
                                        const processingEntry = processingEntries.find(entry =>
                                            entry.batchNo === batch.batchNo
                                        );

                                        const isInvalid = batch.isSpecialBatch && !validateBatchKgsMatch(batch);

                                        return (
                                            <tr key={index} className={isInvalid ? "bg-info-subtle" : ""}>
                                                <td>{batch.batchNo}</td>
                                                <td>
                                                    {batch.isSpecialBatch ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                className={`form-control form-control-sm ${isInvalid ? "is-warning" : ""}`}
                                                                value={specialBatchKgs[batch.batchNo] ?? (processingEntry?.totalKgs || '')}
                                                                onChange={(e) => handleBatchKgChange(batch.batchNo, e.target.value)}
                                                                disabled={processingEntry?.status === 'IN_PROGRESS'}
                                                            />
                                                            {batch.isSpecialBatch && (
                                                                <div className="mt-1 text-muted small">
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        batch.originalTotalKgs.toLocaleString()
                                                    )}
                                                </td>
                                                <td>
                                                    {processingEntry?.processingType || '-'}
                                                </td>
                                                <td>
                                                    {processingEntry ? (
                                                        renderProcessingStatusBadge(processingEntry.status)
                                                    ) : (
                                                        renderProcessingStatusBadge(batch.processingStatus)
                                                    )}
                                                </td>
                                                <td>
                                                    {!processingEntry?.status || processingEntry.status === 'PENDING' ? (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleStartProcessing(batch)}
                                                            style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                                                            disabled={processingEntry?.status === 'IN_PROGRESS' || (batch.isSpecialBatch && !batch.totalKgs)}
                                                        >
                                                            Start Processing
                                                        </button>
                                                    ) : (
                                                        <span className="text-muted">Processing Started</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <EmptyState message={getBatchProcessingMessage()} />
                                )}
                            </tbody>
                        </table>
                        {cwsInfo?.havespeciality && getBatchesByGrade().some(b => b.isSpecialBatch) && (
                            <div className="alert alert-info mt-3">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                For specialty coffee, each batch can be split into two processing runs. Please distribute the total weight across both entries.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Processing Modal */}

            {
                selectedBatch && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Start Processing - Batch {cwsInfo?.havespeciality ? selectedBatch.batchNo : selectedBatch.originalBatchNo}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedBatch(null)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Processing Type</label>
                                        <select
                                            className="form-select"
                                            value={processingType}
                                            onChange={(e) => setProcessingType(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Processing Type</option>
                                            {getProcessingOptions()}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedBatch(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleProcessingSubmit}
                                        disabled={!processingType}
                                        style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                                    >
                                        Start Processing
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }


        </div >

    );

};

export default PurchaseListAll;