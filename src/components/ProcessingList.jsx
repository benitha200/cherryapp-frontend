// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Modal, Button, Form } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// // Consistent theme colors
// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
//   directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
//   centralStation: '#008080'  // Main teal for central station badge
// };

// const StartProcessingModal = ({ show, handleClose, purchases, onSubmit }) => {
//     const [existingProcessing, setExistingProcessing] = useState(null);
//     const [selectedDate, setSelectedDate] = useState('');
//     const [outputKgs, setOutputKgs] = useState({
//       A0: '',
//       A1: '',
//       A2: '',
//       A3: ''
//     });
//     const [loading, setLoading] = useState(false);

//     // Reset modal state when show changes
//     useEffect(() => {
//       if (show && purchases && purchases.length > 0) {
//         // Fetch existing processing for the batch
//         fetchExistingProcessing(purchases[0].batchNo);
//       } else {
//         // Reset all states
//         setSelectedDate('');
//         setOutputKgs({ A0: '', A1: '', A2: '', A3: '' });
//         setExistingProcessing(null);
//       }
//     }, [show, purchases]);

//     // Fetch existing processing details
//     const fetchExistingProcessing = async (batchNo) => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`${API_URL}/processing/batch/${batchNo}`);

//         if (response.data && response.data.length > 0) {
//           setExistingProcessing(response.data[0]);
//         }
//       } catch (error) {
//         console.error('Error fetching processing details:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const handleOutputKgsChange = (key, value) => {
//       setOutputKgs(prev => ({
//         ...prev,
//         [key]: value
//       }));
//     };

//     const handleSubmit = () => {
//       // Validate inputs
//       const requiredInputs = ['A0', 'A1', 'A2', 'A3'];
//       const filledInputs = requiredInputs.every(input => 
//         outputKgs[input] && parseFloat(outputKgs[input]) > 0
//       );

//       if (!selectedDate || !filledInputs) {
//         alert('Please fill in all required fields');
//         return;
//       }

//       const submissionData = {
//         date: selectedDate,
//         outputKgs,
//         existingProcessing,
//         purchases
//       };

//       onSubmit(submissionData);
//       handleClose();
//     };

//     return (
//       <Modal show={show} onHide={handleClose} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Bagging Off Details {loading && '(Loading...'}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {existingProcessing && (
//             <div className="mb-4 p-3 bg-light border rounded">
//               <h5>Processing Details</h5>
//               <div className="row">
//                 <div className="col-md-4">
//                   <strong>Batch No:</strong> {existingProcessing.batchNo}
//                 </div>
//                 <div className="col-md-4">
//                   <strong>Grade:</strong> {existingProcessing.grade}
//                 </div>
//                 <div className="col-md-4">
//                   <strong>Processing Type:</strong> {existingProcessing.processingType}
//                 </div>
//                 <div className="col-md-4">
//                   <strong>Total KGs:</strong> {existingProcessing.totalKgs}
//                 </div>
//                 <div className="col-md-4">
//                   <strong>Status:</strong> {existingProcessing.status}
//                 </div>
//               </div>
//             </div>
//           )}

//           <Form>
//             {/* Date Input */}
//             <Form.Group className="mb-3">
//               <Form.Label>Bagging Off Date</Form.Label>
//               <Form.Control 
//                 type="date" 
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <div className="mb-3">
//               <Form.Label>Output Kilograms</Form.Label>
//               <div className="row">
//                 {['A0', 'A1', 'A2', 'A3'].map((input) => (
//                   <div key={input} className="col-md-3 mb-2">
//                     <Form.Control
//                       type="number"
//                       placeholder={`${input} KGs`}
//                       value={outputKgs[input]}
//                       onChange={(e) => handleOutputKgsChange(input, e.target.value)}
//                       required
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             Submit Bagging Off
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     );
//   };

// const ProcessingList = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPurchases, setSelectedPurchases] = useState([]);
//   const skeletonRows = Array(5).fill(0);

//   useEffect(() => {
//     fetchPurchases();
//   }, []);

//   const fetchPurchases = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/purchases`);
//       setPurchases(res.data);
//       setLoading(false);
//     } catch {
//       setError('Error fetching purchases');
//       setLoading(false);
//     }
//   };

//   const startProcessing = (purchasesToProcess) => {
//     setSelectedPurchases(purchasesToProcess);
//     setShowModal(true);
//   };

// //   const handleProcessSubmit = (processingDetails) => {
// //     console.log('Processing details:', processingDetails);
// //     // Add your processing logic here
// //     setShowModal(false);
// //   };

// const handleProcessSubmit = async (processingDetails) => {
//     try {
//       const { existingProcessing, purchases, ...otherDetails } = processingDetails;

//       // Prepare submission data
//       const submissionData = {
//         ...otherDetails,
//         batchNo: purchases[0].batchNo,
//         existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
//       };

//       // Send bagging-off data to backend
//       const response = await axios.post(`${API_URL}/bagging-off`, submissionData);

//       // Refresh purchases or update UI as needed
//       fetchPurchases();

//       // Optional: Show success message
//       alert('Bagging off processed successfully');
//     } catch (error) {
//       console.error('Bagging off submission error:', error);
//       alert('Failed to process bagging off');
//     }
//   };

//   if (loading) return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div 
//           className="d-flex align-items-center"
//           style={{ backgroundColor: theme.neutral }}
//         >
//           <div 
//             className="skeleton-title h4 mb-0 m-4"
//             style={{ 
//               backgroundColor: '#e0e0e0', 
//               width: '200px', 
//               height: '30px', 
//               borderRadius: '4px' 
//             }}
//           />
//         </div>
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   {['Batch No', 'Total KGs', 'Total Price', 'Grade', 'CWS', 'Site Collection', 'Actions'].map((header, index) => (
//                     <th key={index} className="px-4 py-3">
//                       <div 
//                         className="skeleton-header"
//                         style={{ 
//                           backgroundColor: '#e0e0e0', 
//                           width: '100px', 
//                           height: '20px', 
//                           borderRadius: '4px' 
//                         }}
//                       />
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {skeletonRows.map((_, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {[1, 2, 3, 4, 5, 6, 7].map((cellIndex) => (
//                       <td key={cellIndex} className="px-4 py-3">
//                         <div 
//                           className="skeleton-cell"
//                           style={{ 
//                             backgroundColor: '#f0f0f0', 
//                             width: '80%', 
//                             height: '20px', 
//                             borderRadius: '4px' 
//                           }}
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div className="alert alert-danger m-3" role="alert">{error}</div>
//   );


//   return (
//     <div className="container-fluid py-4">
//       <StartProcessingModal 
//         show={showModal}
//         handleClose={() => setShowModal(false)}
//         purchases={selectedPurchases}
//         onSubmit={handleProcessSubmit}
//       />
//       <div className="card border-0 shadow-sm">
//         <div 
//           className="d-flex align-items-center"
//           style={{ backgroundColor: theme.neutral }}
//         >
//           <h2 
//             className="card-title h4 mb-0 m-4"
//             style={{ color: theme.primary }}
//           >
//             Batch Processing
//           </h2>
//         </div>
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   <th className="px-4 py-3">Batch No</th>
//                   <th className="px-4 py-3">Total KGs</th>
//                   <th className="px-4 py-3">Grade</th>
//                   <th className="px-4 py-3">CWS</th>
//                   <th className="px-4 py-3">Status</th>
//                   <th className="px-4 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {purchases.reduce((acc, purchase) => {
//                   const existingIndex = acc.findIndex(p => p.batchNo === purchase.batchNo);
//                   if (existingIndex !== -1) {
//                     acc[existingIndex].totalKgs += purchase.totalKgs;
//                     acc[existingIndex].totalPrice += purchase.totalPrice;
//                     acc[existingIndex].purchases.push(purchase);
//                   } else {
//                     acc.push({
//                       batchNo: purchase.batchNo,
//                       totalKgs: purchase.totalKgs,
//                       totalPrice: purchase.totalPrice,
//                       grade: purchase.grade,
//                       cws: purchase.cws.name,
//                       siteCollection: purchase.siteCollection?.name || 'N/A',
//                       status: 'Pending', // Default status
//                       purchases: [purchase]
//                     });
//                   }
//                   return acc;
//                 }, []).map(({ batchNo, totalKgs, totalPrice, grade, cws, siteCollection, status, purchases }, i) => (
//                   <tr 
//                     key={i}
//                     style={{ ':hover': { backgroundColor: theme.tableHover } }}
//                   >
//                     <td className="px-4 py-3">{batchNo}</td>
//                     <td className="px-4 py-3">{totalKgs.toFixed(2)} kg</td>
//                     <td className="px-4 py-3">{grade}</td>
//                     <td className="px-4 py-3">{cws}</td>
//                     <td className="px-4 py-3">
//                       <span 
//                         className="badge" 
//                         style={{ 
//                           backgroundColor: status === 'Pending' ? theme.secondary : theme.primary,
//                           color: 'white'
//                         }}
//                       >
//                         {status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button 
//                         className="btn btn-sm"
//                         style={{ 
//                           color: theme.primary,
//                           borderColor: theme.primary,
//                           backgroundColor: 'transparent',
//                           ':hover': {
//                             backgroundColor: theme.neutral
//                           }
//                         }}
//                         onClick={() => startProcessing(purchases)}
//                       >
//                         Bag Off
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProcessingList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, Tab, Tabs } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    accent: '#D95032',     // Complementary orange
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
    centralStation: '#008080'  // Main teal for central station badge
}

const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit }) => {
    const [existingProcessing, setExistingProcessing] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [outputKgs, setOutputKgs] = useState({
        A0: '', A1: '', A2: '', A3: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingDetails(batches[0].batchNo);
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const resetModalState = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setOutputKgs({ A0: '', A1: '', A2: '', A3: '' });
        setExistingProcessing(null);
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

    const handleOutputKgsChange = (key, value) => {
        setOutputKgs(prev => ({ ...prev, [key]: value }));
    };

    // const handleSubmit = () => {
    //     const requiredInputs = ['A0', 'A1', 'A2', 'A3'];
    //     const filledInputs = requiredInputs.every(input =>
    //         outputKgs[input] && parseFloat(outputKgs[input]) > 0
    //     );

    //     if (!filledInputs) {
    //         alert('Please fill in all required fields');
    //         return;
    //     }

    //     const submissionData = {
    //         date: selectedDate,
    //         outputKgs,
    //         existingProcessing,
    //         batches
    //     };

    //     onSubmit(submissionData);
    //     handleClose();
    // };

    const handleSubmit = () => {
        const requiredInputs = ['A0', 'A1', 'A2', 'A3'];
        
        // Initialize any unfilled inputs with 0
        requiredInputs.forEach(input => {
            if (!outputKgs[input] || parseFloat(outputKgs[input]) <= 0) {
                outputKgs[input] = '0';
            }
        });
    
        const submissionData = {
            date: selectedDate,
            outputKgs,
            existingProcessing,
            batches
        };
    
        onSubmit(submissionData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header
                closeButton
                style={{
                    backgroundColor: processingTheme.neutral,
                    borderBottom: `1px solid ${processingTheme.primary}`
                }}
            >
                <Modal.Title style={{ color: processingTheme.primary }}>
                    Bagging Off Details {loading && '(Loading...)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {existingProcessing && (
                    <div
                        className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}
                    >
                        <h5 style={{ color: processingTheme.primary }}>Processing Details</h5>
                        <Row>
                            <Col md={4}>
                                <strong>Batch No:</strong> {existingProcessing.batchNo}
                            </Col>
                            <Col md={4}>
                                <strong>Grade:</strong> {existingProcessing.grade}
                            </Col>
                            <Col md={4}>
                                <strong>Processing Type:</strong> {existingProcessing.processingType}
                            </Col>
                            <Col md={4}>
                                <strong>Total KGs:</strong> {existingProcessing.totalKgs}
                            </Col>
                            <Col md={4}>
                                <strong>Status:</strong> {existingProcessing.status}
                            </Col>
                        </Row>
                    </div>
                )}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={() => { }} // Prevent editing
                            readOnly
                            style={{
                                borderColor: processingTheme.secondary,
                                backgroundColor: processingTheme.neutral
                            }}
                        />
                    </Form.Group>

                    <div className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Output Kilograms</Form.Label>
                        <Row>
                            {['A0', 'A1', 'A2', 'A3'].map((input) => (
                                <Col md={3} key={input} className="mb-2">
                                    <Form.Control
                                        type="number"
                                        placeholder={`${input} KGs`}
                                        value={outputKgs[input]}
                                        onChange={(e) => handleOutputKgsChange(input, e.target.value)}
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
                </Form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    style={{
                        backgroundColor: processingTheme.secondary,
                        borderColor: processingTheme.secondary
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        backgroundColor: processingTheme.primary,
                        borderColor: processingTheme.primary,
                        '&:hover': {
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }
                    }}
                >
                    Submit Bagging Off
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const CompletedBaggingOffList = () => {
    const [completedBaggingOffRecords, setCompletedBaggingOffRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompletedBaggingOffRecords();
    }, []);

    const fetchCompletedBaggingOffRecords = async () => {
        try {
            const response = await axios.get(`${API_URL}/bagging-off`);
            const completedRecords = response.data.filter(record => record.status === 'COMPLETED');
            setCompletedBaggingOffRecords(completedRecords);
            setLoading(false);
        } catch (error) {
            setError('Error fetching completed bagging off records');
            setLoading(false);
        }
    };

    const renderOutputKgs = (outputKgsJson) => {
        const outputKgs = JSON.parse(outputKgsJson);
        return Object.entries(outputKgs).map(([grade, kg]) => (
            <div key={grade}>{grade}: {kg} kg</div>
        ));
    };

    if (loading) return <div className="text-center p-3">Loading completed records...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <Card>
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead style={{
                            backgroundColor: processingTheme.neutral,
                            color: processingTheme.centralStation
                        }}>
                            <tr>
                                <th>Batch No</th>
                                <th>Processing Type</th>
                                <th>Total Processing KGs</th>
                                <th>Output KGs</th>
                                <th>Total Output KGs</th>
                                <th>CWS</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedBaggingOffRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    style={{
                                        backgroundColor: processingTheme.tableHover,
                                        transition: 'background-color 0.3s ease'
                                    }}
                                >
                                    <td>{record.batchNo}</td>
                                    <td>{record.processing.processingType}</td>
                                    <td>{record.processing.totalKgs.toFixed(2)} kg</td>
                                    <td>{renderOutputKgs(record.outputKgs)}</td>
                                    <td>{record.totalOutputKgs} kg</td>
                                    <td>{record.processing.cws.name}</td>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: processingTheme.primary,
                                                color: 'white'
                                            }}
                                        >
                                            {record.status}
                                        </span>
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

    useEffect(() => {
        fetchProcessingBatches();
    }, []);

    const fetchProcessingBatches = async () => {
        try {
            const res = await axios.get(`${API_URL}/processing/cws/1`);
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
            setError('Error fetching processing batches');
            setLoading(false);
        }
    };

    const startProcessing = (batches) => {
        setSelectedBatches(batches);
        setShowModal(true);
    };

    const handleProcessSubmit = async (processingDetails) => {
        try {
            const { existingProcessing, batches, ...otherDetails } = processingDetails;

            const submissionData = {
                ...otherDetails,
                batchNo: batches[0].batchNo,
                cwsId: 1,
                existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
            };

            await axios.post(`${API_URL}/bagging-off`, submissionData);

            fetchProcessingBatches();

            alert('Bagging off processed successfully');
        } catch (error) {
            console.error('Bagging off submission error:', error);
            alert('Failed to process bagging off');
        }
    };

    if (loading) return <div>Loading processing batches...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <ProcessingBatchModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                batches={selectedBatches}
                onSubmit={handleProcessSubmit}
            />

              <Tabs 
                defaultActiveKey="pending" 
                className="mb-3"
                variant="pills"
            >
                <Tab eventKey="pending" style={{ color: processingTheme.primary }} title="Pending Batches">
                    <Card>
                        <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                            <h2 style={{ color: processingTheme.primary }}>Processing Batches</h2>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead style={{ backgroundColor: processingTheme.neutral }}>
                                        <tr>
                                            <th>Batch No</th>
                                            <th>Total KGs</th>
                                            <th>Grade</th>
                                            <th>CWS</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processingBatches.map((batch) => (
                                            <tr key={batch.id}>
                                                <td>{batch.batchNo}</td>
                                                <td>{batch.totalKgs.toFixed(2)} kg</td>
                                                <td>{batch.grade}</td>
                                                <td>{batch.cws}</td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            backgroundColor: processingTheme.secondary,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {batch.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => startProcessing(batch.batches)}
                                                        style={{
                                                            color: processingTheme.primary,
                                                            borderColor: processingTheme.primary,
                                                            backgroundColor: 'transparent'
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
                </Tab>
                <Tab eventKey="completed" title="Completed Batches">
                    <CompletedBaggingOffList />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ProcessingList;