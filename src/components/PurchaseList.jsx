import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_URL from '../constants/Constants';

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

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [siteCollections, setSiteCollections] = useState([]);
  const [globalFees, setGlobalFees] = useState({ commissionFee: 0, transportFee: 0 });
  const [siteCollectionFees, setSiteCollectionFees] = useState([]);
  const [processingEntries, setProcessingEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingInline, setEditingInline] = useState(null);
  const [editFormData, setEditFormData] = useState({});
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
    A: 750,
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
    fetchPurchases();
    fetchSiteCollections();
    fetchProcessingEntries();
  }, []);

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
      (cwsPricing ? cwsPricing.gradeAPrice : 750) :
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

  // const getYesterdayPurchases = () => {
  //   // Get a list of all batch numbers currently in processing
  //   const processingBatchNumbers = processingEntries.map(entry => entry.batchNo);

  //   return purchases.filter(purchase => {
  //     const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
  //     // Only show purchases that haven't started processing and their batch is not in processing
  //     return purchaseDate === yesterdayString &&
  //       !isGradeProcessing(purchase.grade, yesterdayString) &&
  //       !processingBatchNumbers.includes(purchase.batchNo);
  //   });
  // };

  useEffect(() => {
    if (!isLoading.processingEntries) {
      setBatchesState(getBatchesByGrade());
    }
  }, [isLoading.processingEntries, purchases, processingEntries]);

  useEffect(() => {
    const fetchAllSiteFees = async () => {
      if (siteCollections.length > 0) {
        for (const site of siteCollections) {
          await fetchSiteSpecificFee(site.id);
        }
      }
    };
    fetchAllSiteFees();
  }, [siteCollections]);

  // Add this new function to fetch site-specific fees
  const fetchSiteSpecificFee = async (siteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pricing/site-fees/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSiteSpecificFees(prev => ({
        ...prev,
        [siteId]: response.data.transportFee
      }));
      return response.data.transportFee;
    } catch (err) {
      console.error(`Error fetching site fee for site ${siteId}:`, err);
      return null;
    }
  };

  const validatePurchase = (purchaseData, existingPurchases) => {
    const todayPurchases = existingPurchases.filter(p =>
      new Date(p.purchaseDate).toISOString().split('T')[0] === yesterdayString &&
      (editingPurchase ? p.id !== editingPurchase.id : true)
    );

    // Direct Delivery validation - only one entry per grade per day
    if (purchaseData.deliveryType === 'DIRECT_DELIVERY') {
      const existingDirect = todayPurchases.find(p =>
        p.deliveryType === 'DIRECT_DELIVERY' &&
        p.grade === purchaseData.grade
      );
      if (existingDirect) {
        return 'Direct delivery already exists for this grade today';
      }
    }

    // Site Collection validation - unique combination of site, grade, and date
    if (purchaseData.deliveryType === 'SITE_COLLECTION') {
      const existingSite = todayPurchases.find(p =>
        p.deliveryType === 'SITE_COLLECTION' &&
        p.grade === purchaseData.grade &&
        p.siteCollectionId === purchaseData.siteCollectionId
      );
      if (existingSite) {
        return 'Purchase already exists for this site and grade today';
      }
    }

    // Supplier validation - unique combination of grade and date
    if (purchaseData.deliveryType === 'SUPPLIER') {
      const existingSupplier = todayPurchases.find(p =>
        p.deliveryType === 'SUPPLIER' &&
        p.grade === purchaseData.grade
      );
      if (existingSupplier) {
        return 'Supplier purchase already exists for this grade today';
      }
    }

    return '';
  };

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

  const fetchPurchases = async () => {
    try {
      setIsLoading(prev => ({ ...prev, purchases: true }));
      const response = await axios.get(`${API_URL}/purchases/cws/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, purchases: false }));
    }
  };

  const fetchSiteCollections = async () => {
    try {
      setIsLoading(prev => ({ ...prev, siteCollections: true }));
      const response = await axios.get(`${API_URL}/site-collections/cws/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSiteCollections(response.data);
    } catch (error) {
      console.error('Error fetching site collections:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, siteCollections: false }));
    }
  };

  const fetchProcessingEntries = async () => {
    try {
      setIsLoading(prev => ({ ...prev, processingEntries: true }));
      const response = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProcessingEntries(response.data);
    } catch (error) {
      console.error('Error fetching processing entries:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, processingEntries: false }));
    }
  };

  useEffect(() => {
    fetchCWSPricing();
  }, []);

  const fetchCWSPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = JSON.parse(localStorage.getItem('user'));

      const response = await axios.get(`${API_URL}/pricing/cws-pricing/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCwsPricing(response.data);
      setPrices(prev => ({
        ...prev,
        A: response.data?.gradeAPrice || 750
      }));
    } catch (err) {
      setError('Error fetching CWS pricing');
      console.error('Error fetching CWS pricing:', err);
    }
  };

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

  useEffect(() => {
    fetchCWSPricing();
  }, []);

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

    if (name === 'siteCollectionId' && value) {
      const siteFee = await fetchSiteSpecificFee(value);
      if (siteFee !== null) {
        const updatedPurchase = {
          ...newPurchase,
          [name]: value
        };
        const prices = calculatePrices(updatedPurchase);
        setNewPurchase({
          ...updatedPurchase,
          ...prices
        });
        return;
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

  const handlePriceEdit = (grade) => {
    if (grade === 'A') {
      setEditingPrice(prev => ({
        ...prev,
        [grade]: true
      }));
    }
  };

  const handlePriceChange = (grade, value) => {
    if (grade === 'A') {
      setPrices(prev => ({
        ...prev,
        [grade]: parseFloat(value) || 0
      }));
    }
  };

  const handlePriceSave = async (grade) => {
    if (grade === 'A') {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userInfo = JSON.parse(localStorage.getItem('user'));

        await axios.post(`${API_URL}/pricing/cws-pricing`, {
          cwsId: userInfo.cwsId,
          gradeAPrice: prices.A,
          transportFee: cwsPricing?.transportFee || 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEditingPrice(prev => ({
          ...prev,
          [grade]: false
        }));

        await fetchCWSPricing();
      } catch (err) {
        setError('Error updating cherry price');
        console.error('Error updating cherry price:', err);
      } finally {
        setLoading(false);
      }
    }
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
      // First check: Has any processing started for this batch/grade
      const isBatchProcessing = processingEntries.some(entry => {
        return entry.batchNo === yesterdayString &&
          entry.grade === newPurchase.grade &&
          ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
      });

      if (isBatchProcessing) {
        const processingTime = getProcessingStartTime(newPurchase.grade, yesterdayString);
        setValidationError(
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-x-circle me-2"></i>
            <strong>Cannot add purchase for Grade {newPurchase.grade}.</strong>
            <div className="mt-1">
              Processing for Grade {newPurchase.grade} cherries from yesterday has already started
              {processingTime ? ` at ${processingTime}` : ''}.
              Please contact your supervisor if you need to add more purchases for this grade.
            </div>
          </div>
        );
        setLoading(false);
        return;
      }

      // Second check: Has processing started for any other grade (which locks all entries)
      const hasAnyProcessingStarted = processingEntries.some(entry => {
        const entryDate = entry.batchNo.substring(5, 9); // Extract MMDD from batch
        const targetDate = new Date(yesterdayString);
        const targetMMDD = `${String(targetDate.getMonth() + 1).padStart(2, '0')}${String(targetDate.getDate()).padStart(2, '0')}`;

        return entryDate === targetMMDD &&
          ['IN_PROGRESS', 'COMPLETED'].includes(entry.status);
      });

      if (hasAnyProcessingStarted) {
        setValidationError(
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-x-circle me-2"></i>
            <strong>Cannot add new purchases.</strong>
            <div className="mt-1">
              Processing has already started for yesterday's batches.
              No new purchases can be added at this time.
            </div>
          </div>
        );
        setLoading(false);
        return;
      }

      const prices = calculatePrices(newPurchase);

      const formattedPurchase = {
        cwsId: parseInt(newPurchase.cwsId, 10),
        deliveryType: newPurchase.deliveryType,
        totalKgs: parseFloat(newPurchase.totalKgs),
        totalPrice: prices.totalPrice,
        cherryPrice: prices.cherryPrice,
        transportFee: prices.transportFee,
        commissionFee: prices.commissionFee,
        grade: newPurchase.grade,
        purchaseDate: yesterdayString,
        batchNo: yesterdayString,
        siteCollectionId: newPurchase.siteCollectionId ?
          parseInt(newPurchase.siteCollectionId, 10) : null
      };

      // Existing purchase validation
      const error = validatePurchase(formattedPurchase, purchases);
      if (error) {
        setValidationError(
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        );
        setLoading(false);
        return;
      }

      if (formattedPurchase.deliveryType === 'DIRECT_DELIVERY' ||
        formattedPurchase.deliveryType === 'SUPPLIER') {
        delete formattedPurchase.siteCollectionId;
      }

      const response = await axios.post(`${API_URL}/purchases`, formattedPurchase, {
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
        batchNo: yesterdayString
      }));
    } catch (error) {
      console.error('Error adding purchase:', error);

      // Handle the specific error: "That batch is already in processing, you can't add other purchases"
      if (error.response?.data?.error === "That batch is already in processing, you can't add other purchases") {
        setValidationError(
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-x-circle me-2"></i>
            <strong>Cannot add purchase.</strong>
            <div className="mt-1">
              That batch is already in processing. You can't add other purchases for this batch.
            </div>
          </div>
        );
      } else {
        // Handle other errors
        setValidationError(
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-x-circle me-2"></i>
            <strong>Error adding purchase:</strong>
            <div className="mt-1">
              {error.response?.data?.message || 'An unexpected error occurred. Please try again.'}
            </div>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditInline = (purchase) => {
    setEditingInline(purchase.id);
    setEditFormData({
      ...purchase,
      totalKgs: purchase.totalKgs.toString(),
      totalPrice: purchase.totalPrice.toString(),
    });
  };




  const handleEditChange = async (e) => {
    const { name, value } = e.target;

    if (name === 'siteCollectionId' && value) {
      const siteFee = await fetchSiteSpecificFee(value);
      if (siteFee !== null) {
        const updatedForm = {
          ...editFormData,
          [name]: value
        };
        const prices = calculatePrices(updatedForm);
        setEditFormData({
          ...updatedForm,
          ...prices
        });
        return;
      }
    }

    setEditFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'totalKgs' && {
        totalPrice: (parseFloat(value || 0) * prices[prev.grade]).toString()
      })
    }));
  };

  const handleCancelEdit = () => {
    setEditingInline(null);
    setEditFormData({});
  };

  const handleUpdateInline = async (e, purchaseId) => {
    e.preventDefault();
    setLoading(true);
    setValidationError('');

    try {
      const prices = calculatePrices(editFormData);

      const formattedPurchase = {
        ...editFormData,
        totalKgs: parseFloat(editFormData.totalKgs),
        totalPrice: prices.totalPrice,
        cherryPrice: prices.cherryPrice,
        transportFee: prices.transportFee,
        commissionFee: prices.commissionFee,
        cwsId: parseInt(editFormData.cwsId, 10),
        siteCollectionId: editFormData.siteCollectionId ?
          parseInt(editFormData.siteCollectionId, 10) : null,
        purchaseDate: yesterdayString,
        cws: {
          connect: {
            id: parseInt(editFormData.cwsId, 10)
          }
        }
      };

      // Validate update
      const error = validatePurchase(formattedPurchase, purchases.filter(p => p.id !== purchaseId));
      if (error) {
        setValidationError(error);
        setLoading(false);
        return;
      }

      const response = await axios.put(`${API_URL}/purchases/${purchaseId}`, formattedPurchase, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPurchases(purchases.map(p =>
        p.id === purchaseId ? response.data : p
      ));

      setEditingInline(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating purchase:', error);
      setValidationError(error.response?.data?.message || 'Error updating purchase');
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
        cwsId: userInfo.cwsId
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
    const processingStatusMap = {}; // Track processing statuses
    const totalKgsByGrade = {}; // Track total KGs by grade
    
    // First, map processing statuses and track processing batch bases
    const processedBatchBases = new Set();
    processingEntries.forEach(entry => {
      const batchKey = `${entry.batchNo}-${entry.grade}`;
      processingStatusMap[batchKey] = entry.status;
  
      // If we have both -1 and -2 variants, store the base
      const batchBase = entry.batchNo.split('-')[0];
      if (processingEntries.some(e =>
        e.batchNo === `${batchBase}-1` &&
        e.batchNo === `${batchBase}-2`)) {
        processedBatchBases.add(batchBase);
      }
    });
  
    // Calculate total KGs by grade from all yesterday's purchases
    const yesterdayPurchases = getYesterdayPurchases();
    yesterdayPurchases.forEach(purchase => {
      if (!totalKgsByGrade[purchase.grade]) {
        totalKgsByGrade[purchase.grade] = 0;
      }
      totalKgsByGrade[purchase.grade] += purchase.totalKgs;
    });
  
    // Group purchases by grade for non-specialty CWS
    if (!cwsInfo?.havespeciality) {
      const purchasesByGrade = {};
      
      yesterdayPurchases.forEach(purchase => {
        const batchKey = purchase.grade;
        const processingStatus = processingStatusMap[`${purchase.batchNo}-${purchase.grade}`] || 'NOT STARTED';
        
        if (processingStatus !== 'NOT STARTED') return;
        
        if (!purchasesByGrade[batchKey]) {
          purchasesByGrade[batchKey] = {
            // batchNo: yesterdayString + purchase.grade,
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
      
      // Convert grouped purchases to array
      return Object.values(purchasesByGrade);
    } 
    
    // For specialty CWS, continue with the original logic
    else {
      yesterdayPurchases.forEach(purchase => {
        // Extract the base batch number (without grade suffix)
        const batchBase = purchase.batchNo.slice(0, -1);
  
        // Skip if this batch base is already in processing
        if (processedBatchBases.has(batchBase)) {
          return;
        }
  
        const batchKey = `${purchase.batchNo}-${purchase.grade}`;
  
        // Only include batches that are NOT started
        const processingStatus = processingStatusMap[batchKey] || 'NOT STARTED';
        if (processingStatus !== 'NOT STARTED') return;
  
        // For all batches in specialty coffee mode, split them
        const baseId = purchase.batchNo;
        const newBatch = baseId.substring(0, baseId.length - 1);
        const totalKgs = purchase.totalKgs;
        const totalPrice = purchase.totalPrice;
  
        // Skip if either variant is in processing
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

  // Helper function to check if a batch should be hidden
  const shouldHideBatch = (batchNo) => {
    const batchBase = batchNo.split('-')[0];
    return processingEntries.some(entry =>
      entry.batchNo.startsWith(batchBase) &&
      processingEntries.some(e =>
        e.batchNo === `${batchBase}-1` &&
        e.batchNo === `${batchBase}-2`
      )
    );
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

  // Updated validation function to check against total KGs across all batches
  const validateBatchKgsMatch = (batch) => {
    if (!batch.isSpecialBatch) return true;

    const batchBase = batch.batchNo.split('-')[0];
    const batch1 = `${batchBase}-1`;
    const batch2 = `${batchBase}-2`;

    // Get KGs for both batches
    const kg1 = specialBatchKgs[batch1] || 0;
    const kg2 = specialBatchKgs[batch2] || 0;
    const totalKgs = kg1 + kg2;

    // Find original batch
    const originalBatch = purchases.find(p =>
      p.batchNo.startsWith(batchBase) &&
      new Date(p.purchaseDate).toISOString().split('T')[0] === yesterdayString
    );

    if (!originalBatch) return true;

    return Math.abs(totalKgs - originalBatch.totalKgs) < 0.01;
  };



  // 3. Add the missing handleBatchKgChange() function
  const handleBatchKgChange = (batchNo, value) => {
    const newValue = parseFloat(value) || 0;

    // Find the original batch to get total KGs
    const batchBase = batchNo.split('-')[0];
    const originalBatch = purchases.find(p =>
      p.batchNo.startsWith(batchBase) &&
      new Date(p.purchaseDate).toISOString().split('T')[0] === yesterdayString
    );

    if (!originalBatch) return;

    // Update only the current batch's KGs
    setSpecialBatchKgs(prev => ({
      ...prev,
      [batchNo]: newValue
    }));
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

  useEffect(() => {
    console.log('Yesterday string:', yesterdayString);
    console.log('All purchases:', purchases);
    console.log('Yesterday purchases:', getYesterdayPurchases());
  }, [purchases]);



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

  const renderPurchaseTable = () => {
    const hasProcessingStarted = () => {
      const yesterdayPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
        return purchaseDate === yesterdayString;
      });
    }

    return (
      <>
        {validationError && (
          <div className="alert alert-warning" role="alert">
            {validationError}
          </div>
        )}
        <div className="table-responsive mt-4">
          <table className="table table-hover">
            <thead>
              <tr style={{ backgroundColor: theme.neutral }}>
                <th>Date</th>
                <th>Site</th>
                <th>Delivery Type</th>
                <th>Grade</th>
                <th>Total KGs</th>
                <th>Transport Fees (RWF)</th>
                <th>Commission Fees (RWF)</th>
                <th>Cherry Amount (RWF)</th>
                <th>Final Price (RWF)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading.purchases ? (
                Array(5).fill(0).map((_, index) => (
                  <SkeletonRow key={index} cols={9} />
                ))
              ) : hasProcessingStarted() ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <EmptyState message="Yesterday's data processing has already started. You cannot enter new purchases." />
                  </td>
                </tr>
              ) : getYesterdayPurchases().length > 0 ? (
                getYesterdayPurchases().map((purchase) => {
                  // Calculate cherry amount using values from API
                  const totalTransportFees = purchase.transportFee * purchase.totalKgs;
                  const totalCommissionFees = purchase.commissionFee * purchase.totalKgs;
                  const cherryAmount = purchase.cherryPrice * purchase.totalKgs;

                  if (editingInline === purchase.id) {
                    return (
                      <tr key={purchase.id}>
                        <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                        <td>
                          {purchase.deliveryType === 'SITE_COLLECTION' ? (
                            <select
                              name="siteCollectionId"
                              className="form-select form-select-sm"
                              value={editFormData.siteCollectionId || ''}
                              onChange={handleEditChange}
                            >
                              {siteCollections.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                              ))}
                            </select>
                          ) : (
                            purchase.deliveryType === 'SUPPLIER' ? 'Supplier' : 'Direct'
                          )}
                        </td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' ? theme.directDelivery :
                              purchase.deliveryType === 'SUPPLIER' ? theme.supplier : theme.centralStation
                          }}>
                            {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' :
                              purchase.deliveryType === 'SUPPLIER' ? 'Supplier' : 'Site'}
                          </span>
                        </td>
                        <td>
                          <select
                            name="grade"
                            className="form-select form-select-sm"
                            value={editFormData.grade}
                            onChange={handleEditChange}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            name="totalKgs"
                            value={editFormData.totalKgs}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>{totalTransportFees.toLocaleString()}</td>
                        <td>{totalCommissionFees.toLocaleString()}</td>
                        <td>{cherryAmount.toLocaleString()}</td>
                        <td>{purchase.totalPrice.toLocaleString()}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-sucafina"
                              onClick={(e) => handleUpdateInline(e, purchase.id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Regular row display
                  return (
                    <tr key={purchase.id}>
                      <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td>{purchase.siteCollection?.name || (purchase.deliveryType === 'SUPPLIER' ? 'Supplier' : 'Direct')}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' ? theme.directDelivery :
                            purchase.deliveryType === 'SUPPLIER' ? theme.supplier : theme.centralStation
                        }}>
                          {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' :
                            purchase.deliveryType === 'SUPPLIER' ? 'Supplier' : 'Site'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          Grade {purchase.grade}
                        </span>
                      </td>
                      <td>{purchase.totalKgs.toLocaleString()}</td>
                      <td>{totalTransportFees.toLocaleString()}</td>
                      <td>{totalCommissionFees.toLocaleString()}</td>
                      <td>{cherryAmount.toLocaleString()}</td>
                      <td>{purchase.totalPrice.toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-sucafina"
                          onClick={() => handleEditInline(purchase)}
                          style={{ color: theme.primary, borderColor: theme.primary }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyState message="No purchases recorded for yesterday" />
              )}
            </tbody>
            {getYesterdayPurchases().length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: theme.neutral }}>
                  <td colSpan="4"><strong>Totals</strong></td>
                  <td>
                    <strong>
                      {getYesterdayPurchases().reduce((sum, p) => sum + p.totalKgs, 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {getYesterdayPurchases()
                        .reduce((sum, p) => sum + (p.transportFee * p.totalKgs), 0)
                        .toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {getYesterdayPurchases()
                        .reduce((sum, p) => sum + (p.commissionFee * p.totalKgs), 0)
                        .toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {getYesterdayPurchases()
                        .reduce((sum, p) => sum + (p.cherryPrice * p.totalKgs), 0)
                        .toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {getYesterdayPurchases()
                        .reduce((sum, p) => sum + p.totalPrice, 0)
                        .toLocaleString()}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </>
    );
  };


  const renderPriceCard = (grade) => {
    const isGradeA = grade === 'A';


    return (
      <div key={grade} className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="card-title mb-4">Cherry Grade {grade}</h6>
            <div className="d-flex justify-content-between align-items-center">
              {editingPrice[grade] && isGradeA ? (
                <div className="input-group">
                  <span className="input-group-text">RWF</span>
                  <input
                    type="number"
                    className="form-control"
                    value={prices[grade]}
                    onChange={(e) => handlePriceChange(grade, e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePriceSave(grade)}
                    style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span className="h4 mb-0">{prices[grade]} RWF</span>
                  {isGradeA && (
                    <button
                      className="btn btn-outline-sucafina"
                      onClick={() => handlePriceEdit(grade)}
                    // style={{ color: theme.primary, borderColor: theme.primary }}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    fetchGlobalFees();
    // fetchSiteCollectionFees();
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



  const renderNewPurchaseForm = () => {
    // Function to check if a grade has started processing

    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <span className="card-title mb-3 h5" style={{ color: theme.primary }}>
            New Purchase ({yesterdayString})
          </span>

          {/* Show validation error if exists */}
          {/* {validationError && (
            <div className="mb-3">
              {validationError}
            </div>
          )} */}
          <form onSubmit={handleSubmit} className="row g-3 mt-3 align-items-end">
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
                <option value="SITE_COLLECTION">Site</option>
                <option value="SUPPLIER">Supplier</option>
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
                    ({newPurchase.grade === 'A' ? '750' : '200'} - ({newPurchase?.transportFee}+{newPurchase?.commissionFee}))
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

  return (
    <div className="container-fluid py-1">
      <div className="card">
        <div className="card-header">
          <span className="card-title mb-0 h5" style={{ color: theme.primary }}>
            Cherry Purchases & Processing
          </span>
        </div>

        <div className="card-body">
          {/* Price Management Section */}
          <div className="row g-4 mb-4">
            {['A', 'B'].map(grade => renderPriceCard(grade))}
          </div>

          {areAllGradesProcessing() ? (
            <div className="alert alert-info">
              All grades are currently being processed. New purchases cannot be added.
            </div>
          ) : null}

          {/* Get available grades for the form */}
          {(() => {
            return null;
          })()}

          {/* New Purchase Form */}
          {renderNewPurchaseForm()}

          {/* Yesterday's Purchases Table */}

          {renderPurchaseTable()}

          {/* Batches Section */}
          {/* <div className="card border-0 shadow-sm">
            <div className="card-body">
              <span className="card-title mb-3 h5" style={{ color: theme.primary }}>Batches</span>
              <div className="table-responsive mt-2">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ backgroundColor: theme.neutral }}>
                      <th>Batch Date</th>
                      <th>Total KGs</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading.processingEntries ? (
                      // Show 3 skeleton rows while loading
                      Array(3).fill(0).map((_, index) => (
                        <SkeletonRow key={index} cols={6} />
                      ))
                    ) : batchesState.length > 0 ? (
                      batchesState.map((batch, index) => {
                        const isInvalid = batch.isSpecialBatch && !validateBatchKgsMatch(batch);
                        return (
                          <tr key={index} className={isInvalid ? "bg-info-subtle" : ""}>
                            <td>{batch.batchNo}</td>
                            <td>
                              {batch.isSpecialBatch ? (
                                <input
                                  type="number"
                                  className={`form-control form-control-sm ${isInvalid ? "is-warning" : ""}`}
                                  // className={`form-control form-control-sm ${isInvalid ? "is-invalid" : ""}`}
                                  value={batch.totalKgs || ''}
                                  onChange={(e) => handleBatchKgChange(index, e.target.value)}
                                  disabled={batch.processingStatus === 'IN_PROGRESS'} // Disable input if processing is in progress
                                />
                              ) : (
                                batch.totalKgs.toLocaleString()
                              )}
                              {batch.isSpecialBatch && isInvalid && (
                                <div className="text-info">
                                  Total KGs across split batches must equal {batch.originalTotalKgs.toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td>
                              {renderProcessingStatusBadge(batch.processingStatus)}
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStartProcessing(batch)}
                                style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                                disabled={batch.processingStatus === 'IN_PROGRESS' || (batch.isSpecialBatch && !batch.totalKgs)}
                              >
                                Start Processing
                              </button>
                              {batch.isSpecialBatch && isInvalid && (
                                <div className="text-warning mt-1" style={{ fontSize: '0.8rem' }}>
                                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                  KGs don't match original total
                                </div>
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
          </div> */}

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
                      {/* <th>Start Date</th> */}
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
                                      {/* Current: {specialBatchKgs[batch.batchNo] || 0} KGs */}
                                      {/* {isInvalid && (
                                        <div className="text-danger mt-1">
                                          Combined total should equal {batch.originalTotalKgs.toLocaleString()} KGs
                                        </div>
                                      )} */}
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
                            {/* <td>
                              {processingEntry?.startDate ?
                                new Date(processingEntry.startDate).toLocaleString() :
                                '-'
                              }
                            </td> */}
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
                              {/* {batch.isSpecialBatch && isInvalid && (
                                <div className="text-warning mt-1" style={{ fontSize: '0.8rem' }}>
                                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                  KGs don't match original total
                                </div>
                              )} */}
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

          {selectedBatch && (
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
          )}


        </div >
      </div >
    </div >
  );

};

export default PurchaseList;