import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, Tab, Tabs, Placeholder, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_URL from '../constants/Constants';
import ConfirmationModal from './CwsManager/ConfirmationModal';
import AlertModal from './CwsManager/AlertModal';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    accent: '#D95032',     // Complementary orange
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
    centralStation: '#008080',  // Main teal for central station badge
    buttonHover: '#006666'  // Darker teal for button hover
};
const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit, onComplete }) => {
    const [existingProcessing, setExistingProcessing] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    const [honeyOutputKgs, setHoneyOutputKgs] = useState({ H1: '' });
    const [naturalOutputKgs, setNaturalOutputKgs] = useState({
        N1: '', N2: '', B1: '', B2: ''
    });
    const [fullyWashedOutputKgs, setFullyWashedOutputKgs] = useState({
        A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
    });
    const [loading, setLoading] = useState(false);
    const [savedBaggingOffs, setSavedBaggingOffs] = useState([]);
    const [progressiveMode, setProgressiveMode] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);
        } else {
            resetModalState();
        }
    }, [show, batches]);

    useEffect(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Ensure the date is in the correct time zone
        const offset = yesterday.getTimezoneOffset();
        yesterday.setMinutes(yesterday.getMinutes() - offset);

        const year = yesterday.getFullYear();
        const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
        const day = yesterday.getDate().toString().padStart(2, '0');

        setSelectedDate(`${year}-${month}-${day}`);
    }, []);

    const resetModalState = () => {
        // setSelectedDate(new Date().toISOString().split('T')[0]);
        resetOutputs();
        setExistingProcessing(null);
        setSavedBaggingOffs([]);
        setIsEditing(false);
        setEditingRecord(null);
    };

    const resetOutputs = () => {
        setHoneyOutputKgs({ H1: '' });
        setNaturalOutputKgs({
            N1: '', N2: '', B1: '', B2: ''
        });
        setFullyWashedOutputKgs({
            A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
        });
    };

    const fetchExistingProcessingDetails = async (batchNo) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/processing/batch/${batchNo}`);

            if (response.data && response.data.length > 0) {
                setExistingProcessing(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching processing details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingDetails(batches[0].batchNo);
            resetOutputs();
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const handleHoneyOutputChange = (value) => {
        setHoneyOutputKgs({ H1: value });
    };

    const handleNaturalOutputChange = (field, value) => {
        setNaturalOutputKgs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFullyWashedOutputChange = (field, value) => {
        setFullyWashedOutputKgs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const fetchExistingProcessingAndBaggingOffs = async (batchNo) => {
        try {
            setLoading(true);
            const [processingResponse, baggingOffsResponse] = await Promise.all([
                axios.get(`${API_URL}/processing/batch/${batchNo}`),
                axios.get(`${API_URL}/bagging-off/batch/${batchNo}`)
            ]);

            if (processingResponse.data?.[0]) {
                setExistingProcessing(processingResponse.data[0]);
            }

            if (baggingOffsResponse.data?.length > 0) {
                // Sort by date in descending order (most recent first)
                const sortedBaggingOffs = baggingOffsResponse.data.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setSavedBaggingOffs(sortedBaggingOffs);

                // If not in edit mode, reset form
                if (!isEditing) {
                    resetOutputs();
                }
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    // const prepareSubmissionData = (processingType, status) => {
    //     if (!batches?.[0]?.batchNo) return [];

    //     const submissions = [];
    //     const batchNo = batches[0].batchNo;

    //     if (processingType === 'HONEY') {
    //         if (honeyOutputKgs.H1) {
    //             submissions.push({
    //                 date: selectedDate,
    //                 outputKgs: honeyOutputKgs,
    //                 processingType: 'HONEY',
    //                 existingProcessing, // Ensure this is included
    //                 batchNo,
    //                 status,
    //                 progressive: progressiveMode,
    //                 recordId: isEditing && editingRecord?.processingType === 'HONEY' ? editingRecord.id : null
    //             });
    //         }

    //         // Add fully washed submission if applicable
    //         if (Object.values(fullyWashedOutputKgs).some(v => v !== '')) {
    //             submissions.push({
    //                 date: selectedDate,
    //                 outputKgs: fullyWashedOutputKgs,
    //                 processingType: 'FULLY WASHED',
    //                 existingProcessing, // Ensure this is included
    //                 batchNo,
    //                 status,
    //                 progressive: progressiveMode,
    //                 recordId: isEditing && editingRecord?.processingType === 'FULLY WASHED' ? editingRecord.id : null
    //             });
    //         }
    //     } else {
    //         const outputData = prepareOutputData(processingType, batchNo);
    //         if (Object.values(outputData).some(v => v !== '')) {
    //             submissions.push({
    //                 date: selectedDate,
    //                 outputKgs: outputData,
    //                 processingType,
    //                 existingProcessing, // Ensure this is included
    //                 batchNo,
    //                 status,
    //                 progressive: progressiveMode,
    //                 recordId: isEditing ? editingRecord?.id : null
    //             });
    //         }
    //     }

    //     return submissions;
    // };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // const calculateTotalsByProcessingType = () => {
    //     const totals = {
    //         'HONEY': { H1: 0 },
    //         'NATURAL': { N1: 0, N2: 0, B1: 0, B2: 0 },
    //         'FULLY WASHED': { A0: 0, A1: 0, A2: 0, A3: 0, B1: 0, B2: 0 },
    //         'FULLY_WASHED': { A0: 0, A1: 0, A2: 0, A3: 0, B1: 0, B2: 0 },
    //     };

    //     savedBaggingOffs.forEach(record => {
    //         if (record.processingType === 'HONEY') {
    //             if (record.outputKgs.H1) {
    //                 totals['HONEY'].H1 += parseFloat(record.outputKgs.H1);
    //             }
    //         } else if (record.processingType === 'NATURAL') {
    //             Object.keys(record.outputKgs).forEach(key => {
    //                 if (record.outputKgs[key]) {
    //                     totals['NATURAL'][key] = (totals['NATURAL'][key] || 0) + parseFloat(record.outputKgs[key]);
    //                 }
    //             });
    //         } else if (record.processingType === 'FULLY WASHED') {
    //             Object.keys(record.outputKgs).forEach(key => {
    //                 if (record.outputKgs[key]) {
    //                     totals['FULLY WASHED'][key] = (totals['FULLY WASHED'][key] || 0) + parseFloat(record.outputKgs[key]);
    //                 }
    //             });
    //         }
    //     });

    //     return totals;
    // };


    const calculateTotalsByProcessingType = () => {
        const totals = {
            'HONEY': { H1: 0 },
            'NATURAL': { N1: 0, N2: 0, B1: 0, B2: 0 },
            'FULLY WASHED': { A0: 0, A1: 0, A2: 0, A3: 0, B1: 0, B2: 0 }, // Use consistent naming
        };

        savedBaggingOffs.forEach(record => {
            if (record.processingType === 'HONEY') {
                if (record.outputKgs.H1) {
                    totals['HONEY'].H1 += parseFloat(record.outputKgs.H1);
                }
            } else if (record.processingType === 'NATURAL') {
                Object.keys(record.outputKgs).forEach(key => {
                    if (record.outputKgs[key]) {
                        totals['NATURAL'][key] = (totals['NATURAL'][key] || 0) + parseFloat(record.outputKgs[key]);
                    }
                });
            } else if (record.processingType === 'FULLY WASHED') { // Ensure this matches the key in `totals`
                Object.keys(record.outputKgs).forEach(key => {
                    if (record.outputKgs[key]) {
                        totals['FULLY WASHED'][key] = (totals['FULLY WASHED'][key] || 0) + parseFloat(record.outputKgs[key]);
                    }
                });
            }
        });

        return totals;
    };

    // In the render method, display the detailed data in the table
    <Table size="sm" bordered hover>
        <thead>
            <tr>
                <th>Date</th>
                <th>Processing Type</th>
                <th>Grades/Output</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {savedBaggingOffs.map((record, index) => (
                <tr key={record.id || index}>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.processingType}</td>
                    <td>
                        {Object.entries(record.outputKgs)
                            .filter(([_, value]) => value && parseFloat(value) > 0)
                            .map(([grade, value]) => (
                                <div key={grade}>{grade}: {parseFloat(value).toFixed(2)} KGs</div>
                            ))
                        }
                    </td>
                    <td>{record.status}</td>
                    <td>
                        {record.status !== 'COMPLETED' && (
                            <>
                                <Button
                                    variant="outline-sucafina"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                    style={{
                                        color: processingTheme.primary,
                                        borderColor: processingTheme.primary,
                                        marginRight: '5px'
                                    }}
                                >
                                    <i className="bi bi-pencil-square"></i>
                                </Button>
                                {/* <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(record.id)}
                                    style={{
                                        color: '#dc3545',
                                        borderColor: '#dc3545'
                                    }}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button> */}
                            </>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>

    const prepareOutputData = (processingType, batchNo) => {
        const isSecondaryBatch = batchNo.endsWith('-2') || batchNo.endsWith('B');

        switch (processingType) {
            case 'NATURAL':
                return isSecondaryBatch ?
                    { N1: naturalOutputKgs.N1, N2: naturalOutputKgs.N2 } :
                    { N1: naturalOutputKgs.N1, N2: naturalOutputKgs.N2 };
            case 'FULLY WASHED':
            case 'FULLY_WASHED':
                return isSecondaryBatch ?
                    { B1: fullyWashedOutputKgs.B1, B2: fullyWashedOutputKgs.B2 } :
                    {
                        A0: fullyWashedOutputKgs.A0,
                        A1: fullyWashedOutputKgs.A1,
                        A2: fullyWashedOutputKgs.A2,
                        A3: fullyWashedOutputKgs.A3
                    };
            default:
                return {};
        }
    };

    const handleSave = async () => {
        if (!batches?.[0]?.processingType) return;

        try {
            setLoading(true);

            // Determine if we're editing an existing record or creating a new one
            if (isEditing && editingRecord) {
                // If editing, use PUT to update the existing record
                const updateData = {
                    date: selectedDate,
                    outputKgs: isEditing && editingRecord.processingType === 'HONEY' ? honeyOutputKgs :
                        isEditing && editingRecord.processingType === 'NATURAL' ? naturalOutputKgs :
                            fullyWashedOutputKgs,
                    status: 'PENDING' // or keep the existing status
                };

                await axios.put(`${API_URL}/bagging-off/${editingRecord.id}`, updateData);

                setAlertTitle('Success');
                setAlertMessage('Record updated successfully');
            } else {
                // If not editing, create a new record
                const submissions = prepareSubmissionData(
                    batches[0].processingType.toUpperCase(),
                    'PENDING'
                );

                if (submissions.length === 0) {
                    alert('Please enter at least one output value');
                    return;
                }

                await Promise.all(
                    submissions.map(submission =>
                        axios.post(`${API_URL}/bagging-off`, submission)
                    )
                );

                setAlertTitle('Success');
                setAlertMessage('Bagging Off record added successfully');
            }

            // Refresh the bagging offs data
            await fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);

            // Reset form and editing state
            resetOutputs();
            setIsEditing(false);
            setEditingRecord(null);

            setShowAlertModal(true);
        } catch (error) {
            console.error('Save error:', error);
            setAlertTitle('Error');
            setAlertMessage('Failed to save data');
            setShowAlertModal(true);
        } finally {
            setLoading(false);
        }
    };

    const isYesterdayRecord = (recordDate) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const recordDateObj = new Date(recordDate);
        return (
            recordDateObj.getFullYear() === yesterday.getFullYear() &&
            recordDateObj.getMonth() === yesterday.getMonth() &&
            recordDateObj.getDate() === yesterday.getDate()
        );
    };

    // const handleEdit = (record) => {
    //     // Normalize the record to ensure consistent processingType
    //     const normalizedRecord = {
    //         ...record,
    //         processingType: record.processingType
    //     };

    //     // Check if the record is from yesterday
    //     if (!isYesterdayRecord(normalizedRecord.date)) {
    //         setAlertTitle('Edit Restricted');
    //         setAlertMessage('You can only edit records from yesterday.');
    //         setShowAlertModal(true);
    //         return;
    //     }

    //     console.log(normalizedRecord.processingType);

    //     setIsEditing(true);
    //     setEditingRecord(normalizedRecord);
    //     setSelectedDate(new Date(normalizedRecord.date).toISOString().split('T')[0]);

    //     // Reset all outputs first
    //     resetOutputs();

    //     // Set the outputs based on the record being edited
    //     if (normalizedRecord.processingType === 'HONEY') {
    //         setHoneyOutputKgs(normalizedRecord.outputKgs);
    //     } else if (normalizedRecord.processingType === 'NATURAL') {
    //         const updatedNaturalOutputs = { ...naturalOutputKgs };
    //         Object.keys(normalizedRecord.outputKgs).forEach(key => {
    //             if (normalizedRecord.outputKgs[key]) {
    //                 updatedNaturalOutputs[key] = normalizedRecord.outputKgs[key];
    //             }
    //         });
    //         setNaturalOutputKgs(updatedNaturalOutputs);
    //     } else if (normalizedRecord.processingType === 'FULLY WASHED') {
    //         const updatedFullyWashedOutputs = { ...fullyWashedOutputKgs };
    //         Object.keys(normalizedRecord.outputKgs).forEach(key => {
    //             if (normalizedRecord.outputKgs[key]) {
    //                 updatedFullyWashedOutputs[key] = normalizedRecord.outputKgs[key];
    //             }
    //         });
    //         console.log("Fully Washed Outputs:", normalizedRecord.outputKgs);
    //         setFullyWashedOutputKgs(updatedFullyWashedOutputs);
    //     }
    // };

    const handleEdit = (record) => {
        // Normalize the record to ensure consistent processingType
        const normalizedRecord = {
            ...record,
            processingType: record.processingType
        };

        // Check if the record is from yesterday
        if (!isYesterdayRecord(normalizedRecord.date)) {
            setAlertTitle('Edit Restricted');
            setAlertMessage('You can only edit records from yesterday.');
            setShowAlertModal(true);
            return;
        }

        setIsEditing(true);
        setEditingRecord(normalizedRecord);
        setSelectedDate(new Date(normalizedRecord.date).toISOString().split('T')[0]);

        // Reset all outputs first
        resetOutputs();

        // Specifically handle each processing type
        switch (normalizedRecord.processingType) {
            case 'HONEY':
                // Ensure H1 is properly set, converting to string if necessary
                const honeyOutput = {
                    H1: normalizedRecord.outputKgs.H1 !== null && normalizedRecord.outputKgs.H1 !== undefined
                        ? normalizedRecord.outputKgs.H1.toString()
                        : ''
                };
                setHoneyOutputKgs(honeyOutput);

                // Only set Fully Washed outputs if they exist
                const fullyWashedOutputs = normalizedRecord.outputKgs;
                const hasFullyWashedOutputs = ['A0', 'A1', 'A2', 'A3']
                    .some(key => fullyWashedOutputs[key] !== null && fullyWashedOutputs[key] !== undefined && fullyWashedOutputs[key] !== '');

                if (hasFullyWashedOutputs) {
                    const fullyWashedOutput = {
                        A0: '', A1: '', A2: '', A3: ''
                    };
                    ['A0', 'A1', 'A2', 'A3'].forEach(key => {
                        if (fullyWashedOutputs[key] !== null && fullyWashedOutputs[key] !== undefined) {
                            fullyWashedOutput[key] = fullyWashedOutputs[key].toString();
                        }
                    });
                    setFullyWashedOutputKgs(fullyWashedOutput);
                }
                break;

            case 'NATURAL':
                // Prepare natural outputs, ensuring string conversion
                const naturalOutput = {};
                ['N1', 'N2', 'B1', 'B2'].forEach(key => {
                    if (normalizedRecord.outputKgs[key] !== null && normalizedRecord.outputKgs[key] !== undefined) {
                        naturalOutput[key] = normalizedRecord.outputKgs[key].toString();
                    } else {
                        naturalOutput[key] = '';
                    }
                });
                setNaturalOutputKgs(naturalOutput);
                break;

            case 'FULLY WASHED':
                // Prepare fully washed outputs, ensuring string conversion
                const fullyWashedOutput = {
                    A0: '', A1: '', A2: '', A3: '',
                    B1: '', B2: ''
                };
                ['A0', 'A1', 'A2', 'A3', 'B1', 'B2'].forEach(key => {
                    if (normalizedRecord.outputKgs[key] !== null && normalizedRecord.outputKgs[key] !== undefined) {
                        fullyWashedOutput[key] = normalizedRecord.outputKgs[key].toString();
                    }
                });
                setFullyWashedOutputKgs(fullyWashedOutput);
                break;

            default:
                console.warn('Unknown processing type:', normalizedRecord.processingType);
        }
    };

    // const handleEdit = (record) => {
    //     // Check if the record is from yesterday
    //     if (!isYesterdayRecord(record.date)) {
    //         setAlertTitle('Edit Restricted');
    //         setAlertMessage('You can only edit records from yesterday.');
    //         setShowAlertModal(true);
    //         return;
    //     }

    //     console.log(record);

    //     setIsEditing(true);
    //     setEditingRecord(record);
    //     setSelectedDate(new Date(record.date).toISOString().split('T')[0]);

    //     // Reset all outputs first
    //     resetOutputs();

    //     // Set the outputs based on the record being edited
    //     if (record.processingType === 'HONEY') {
    //         setHoneyOutputKgs(record.outputKgs);
    //     } else if (record.processingType === 'NATURAL') {
    //         const updatedNaturalOutputs = { ...naturalOutputKgs };
    //         Object.keys(record.outputKgs).forEach(key => {
    //             if (record.outputKgs[key]) {
    //                 updatedNaturalOutputs[key] = record.outputKgs[key];
    //             }
    //         });
    //         setNaturalOutputKgs(updatedNaturalOutputs);
    //     } else if (record.processingType === 'FULLY WASHED') {
    //         const updatedFullyWashedOutputs = { ...fullyWashedOutputKgs };
    //         Object.keys(record.outputKgs).forEach(key => {
    //             if (record.outputKgs[key]) {
    //                 updatedFullyWashedOutputs[key] = record.outputKgs[key];
    //             }
    //         });
    //         setFullyWashedOutputKgs(updatedFullyWashedOutputs);
    //     }
    // };

    // Modify handleDelete to only allow deleting yesterday's records
    const handleDelete = async (recordId) => {
        // Find the record to check its date
        const recordToDelete = savedBaggingOffs.find(record => record.id === recordId);

        if (!recordToDelete) {
            alert('Record not found');
            return;
        }

        // Check if the record is from yesterday
        if (!isYesterdayRecord(recordToDelete.date)) {
            setAlertTitle('Delete Restricted');
            setAlertMessage('You can only delete records from yesterday.');
            setShowAlertModal(true);
            return;
        }

        if (!recordId) return;

        // Confirm deletion with user
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/bagging-off/${recordId}`);

            // Refresh the bagging offs data
            await fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);

            alert('Record deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete record');
        } finally {
            setLoading(false);
        }
    };

    // const handleEdit = (record) => {
    //     setIsEditing(true);
    //     setEditingRecord(record);
    //     setSelectedDate(new Date(record.date).toISOString().split('T')[0]);

    //     // Reset all outputs first
    //     resetOutputs();

    //     // Set the outputs based on the record being edited
    //     if (record.processingType === 'HONEY') {
    //         setHoneyOutputKgs(record.outputKgs);
    //     } else if (record.processingType === 'NATURAL') {
    //         // Only set the fields that exist in the record
    //         const updatedNaturalOutputs = { ...naturalOutputKgs };
    //         Object.keys(record.outputKgs).forEach(key => {
    //             if (record.outputKgs[key]) {
    //                 updatedNaturalOutputs[key] = record.outputKgs[key];
    //             }
    //         });
    //         setNaturalOutputKgs(updatedNaturalOutputs);
    //     } else if (record.processingType === 'FULLY WASHED') {
    //         // Only set the fields that exist in the record
    //         const updatedFullyWashedOutputs = { ...fullyWashedOutputKgs };
    //         Object.keys(record.outputKgs).forEach(key => {
    //             if (record.outputKgs[key]) {
    //                 updatedFullyWashedOutputs[key] = record.outputKgs[key];
    //             }
    //         });
    //         setFullyWashedOutputKgs(updatedFullyWashedOutputs);
    //     }
    // };

    const prepareSubmissionData = (processingType, status) => {
        if (!batches?.[0]?.batchNo) return [];

        const submissions = [];
        const batchNo = batches[0].batchNo;

        if (processingType === 'HONEY') {
            if (honeyOutputKgs.H1) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: honeyOutputKgs,
                    processingType: 'HONEY',
                    existingProcessing,
                    batchNo,
                    status,
                    progressive: progressiveMode,
                });

                // Add fully washed submission if applicable
                if (Object.values(fullyWashedOutputKgs).some(v => v !== '')) {
                    submissions.push({
                        date: selectedDate,
                        outputKgs: fullyWashedOutputKgs,
                        processingType: 'FULLY WASHED',
                        existingProcessing,
                        batchNo,
                        status,
                        progressive: progressiveMode,
                    });
                }
            }
        } else {
            const outputData = prepareOutputData(processingType, batchNo);
            if (Object.values(outputData).some(v => v !== '')) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: outputData,
                    processingType,
                    existingProcessing,
                    batchNo,
                    status,
                    progressive: progressiveMode,
                });
            }
        }

        return submissions;
    };

    const handleCompleteBaggingOff = async () => {
        // Show confirmation modal
        setShowConfirmationModal(true);
    };

    const confirmCompleteBaggingOff = async () => {
        setShowConfirmationModal(false); // Hide confirmation modal

        if (!batches?.[0]?.batchNo) return;

        try {
            setLoading(true);

            // Get submissions if there are any new values entered
            const submissions = prepareSubmissionData(
                batches[0].processingType.toUpperCase(),
                'COMPLETED'
            );

            // If there are new entries, submit them
            if (submissions.length > 0) {
                await Promise.all(
                    submissions.map(submission =>
                        axios.post(`${API_URL}/bagging-off`, submission)
                    )
                );
            }

            // Always update existing bagging-off entries to "COMPLETED"
            if (savedBaggingOffs.length > 0) {
                await Promise.all(
                    savedBaggingOffs.map(entry =>
                        axios.put(`${API_URL}/bagging-off/${entry.id}`, {
                            ...entry,
                            status: 'COMPLETED'
                        })
                    )
                );
            }

            // Always call onComplete even if there are no new submissions
            if (onComplete && typeof onComplete === 'function') {
                await onComplete(batches[0].batchNo);
            }

            handleClose();
            setAlertTitle('Success');
            setAlertMessage('Bagging off completed successfully');
            setShowAlertModal(true); // Show success alert
        } catch (error) {
            console.error('Complete bagging off error:', error);
            setAlertTitle('Error');
            setAlertMessage(error.response?.data?.message || 'Failed to complete bagging off');
            setShowAlertModal(true); // Show error alert
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingRecord(null);
        resetOutputs();
    };



    return (
        <><Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header
                closeButton
                style={{
                    backgroundColor: processingTheme.neutral,
                    borderBottom: `1px solid ${processingTheme.primary}`
                }}
            >
                <Modal.Title style={{ color: processingTheme.primary }}>
                    {isEditing ? "Edit Bagging Off Record" : "Bagging Off Details"} {loading && '(Loading...)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {existingProcessing && (
                    <div className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}>
                        <h5 style={{ color: processingTheme.primary }}>Processing Details</h5>
                        <Row>
                            <Col md={4}>
                                <strong>Batch No:</strong> {existingProcessing.batchNo}
                            </Col>
                            <Col md={4}>
                                <strong>Processing Type:</strong> {existingProcessing.processingType}
                            </Col>
                            <Col md={4}>
                                <strong>Total KGs:</strong> {existingProcessing.totalKgs}
                            </Col>
                        </Row>
                    </div>
                )}

                {!isEditing && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="progressive-mode-switch"
                            // label={<span className="text-warning">Progressive Drying Mode (Add new outputs without replacing previous entries)</span>}
                            checked={progressiveMode}
                            onChange={(e) => setProgressiveMode(e.target.checked)}
                            className="custom-switch"
                            hidden
                        />
                    </Form.Group>
                )}

                {/* Saved Bagging Offs List - Show if not editing */}
                {!isEditing && savedBaggingOffs.length > 0 && (
                    <div className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}>
                        <h5 style={{ color: processingTheme.primary }}>Previous Bagging Off Records</h5>

                        <Table size="sm" bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Processing Type</th>
                                    <th>Grades/Output</th>
                                    {/* <th>Status</th> */}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedBaggingOffs.map((record, index) => (
                                    <tr key={record.id || index}>
                                        <td>{formatDate(record.date)}</td>
                                        <td>{record.processingType}</td>
                                        <td>
                                            {Object.entries(record.outputKgs)
                                                .filter(([_, value]) => value && parseFloat(value) > 0)
                                                .map(([grade, value]) => (
                                                    <div key={grade}>{grade}: {parseFloat(value).toFixed(2)} KGs</div>
                                                ))
                                            }
                                        </td>
                                        {/* <td>{record.status}</td> */}
                                        <td>
                                            {record.status !== 'COMPLETED' && isYesterdayRecord(record.date) && (
                                                <>
                                                    <Button
                                                        variant="outline-sucafina"
                                                        size="sm"
                                                        onClick={() => handleEdit(record)}
                                                        style={{
                                                            color: processingTheme.primary,
                                                            borderColor: processingTheme.primary,
                                                            marginRight: '5px'
                                                        }}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    {/* <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(record.id)}
                                                        style={{
                                                            color: '#dc3545',
                                                            borderColor: '#dc3545'
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button> */}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Total summary after the individual records */}
                        <div className="mt-3">
                            <h6 style={{ color: processingTheme.primary }}>Total Accumulated Output</h6>
                            <Table size="sm" bordered>
                                <thead>
                                    <tr>
                                        {/* <th>Processing Type</th> */}
                                        <th>Grade</th>
                                        <th>Total KGs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const totals = calculateTotalsByProcessingType();
                                        const rows = [];

                                        Object.keys(totals).forEach(procType => {
                                            Object.keys(totals[procType]).forEach((grade, idx) => {
                                                if (totals[procType][grade] > 0) {
                                                    rows.push(
                                                        <tr key={`${procType}-${grade}`}>
                                                            {/* {idx === 0 ? <td rowSpan={Object.keys(totals[procType]).filter(g => totals[procType][g] > 0).length}>{procType}</td> : null} */}
                                                            <td>{grade}</td>
                                                            <td>{totals[procType][grade].toFixed(2)} KGs</td>
                                                        </tr>
                                                    );
                                                }
                                            });
                                        });

                                        return rows.length > 0 ? rows : (
                                            <tr>
                                                <td colSpan="3" className="text-center">No previous output recorded</td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            readOnly // Make the input read-only
                            style={{
                                borderColor: processingTheme.secondary,
                                backgroundColor: processingTheme.neutral,
                                cursor: 'not-allowed', // Optional: Change cursor to indicate non-editable
                            }}
                        />
                    </Form.Group>


                    {/* Honey Processing Section */}
                    {((!isEditing && batches?.[0]?.processingType?.toUpperCase() === 'HONEY') ||
                        (isEditing && editingRecord?.processingType === 'HONEY')) && (
                            <>
                                <div className="mb-4">
                                    <Form.Label style={{ color: processingTheme.primary }}>
                                        Honey Processing Output
                                    </Form.Label>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Control
                                                type="number"
                                                step="0.5"
                                                placeholder="H1 KGs"
                                                value={honeyOutputKgs.H1}
                                                onChange={(e) => handleHoneyOutputChange(e.target.value)}
                                                required
                                                style={{
                                                    borderColor: processingTheme.secondary,
                                                    ':focus': { borderColor: processingTheme.primary }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                {/* Only show Fully Washed Processing Output if not editing a Honey record */}
                                {!isEditing && (
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Label style={{ color: processingTheme.primary, marginBottom: 0 }}>
                                                Fully Washed Processing Output
                                            </Form.Label>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                color: processingTheme.accent
                                            }}>
                                                Was processed as Fully Washed
                                            </span>
                                        </div>
                                        <Row>
                                            {['A0', 'A1', 'A2', 'A3'].map((field) => (
                                                <Col md={3} key={field} className="mb-2">
                                                    <Form.Control
                                                        type="number"
                                                        step="0.5"
                                                        placeholder={`${field} KGs`}
                                                        value={fullyWashedOutputKgs[field]}
                                                        onChange={(e) => handleFullyWashedOutputChange(field, e.target.value)}
                                                        required
                                                        style={{
                                                            borderColor: processingTheme.secondary,
                                                            ':focus': { borderColor: processingTheme.primary }
                                                        }}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                            </>
                        )}


                    {/* Honey Processing Section */}
                    {/* {((!isEditing && batches?.[0]?.processingType?.toUpperCase() === 'HONEY') ||
                        (isEditing && editingRecord?.processingType === 'HONEY')) && (
                            <>
                                <div className="mb-4">
                                    <Form.Label style={{ color: processingTheme.primary }}>
                                        Honey Processing Output
                                    </Form.Label>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Control
                                                type="number"
                                                step="0.5"
                                                placeholder="H1 KGs"
                                                value={honeyOutputKgs.H1}
                                                onChange={(e) => handleHoneyOutputChange(e.target.value)}
                                                required
                                                style={{
                                                    borderColor: processingTheme.secondary,
                                                    ':focus': { borderColor: processingTheme.primary }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Form.Label style={{ color: processingTheme.primary, marginBottom: 0 }}>
                                            Fully Washed Processing Output
                                        </Form.Label>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: processingTheme.accent
                                        }}>
                                            Was processed as Fully Washed
                                        </span>
                                    </div>
                                    <Row>
                                        {['A0', 'A1', 'A2', 'A3'].map((field) => (
                                            <Col md={3} key={field} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    step="0.5"
                                                    placeholder={`${field} KGs`}
                                                    value={fullyWashedOutputKgs[field]}
                                                    onChange={(e) => handleFullyWashedOutputChange(field, e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </>
                        )} */}

                    {/* Fully Washed Processing Section */}
                    {((!isEditing && batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED') ||
                        (isEditing && editingRecord?.processingType === 'FULLY WASHED')) && (
                            <div className="mb-3">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Fully Washed Processing Output
                                </Form.Label>
                                <Row>
                                    {/* Check for batch ending with -2 or B */}
                                    {(editingRecord?.batchNo?.endsWith('-2') ||
                                        editingRecord?.batchNo?.endsWith('B') ||
                                        batches?.[0]?.batchNo?.endsWith('-2') ||
                                        batches?.[0]?.batchNo?.endsWith('B')) ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B1 KGs"
                                                    value={fullyWashedOutputKgs.B1}
                                                    onChange={(e) => handleFullyWashedOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B2 KGs"
                                                    value={fullyWashedOutputKgs.B2}
                                                    onChange={(e) => handleFullyWashedOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A0 KGs"
                                                    value={fullyWashedOutputKgs.A0}
                                                    onChange={(e) => handleFullyWashedOutputChange('A0', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A1 KGs"
                                                    value={fullyWashedOutputKgs.A1}
                                                    onChange={(e) => handleFullyWashedOutputChange('A1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A2 KGs"
                                                    value={fullyWashedOutputKgs.A2}
                                                    onChange={(e) => handleFullyWashedOutputChange('A2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A3 KGs"
                                                    value={fullyWashedOutputKgs.A3}
                                                    onChange={(e) => handleFullyWashedOutputChange('A3', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )}

                    {/* Natural Processing Section */}
                    {((!isEditing && batches?.[0]?.processingType?.toUpperCase() === 'NATURAL') ||
                        (isEditing && editingRecord?.processingType === 'NATURAL')) && (
                            <div className="mb-4">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Natural Processing Output
                                </Form.Label>
                                <Row>
                                    {(batches[0].batchNo.endsWith('-1') || batches[0].batchNo.endsWith('A')) ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="N1 KGs"
                                                    value={naturalOutputKgs.N1}
                                                    onChange={(e) => handleNaturalOutputChange('N1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="N2 KGs"
                                                    value={naturalOutputKgs.N2}
                                                    onChange={(e) => handleNaturalOutputChange('N2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="N1 KGs"
                                                    value={naturalOutputKgs.N1}
                                                    onChange={(e) => handleNaturalOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="N2 KGs"
                                                    value={naturalOutputKgs.N2}
                                                    onChange={(e) => handleNaturalOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )}



                    {/* {(!isEditing || (isEditing && editingRecord?.processingType === 'FULLY WASHED' || isEditing && editingRecord?.processingType === 'HONEY')) &&
                        batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
                            <div className="mb-3">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Fully Washed Processing Output
                                </Form.Label>
                                <Row>
                                    {batches[0].batchNo.endsWith('-2') || batches[0].batchNo.endsWith('B') ? (
                                        <>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B1 KGs"
                                                    value={fullyWashedOutputKgs.B1}
                                                    onChange={(e) => handleFullyWashedOutputChange('B1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="B2 KGs"
                                                    value={fullyWashedOutputKgs.B2}
                                                    onChange={(e) => handleFullyWashedOutputChange('B2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    ) : (
                                        <>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A0 KGs"
                                                    value={fullyWashedOutputKgs.A0}
                                                    onChange={(e) => handleFullyWashedOutputChange('A0', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A1 KGs"
                                                    value={fullyWashedOutputKgs.A1}
                                                    onChange={(e) => handleFullyWashedOutputChange('A1', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A2 KGs"
                                                    value={fullyWashedOutputKgs.A2}
                                                    onChange={(e) => handleFullyWashedOutputChange('A2', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                            <Col md={3} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="A3 KGs"
                                                    value={fullyWashedOutputKgs.A3}
                                                    onChange={(e) => handleFullyWashedOutputChange('A3', e.target.value)}
                                                    required
                                                    style={{
                                                        borderColor: processingTheme.secondary,
                                                        ':focus': { borderColor: processingTheme.primary }
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>
                        )} */}
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
                {isEditing ? (
                    <>
                        <Button variant="secondary" onClick={cancelEdit}>
                            Cancel
                        </Button>
                        <Button
                            style={{
                                backgroundColor: processingTheme.primary,
                                borderColor: processingTheme.primary
                            }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Update Record'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            style={{
                                backgroundColor: processingTheme.primary,
                                borderColor: processingTheme.primary,
                                marginRight: '10px'
                            }}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleCompleteBaggingOff}
                            disabled={loading || savedBaggingOffs.length === 0}
                        >
                            {loading ? 'Processing...' : 'Complete Bagging Off'}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
            <ConfirmationModal
                show={showConfirmationModal}
                onHide={() => setShowConfirmationModal(false)}
                onConfirm={confirmCompleteBaggingOff}
                title="Confirm Completion"
                message="Are you sure you want to complete bagging off? This action cannot be undone."
                confirmText="Yes, Complete"
                cancelText="Cancel"
            />

            {/* Alert Modal */}
            <AlertModal
                show={showAlertModal}
                onHide={() => setShowAlertModal(false)}
                title={alertTitle}
                message={alertMessage}
            />

        </>

    );
};
const LoadingSkeleton = () => {
    const placeholderStyle = {
        opacity: 0.4,
        backgroundColor: processingTheme.secondary
    };

    return (
        <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                <Placeholder as="h2" animation="glow">
                    <Placeholder xs={4} style={placeholderStyle} />
                </Placeholder>
            </Card.Header>
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <table className="table mb-0">
                        <thead style={{ backgroundColor: processingTheme.neutral }}>
                            <tr>
                                <th>Batch No</th>
                                <th>Total KGs</th>
                                <th>CWS</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, index) => (
                                <tr key={index}>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={6} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={4} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={3} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={5} style={placeholderStyle} />
                                        </Placeholder>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled
                                            style={{
                                                color: processingTheme.primary,
                                                borderColor: processingTheme.primary,
                                                opacity: 0.4,
                                                backgroundColor: 'transparent',
                                                cursor: 'default'
                                            }}
                                        >
                                            Bag Off
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card.Body>
        </Card>
    );
};


const ProcessingList = () => {
    const [processingBatches, setProcessingBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const cwsInfo = JSON.parse(localStorage.getItem('cws'));
    const navigate = useNavigate();

    const shouldHideGradeColumn = (batches) => {
        if (!batches || batches.length === 0) return false;
        return batches.some(batch => batch.batchNo && batch.batchNo.includes('-'));
    };

    useEffect(() => {
        fetchProcessingBatches();
    }, [refreshKey]);

    const fetchProcessingBatches = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`);
            const mappedBatches = res.data
                .filter(processing => processing.status !== 'COMPLETED')
                .map(processing => ({
                    id: processing.id,
                    batchNo: processing.batchNo,
                    totalKgs: processing.totalKgs,
                    grade: processing.grade,
                    cws: processing.cws.name,
                    status: processing.status,
                    processingType: processing.processingType,
                    batches: [processing]
                }));
            setProcessingBatches(mappedBatches);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching processing batches:', error);
            setError(error.response?.data?.message || 'Error fetching processing batches');
            setLoading(false);
        }
    };

    const startProcessing = (batches) => {
        setSelectedBatches(batches);
        setShowModal(true);
    };

    const handleBatchCompletion = (batchNo) => {
        setProcessingBatches(prev =>
            prev.filter(batch => batch.batchNo !== batchNo)
        );
        // Trigger a refresh after a short delay to ensure server consistency
        setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500);
    };

    const handleProcessSubmit = async (processingDetailsArray) => {
        try {
            if (!userInfo?.cwsId) {
                throw new Error('User CWS ID not found');
            }

            for (const processingDetails of processingDetailsArray) {
                const { existingProcessing, batches, ...otherDetails } = processingDetails;

                const submissionData = {
                    ...otherDetails,
                    batchNo: batches[0].batchNo,
                    cwsId: userInfo.cwsId,
                    existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
                };

                await axios.post(`${API_URL}/bagging-off`, submissionData);
            }

            setShowModal(false);
            setRefreshKey(prevKey => prevKey + 1);

            // Use a toast notification instead of an alert
            // If you have a toast library like react-toastify
            // toast.success('Bagging off processed successfully');
            alert('Bagging off processed successfully');
        } catch (error) {
            console.error('Bagging off submission error:', error);
            alert(error.response?.data?.message || 'Failed to process bagging off');
        }
    };


    const hideGradeColumn = shouldHideGradeColumn(processingBatches);

    if (loading) return <LoadingSkeleton />;
    if (error) return (
        <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
            <button
                className="btn btn-sm btn-outline-danger ml-3"
                onClick={() => setRefreshKey(prevKey => prevKey + 1)}
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            <ProcessingBatchModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                batches={selectedBatches}
                onSubmit={handleProcessSubmit}
                onComplete={handleBatchCompletion}
            />

            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h4 style={{ color: processingTheme.primary }}>Processing Management</h4>
            </div>

            <Card className="shadow-sm">
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className='h5' style={{ color: processingTheme.primary }}>Processing Batches</span>
                    <Button
                        variant="link"
                        size="sm"
                        className="float-right"
                        onClick={() => setRefreshKey(prevKey => prevKey + 1)}
                        style={{ color: processingTheme.primary }}
                    >
                        <i className="fas fa-sync-alt"></i> Refresh
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: processingTheme.neutral }}>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Total KGs</th>
                                    {!hideGradeColumn && <th>Grade</th>}
                                    <th>CWS</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processingBatches.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={hideGradeColumn ? 5 : 6}
                                            className="text-center py-4"
                                            style={{
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            <i className="fas fa-info-circle mr-2"></i>
                                            No processing batches found
                                        </td>
                                    </tr>
                                ) : (processingBatches.map((batch) => (
                                    <tr key={batch.id} style={{ cursor: 'pointer' }}
                                        onClick={() => startProcessing(batch.batches)}
                                        className="position-relative"
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = processingTheme.tableHover}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                    >
                                        <td>{batch.batchNo}</td>
                                        <td>{batch?.totalKgs.toLocaleString()} kg</td>
                                        {!hideGradeColumn && <td>{batch.grade || "N/A"}</td>}
                                        <td>{batch.cws}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor:
                                                        batch.status === 'PROCESSING' ? processingTheme.secondary :
                                                            batch.status === 'PENDING' ? '#FFC107' :
                                                                processingTheme.primary,
                                                    color: 'white',
                                                    padding: '6px 10px'
                                                }}
                                            >
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startProcessing(batch.batches);
                                                }}
                                                style={{
                                                    color: processingTheme.primary,
                                                    borderColor: processingTheme.primary,
                                                    backgroundColor: 'transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = processingTheme.neutral;
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <i className="fas fa-box mr-1"></i> Bag Off
                                            </Button>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};



export default ProcessingList;