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
// }

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
//   };

// const Transfer = () => {
//     const [completedBaggingOffRecords, setCompletedBaggingOffRecords] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [showTransferModal, setShowTransferModal] = useState(false);
//     const [selectedRecord, setSelectedRecord] = useState(null);

//     useEffect(() => {
//         fetchCompletedBaggingOffRecords();
//     }, []);

//     const fetchCompletedBaggingOffRecords = async () => {
//         try {
//             const response = await axios.get(`${API_URL}/bagging-off`);
//             const completedRecords = response.data.filter(record => record.status === 'COMPLETED');
//             setCompletedBaggingOffRecords(completedRecords);
//             setLoading(false);
//         } catch (error) {
//             setError('Error fetching completed bagging off records');
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
            
//             // Refresh the data after transfer
//             await fetchCompletedBaggingOffRecords();
//             setShowTransferModal(false);
//             alert('Transfer completed successfully');
//         } catch (error) {
//             console.error('Transfer error:', error);
//             alert('Failed to complete transfer');
//         }
//     };

//     const renderOutputKgs = (outputKgsJson) => {
//         const outputKgs = JSON.parse(outputKgsJson);
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
//                     <h2 style={{ color: processingTheme.primary }}>Completed Batches</h2>
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
//                                 {completedBaggingOffRecords.length === 0 ? (
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
//                                 ) : (completedBaggingOffRecords.map((record) => (
//                                     <tr
//                                         key={record.id}
//                                         style={{
//                                             backgroundColor: processingTheme.tableHover,
//                                             transition: 'background-color 0.3s ease'
//                                         }}
//                                     >
//                                         <td>{record.batchNo}</td>
//                                         <td>{record.processing.processingType}</td>
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
//                             <p><strong>CWS:</strong> {selectedRecord.processing.cws.name}</p>
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
    centralStation: '#008080'  // Main teal for central station badge
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr 
                    key={index}
                    style={{
                      backgroundColor: processingTheme.tableHover,
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={6} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={8} style={placeholderStyle} />
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
                        <Placeholder xs={3} style={placeholderStyle} />
                        <Placeholder xs={3} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={4} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={5} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={6} style={placeholderStyle} />
                      </Placeholder>
                    </td>
                    <td>
                      <Placeholder animation="glow">
                        <Placeholder xs={4} style={placeholderStyle} className="rounded-pill" />
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
    );
};

const Transfer = () => {
    const [untransferredRecords, setUntransferredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchUntransferredRecords();
    }, []);

    const fetchUntransferredRecords = async () => {
        try {
            const response = await axios.get(`${API_URL}/bagging-off`);
            // Filter out records that have already been transferred
            const untransferred = response.data.filter(record => record.transfer === null);
            setUntransferredRecords(untransferred);
            setLoading(false);
        } catch (error) {
            setError('Error fetching untransferred records');
            setLoading(false);
        }
    };

    const handleTransferClick = (record) => {
        setSelectedRecord(record);
        setShowTransferModal(true);
    };

    const handleTransferConfirm = async () => {
        try {
            await axios.post(`${API_URL}/transfer`, {
                baggingOffId: selectedRecord.id,
                batchNo: selectedRecord.batchNo,
                date: new Date().toISOString()
            });
            
            // Refresh the data after transfer
            await fetchUntransferredRecords();
            setShowTransferModal(false);
            alert('Transfer completed successfully');
        } catch (error) {
            console.error('Transfer error:', error);
            alert('Failed to complete transfer');
        }
    };

    const renderOutputKgs = (outputKgsJson) => {
        const outputKgs = JSON.parse(outputKgsJson);
        return Object.entries(outputKgs).map(([grade, kg]) => (
            <div key={grade}>{grade}: {kg} kg</div>
        ));
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <Card>
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className='h5' style={{ color: processingTheme.primary }}>Ready to Transfer Batches</span>
                </Card.Header>
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {untransferredRecords.length === 0 ? (
                                    <tr>
                                        <td 
                                            colSpan="9" 
                                            className="text-center py-4"
                                            style={{ 
                                                backgroundColor: processingTheme.tableHover,
                                                color: processingTheme.primary,
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            No Ready to Transfer batches found
                                        </td>
                                    </tr>
                                ) : (untransferredRecords.map((record) => (
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
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleTransferClick(record)}
                                                style={{
                                                    color: processingTheme.primary,
                                                    borderColor: processingTheme.primary,
                                                    backgroundColor: 'transparent'
                                                }}
                                            >
                                                Transfer
                                            </Button>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            {/* Transfer Confirmation Modal */}
            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
                <Modal.Header 
                    closeButton
                    style={{ backgroundColor: processingTheme.neutral }}
                >
                    <Modal.Title style={{ color: processingTheme.primary }}>Confirm Transfer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <div>
                            <p>Are you sure you want to transfer batch {selectedRecord.batchNo}?</p>
                            <p><strong>Processing Type:</strong> {selectedRecord.processing.processingType}</p>
                            <p><strong>Total KGs:</strong> {selectedRecord.processing.totalKgs.toFixed(2)} kg</p>
                            <p><strong>CWS:</strong> {selectedRecord.processing.cws.name}</p>
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