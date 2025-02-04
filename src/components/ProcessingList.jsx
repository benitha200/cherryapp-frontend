// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ProcessingList = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchPurchases();
//   }, []);

//   const fetchPurchases = async () => {
//     try {
//       const res = await axios.get('http://localhost:3000/api/purchases');
//       setPurchases(res.data);
//       setLoading(false);
//     } catch {
//       setError('Error fetching purchases');
//       setLoading(false);
//     }
//   };

//   const startProcessing = (purchase) => {
//     console.log('Started processing:', purchase);
//   };

//   if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
//   if (error) return <div className="alert alert-danger my-3">{error}</div>;

//   return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div className="card-header bg-info bg-opacity-10 py-3">
//           <h2 className="card-title h4 mb-0 text-info">Batch Processing</h2>
//         </div>
//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table table-hover mb-0">
//               <thead className="table-light">
//                 <tr>
                 
//                   <th className="px-4 py-3">Batch No</th>
//                   {/* <th className="px-4 py-3">Delivery Type</th> */}
//                   <th className="px-4 py-3">Total KGs</th>
//                   <th className="px-4 py-3">Total Price (RWF)</th>
//                   <th className="px-4 py-3">Grade</th>
//                   <th className="px-4 py-3">CWS</th>
//                   <th className="px-4 py-3">Site Collection</th>
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
//                     //   deliveryType: purchase.deliveryType,
//                       totalKgs: purchase.totalKgs,
//                       totalPrice: purchase.totalPrice,
//                       grade: purchase.grade,
//                       cws: purchase.cws.name,
//                       siteCollection: purchase.siteCollection?.name || 'N/A',
//                       purchases: [purchase]
//                     });
//                   }
//                   return acc;
//                 }, []).map(({ batchNo, deliveryType, totalKgs, totalPrice, grade, cws, siteCollection, purchases }, i) => (
//                   <tr key={i}>
                    
//                     <td className="px-4 py-3">{batchNo}</td>
//                     {/* <td className="px-4 py-3">{deliveryType}</td> */}
//                     <td className="px-4 py-3">{totalKgs.toFixed(2)} kg</td>
//                     <td className="px-4 py-3">{totalPrice.toFixed(2)}</td>
//                     <td className="px-4 py-3">{grade}</td>
//                     <td className="px-4 py-3">{cws}</td>
//                     <td className="px-4 py-3">{siteCollection}</td>
//                     <td className="px-4 py-3">
//                       <button className="btn btn-sm btn-outline-info bg-opacity-1" onClick={() => startProcessing(purchases)}>Start Processing</button>
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
import { Modal, Button, Form } from 'react-bootstrap';

const StartProcessingModal = ({ show, handleClose, purchases, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const gradeOptions = [
    { value: 'CA', label: 'Anaerobic' },
    { value: 'CA', label: 'Honey' },
    { value: 'CA', label: 'Fully Washed' },
    { value: 'CA', label: 'Natural ' },
  ];

  const handleSubmit = () => {
    if (selectedDate && selectedGrade) {
      onSubmit({ date: selectedDate, grade: selectedGrade, purchases });
      handleClose();
    } else {
      alert('Please select both a date and a grade');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Purchase Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Coffee Grade</Form.Label>
            <Form.Select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">Select Grade</option>
              {gradeOptions.map((grade, index) => (
                <option key={index} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ProcessingList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/purchases');
      setPurchases(res.data);
      setLoading(false);
    } catch {
      setError('Error fetching purchases');
      setLoading(false);
    }
  };

  const startProcessing = (purchasesToProcess) => {
    setSelectedPurchases(purchasesToProcess);
    setShowModal(true);
  };

  const handleProcessSubmit = (processingDetails) => {
    console.log('Processing details:', processingDetails);
    // Add your processing logic here
    setShowModal(false);
  };

  if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error) return <div className="alert alert-danger my-3">{error}</div>;

  return (
    <div className="container-fluid py-4">
      <StartProcessingModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        purchases={selectedPurchases}
        onSubmit={handleProcessSubmit}
      />
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-info bg-opacity-10 py-3">
          <h2 className="card-title h4 mb-0 text-info">Batch Processing</h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Batch No</th>
                  <th className="px-4 py-3">Total KGs</th>
                  <th className="px-4 py-3">Total Price (RWF)</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">CWS</th>
                  <th className="px-4 py-3">Site Collection</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.reduce((acc, purchase) => {
                  const existingIndex = acc.findIndex(p => p.batchNo === purchase.batchNo);
                  if (existingIndex !== -1) {
                    acc[existingIndex].totalKgs += purchase.totalKgs;
                    acc[existingIndex].totalPrice += purchase.totalPrice;
                    acc[existingIndex].purchases.push(purchase);
                  } else {
                    acc.push({
                      batchNo: purchase.batchNo,
                      totalKgs: purchase.totalKgs,
                      totalPrice: purchase.totalPrice,
                      grade: purchase.grade,
                      cws: purchase.cws.name,
                      siteCollection: purchase.siteCollection?.name || 'N/A',
                      purchases: [purchase]
                    });
                  }
                  return acc;
                }, []).map(({ batchNo, totalKgs, totalPrice, grade, cws, siteCollection, purchases }, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">{batchNo}</td>
                    <td className="px-4 py-3">{totalKgs.toFixed(2)} kg</td>
                    <td className="px-4 py-3">{totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">{grade}</td>
                    <td className="px-4 py-3">{cws}</td>
                    <td className="px-4 py-3">{siteCollection}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="btn btn-sm btn-outline-info bg-opacity-1" 
                        onClick={() => startProcessing(purchases)}
                      >
                        Start Processing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingList;