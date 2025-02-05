import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import API_URL from '../constants/Constants';

// Consistent theme colors
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
  directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
  centralStation: '#008080'  // Main teal for central station badge
};

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
      <Modal.Header closeButton style={{ backgroundColor: theme.neutral }}>
        <Modal.Title style={{ color: theme.primary }}>Select Purchase Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: theme.primary }}>Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: theme.primary }}>Coffee Grade</Form.Label>
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
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          style={{ 
            borderColor: theme.secondary,
            color: theme.secondary
          }}
        >
          Close
        </Button>
        <Button 
          onClick={handleSubmit}
          style={{ 
            backgroundColor: theme.primary,
            borderColor: theme.primary,
            color: 'white'
          }}
        >
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
      const res = await axios.get(`${API_URL}/purchases``);
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

  if (loading) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border" style={{ color: theme.primary }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-3" role="alert">{error}</div>
  );

  return (
    <div className="container-fluid py-4">
      <StartProcessingModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        purchases={selectedPurchases}
        onSubmit={handleProcessSubmit}
      />
      <div className="card border-0 shadow-sm">
        <div 
          className="d-flex align-items-center"
          style={{ backgroundColor: theme.neutral }}
        >
          <h2 
            className="card-title h4 mb-0 m-4"
            style={{ color: theme.primary }}
          >
            Batch Processing
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
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
                  <tr 
                    key={i}
                    style={{ ':hover': { backgroundColor: theme.tableHover } }}
                  >
                    <td className="px-4 py-3">{batchNo}</td>
                    <td className="px-4 py-3">{totalKgs.toFixed(2)} kg</td>
                    <td className="px-4 py-3">{totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">{grade}</td>
                    <td className="px-4 py-3">{cws}</td>
                    <td className="px-4 py-3">{siteCollection}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          color: theme.primary,
                          borderColor: theme.primary,
                          backgroundColor: 'transparent',
                          ':hover': {
                            backgroundColor: theme.neutral
                          }
                        }}
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