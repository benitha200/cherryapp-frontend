// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Modal, Button, Form, Row, Col, Card, Tab, Tabs, Placeholder } from 'react-bootstrap';
// import API_URL from '../constants/Constants';

// const processingTheme = {
//     primary: '#008080',    // Sucafina teal
//     secondary: '#4FB3B3',  // Lighter teal
//     accent: '#D95032',     // Complementary orange
//     neutral: '#E6F3F3',    // Very light teal
//     tableHover: '#F8FAFA', // Ultra light teal for table hover
//     directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
//     centralStation: '#008080'  // Main teal for central station badge
// };

// const LoadingSkeleton = () => {
//     const placeholderStyle = {
//         opacity: 0.4,
//         backgroundColor: processingTheme.secondary
//     };

//     return (
//         <Card>
//             <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//                 <Placeholder as="h2" animation="glow">
//                     <Placeholder xs={4} style={placeholderStyle} />
//                 </Placeholder>
//             </Card.Header>
//             <Card.Body className="p-0">
//                 <div className="table-responsive">
//                     <table className="table mb-0">
//                         <thead style={{ backgroundColor: processingTheme.neutral }}>
//                             <tr>
//                                 <th>Batch No</th>
//                                 <th>Total KGs</th>
//                                 <th>CWS</th>
//                                 <th>Status</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {[...Array(5)].map((_, index) => (
//                                 <tr key={index}>
//                                     <td>
//                                         <Placeholder animation="glow">
//                                             <Placeholder xs={6} style={placeholderStyle} />
//                                         </Placeholder>
//                                     </td>
//                                     <td>
//                                         <Placeholder animation="glow">
//                                             <Placeholder xs={4} style={placeholderStyle} />
//                                         </Placeholder>
//                                     </td>
//                                     <td>
//                                         <Placeholder animation="glow">
//                                             <Placeholder xs={3} style={placeholderStyle} />
//                                         </Placeholder>
//                                     </td>
//                                     <td>
//                                         <Placeholder animation="glow">
//                                             <Placeholder xs={5} style={placeholderStyle} />
//                                         </Placeholder>
//                                     </td>
//                                     <td>
//                                         <Button
//                                             variant="outline-primary"
//                                             size="sm"
//                                             disabled
//                                             style={{
//                                                 color: processingTheme.primary,
//                                                 borderColor: processingTheme.primary,
//                                                 opacity: 0.4,
//                                                 backgroundColor: 'transparent',
//                                                 cursor: 'default'
//                                             }}
//                                         >
//                                             Bag Off
//                                         </Button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card.Body>
//         </Card>
//     );
// };

// const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit }) => {
//     const [existingProcessing, setExistingProcessing] = useState(null);
//     const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//     const [honeyOutputKgs, setHoneyOutputKgs] = useState({ H1: '' });
//     const [naturalOutputKgs, setNaturalOutputKgs] = useState({
//         N1: '', N2: '', B1: '', B2: ''
//     });
//     const [fullyWashedOutputKgs, setFullyWashedOutputKgs] = useState({
//         A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
//     });
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (show && batches && batches.length > 0) {
//             fetchExistingProcessingDetails(batches[0].batchNo);
//             resetOutputs();
//         } else {
//             resetModalState();
//         }
//     }, [show, batches]);

//     const resetOutputs = () => {
//         setHoneyOutputKgs({ H1: '' });
//         setNaturalOutputKgs({
//             N1: '', N2: '', B1: '', B2: ''
//         });
//         setFullyWashedOutputKgs({
//             A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''  // Added B1 and B2
//         });
//     };

//     const resetModalState = () => {
//         setSelectedDate(new Date().toISOString().split('T')[0]);
//         resetOutputs();
//         setExistingProcessing(null);
//     };

//     const fetchExistingProcessingDetails = async (batchNo) => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${API_URL}/processing/batch/${batchNo}`);

//             if (response.data && response.data.length > 0) {
//                 setExistingProcessing(response.data[0]);
//             }
//         } catch (error) {
//             console.error('Error fetching processing details:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (show && batches && batches.length > 0) {
//             fetchExistingProcessingDetails(batches[0].batchNo);
//             resetOutputs();
//         } else {
//             resetModalState();
//         }
//     }, [show, batches]);

//     const handleHoneyOutputChange = (value) => {
//         setHoneyOutputKgs({ H1: value });
//     };

//     const handleNaturalOutputChange = (field, value) => {
//         setNaturalOutputKgs(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleFullyWashedOutputChange = (field, value) => {
//         setFullyWashedOutputKgs(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleSubmit = () => {
//         if (!batches || batches.length === 0) return;

//         const batch = batches[0];
//         const processingType = batch.processingType?.toUpperCase();
//         const batchNo = batch.batchNo;

//         if (processingType === 'HONEY') {
//             const honeySubmission = {
//                 date: selectedDate,
//                 outputKgs: honeyOutputKgs,
//                 processingType: 'HONEY',
//                 existingProcessing,
//                 batches
//             };

//             const fullyWashedSubmission = {
//                 date: selectedDate,
//                 outputKgs: fullyWashedOutputKgs,
//                 processingType: 'FULLY WASHED',
//                 existingProcessing,
//                 batches
//             };

//             onSubmit([honeySubmission, fullyWashedSubmission]);
//         } else if (processingType === 'NATURAL') {
//             let outputData = {};
//             if (batchNo.endsWith('-1') || batchNo.endsWith('A')) {
//                 outputData = {
//                     N1: naturalOutputKgs.N1,
//                     N2: naturalOutputKgs.N2
//                 };
//             } else if (batchNo.endsWith('-2') || batchNo.endsWith('B')) {
//                 outputData = {
//                     B1: naturalOutputKgs.B1,
//                     B2: naturalOutputKgs.B2
//                 };
//             }

//             const naturalSubmission = {
//                 date: selectedDate,
//                 outputKgs: outputData,
//                 processingType: 'NATURAL',
//                 existingProcessing,
//                 batches
//             };
//             onSubmit([naturalSubmission]);
//         } else {
//             let outputData = {};
//             if (batchNo.endsWith('-2') || batchNo.endsWith('B')) {
//                 outputData = {
//                     B1: fullyWashedOutputKgs.B1,
//                     B2: fullyWashedOutputKgs.B2
//                 };
//             } else {
//                 outputData = {
//                     A0: fullyWashedOutputKgs.A0,
//                     A1: fullyWashedOutputKgs.A1,
//                     A2: fullyWashedOutputKgs.A2,
//                     A3: fullyWashedOutputKgs.A3
//                 };
//             }

//             const fullyWashedSubmission = {
//                 date: selectedDate,
//                 outputKgs: outputData,
//                 processingType: 'FULLY WASHED',
//                 existingProcessing,
//                 batches
//             };
//             onSubmit([fullyWashedSubmission]);
//         }
//         handleClose();
//     };

//     // Render modal content here
//     return (
//         <Modal show={show} onHide={handleClose} size="lg">
//             <Modal.Header
//                 closeButton
//                 style={{
//                     backgroundColor: processingTheme.neutral,
//                     borderBottom: `1px solid ${processingTheme.primary}`
//                 }}
//             >
//                 <Modal.Title style={{ color: processingTheme.primary }}>
//                     Bagging Off Details {loading && '(Loading...)'}
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 {existingProcessing && (
//                     <div className="mb-4 p-3 border rounded"
//                         style={{
//                             backgroundColor: processingTheme.neutral,
//                             borderColor: processingTheme.secondary
//                         }}>
//                         <h5 style={{ color: processingTheme.primary }}>Processing Details</h5>
//                         <Row>
//                             <Col md={4}>
//                                 <strong>Batch No:</strong> {existingProcessing.batchNo}
//                             </Col>
//                             <Col md={4}>
//                                 <strong>Processing Type:</strong> {existingProcessing.processingType}
//                             </Col>
//                             <Col md={4}>
//                                 <strong>Total KGs:</strong> {existingProcessing.totalKgs}
//                             </Col>
//                         </Row>
//                     </div>
//                 )}
//                 <Form>
//                     <Form.Group className="mb-3">
//                         <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
//                         <Form.Control
//                             type="date"
//                             value={selectedDate}
//                             onChange={() => { }}
//                             readOnly
//                             style={{
//                                 borderColor: processingTheme.secondary,
//                                 backgroundColor: processingTheme.neutral
//                             }}
//                         />
//                     </Form.Group>

//                     {/* Honey Processing Section */}
//                     {batches?.[0]?.processingType?.toUpperCase() === 'HONEY' && (
//                         <>
//                             <div className="mb-4">
//                                 <Form.Label style={{ color: processingTheme.primary }}>
//                                     Honey Processing Output
//                                 </Form.Label>
//                                 <Row>
//                                     <Col md={12}>
//                                         <Form.Control
//                                             type="number"
//                                             placeholder="H1 KGs"
//                                             value={honeyOutputKgs.H1}
//                                             onChange={(e) => handleHoneyOutputChange(e.target.value)}
//                                             required
//                                             style={{
//                                                 borderColor: processingTheme.secondary,
//                                                 ':focus': { borderColor: processingTheme.primary }
//                                             }}
//                                         />
//                                     </Col>
//                                 </Row>
//                             </div>

//                             <div className="mb-3">
//                                 <div className="d-flex justify-content-between align-items-center mb-2">
//                                     <Form.Label style={{ color: processingTheme.primary, marginBottom: 0 }}>
//                                         Fully Washed Processing Output
//                                     </Form.Label>
//                                     <span style={{
//                                         fontSize: '0.875rem',
//                                         color: processingTheme.accent
//                                     }}>
//                                         Will be processed as Fully Washed
//                                     </span>
//                                 </div>
//                                 <Row>
//                                     {['A0', 'A1', 'A2', 'A3'].map((field) => (
//                                         <Col md={3} key={field} className="mb-2">
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder={`${field} KGs`}
//                                                 value={fullyWashedOutputKgs[field]}
//                                                 onChange={(e) => handleFullyWashedOutputChange(field, e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                     ))}
//                                 </Row>
//                             </div>
//                         </>
//                     )}

//                     {/* Natural Processing Section */}
//                     {batches?.[0]?.processingType?.toUpperCase() === 'NATURAL' && (
//                         <div className="mb-4">
//                             <Form.Label style={{ color: processingTheme.primary }}>
//                                 Natural Processing Output
//                             </Form.Label>
//                             <Row>
//                                 {(batches[0].batchNo.endsWith('-1') || batches[0].batchNo.endsWith('A')) ? (
//                                     <>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="N1 KGs"
//                                                 value={naturalOutputKgs.N1}
//                                                 onChange={(e) => handleNaturalOutputChange('N1', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="N2 KGs"
//                                                 value={naturalOutputKgs.N2}
//                                                 onChange={(e) => handleNaturalOutputChange('N2', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="B1 KGs"
//                                                 value={naturalOutputKgs.B1}
//                                                 onChange={(e) => handleNaturalOutputChange('B1', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="B2 KGs"
//                                                 value={naturalOutputKgs.B2}
//                                                 onChange={(e) => handleNaturalOutputChange('B2', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                     </>
//                                 )}
//                             </Row>
//                         </div>
//                     )}

//                     {/* Fully Washed Processing Section */}
//                     {batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
//                         <div className="mb-3">
//                             <Form.Label style={{ color: processingTheme.primary }}>
//                                 Fully Washed Processing Output
//                             </Form.Label>
//                             <Row>
//                                 {batches[0].batchNo.endsWith('-2') || batches[0].batchNo.endsWith('B') ? (
//                                     <>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="B1 KGs"
//                                                 value={fullyWashedOutputKgs.B1}
//                                                 onChange={(e) => handleFullyWashedOutputChange('B1', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                         <Col md={6}>
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder="B2 KGs"
//                                                 value={fullyWashedOutputKgs.B2}
//                                                 onChange={(e) => handleFullyWashedOutputChange('B2', e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                     </>
//                                 ) : (
//                                     ['A0', 'A1', 'A2', 'A3'].map((field) => (
//                                         <Col md={3} key={field} className="mb-2">
//                                             <Form.Control
//                                                 type="number"
//                                                 placeholder={`${field} KGs`}
//                                                 value={fullyWashedOutputKgs[field]}
//                                                 onChange={(e) => handleFullyWashedOutputChange(field, e.target.value)}
//                                                 required
//                                                 style={{
//                                                     borderColor: processingTheme.secondary,
//                                                     ':focus': { borderColor: processingTheme.primary }
//                                                 }}
//                                             />
//                                         </Col>
//                                     ))
//                                 )}
//                             </Row>
//                         </div>
//                     )}

//                 </Form>
//             </Modal.Body>
//             <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
//                 <Button
//                     variant="secondary"
//                     onClick={handleClose}
//                     style={{
//                         backgroundColor: processingTheme.secondary,
//                         borderColor: processingTheme.secondary
//                     }}
//                 >
//                     Close
//                 </Button>
//                 <Button
//                     variant="primary"
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     style={{
//                         backgroundColor: processingTheme.primary,
//                         borderColor: processingTheme.primary
//                     }}
//                 >
//                     Submit Bagging Off
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// const ProcessingList = () => {
//     const [processingBatches, setProcessingBatches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [showModal, setShowModal] = useState(false);
//     const [selectedBatches, setSelectedBatches] = useState([]);
//     const userInfo = JSON.parse(localStorage.getItem('user'));

//     const shouldHideGradeColumn = (batches) => {
//         if (!batches || batches.length === 0) return false;
//         return batches.some(batch => batch.batchNo && batch.batchNo.includes('-'));
//     };

//     useEffect(() => {
//         fetchProcessingBatches();
//     }, []);

//     const fetchProcessingBatches = async () => {
//         try {
//             const res = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`);
//             const mappedBatches = res.data
//                 .filter(processing => processing.status !== 'COMPLETED')
//                 .map(processing => ({
//                     id: processing.id,
//                     batchNo: processing.batchNo,
//                     totalKgs: processing.totalKgs,
//                     grade: processing.grade,
//                     cws: processing.cws.name,
//                     status: processing.status,
//                     processingType: processing.processingType,
//                     batches: [processing]
//                 }));
//             setProcessingBatches(mappedBatches);
//             setLoading(false);
//         } catch (error) {
//             setError('Error fetching processing batches');
//             setLoading(false);
//         }
//     };

//     const startProcessing = (batches) => {
//         setSelectedBatches(batches);
//         setShowModal(true);
//     };

//     const handleProcessSubmit = async (processingDetailsArray) => {
//         try {
//             if (!userInfo?.cwsId) {
//                 throw new Error('User CWS ID not found');
//             }

//             for (const processingDetails of processingDetailsArray) {
//                 const { existingProcessing, batches, ...otherDetails } = processingDetails;

//                 const submissionData = {
//                     ...otherDetails,
//                     batchNo: batches[0].batchNo,
//                     cwsId: userInfo.cwsId,
//                     existingProcessing: existingProcessing ? { id: existingProcessing.id } : null
//                 };

//                 await axios.post(`${API_URL}/bagging-off`, submissionData);
//             }

//             fetchProcessingBatches();
//             alert('Bagging off processed successfully');
//         } catch (error) {
//             console.error('Bagging off submission error:', error);
//             alert(error.message || 'Failed to process bagging off');
//         }
//     };

//     const hideGradeColumn = shouldHideGradeColumn(processingBatches);

//     if (loading) return <LoadingSkeleton />;
//     if (error) return <div className="alert alert-danger">{error}</div>;

//     return (
//         <div className="container-fluid py-4">
//             <ProcessingBatchModal
//                 show={showModal}
//                 handleClose={() => setShowModal(false)}
//                 batches={selectedBatches}
//                 onSubmit={handleProcessSubmit}
//             />

//             <Card>
//                 <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
//                     <span className='h5' style={{ color: processingTheme.primary }}>Processing Batches</span>
//                 </Card.Header>
//                 <Card.Body className="p-0">
//                     <div className="table-responsive">
//                         <table className="table mb-0">
//                             <thead style={{ backgroundColor: processingTheme.neutral }}>
//                                 <tr>
//                                     <th>Batch No</th>
//                                     <th>Total KGs</th>
//                                     {!hideGradeColumn && <th>Grade</th>}
//                                     <th>CWS</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {processingBatches.length === 0 ? (
//                                     <tr>
//                                         <td
//                                             colSpan={hideGradeColumn ? 5 : 6}
//                                             className="text-center py-4"
//                                             style={{
//                                                 backgroundColor: processingTheme.tableHover,
//                                                 color: processingTheme.primary,
//                                                 fontSize: '1.1em'
//                                             }}
//                                         >
//                                             No Processing batches found!
//                                         </td>
//                                     </tr>
//                                 ) : (processingBatches.map((batch) => (
//                                     <tr key={batch.id}>
//                                         <td>{batch.batchNo}</td>
//                                         <td>{batch?.totalKgs.toLocaleString()} kg</td>
//                                         {!hideGradeColumn && <td>{batch.grade}</td>}
//                                         <td>{batch.cws}</td>
//                                         <td>
//                                             <span
//                                                 className="badge"
//                                                 style={{
//                                                     backgroundColor: processingTheme.secondary,
//                                                     color: 'white'
//                                                 }}
//                                             >
//                                                 {batch.status}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             <Button
//                                                 variant="outline-primary"
//                                                 size="sm"
//                                                 onClick={() => startProcessing(batch.batches)}
//                                                 style={{
//                                                     color: processingTheme.primary,
//                                                     borderColor: processingTheme.primary,
//                                                     backgroundColor: 'transparent'
//                                                 }}
//                                             >
//                                                 Bag Off
//                                             </Button>
//                                         </td>
//                                     </tr>
//                                 )))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </Card.Body>
//             </Card>
//         </div>
//     );
// };

// export default ProcessingList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Card, Tab, Tabs, Placeholder } from 'react-bootstrap';
import API_URL from '../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    accent: '#D95032',     // Complementary orange
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
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

const ProcessingBatchModal = ({ show, handleClose, batches, onSubmit, onComplete }) => {
    const [existingProcessing, setExistingProcessing] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [honeyOutputKgs, setHoneyOutputKgs] = useState({ H1: '' });
    const [naturalOutputKgs, setNaturalOutputKgs] = useState({
        N1: '', N2: '', B1: '', B2: ''
    });
    const [fullyWashedOutputKgs, setFullyWashedOutputKgs] = useState({
        A0: '', A1: '', A2: '', A3: '', B1: '', B2: ''
    });
    const [loading, setLoading] = useState(false);
    const [savedBaggingOffs, setSavedBaggingOffs] = useState([]);

    useEffect(() => {
        if (show && batches && batches.length > 0) {
            fetchExistingProcessingAndBaggingOffs(batches[0].batchNo);
        } else {
            resetModalState();
        }
    }, [show, batches]);

    const resetModalState = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        resetOutputs();
        setExistingProcessing(null);
        setSavedBaggingOffs([]);
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
                setSavedBaggingOffs(baggingOffsResponse.data);

                // Get the most recent bagging off data for each processing type
                const savedData = baggingOffsResponse.data.reduce((acc, curr) => {
                    if (!acc[curr.processingType] || new Date(curr.createdAt) > new Date(acc[curr.processingType].createdAt)) {
                        acc[curr.processingType] = curr;
                    }
                    return acc;
                }, {});

                // Populate form with saved data
                if (savedData['HONEY']) {
                    setHoneyOutputKgs(savedData['HONEY'].outputKgs);
                }
                if (savedData['NATURAL']) {
                    setNaturalOutputKgs(savedData['NATURAL'].outputKgs);
                }
                if (savedData['FULLY WASHED']) {
                    setFullyWashedOutputKgs(savedData['FULLY WASHED'].outputKgs);
                }

                // Set date from most recent bagging off
                const mostRecent = baggingOffsResponse.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                if (mostRecent) {
                    setSelectedDate(new Date(mostRecent.date).toISOString().split('T')[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    status
                });
            }

            // Add fully washed submission if applicable
            if (Object.values(fullyWashedOutputKgs).some(v => v !== '')) {
                submissions.push({
                    date: selectedDate,
                    outputKgs: fullyWashedOutputKgs,
                    processingType: 'FULLY WASHED',
                    existingProcessing,
                    batchNo,
                    status
                });
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
                    status
                });
            }
        }

        return submissions;
    };

    const prepareOutputData = (processingType, batchNo) => {
        const isSecondaryBatch = batchNo.endsWith('-2') || batchNo.endsWith('B');

        switch (processingType) {
            case 'NATURAL':
                return isSecondaryBatch ?
                    { B1: naturalOutputKgs.B1, B2: naturalOutputKgs.B2 } :
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
            const submissions = prepareSubmissionData(
                batches[0].processingType.toUpperCase(),
                'PENDING'
            );

            if (submissions.length === 0) {
                alert('Please enter at least one output value');
                return;
            }

            setLoading(true);
            const results = await Promise.all(
                submissions.map(submission =>
                    axios.post(`${API_URL}/bagging-off`, submission)
                )
            );

            // Update the saved bagging offs with the new data
            const newBaggingOffs = results.map(result => result.data);
            setSavedBaggingOffs(prev => [...newBaggingOffs, ...prev]);
            
            alert('Data saved successfully');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save data');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteBaggingOff = async () => {
        if (!batches?.[0]?.processingType) return;

        try {
            const submissions = prepareSubmissionData(
                batches[0].processingType.toUpperCase(),
                'COMPLETED'
            );

            if (submissions.length === 0) {
                alert('Please enter at least one output value');
                return;
            }

            setLoading(true);
            await Promise.all(
                submissions.map(submission =>
                    axios.post(`${API_URL}/bagging-off`, submission)
                )
            );

            // Call the onComplete callback to notify parent component
            if (onComplete && typeof onComplete === 'function') {
                onComplete(batches[0].batchNo);
            }
            
            handleClose();
            alert('Bagging off completed successfully');
        } catch (error) {
            console.error('Complete bagging off error:', error);
            alert('Failed to complete bagging off');
        } finally {
            setLoading(false);
        }
    };

    // Format the output KGs for display
    const formatOutputKgs = (outputKgs) => {
        if (!outputKgs || typeof outputKgs !== 'object') return 'No data';
        
        return Object.entries(outputKgs)
            .filter(([_, kg]) => kg && kg !== '') // Filter out empty values
            .map(([grade, kg]) => `${grade}: ${kg}kg`)
            .join(', ');
    };

    // Render modal content here
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

                {/* Saved Bagging Offs Summary */}
                {savedBaggingOffs.length > 0 && (
                    <div className="mb-4 p-3 border rounded"
                        style={{
                            backgroundColor: processingTheme.neutral,
                            borderColor: processingTheme.secondary
                        }}>
                        {/* <h5 style={{ color: processingTheme.primary }}>Saved Bagging Off History</h5>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Output KGs</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedBaggingOffs.map((baggingOff, index) => (
                                        <tr key={index}>
                                            <td>{new Date(baggingOff.date).toLocaleDateString()}</td>
                                            <td>{baggingOff.processingType}</td>
                                            <td>{formatOutputKgs(baggingOff.outputKgs)}</td>
                                            <td>
                                                <span className={`badge ${baggingOff.status === 'COMPLETED'
                                                        ? 'bg-success'
                                                        : 'bg-warning'
                                                    }`}>
                                                    {baggingOff.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> */}
                    </div>
                )}
                
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ color: processingTheme.primary }}>Bagging Off Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                borderColor: processingTheme.secondary,
                                backgroundColor: processingTheme.neutral
                            }}
                        />
                    </Form.Group>

                    {/* Honey Processing Section */}
                    {batches?.[0]?.processingType?.toUpperCase() === 'HONEY' && (
                        <>
                            <div className="mb-4">
                                <Form.Label style={{ color: processingTheme.primary }}>
                                    Honey Processing Output
                                </Form.Label>
                                <Row>
                                    <Col md={12}>
                                        <Form.Control
                                            type="number"
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
                    )}

                    {/* Natural Processing Section */}
                    {batches?.[0]?.processingType?.toUpperCase() === 'NATURAL' && (
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
                                                placeholder="B1 KGs"
                                                value={naturalOutputKgs.B1}
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
                                                placeholder="B2 KGs"
                                                value={naturalOutputKgs.B2}
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

                    {/* Fully Washed Processing Section */}
                    {batches?.[0]?.processingType?.toUpperCase() === 'FULLY_WASHED' && (
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
                                    ['A0', 'A1', 'A2', 'A3'].map((field) => (
                                        <Col md={3} key={field} className="mb-2">
                                            <Form.Control
                                                type="number"
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
                                    ))
                                )}
                            </Row>
                        </div>
                    )}

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
                    variant="info"
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                        backgroundColor: processingTheme.secondary,
                        borderColor: processingTheme.secondary,
                        marginRight: '8px'
                    }}
                >
                    Save
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCompleteBaggingOff}
                    disabled={loading}
                    style={{
                        backgroundColor: processingTheme.primary,
                        borderColor: processingTheme.primary
                    }}
                >
                    Complete Bagging Off
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const ProcessingList = () => {
    const [processingBatches, setProcessingBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('user'));

    const shouldHideGradeColumn = (batches) => {
        if (!batches || batches.length === 0) return false;
        return batches.some(batch => batch.batchNo && batch.batchNo.includes('-'));
    };

    useEffect(() => {
        fetchProcessingBatches();
    }, []);

    const fetchProcessingBatches = async () => {
        try {
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
            setError('Error fetching processing batches');
            setLoading(false);
        }
    };

    const startProcessing = (batches) => {
        setSelectedBatches(batches);
        setShowModal(true);
    };

    // New function to handle batch completion
    const handleBatchCompletion = (batchNo) => {
        // Remove the completed batch from the list immediately
        setProcessingBatches(prev => 
            prev.filter(batch => batch.batchNo !== batchNo)
        );
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

            fetchProcessingBatches();
            alert('Bagging off processed successfully');
        } catch (error) {
            console.error('Bagging off submission error:', error);
            alert(error.message || 'Failed to process bagging off');
        }
    };

    const hideGradeColumn = shouldHideGradeColumn(processingBatches);

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid py-4">
            <ProcessingBatchModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                batches={selectedBatches}
                onSubmit={handleProcessSubmit}
                onComplete={handleBatchCompletion}
            />

            <Card>
                <Card.Header style={{ backgroundColor: processingTheme.neutral }}>
                    <span className='h5' style={{ color: processingTheme.primary }}>Processing Batches</span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table mb-0">
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
                                            No Processing batches found!
                                        </td>
                                    </tr>
                                ) : (processingBatches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{batch.batchNo}</td>
                                        <td>{batch?.totalKgs.toLocaleString()} kg</td>
                                        {!hideGradeColumn && batch.grade}
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