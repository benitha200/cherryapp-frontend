// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, Button, Modal, Placeholder } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// const processingTheme = {
//     primary: '#008080',    // Sucafina teal
//     secondary: '#4FB3B3',  // Lighter teal
//     neutral: '#E6F3F3',    // Very light teal
//     tableHover: '#F8FAFA', // Ultra light teal for table hover
//     centralStation: '#008080'  // Main teal for central station badge
// };

// const LoadingSkeleton = () => {
//     const placeholderStyle = {
//       opacity: 0.4,
//       backgroundColor: processingTheme.secondary
//     };
  
//     return (
//       <Card>
//         <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//           <Placeholder as="h2" animation="glow">
//             <Placeholder xs={4} style={placeholderStyle} />
//           </Placeholder>
//         </Card.Header>
//         <Card.Body className="p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead style={{
//                 backgroundColor: processingTheme.neutral,
//                 color: processingTheme.centralStation
//               }}>
//                 <tr>
//                   <th>Batch No</th>
//                   <th>Processing Type</th>
//                   <th>Total Processing KGs</th>
//                   <th>Output KGs</th>
//                   <th>Total Output KGs</th>
//                   <th>CWS</th>
//                   <th>Date</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[...Array(5)].map((_, index) => (
//                   <tr 
//                     key={index}
//                     style={{
//                       backgroundColor: processingTheme.tableHover,
//                       transition: 'background-color 0.3s ease'
//                     }}
//                   >
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={6} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={8} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={4} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={3} style={placeholderStyle} />
//                         <Placeholder xs={3} style={placeholderStyle} />
//                         <Placeholder xs={3} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={4} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={5} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={6} style={placeholderStyle} />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Placeholder animation="glow">
//                         <Placeholder xs={4} style={placeholderStyle} className="rounded-pill" />
//                       </Placeholder>
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         disabled
//                         style={{
//                           color: processingTheme.primary,
//                           borderColor: processingTheme.primary,
//                           opacity: 0.4,
//                           backgroundColor: 'transparent',
//                           cursor: 'default'
//                         }}
//                       >
//                         Transfer
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card.Body>
//       </Card>
//     );
// };

// const Transfer = () => {
//     const [untransferredRecords, setUntransferredRecords] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [showTransferModal, setShowTransferModal] = useState(false);
//     const [selectedRecord, setSelectedRecord] = useState(null);
//     const userInfo = JSON.parse(localStorage.getItem('user'));

//     useEffect(() => {
//         fetchUntransferredRecords();
//     }, []);

//     const fetchUntransferredRecords = async () => {
//         try {
//             const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
//             // Filter records with empty transfers array
//             const untransferred = response.data.filter(record => record.transfers.length === 0);
//             setUntransferredRecords(untransferred);
//             setLoading(false);
//         } catch (error) {
//             setError('Error fetching untransferred records');
//             setLoading(false);
//         }
//     };

//     const handleTransferClick = (record) => {
//         setSelectedRecord(record);
//         setShowTransferModal(true);
//     };

//     const handleTransferConfirm = async () => {
//         try {
//             await axios.post(`${API_URL}/transfer`, {
//                 baggingOffId: selectedRecord.id,
//                 batchNo: selectedRecord.batchNo,
//                 date: new Date().toISOString()
//             });
            
//             await fetchUntransferredRecords();
//             setShowTransferModal(false);
//             alert('Transfer completed successfully');
//         } catch (error) {
//             console.error('Transfer error:', error);
//             alert('Failed to complete transfer');
//         }
//     };

//     const renderOutputKgs = (outputKgs) => {
//         // Handle outputKgs as an object directly, no need for JSON.parse
//         return Object.entries(outputKgs).map(([grade, kg]) => (
//             <div key={grade}>{grade}: {kg} kg</div>
//         ));
//     };

//     if (loading) return <LoadingSkeleton />;
//     if (error) return <div className="alert alert-danger">{error}</div>;

//     return (
//         <div className="container-fluid py-4">
//             <Card>
//                 <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//                     <span className='h5' style={{ color: processingTheme.primary }}>Ready to Transfer Batches</span>
//                 </Card.Header>
//                 <Card.Body className="p-0">
//                     <div className="table-responsive">
//                         <table className="table table-hover mb-0">
//                             <thead style={{
//                                 backgroundColor: processingTheme.neutral,
//                                 color: processingTheme.centralStation
//                             }}>
//                                 <tr>
//                                     <th>Batch No</th>
//                                     <th>Processing Type</th>
//                                     <th>Total Processing KGs</th>
//                                     <th>Output KGs</th>
//                                     <th>Total Output KGs</th>
//                                     <th>CWS</th>
//                                     <th>Date</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {untransferredRecords.length === 0 ? (
//                                     <tr>
//                                         <td 
//                                             colSpan="9" 
//                                             className="text-center py-4"
//                                             style={{ 
//                                                 backgroundColor: processingTheme.tableHover,
//                                                 color: processingTheme.primary,
//                                                 fontSize: '1.1em'
//                                             }}
//                                         >
//                                             No Ready to Transfer batches found
//                                         </td>
//                                     </tr>
//                                 ) : (untransferredRecords.map((record) => (
//                                     <tr
//                                         key={record.id}
//                                         style={{
//                                             backgroundColor: processingTheme.tableHover,
//                                             transition: 'background-color 0.3s ease'
//                                         }}
//                                     >
//                                         <td>{record.batchNo}</td>
//                                         <td>{record.processingType}</td>
//                                         <td>{record.processing.totalKgs.toFixed(2)} kg</td>
//                                         <td>{renderOutputKgs(record.outputKgs)}</td>
//                                         <td>{record.totalOutputKgs} kg</td>
//                                         <td>{record.processing.cws.name}</td>
//                                         <td>{new Date(record.date).toLocaleDateString()}</td>
//                                         <td>
//                                             <span
//                                                 className="badge"
//                                                 style={{
//                                                     backgroundColor: processingTheme.primary,
//                                                     color: 'white'
//                                                 }}
//                                             >
//                                                 {record.status}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             <Button
//                                                 variant="outline-primary"
//                                                 size="sm"
//                                                 onClick={() => handleTransferClick(record)}
//                                                 style={{
//                                                     color: processingTheme.primary,
//                                                     borderColor: processingTheme.primary,
//                                                     backgroundColor: 'transparent'
//                                                 }}
//                                             >
//                                                 Transfer
//                                             </Button>
//                                         </td>
//                                     </tr>
//                                 )))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </Card.Body>
//             </Card>

//             {/* Transfer Confirmation Modal */}
//             <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
//                 <Modal.Header 
//                     closeButton
//                     style={{ backgroundColor: processingTheme.neutral }}
//                 >
//                     <Modal.Title style={{ color: processingTheme.primary }}>Confirm Transfer</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     {selectedRecord && (
//                         <div>
//                             <p>Are you sure you want to transfer batch {selectedRecord.batchNo}?</p>
//                             <p><strong>Processing Type:</strong> {selectedRecord.processing.processingType}</p>
//                             <p><strong>Total KGs:</strong> {selectedRecord.processing.totalKgs.toFixed(2)} kg</p>
//                             <p><strong>FROM: </strong> {selectedRecord.processing.cws.name}</p>
//                             <p><strong>TO: </strong> RWACOF HQ</p>
//                         </div>
//                     )}
//                 </Modal.Body>
//                 <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
//                     <Button 
//                         variant="secondary" 
//                         onClick={() => setShowTransferModal(false)}
//                         style={{
//                             backgroundColor: processingTheme.secondary,
//                             borderColor: processingTheme.secondary
//                         }}
//                     >
//                         Cancel
//                     </Button>
//                     <Button 
//                         variant="primary" 
//                         onClick={handleTransferConfirm}
//                         style={{
//                             backgroundColor: processingTheme.primary,
//                             borderColor: processingTheme.primary
//                         }}
//                     >
//                         Confirm Transfer
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//         </div>
//     );
// };

// export default Transfer;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Placeholder } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
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
                                {['Batch No', 'Processing Type', 'Total KGs', 'Output KGs', 'Total Output KGs', 'Outturn', 'CWS', 'Date', 'Status', 'Actions'].map((header) => (
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
                                    {[...Array(10)].map((_, cellIdx) => (
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

const Transfer = () => {
    const [groupedRecords, setGroupedRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchUntransferredRecords();
    }, []);

    const fetchUntransferredRecords = async () => {
        try {
            const response = await axios.get(`${API_URL}/bagging-off/cws/${userInfo.cwsId}`);
            // Filter records with empty transfers array
            const untransferred = response.data.filter(record => record.transfers.length === 0);
            
            // Group records by base batch number (ignoring suffixes like -1, -2)
            const grouped = untransferred.reduce((acc, record) => {
                const baseBatchNo = record.batchNo.split('-')[0]; // Extract base batch number
                if (!acc[baseBatchNo]) {
                    acc[baseBatchNo] = [];
                }
                acc[baseBatchNo].push(record);
                return acc;
            }, {});
            
            setGroupedRecords(grouped);
            setLoading(false);
        } catch (error) {
            setError('Error fetching untransferred records');
            setLoading(false);
        }
    };

    const handleTransferClick = (batchRecords) => {
        setSelectedBatch(batchRecords);
        setShowTransferModal(true);
    };

    const handleTransferConfirm = async () => {
        try {
            // Create transfer records for all processing types in the batch
            await Promise.all(selectedBatch.map(record => 
                axios.post(`${API_URL}/transfer`, {
                    baggingOffId: record.id,
                    batchNo: record.batchNo,
                    date: new Date().toISOString()
                })
            ));
            
            await fetchUntransferredRecords();
            setShowTransferModal(false);
            alert('Transfer completed successfully');
        } catch (error) {
            console.error('Transfer error:', error);
            alert('Failed to complete transfer');
        }
    };

    const renderOutputKgs = (outputKgs) => {
        return Object.entries(outputKgs).map(([grade, kg]) => (
            <div key={grade} className="small">
                {grade}: {kg} kg
            </div>
        ));
    };

    const calculateOutturn = (records) => {
        const totalProcessingKgs = records.reduce((sum, record) => {
            if (record.processingType !== 'NATURAL') {
                return sum + record.processing.totalKgs;
            }
            return sum;
        }, 0);

        const totalOutputKgs = records.reduce((sum, record) => {
            if (record.processingType !== 'NATURAL') {
                return sum + record.totalOutputKgs;
            }
            return sum;
        }, 0);

        return totalProcessingKgs > 0 ? ((totalOutputKgs / totalProcessingKgs) * 100).toFixed(2) : 'N/A';
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <Card>
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className="h5" style={{ color: processingTheme.primary }}>
                        Ready to Transfer Batches
                    </span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: processingTheme.neutral }}>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Processing Types</th>
                                    <th>Total Processing KGs</th>
                                    <th>Output KGs</th>
                                    <th>Total Output KGs</th>
                                    <th>Outturn</th>
                                    <th>CWS</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedRecords).map(([baseBatchNo, records]) => (
                                    <tr key={baseBatchNo}>
                                        <td>
                                            <strong>{baseBatchNo}</strong>
                                            <div className="small text-muted">
                                                {records.map(record => record.batchNo).join(', ')}
                                            </div>
                                        </td>
                                        <td>
                                            {records.map(record => (
                                                <div key={record.id} className="small">
                                                    {record.processingType}
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            {records.map(record => (
                                                <div key={record.id} className="small">
                                                    {record.processing.totalKgs.toFixed(2)} kg
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            {records.map(record => (
                                                <div key={record.id} className="mb-2">
                                                    {renderOutputKgs(record.outputKgs)}
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            {records.reduce((sum, record) => sum + record.totalOutputKgs, 0)} kg
                                        </td>
                                        <td>
                                            {calculateOutturn(records)}%
                                        </td>
                                        <td>{records[0].processing.cws.name}</td>
                                        <td>{new Date(records[0].date).toLocaleDateString()}</td>
                                        <td>
                                            <span 
                                                className="badge"
                                                style={{ 
                                                    backgroundColor: processingTheme.primary,
                                                    color: 'white'
                                                }}
                                            >
                                                {records[0].status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleTransferClick(records)}
                                                style={{
                                                    color: processingTheme.primary,
                                                    borderColor: processingTheme.primary
                                                }}
                                            >
                                                Transfer
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
                <Modal.Header 
                    closeButton
                    style={{ backgroundColor: processingTheme.neutral }}
                >
                    <Modal.Title style={{ color: processingTheme.primary }}>
                        Confirm Transfer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBatch && (
                        <div>
                            <p>Are you sure you want to transfer batch {selectedBatch[0].batchNo.split('-')[0]}?</p>
                            <div className="mt-3">
                                <p><strong>Processing Types:</strong></p>
                                {selectedBatch.map(record => (
                                    <div key={record.id} className="ml-3">
                                        - {record.processingType} ({record.totalOutputKgs} kg)
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3">
                                <strong>FROM:</strong> {selectedBatch[0].processing.cws.name}
                            </p>
                            <p><strong>TO:</strong> RWACOF HQ</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
                    <Button 
                        variant="secondary"
                        onClick={() => setShowTransferModal(false)}
                        style={{
                            backgroundColor: processingTheme.secondary,
                            borderColor: processingTheme.secondary
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={handleTransferConfirm}
                        style={{
                            backgroundColor: processingTheme.primary,
                            borderColor: processingTheme.primary
                        }}
                    >
                        Confirm Transfer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Transfer;