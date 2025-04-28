import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder, Form, Alert, InputGroup, Badge, Row, Col, Tab, Tabs, Nav } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
};

const GRADE_GROUPS = {
  HIGH: ['A0', 'A1','N1','N2','H2'],
  LOW: ['A2', 'A3', 'B1', 'B2'],
  BOTH: ['A0', 'A1','N1','N2','H2','A2', 'B1', 'B2']
};

const CUP_PROFILES = ['Select Cup Profile', 'S88', 'S87', 'S86', 'C1', 'C2'];



const Transfer = () => {
  const [groupedRecords, setGroupedRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState({});
  const [availableGrades, setAvailableGrades] = useState([]);
  const [totalSelectedKgs, setTotalSelectedKgs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage, setBatchesPerPage] = useState(30);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [modalBatchSearch, setModalBatchSearch] = useState('');
  const [transferMode, setTransferMode] = useState('BOTH'); // 'BOTH', 'HIGH', 'LOW'
  const [highGradeFullyTransferred, setHighGradeFullyTransferred] = useState({});
  const [showBatchSelection, setShowBatchSelection] = useState(false);
  const [selectedLowGrade, setSelectedLowGrade] = useState(null);
  const [selectedLowGradeBatches, setSelectedLowGradeBatches] = useState([]);
  const [lowGradeBags, setLowGradeBags] = useState('');
  const [activeBothGradeTab, setActiveBothGradeTab] = useState("high");


  // New state variables
  const [selectedHighGradeBatches, setSelectedHighGradeBatches] = useState([]);
  const [showHighGradeBatchSelection, setShowHighGradeBatchSelection] = useState(false);
  const [showLowGradeBatchSelection, setShowLowGradeBatchSelection] = useState(false);

  // Replace the single toggleBatchSelectionView function with separate functions
  const toggleHighGradeBatchSelectionView = () => {
    setShowHighGradeBatchSelection(!showHighGradeBatchSelection);
    if (activeBothGradeTab !== 'high') {
      setActiveBothGradeTab('high');
    }
  };

  const toggleLowGradeBatchSelectionView = () => {
    setShowLowGradeBatchSelection(!showLowGradeBatchSelection);
    if (activeBothGradeTab !== 'low') {
      setActiveBothGradeTab('low');
    }
  };

  // First, let's create a function that will flatten the batch records into grade-specific entries
  const flattenBatchRecords = () => {
    // First create the individual items as before
    const individualRows = [];

    Object.keys(groupedRecords).forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;

          // Only include grades that have a positive kg value and haven't been transferred
          if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
            // Create a unique ID by combining record ID and grade
            const uniqueId = `${record.id}-${grade}`;
            // Create a unique gradeKey for selection
            const gradeKey = `${batchKey}-${grade}`;

            individualRows.push({
              id: uniqueId,
              batchKey: batchKey,
              gradeKey: gradeKey,
              batchNo: record.batchNo,
              displayId: `${record.batchNo}(${grade})`,
              grade: grade,
              kgValue: kgValue,
              isHighGrade: GRADE_GROUPS.HIGH.includes(grade),
              processingType: record.processingType,
              totalKgs: record.totalKgs,
              recordId: record.id,
              record: record
            });
          }
        });
      });
    });

    // Now group identical batch & grade combinations
    const groupedItems = {};
    individualRows.forEach(row => {
      // Create a combined key using batch number and grade
      const combinedKey = `${row.batchNo}-${row.grade}`;

      if (!groupedItems[combinedKey]) {
        // First occurrence of this batch & grade combination
        groupedItems[combinedKey] = {
          ...row,
          // Create a new combined grade key for selection
          combinedGradeKey: combinedKey,
          // Store the original items in a records array
          records: [row],
          // Count how many records we're combining
          recordCount: 1
        };
      } else {
        // Add this record's weight to the existing combination
        groupedItems[combinedKey].kgValue += row.kgValue;
        // Add the record to the records array
        groupedItems[combinedKey].records.push(row);
        // Increment record count
        groupedItems[combinedKey].recordCount += 1;
      }
    });

    // Convert back to array and sort
    const combinedRows = Object.values(groupedItems);

    // Define the desired grade order
    const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];

    // Function to extract date from batch number (DDMM format)
    const extractDateFromBatch = (batchNo) => {
      // Match 4 consecutive digits in the batch number
      const dateMatch = batchNo.match(/(\d{2})(\d{2})/);
      if (dateMatch && dateMatch.length >= 3) {
        const day = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10);
        return { day, month };
      }
      return { day: 0, month: 0 }; // Default for batches without date
    };

    // Sort by grade first, then by date (oldest first)
    return combinedRows.sort((a, b) => {
      // First sort by grade
      const gradeAIndex = gradeOrder.indexOf(a.grade);
      const gradeBIndex = gradeOrder.indexOf(b.grade);

      if (gradeAIndex !== gradeBIndex) {
        return gradeAIndex - gradeBIndex;
      }

      // If grades are same, sort by date
      const dateA = extractDateFromBatch(a.batchNo);
      const dateB = extractDateFromBatch(b.batchNo);

      // Compare months first
      if (dateA.month !== dateB.month) {
        return dateA.month - dateB.month;
      }

      // If same month, compare days
      if (dateA.day !== dateB.day) {
        return dateA.day - dateB.day;
      }

      // If same date, sort alphabetically by batch number
      return a.batchNo.localeCompare(b.batchNo);
    });
  };

  // Update selection functions to work with combinedGradeKey
  const handleGradeItemSelection = (combinedGradeKey, isSelected) => {
    if (isSelected) {
      setSelectedGradeItems(prev => [...prev, combinedGradeKey]);
    } else {
      setSelectedGradeItems(prev => prev.filter(key => key !== combinedGradeKey));
    }
  };

  // Function to check if a grade item is selected
  const isGradeItemSelected = (combinedGradeKey) => {
    return selectedGradeItems.includes(combinedGradeKey);
  };

  // Function to handle select all
  const handleSelectAllGradeItems = (isSelected) => {
    if (isSelected) {
      const allGradeKeys = flattenBatchRecords().map(item => item.combinedGradeKey);
      setSelectedGradeItems(allGradeKeys);
    } else {
      setSelectedGradeItems([]);
    }
  };

  // Replace selectedBatches with selectedGradeItems
  const [selectedGradeItems, setSelectedGradeItems] = useState([]);

  // Function to get selected items details
  const getSelectedGradeItems = () => {
    return flattenBatchRecords().filter(item => selectedGradeItems.includes(item.gradeKey));
  };

  // Calculate total selected KGs
  const calculateTotalSelectedKgs = () => {
    const total = getSelectedGradeItems().reduce((sum, item) => sum + item.kgValue, 0);
    setTotalSelectedKgs(total);
  };

  // Get high grade total
  const getHighGradeTotal = () => {
    return getSelectedGradeItems()
      .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
      .reduce((sum, item) => sum + item.kgValue, 0);
  };

  // Get low grade total
  const getLowGradeTotal = () => {
    return getSelectedGradeItems()
      .filter(item => GRADE_GROUPS.LOW.includes(item.grade))
      .reduce((sum, item) => sum + item.kgValue, 0);
  };

  // Helper to group selected items by grade group
  const getSelectedItemsByGradeGroup = (gradeGroup) => {
    return getSelectedGradeItems()
      .filter(item => GRADE_GROUPS[gradeGroup].includes(item.grade));
  };

  // Check if there are transferable items in a grade group
  const hasTransferableItems = (gradeGroup) => {
    return getSelectedGradeItems()
      .some(item => GRADE_GROUPS[gradeGroup].includes(item.grade));
  };

  // Modified transfer function
  // Modified handleTransferConfirm function to handle the combined low grade bags
  const handleTransferConfirm = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const transferPromises = [];

      // Process high grade items - unchanged
      if (transferMode === 'BOTH' || transferMode === 'HIGH') {
        const highGradeItems = getSelectedGradeItems().filter(item =>
          GRADE_GROUPS.HIGH.includes(item.grade)
        );

        for (const groupedItem of highGradeItems) {
          // For each grouped high grade item, create transfers for each record in the group
          for (const originalRecord of groupedItem.records) {
            // For each high grade item, create a transfer
            const gradeDetails = {};
            gradeDetails[originalRecord.grade] = {
              numberOfBags: parseInt(gradeQualityDetails[groupedItem.gradeKey]?.numberOfBags || 0) / groupedItem.recordCount,
              cupProfile: gradeQualityDetails[groupedItem.gradeKey]?.cupProfile || CUP_PROFILES[0],
              moistureContent: parseInt(gradeQualityDetails[groupedItem.gradeKey]?.moistureContent || 0)
            };

            const outputKgs = {};
            outputKgs[originalRecord.grade] = originalRecord.kgValue;

            transferPromises.push(
              axios.post(`${API_URL}/transfer`, {
                baggingOffId: originalRecord.recordId,
                batchNo: originalRecord.batchKey,
                gradeGroup: 'HIGH',
                date: new Date().toISOString(),
                outputKgs: outputKgs,
                gradeDetails: gradeDetails,
                ...transportDetails
              })
            );
          }
        }
      }

      // Process low grade items - modified for combined bag approach
      if (transferMode === 'BOTH' || transferMode === 'LOW') {
        if (selectedLowGrade) {
          // Get all selected batches for this low grade
          const selectedBatchItems = flattenBatchRecords()
            .filter(item =>
              item.grade === selectedLowGrade &&
              selectedLowGradeBatches.includes(item.gradeKey)
            );

          // Calculate total number of bags per record
          const totalLowGradeRecords = selectedBatchItems.reduce((sum, item) => sum + item.recordCount, 0);
          const bagsPerRecord = totalLowGradeRecords > 0 ?
            Math.ceil(parseInt(lowGradeBags || 0) / totalLowGradeRecords) : 0;

          // Process each selected batch
          for (const groupedItem of selectedBatchItems) {
            for (const originalRecord of groupedItem.records) {
              const gradeDetails = {};
              gradeDetails[originalRecord.grade] = {
                numberOfBags: bagsPerRecord
              };

              const outputKgs = {};
              outputKgs[originalRecord.grade] = originalRecord.kgValue;

              transferPromises.push(
                axios.post(`${API_URL}/transfer`, {
                  baggingOffId: originalRecord.recordId,
                  batchNo: originalRecord.batchKey,
                  gradeGroup: 'LOW',
                  date: new Date().toISOString(),
                  outputKgs: outputKgs,
                  gradeDetails: gradeDetails,
                  ...transportDetails
                })
              );
            }
          }
        } else {
          // Legacy processing for directly selected low grade items
          const lowGradeItems = getSelectedGradeItems().filter(item =>
            GRADE_GROUPS.LOW.includes(item.grade)
          );

          for (const groupedItem of lowGradeItems) {
            for (const originalRecord of groupedItem.records) {
              const gradeDetails = {};
              gradeDetails[originalRecord.grade] = {
                numberOfBags: parseInt(gradeQualityDetails[groupedItem.gradeKey]?.numberOfBags || 0) / groupedItem.recordCount
              };

              const outputKgs = {};
              outputKgs[originalRecord.grade] = originalRecord.kgValue;

              transferPromises.push(
                axios.post(`${API_URL}/transfer`, {
                  baggingOffId: originalRecord.recordId,
                  batchNo: originalRecord.batchKey,
                  gradeGroup: 'LOW',
                  date: new Date().toISOString(),
                  outputKgs: outputKgs,
                  gradeDetails: gradeDetails,
                  ...transportDetails
                })
              );
            }
          }
        }
      }

      await Promise.all(transferPromises);

      // Reset form and refresh data
      await fetchUntransferredRecords();
      setSelectedGradeItems([]);
      setSelectedLowGrade(null);
      setSelectedLowGradeBatches([]);
      setLowGradeBags('');
      setTransportDetails({
        truckNumber: '',
        driverName: '',
        driverPhone: '',
        notes: ''
      });
      setGradeQualityDetails({});
      setShowTransferModal(false);
      setValidated(false);

      // Show success message
      if (transferMode === 'HIGH') {
        alert('High Grade transfer completed successfully');
      } else if (transferMode === 'LOW') {
        alert('Low Grade transfer completed successfully');
      } else {
        alert('Transfer completed successfully');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert(`Failed to complete transfer: ${error.response?.data?.error || error.message}`);
    }
  };

  // Modified function to initialize quality details
  // const initializeGradeQualityDetails = () => {
  //   const newGradeDetails = {};

  //   getSelectedGradeItems().forEach(item => {
  //     // Only initialize if not already exists
  //     if (!newGradeDetails[item.gradeKey]) {
  //       newGradeDetails[item.gradeKey] = {
  //         numberOfBags: gradeQualityDetails[item.gradeKey]?.numberOfBags || '',
  //         cupProfile: item.isHighGrade ? 
  //           (gradeQualityDetails[item.gradeKey]?.cupProfile || CUP_PROFILES[0]) : 
  //           undefined,
  //         moistureContent: item.isHighGrade ? 
  //           (gradeQualityDetails[item.gradeKey]?.moistureContent || '') : 
  //           undefined
  //       };
  //     }
  //   });

  //   setGradeQualityDetails(prevDetails => ({
  //     ...prevDetails,
  //     ...newGradeDetails
  //   }));
  // };

  // Modified handler for quality details change
  const handleQualityDetailsChange = (gradeKey, field, value) => {
    setGradeQualityDetails(prevDetails => ({
      ...prevDetails,
      [gradeKey]: {
        ...(prevDetails[gradeKey] || {}),
        [field]: value
      }
    }));
  };

  // New batch selection handlers
  const handleHighGradeBatchSelectionChange = (batchKey, isSelected) => {
    if (isSelected) {
      setSelectedHighGradeBatches(prev => [...prev, batchKey]);
    } else {
      setSelectedHighGradeBatches(prev => prev.filter(b => b !== batchKey));
    }
  };

  const handleLowGradeBatchSelectionChange = (batchKey, isSelected) => {
    if (isSelected) {
      setSelectedLowGradeBatches(prev => [...prev, batchKey]);
    } else {
      setSelectedLowGradeBatches(prev => prev.filter(b => b !== batchKey));
    }
  };

  // Update getFilteredBatches to filter by grade group
  const getFilteredBatches = (gradeGroup = 'BOTH') => {
    // Validate gradeGroup exists in GRADE_GROUPS
    if (!GRADE_GROUPS[gradeGroup]) {
      console.error(`Invalid grade group: ${gradeGroup}. Using 'BOTH' as fallback`);
      gradeGroup = 'BOTH'; // Fallback to BOTH if invalid
    }

    return Object.keys(groupedRecords).filter(batchKey => {
      const records = groupedRecords[batchKey] || [];

      return records.some(record => {
        return Object.entries(record.outputKgs || {}).some(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;
          return kgValue > 0 &&
            GRADE_GROUPS[gradeGroup].includes(grade) &&
            (!record.transferredGrades || !record.transferredGrades[grade]);
        });
      });
    });
  };

  // Track quality details per grade per batch
  const [gradeQualityDetails, setGradeQualityDetails] = useState({});

  // Common transport details
  const [transportDetails, setTransportDetails] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: '',
    notes: ''
  });

  const [validated, setValidated] = useState(false);
  const [activeGradeTab, setActiveGradeTab] = useState('high');

  useEffect(() => {
    fetchUntransferredRecords();
  }, []);

  useEffect(() => {
    updateAvailableGrades();
    calculateTotalSelectedKgs();
    initializeGradeQualityDetails();
  }, [selectedBatches, groupedRecords]);

  // useEffect(() => {
  //   calculateTotalSelectedKgs();
  // }, [selectedGrades, transferMode]);



  // Modify the toggle function for batch selection view
  const toggleBatchSelectionView = () => {
    setShowBatchSelection(!showBatchSelection);

    // When switching back to transfer view, initialize any new batches
    if (!showBatchSelection) {
      initializeGradeQualityDetails();
    }
  };

  // Modify the initializeGradeQualityDetails function to merge with existing data
  const initializeGradeQualityDetails = () => {
    const newGradeDetails = {};

    selectedBatches.forEach(batchKey => {
      if (!newGradeDetails[batchKey]) {
        newGradeDetails[batchKey] = {};
      }

      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          if (parseFloat(kg) > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
            if (!newGradeDetails[batchKey][grade]) {
              // Only initialize if not already exists
              newGradeDetails[batchKey][grade] = {
                numberOfBags: gradeQualityDetails[batchKey]?.[grade]?.numberOfBags || '',
                cupProfile: gradeQualityDetails[batchKey]?.[grade]?.cupProfile || CUP_PROFILES[0],
                moistureContent: gradeQualityDetails[batchKey]?.[grade]?.moistureContent || ''
              };
            }
          }
        });
      });
    });

    setGradeQualityDetails(prevDetails => ({
      ...prevDetails,
      ...newGradeDetails
    }));
  };

  // Modify the modal's onHide handler to preserve state when just closing
  const handleModalClose = () => {
    setShowTransferModal(false);
    setValidated(false);
    // Don't reset other states here to allow reopening with same data
  };



  const handleTransportDetailsChange = (e) => {
    const { name, value } = e.target;
    setTransportDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };


  useEffect(() => {
    const visibleBatches = getFilteredBatches();
    const allSelected = visibleBatches.length > 0 &&
      visibleBatches.every(batch => selectedBatches.includes(batch));
    setSelectAllChecked(allSelected);
  }, [selectedBatches, searchTerm, currentPage]);

  const getGradeTotals = (gradeGroup = null) => {
    const totals = {};

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          // Parse kg as a number or default to 0 if it's undefined, null, or empty string
          const kgValue = parseFloat(kg) || 0;

          // Skip if not selected
          if (!selectedGrades[grade]) return;

          // Filter by grade group if specified
          if (gradeGroup && !GRADE_GROUPS[gradeGroup].includes(grade)) return;

          totals[grade] = (totals[grade] || 0) + kgValue;
        });
      });
    });

    return totals;
  };

  // Update useEffect to trigger calculation when selectedGradeItems changes
  useEffect(() => {
    calculateTotalSelectedKgs();
  }, [selectedGradeItems, transferMode]);

  // Replace getGradeGroupTotal with a new function based on the flattened model
  const getGradeGroupTotal = (gradeGroup) => {
    return getSelectedGradeItems()
      .filter(item => GRADE_GROUPS[gradeGroup].includes(item.grade))
      .reduce((sum, item) => sum + item.kgValue, 0);
  };

  const handleGradeSelectionChange = (grade, isSelected) => {
    setSelectedGrades(prev => ({
      ...prev,
      [grade]: isSelected
    }));
  };

  const updateAvailableGrades = () => {
    const grades = {};
    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];
      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          // Only include grades that haven't been fully transferred
          if (!record.transferredGrades || !record.transferredGrades[grade]) {
            if (parseFloat(kg) > 0) {
              grades[grade] = true;
            }
          }
        });
      });
    });
    setAvailableGrades(Object.keys(grades));

    // Initialize selected grades if not already set
    const newSelectedGrades = {};
    Object.keys(grades).forEach(grade => {
      // Only set if it's undefined (don't override user selections)
      if (selectedGrades[grade] === undefined) {
        newSelectedGrades[grade] = true;
      }
    });
    if (Object.keys(newSelectedGrades).length > 0) {
      setSelectedGrades(prev => ({ ...prev, ...newSelectedGrades }));
    }
  };


  // const calculateTotalSelectedKgs = () => {
  //   let total = 0;
  //   selectedBatches.forEach(batchKey => {
  //     const batchRecords = groupedRecords[batchKey] || [];
  //     batchRecords.forEach(record => {
  //       Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
  //         // Only count if grade is selected and matches transfer mode
  //         if (selectedGrades[grade]) {
  //           const kgValue = parseFloat(kg) || 0;
  //           if (transferMode === 'BOTH') {
  //             total += kgValue;
  //           } else if (transferMode === 'HIGH' && GRADE_GROUPS.HIGH.includes(grade)) {
  //             total += kgValue;
  //           } else if (transferMode === 'LOW' && GRADE_GROUPS.LOW.includes(grade)) {
  //             total += kgValue;
  //           }
  //         }
  //       });
  //     });
  //   });
  //   setTotalSelectedKgs(total);
  // };



  const handleBatchSelectionChange = (batchKey, isSelected) => {
    if (isSelected) {
      setSelectedBatches(prev => [...prev, batchKey]);

      // Initialize empty quality details for new batch if they don't exist
      setGradeQualityDetails(prev => {
        if (!prev[batchKey]) {
          return {
            ...prev,
            [batchKey]: {}
          };
        }
        return prev;
      });
    } else {
      setSelectedBatches(prev => prev.filter(key => key !== batchKey));

      // Optionally: Remove quality details for deselected batch
      setGradeQualityDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[batchKey];
        return newDetails;
      });
    }
  };

  const handleTransferClick = (mode = 'BOTH') => {
    setTransferMode(mode);
    setShowTransferModal(true);
  };

  const validateQualityDetails = () => {
    // For HIGH or BOTH modes, validate that all high grades have quality details
    if (transferMode === 'LOW') {
      return true; // No validation needed for low grades
    }

    let isValid = true;

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey] || [];

      batchRecords.forEach(record => {
        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;

          // Only validate high grades that are selected and not transferred
          if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS.HIGH.includes(grade) &&
            (!record.transferredGrades || !record.transferredGrades[grade])) {

            const details = gradeQualityDetails[batchKey]?.[grade];

            if (!details ||
              !details.numberOfBags ||
              !details.cupProfile ||
              !details.moistureContent) {
              isValid = false;
            }
          }
        });
      });
    });

    return isValid;
  };



  const hasBothGradeTypes = () => {
    const selectedItems = getSelectedGradeItems();
    const hasHighGrade = selectedItems.some(item => GRADE_GROUPS.HIGH.includes(item.grade));
    const hasLowGrade = selectedItems.some(item => GRADE_GROUPS.LOW.includes(item.grade));
    return hasHighGrade && hasLowGrade;
  };

  const createGradeGroupTransfers = (gradeGroup) => {
    const transfers = [];

    selectedBatches.forEach(batchKey => {
      const batchRecords = groupedRecords[batchKey];
      const batchNo = batchKey;

      batchRecords.forEach(record => {
        const filteredOutputKgs = {};
        let hasGrades = false;

        Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
          const kgValue = parseFloat(kg) || 0;
          // Check if the grade belongs to this grade group, is selected, and hasn't been transferred yet
          if (kgValue > 0 && selectedGrades[grade] && GRADE_GROUPS[gradeGroup].includes(grade) &&
            (!record.transferredGrades || !record.transferredGrades[grade])) {
            filteredOutputKgs[grade] = kgValue;
            hasGrades = true;
          }
        });

        if (hasGrades) {
          const gradeDetails = {};

          // Add quality details for each grade
          Object.keys(filteredOutputKgs).forEach(grade => {
            const details = gradeQualityDetails[batchKey]?.[grade] || {};

            // For high grades, include all quality details
            if (GRADE_GROUPS.HIGH.includes(grade)) {
              gradeDetails[grade] = {
                numberOfBags: parseInt(details.numberOfBags || 0),
                cupProfile: details.cupProfile || CUP_PROFILES[0],
                moistureContent: parseInt(details.moistureContent || 0)
              };
            } else {
              // For low grades, only include number of bags
              gradeDetails[grade] = {
                numberOfBags: parseInt(details.numberOfBags || 0)
              };
            }
          });

          transfers.push({
            baggingOffId: record.id,
            batchNo: batchNo,
            gradeGroup,
            date: new Date().toISOString(),
            outputKgs: filteredOutputKgs,
            gradeDetails: gradeDetails,
            ...transportDetails
          });
        }
      });
    });

    return transfers;
  };

  // Check if all high grades for a batch have been transferred
  const areAllHighGradesTransferred = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredHighGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) && (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredHighGrade = true;
        }
      });
    });

    return !hasUntransferredHighGrade;
  };

  // Modify the fetchUntransferredRecords function to track transferred grades
  const fetchUntransferredRecords = async () => {
    try {
      console.log("Fetching bagging-off records...");
      const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
      console.log("Bagging-off response:", response.data);

      // Get all transfers for the CWS
      console.log("Fetching transfers...");
      const transfersResponse = await axios.get(`${API_URL}/transfer/cws/${userInfo.cwsId}`);
      console.log("Transfers response:", transfersResponse.data);
      const allTransfers = transfersResponse.data || [];

      // Create a map of all transfers by baggingOffId
      const transfersByBaggingOff = {};
      allTransfers.forEach(transfer => {
        if (!transfersByBaggingOff[transfer.baggingOffId]) {
          transfersByBaggingOff[transfer.baggingOffId] = [];
        }
        transfersByBaggingOff[transfer.baggingOffId].push(transfer);
      });

      // Process all bagging-off records
      const processedRecords = (response.data || []).map(record => {
        // Get transfers for this record
        const recordTransfers = transfersByBaggingOff[record.id] || [];

        // Check which grades have been transferred for this record
        const transferredGrades = {};
        recordTransfers.forEach(transfer => {
          if (transfer.outputKgs) {
            Object.keys(transfer.outputKgs).forEach(grade => {
              transferredGrades[grade] = true;
            });
          }
        });

        // Add data about transferred grades to the record
        return {
          ...record,
          transferredGrades,
          hasTransferredGrades: Object.keys(transferredGrades).length > 0,
          hasUntransferredGrades: record.outputKgs && Object.keys(record.outputKgs).some(grade =>
            !transferredGrades[grade] && parseFloat(record.outputKgs[grade] || 0) > 0
          )
        };
      });

      // Filter and group records
      console.log("Processed records:", processedRecords);
      const untransferred = processedRecords.filter(record => record.hasUntransferredGrades);
      console.log("Untransferred records:", untransferred);

      const grouped = untransferred.reduce((acc, record) => {
        if (record.batchNo) {
          const baseBatchNo = record.batchNo.replace(/[A-Za-z-]\d*$/, '');
          if (!acc[baseBatchNo]) {
            acc[baseBatchNo] = [];
          }
          acc[baseBatchNo].push(record);
        }
        return acc;
      }, {});

      console.log("Grouped records:", grouped);
      setGroupedRecords(grouped);

      // Check which batches have all high grades transferred
      const highGradeStatus = {};
      Object.keys(grouped).forEach(batchKey => {
        highGradeStatus[batchKey] = areAllHighGradesTransferred(batchKey);
      });
      setHighGradeFullyTransferred(highGradeStatus);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Error stack:", error.stack);
      setError(`Error fetching untransferred records: ${error.message}`);
      setLoading(false);
    }
  };

  // Update the rendering of grades in the table to show which ones are already transferred
  const renderOutputKgs = (outputKgs, transferredGrades = {}) => {
    const totalsByGrade = {};

    if (!outputKgs) return [];

    Object.entries(outputKgs).forEach(([grade, kg]) => {
      const numKg = kg === "" ? 0 : parseFloat(kg) || 0;
      if (numKg > 0) {
        totalsByGrade[grade] = numKg;
      }
    });

    return Object.entries(totalsByGrade)
      .map(([grade, total]) => {
        const isTransferred = transferredGrades[grade];
        return renderGradeBadge(grade, total, isTransferred);
      });
  };

  // Modified grade badge renderer to show transferred status
  const renderGradeBadge = (grade, kg, isTransferred = false) => {
    const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);
    let badgeColor = isHighGrade ? processingTheme.primary : '#008080';

    // Style for transferred grades
    const containerStyle = isTransferred ? {
      opacity: 0.5,
      textDecoration: 'line-through'
    } : {};

    return (
      <div key={grade} className="small mb-1" style={containerStyle}>
        <Badge
          className="me-1"
          bg="sucafina"
          variant="secondary"
          style={{ backgroundColor: badgeColor, color: 'white' }}
        >
          {grade}
        </Badge>
        <span>{kg.toFixed(2)} kg</span>
        {isHighGrade && <span className="ms-1" style={{ color: processingTheme.primary }}>★</span>}
        {isTransferred && <Badge bg="info" className="ms-1" pill>Transferred</Badge>}
      </div>
    );
  };

  const calculateOutturn = (totalKgs, outputKgs) => {
    if (!outputKgs) return '0.00';
    const totalOutputKgs = Object.values(outputKgs).reduce((sum, kg) => sum + (parseFloat(kg) || 0), 0);
    return totalKgs > 0 ? ((totalOutputKgs / totalKgs) * 100).toFixed(2) : '0.00';
  };

  const getUniqueProcessingTypes = (records) => {
    const types = new Set();
    records.forEach(record => types.add(record.processingType));
    return Array.from(types).join(', ');
  };

  // Add this helper function to get available grades for a batch
  const getAvailableGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    const availableGradeSet = {};

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        // Only include grades that haven't been transferred and have kg > 0
        if (kgValue > 0 && (!record.transferredGrades || !record.transferredGrades[grade])) {
          if (!availableGradeSet[grade]) {
            availableGradeSet[grade] = 0;
          }
          availableGradeSet[grade] += kgValue;
        }
      });
    });

    return availableGradeSet;
  };

  // Helper function to render grade pills for available grades
  const renderAvailableGrades = (batchKey) => {
    const availableGrades = getAvailableGrades(batchKey);

    if (Object.keys(availableGrades).length === 0) {
      return <span className="text-muted">None</span>;
    }

    return Object.entries(availableGrades).map(([grade, kg]) => {
      const isHighGrade = GRADE_GROUPS.HIGH.includes(grade);

      return (
        <Badge
          key={grade}
          className="me-1 mb-1"
          bg='sucafina'
          style={{
            fontSize: '0.8rem',
            backgroundColor: isHighGrade ? processingTheme.primary : '#008080',
            color: 'white'
          }}
        >
          {grade}: {kg.toFixed(2)} kg {isHighGrade && '★'}
        </Badge>
      );
    });
  };

  const toggleBatchExpansion = (batchKey) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }));
  };

  const handleSelectAllBatches = (isSelected) => {
    if (isSelected) {
      setSelectedBatches(getFilteredBatches());
    } else {
      setSelectedBatches([]);
    }
    setSelectAllChecked(isSelected);
  };

  // const getPaginatedBatches = () => {
  //   const filteredBatches = getFilteredBatches();
  //   const indexOfLastBatch = currentPage * batchesPerPage;
  //   const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  //   return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  // };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const calculateOverallTotalKgs = (batchKey) => {
    return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalKgs || 0), 0);
  };

  const calculateOverallOutputKgs = (batchKey) => {
    return (groupedRecords[batchKey] || []).reduce((sum, record) => sum + (record.totalOutputKgs || 0), 0);
  };

  const hasTransferableHighGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredHighGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.HIGH.includes(grade) &&
          (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredHighGrade = true;
        }
      });
    });

    return hasUntransferredHighGrade;
  };

  const hasTransferableLowGrades = (batchKey) => {
    const batchRecords = groupedRecords[batchKey] || [];
    let hasUntransferredLowGrade = false;

    batchRecords.forEach(record => {
      Object.entries(record.outputKgs || {}).forEach(([grade, kg]) => {
        const kgValue = parseFloat(kg) || 0;
        if (kgValue > 0 && GRADE_GROUPS.LOW.includes(grade) &&
          (!record.transferredGrades || !record.transferredGrades[grade])) {
          hasUntransferredLowGrade = true;
        }
      });
    });

    return hasUntransferredLowGrade;
  };

  const getPaginatedBatches = () => {
    const flattenedBatches = flattenBatchRecords();
    // Apply search filter if needed
    const filteredBatches = flattenedBatches.filter(item => {
      if (searchTerm) {
        return item.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.processingType.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    const indexOfLastBatch = currentPage * batchesPerPage;
    const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
    return filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);
  };

  return (
    <div className="container-fluid py-4">

      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
          <span className="h5" style={{ color: processingTheme.primary }}>
            Transport to HQ
          </span>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="mb-2 mb-md-0">
              <h5 className="mb-1">Transfer Summary</h5>
              <div className="d-flex gap-4 text-sm">
                <span><strong>Batches:</strong> {new Set(getSelectedGradeItems().map(item => item.batchNo)).size}</span>
                <span><strong>Grades:</strong> {new Set(getSelectedGradeItems().map(item => item.grade)).size}</span>
                <span><strong>Total:</strong> {totalSelectedKgs.toFixed(2)} kg</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <div className="me-2">
                <div className="mb-1"><strong>High Grades:</strong> {getGradeGroupTotal('HIGH').toFixed(2)} kg</div>
                <div><strong>Low Grades:</strong> {getGradeGroupTotal('LOW').toFixed(2)} kg</div>
              </div>

              <div className="d-flex gap-1">
                <Button
                  size="sm"
                  variant="outline-sucafina"
                  disabled={hasBothGradeTypes() || !getSelectedGradeItems().some(item => GRADE_GROUPS.HIGH.includes(item.grade))}
                  onClick={() => handleTransferClick('HIGH')}
                  style={{
                    color: processingTheme.primary,
                    borderColor: processingTheme.primary,
                    opacity: hasBothGradeTypes() ? 0.5 : 1
                  }}
                >
                  High Grades
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={hasBothGradeTypes() || !getSelectedGradeItems().some(item => GRADE_GROUPS.LOW.includes(item.grade))}
                  onClick={() => handleTransferClick('LOW')}
                  style={{
                    opacity: hasBothGradeTypes() ? 0.5 : 1
                  }}
                >
                  Low Grades
                </Button>
                <Button
                  size="sm"
                  variant="sucafina"
                  disabled={getSelectedGradeItems().length === 0}
                  onClick={() => handleTransferClick('BOTH')}
                  style={{
                    backgroundColor: processingTheme.primary,
                    borderColor: processingTheme.primary
                  }}
                >
                  Transport Both Grades
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showTransferModal} onHide={handleModalClose} size="lg">
        <Form noValidate validated={validated} onSubmit={handleTransferConfirm}>
          <Modal.Header
            closeButton
            className="d-flex"
            style={{ backgroundColor: processingTheme.neutral }}
          >
            <div className='d-flex justify-content-between align-items-center w-100 px-3'>
              <Modal.Title className="mb-0">
                {transferMode === 'HIGH' ? 'Transfer High Grades (A0, A1)' :
                  transferMode === 'LOW' ? 'Transfer Low Grades (A2-B2)' :
                    transferMode === 'BOTH' ? 'Transfer Both High & Low Grades' :
                      'Unknown'}
              </Modal.Title>
              {transferMode === 'BOTH' ? (
                <Button
                  variant="sucafina"
                  size="md"
                  onClick={activeBothGradeTab === 'high' ? toggleHighGradeBatchSelectionView : toggleLowGradeBatchSelectionView}
                  style={{
                    borderColor: processingTheme.primary,
                    color: processingTheme.primary
                  }}
                >
                  {activeBothGradeTab === 'high' ?
                    (showHighGradeBatchSelection ? 'Done Selecting High' : 'Modify High Batches') :
                    (showLowGradeBatchSelection ? 'Done Selecting Low' : 'Modify Low Batches')
                  }
                </Button>
              ) : (
                <Button
                  variant="sucafina"
                  size="md"
                  onClick={toggleBatchSelectionView}
                  style={{
                    borderColor: processingTheme.primary,
                    color: processingTheme.primary
                  }}
                >
                  {showBatchSelection ? 'Back to Transfer' : 'Modify Batches'}
                </Button>
              )}
            </div>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {showBatchSelection ? (
              <div className="batch-selection-modal">
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Search batches..."
                    value={modalBatchSearch}
                    onChange={(e) => setModalBatchSearch(e.target.value)}
                  />
                </InputGroup>

                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th width="10%">Select</th>
                        <th width="30%">Batch & Grade</th>
                        <th width="30%">Processing</th>
                        <th width="30%">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flattenBatchRecords()
                        .filter(item => item.displayId.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                        .map((item) => (
                          <tr
                            key={item.id}
                            style={{
                              backgroundColor: item.isHighGrade ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
                              borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
                            }}
                          >
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={isGradeItemSelected(item.gradeKey)}
                                onChange={(e) => handleGradeItemSelection(item.gradeKey, e.target.checked)}
                                label=""
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div>
                                  <div className="fw-bold">
                                    {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
                                  </div>
                                  <Badge
                                    bg={item.isHighGrade ? "success" : "info"}
                                    className="me-1"
                                  >
                                    {item.isHighGrade ? "High Grade" : "Low Grade"}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td>{item.processingType}</td>
                            <td>{item.kgValue.toFixed(2)} kg</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                {selectedGradeItems.length === 0 ? (
                  <Alert variant="warning">No grade items selected for transfer</Alert>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Batch & Grade</th>
                            <th>Processing</th>
                            <th>Weight (kg)</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSelectedGradeItems()
                            .sort((a, b) => {
                              const gradeOrder = ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'];
                              const gradeAIndex = gradeOrder.indexOf(a.grade);
                              const gradeBIndex = gradeOrder.indexOf(b.grade);

                              if (gradeAIndex !== gradeBIndex) return gradeAIndex - gradeBIndex;

                              // Extract dates
                              const extractDate = (batchNo) => {
                                const match = batchNo.match(/(\d{2})(\d{2})/);
                                return match ? { day: parseInt(match[1], 10), month: parseInt(match[2], 10) } : { day: 0, month: 0 };
                              };

                              const dateA = extractDate(a.batchNo);
                              const dateB = extractDate(b.batchNo);

                              // Month comparison first
                              if (dateA.month !== dateB.month) return dateA.month - dateB.month;
                              // Then day comparison
                              if (dateA.day !== dateB.day) return dateA.day - dateB.day;
                              // Finally batch number
                              return a.batchNo.localeCompare(b.batchNo);
                            })
                            .map((item) => (
                              <tr key={item.id}
                                style={{
                                  backgroundColor: item.isHighGrade ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
                                  borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
                                }}
                              >
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div>
                                      <div className="fw-bold">
                                        {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
                                      </div>
                                      <Badge
                                        bg={item.isHighGrade ? "success" : "info"}
                                        className="me-1"
                                      >
                                        {item.isHighGrade ? "High Grade" : "Low Grade"}
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.processingType}</td>
                                <td>{item.kgValue.toFixed(2)} kg</td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleGradeItemSelection(item.gradeKey, false)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Quality Details Form */}
                    {/* Modified version of the Quality Details Card to handle low grades differently */}
                    <Card className="mt-3">
                      <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="h5" style={{ color: processingTheme.primary }}>Quality Details</span>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {/* Tabs for HIGH/LOW when in BOTH mode */}
                        {transferMode === 'BOTH' && (
                          <Nav variant="tabs" className="mb-3" activeKey={activeBothGradeTab} onSelect={setActiveBothGradeTab}>
                            <Nav.Item>
                              <Nav.Link eventKey="high">High Grades</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="low">Low Grades</Nav.Link>
                            </Nav.Item>
                          </Nav>
                        )}

                        {/* High Grade Quality Details - only show when in high tab or non-BOTH mode */}
                        {(transferMode !== 'BOTH' || activeBothGradeTab === 'high') && (
                          <>
                            {showHighGradeBatchSelection ? (
                              <div className="batch-selection-container">
                                <h5>Select High Grade Batches</h5>
                                <InputGroup className="mb-3">
                                  <Form.Control
                                    placeholder="Search batches..."
                                    value={modalBatchSearch}
                                    onChange={(e) => setModalBatchSearch(e.target.value)}
                                  />
                                </InputGroup>

                                <div className="table-responsive">
                                  <table className="table table-hover mb-0">
                                    <thead>
                                      <tr>
                                        <th width="10%">Select</th>
                                        <th width="30%">Batch</th>
                                        <th width="30%">Processing</th>
                                        <th width="30%">Weight (kg)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {flattenBatchRecords()
                                        .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
                                        .filter(item => item.displayId.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                                        .map((item) => (
                                          <tr key={item.id}>
                                            <td>
                                              <Form.Check
                                                type="checkbox"
                                                checked={selectedGradeItems.includes(item.gradeKey)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setSelectedGradeItems(prev => [...prev, item.gradeKey]);
                                                  } else {
                                                    setSelectedGradeItems(prev => prev.filter(key => key !== item.gradeKey));
                                                  }
                                                }}
                                              />
                                            </td>
                                            <td>
                                              <div className="d-flex align-items-center">
                                                <div>
                                                  <div className="fw-bold">
                                                    {item.displayId} <span style={{ color: processingTheme.primary }}>★</span>
                                                  </div>
                                                  <Badge
                                                    bg="success"
                                                    className="me-1"
                                                  >
                                                    High Grade
                                                  </Badge>
                                                </div>
                                              </div>
                                            </td>
                                            <td>{item.processingType}</td>
                                            <td>{item.kgValue.toFixed(2)} kg</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="mt-3 d-flex justify-content-between">
                                  <Button
                                    variant="secondary"
                                    onClick={() => setShowHighGradeBatchSelection(false)}
                                  >
                                    Back
                                  </Button>
                                  <Button
                                    variant="primary"
                                    onClick={() => setShowHighGradeBatchSelection(false)}
                                    style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
                                  >
                                    Confirm Selection
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Display selected high grade batches */}
                                <div className="selected-batches mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5>Selected High Grade Batches</h5>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setShowHighGradeBatchSelection(true)}
                                      style={{ borderColor: processingTheme.primary, color: processingTheme.primary }}
                                    >
                                      Modify High Batches
                                    </Button>
                                  </div>

                                  {getSelectedGradeItems().filter(item => GRADE_GROUPS.HIGH.includes(item.grade)).length > 0 ? (
                                    <table className="table table-sm">
                                      <thead>
                                        <tr>
                                          <th>Batch & Grade</th>
                                          <th>Weight (kg)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {getSelectedGradeItems()
                                          .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
                                          .map(item => (
                                            <tr key={item.gradeKey}>
                                              <td>{item.displayId}</td>
                                              <td>{item.kgValue.toFixed(2)} kg</td>
                                            </tr>
                                          ))}
                                        <tr className="table-active">
                                          <td><strong>Total</strong></td>
                                          <td><strong>
                                            {getSelectedGradeItems()
                                              .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
                                              .reduce((sum, item) => sum + item.kgValue, 0)
                                              .toFixed(2)} kg
                                          </strong></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  ) : (
                                    <Alert variant="info">No high grade batches selected. Click "Modify High Batches" to select.</Alert>
                                  )}
                                </div>

                                {/* Quality Details for High Grades */}
                                {getSelectedGradeItems()
                                  .filter(item => GRADE_GROUPS.HIGH.includes(item.grade))
                                  .map((item) => (
                                    <div key={`quality-${item.gradeKey}`} className="mb-3">
                                      <h5>{item.displayId}</h5>
                                      <Row>
                                        <Col md={4}>
                                          <Form.Group controlId={`${item.gradeKey}-bags`}>
                                            <Form.Label>Number of Bags</Form.Label>
                                            <Form.Control
                                              type="number"
                                              min="1"
                                              placeholder="ex: 20"
                                              value={gradeQualityDetails[item.gradeKey]?.numberOfBags || ''}
                                              onChange={(e) => handleQualityDetailsChange(item.gradeKey, 'numberOfBags', e.target.value)}
                                              required
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group controlId={`${item.gradeKey}-cupProfile`}>
                                            <Form.Label>Cup Profile</Form.Label>
                                            <Form.Select
                                              value={gradeQualityDetails[item.gradeKey]?.cupProfile || CUP_PROFILES[0]}
                                              onChange={(e) => handleQualityDetailsChange(item.gradeKey, 'cupProfile', e.target.value)}
                                              required
                                            >
                                              {CUP_PROFILES.map(profile => (
                                                <option key={profile} value={profile}>{profile}</option>
                                              ))}
                                            </Form.Select>
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group controlId={`${item.gradeKey}-moisture`}>
                                            <Form.Label>Moisture Content (%)</Form.Label>
                                            <Form.Control
                                              type="number"
                                              min="0"
                                              max="20"
                                              step="0.1"
                                              placeholder="Enter moisture %"
                                              value={gradeQualityDetails[item.gradeKey]?.moistureContent || ''}
                                              onChange={(e) => handleQualityDetailsChange(item.gradeKey, 'moistureContent', e.target.value)}
                                              required
                                            />
                                          </Form.Group>
                                        </Col>
                                      </Row>
                                    </div>
                                  ))}
                              </>
                            )}
                          </>
                        )}
                        {/* Low Grade Selector - only show when in low tab or LOW mode */}
                        {(transferMode === 'LOW' || (transferMode === 'BOTH' && activeBothGradeTab === 'low')) && (
                          <>
                            {showLowGradeBatchSelection ? (
                              <div className="batch-selection-container">
                                <h5>Select Batches for {selectedLowGrade}</h5>
                                <InputGroup className="mb-3">
                                  <Form.Control
                                    placeholder="Search batches..."
                                    value={modalBatchSearch}
                                    onChange={(e) => setModalBatchSearch(e.target.value)}
                                  />
                                </InputGroup>

                                <div className="table-responsive">
                                  <table className="table table-hover mb-0">
                                    <thead>
                                      <tr>
                                        <th width="10%">Select</th>
                                        <th width="30%">Batch</th>
                                        <th width="30%">Processing</th>
                                        <th width="30%">Weight (kg)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {flattenBatchRecords()
                                        .filter(item => item.grade === selectedLowGrade)
                                        .filter(item => item.displayId.toLowerCase().includes(modalBatchSearch.toLowerCase()))
                                        .map((item) => (
                                          <tr key={item.id}>
                                            <td>
                                              <Form.Check
                                                type="checkbox"
                                                checked={selectedLowGradeBatches.includes(item.gradeKey)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setSelectedLowGradeBatches(prev => [...prev, item.gradeKey]);
                                                  } else {
                                                    setSelectedLowGradeBatches(prev => prev.filter(key => key !== item.gradeKey));
                                                  }
                                                }}
                                              />
                                            </td>
                                            <td>{item.displayId}</td>
                                            <td>{item.processingType}</td>
                                            <td>{item.kgValue.toFixed(2)} kg</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="mt-3 d-flex justify-content-between">
                                  <Button
                                    variant="secondary"
                                    onClick={() => setShowLowGradeBatchSelection(false)}
                                  >
                                    Back
                                  </Button>
                                  <Button
                                    variant="primary"
                                    onClick={() => {
                                      // Update selected grade items with all selected batches
                                      setSelectedGradeItems(prev => {
                                        // Remove any existing items with this grade
                                        const filtered = prev.filter(item => {
                                          const batchItem = flattenBatchRecords().find(record => record.gradeKey === item);
                                          return !batchItem || batchItem.grade !== selectedLowGrade;
                                        });
                                        // Add new selections
                                        return [...filtered, ...selectedLowGradeBatches];
                                      });
                                      setShowLowGradeBatchSelection(false);
                                    }}
                                    style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
                                  >
                                    Confirm Selection
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Low Grade Selection */}
                                <div className="grade-selection-container">
                                  <Form.Group className="mb-3">
                                    <Form.Label>Select Low Grade</Form.Label>
                                    <Form.Select
                                      value={selectedLowGrade || ''}
                                      onChange={(e) => setSelectedLowGrade(e.target.value)}
                                      required
                                    >
                                      <option value="">Select a low grade</option>
                                      {GRADE_GROUPS.LOW.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>

                                  {selectedLowGrade && (
                                    <>
                                      <div className="selected-batches mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <h5>Selected {selectedLowGrade} Batches</h5>
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => setShowLowGradeBatchSelection(true)}
                                            style={{ borderColor: processingTheme.primary, color: processingTheme.primary }}
                                          >
                                            Modify Batches
                                          </Button>
                                        </div>

                                        {selectedLowGradeBatches.length > 0 ? (
                                          <table className="table table-sm">
                                            <thead>
                                              <tr>
                                                <th>Batch</th>
                                                <th>Weight (kg)</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {selectedLowGradeBatches.map(key => {
                                                const item = flattenBatchRecords().find(record => record.gradeKey === key);
                                                return item && (
                                                  <tr key={key}>
                                                    <td>{item.displayId}</td>
                                                    <td>{item.kgValue.toFixed(2)} kg</td>
                                                  </tr>
                                                );
                                              })}
                                              <tr className="table-active">
                                                <td><strong>Total</strong></td>
                                                <td><strong>
                                                  {selectedLowGradeBatches
                                                    .map(key => flattenBatchRecords().find(record => record.gradeKey === key))
                                                    .filter(item => item)
                                                    .reduce((sum, item) => sum + item.kgValue, 0)
                                                    .toFixed(2)} kg
                                                </strong></td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        ) : (
                                          <Alert variant="info">No batches selected. Click "Modify Batches" to select.</Alert>
                                        )}
                                      </div>

                                      <Form.Group className="mb-3">
                                        <Form.Label>Number of Bags (Combined)</Form.Label>
                                        <Form.Control
                                          type="number"
                                          min="1"
                                          // placeholder="Total number of bags"
                                          value={lowGradeBags}
                                          // defaultValue={1}
                                          // readOnly
                                          onChange={(e) => setLowGradeBags(e.target.value)}
                                          required
                                        />
                                        <Form.Text className="text-muted">
                                          Enter the total number of bags for all selected {selectedLowGrade} batches combined.
                                        </Form.Text>
                                      </Form.Group>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {/* Show message when no items selected */}
                        {getSelectedGradeItems().length === 0 && (transferMode !== 'BOTH' || activeBothGradeTab !== 'low') && (
                          <Alert variant="info">No grade items selected for transfer. Please modify batches to continue.</Alert>
                        )}
                      </Card.Body>
                    </Card>




                    {/* Transport Details */}
                    <Card className="mt-3">
                      <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="h5" style={{ color: processingTheme.primary }}>Transport Details</span>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group controlId="truckNumber">
                              <Form.Label>Truck Number</Form.Label>
                              <Form.Control
                                type="text"
                                name="truckNumber"
                                placeholder="Enter truck number"
                                value={transportDetails.truckNumber}
                                onChange={handleTransportDetailsChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="driverName">
                              <Form.Label>Driver Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="driverName"
                                placeholder="Enter driver name"
                                value={transportDetails.driverName}
                                onChange={handleTransportDetailsChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group controlId="driverPhone">
                              <Form.Label>Driver Phone</Form.Label>
                              <Form.Control
                                type="text"
                                name="driverPhone"
                                placeholder="Enter driver phone"
                                value={transportDetails.driverPhone}
                                onChange={handleTransportDetailsChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="notes">
                              <Form.Label>Notes</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                name="notes"
                                placeholder="Enter any notes"
                                value={transportDetails.notes}
                                onChange={handleTransportDetailsChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            {showBatchSelection ? (
              <Button
                variant="primary"
                onClick={() => setShowBatchSelection(false)}
                style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
              >
                Done Selecting
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: processingTheme.primary, borderColor: processingTheme.primary }}
                  disabled={selectedGradeItems.length === 0}
                >
                  Confirm Transfer
                </Button>
              </>
            )}
          </Modal.Footer>
        </Form>
      </Modal>




      {/* Transfer Modal */}





      {
        loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="h5" style={{ color: processingTheme.primary }}>
                  Available Grade Items
                </span>
                <div className="d-flex gap-2">
                  <InputGroup>
                    <Form.Control
                      type="search"
                      placeholder="Search batches or grades"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <Placeholder animation="glow">
                  <Placeholder xs={12} />
                  <Placeholder xs={12} />
                  <Placeholder xs={12} />
                </Placeholder>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>
                            <Form.Check
                              type="checkbox"
                              checked={selectAllChecked}
                              onChange={(e) => handleSelectAllGradeItems(e.target.checked)}
                              label=""
                            />
                          </th>
                          <th>Batch & Grade</th>
                          <th>Processing</th>
                          <th>Weight (kg)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedBatches().map((item) => (
                          <tr
                            key={item.id}
                            style={{
                              backgroundColor: item.isHighGrade ? 'rgba(0, 128, 128, 0.05)' : 'transparent',
                              borderLeft: item.isHighGrade ? `4px solid ${processingTheme.primary}` : 'none'
                            }}
                          >
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={isGradeItemSelected(item.gradeKey)}
                                onChange={(e) => handleGradeItemSelection(item.gradeKey, e.target.checked)}
                                label=""
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div>
                                  <div className="fw-bold">
                                    {item.displayId} {item.isHighGrade && <span style={{ color: processingTheme.primary }}>★</span>}
                                  </div>
                                  <Badge
                                    bg={item.isHighGrade ? "success" : "info"}
                                    className="me-1"
                                  >
                                    {item.isHighGrade ? "High Grade" : "Low Grade"}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td>{item.processingType}</td>
                            <td>{item.kgValue.toFixed(2)} kg</td>
                            <td>
                              <Button
                                size="sm"
                                variant={isGradeItemSelected(item.gradeKey) ? "outline-danger" : "outline-sucafina"}
                                onClick={() => handleGradeItemSelection(item.gradeKey, !isGradeItemSelected(item.gradeKey))}
                              >
                                {isGradeItemSelected(item.gradeKey) ? "Remove" : "Select"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {getPaginatedBatches().length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center">No grade items found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {getPaginatedBatches().length} of {flattenBatchRecords().length} grade items
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                        </li>
                        {Array.from({ length: Math.ceil(flattenBatchRecords().length / batchesPerPage) }).map((_, index) => (
                          <li key={`page-${index}`} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === Math.ceil(flattenBatchRecords().length / batchesPerPage) ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        )
      }



    </div >
  );
};
const LoadingSkeleton = () => {
  const placeholderStyle = {
    opacity: 0.4,
    backgroundColor: processingTheme.secondary
  };

  return (
    <Card>
      <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
        <Placeholder as="h2" animation="glow">
          <Placeholder xs={4} style={placeholderStyle} />
        </Placeholder>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                {['Batch No', 'Processing Type', 'Output KGs', 'Total Output KGs', 'CWS', 'Date', 'Status'].map((header) => (
                  <th key={header}>
                    <Placeholder animation="glow">
                      <Placeholder xs={6} style={placeholderStyle} />
                    </Placeholder>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  {[...Array(9)].map((_, cellIdx) => (
                    <td key={cellIdx}>
                      <Placeholder animation="glow">
                        <Placeholder xs={6} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Transfer;
