import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import API_URL from '../../constants/Constants';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
    success: '#28a745',    // Success green
    warning: '#ffc107',    // Warning yellow
    danger: '#dc3545',     // Danger red
};
const BagOffModal = ({ show, onHide, batchNo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [batchDetails, setBatchDetails] = useState(null);
  const [error, setError] = useState('');
  const [bagOffOutputKgs, setBagOffOutputKgs] = useState({});
  const [notes, setNotes] = useState('');

  // Fetch batch details when modal opens
  React.useEffect(() => {
    if (show && batchNo) {
      fetchBatchDetails();
      // Reset form state when modal opens
      setBagOffOutputKgs({});
      setNotes('');
      setError('');
    }
  }, [show, batchNo]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/wet-transfer/batch/${batchNo}`);
      
      // Handle array response and pick the first item (or handle as needed)
      if (response.data && response.data.length > 0) {
        console.log('Batch details:', response.data[0]); // Log the first item for debugging
        setBatchDetails(response.data[0]); // Use the first item in the array
        
        // Initialize bagOffOutputKgs based on batch type
        const isSecondaryBatch = response.data[0]?.batchNo?.endsWith('-2') || 
                                 response.data[0]?.batchNo?.endsWith('B');
        
        if (isSecondaryBatch) {
          setBagOffOutputKgs({ B1: '', B2: '' });
        } else {
          // For FULLY WASHED, we use A0, A1, etc.
          if (response.data[0]?.processingType === 'FULLY WASHED' || 
              response.data[0]?.processingType === 'FULLY_WASHED') {
            setBagOffOutputKgs({ A0: '', A1: '' });
          } 
          // For NATURAL processing
          else if (response.data[0]?.processingType === 'NATURAL') {
            setBagOffOutputKgs({ N1: '', N2: '' });
          }
          // For HONEY processing
          else if (response.data[0]?.processingType === 'HONEY') {
            setBagOffOutputKgs({ H1: '' });
          }
          // Default case
          else {
            setBagOffOutputKgs({ A0: '', A1: '' });
          }
        }
      } else {
        setError('No batch details found.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batch details:', error);
      setError('Failed to fetch batch details. Please try again.');
      setLoading(false);
    }
  };

  const handleBagOffOutputChange = (grade, value) => {
    setBagOffOutputKgs(prev => ({
      ...prev,
      [grade]: value
    }));
  };

  const calculateTotalOutput = () => {
    return Object.values(bagOffOutputKgs)
      .filter(val => val !== '')
      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Filter out empty values
      const outputData = Object.entries(bagOffOutputKgs)
        .filter(([_, value]) => value !== '')
        .reduce((obj, [key, value]) => {
          obj[key] = parseFloat(value);
          return obj;
        }, {});
        
      // Make sure we have valid data
      if (Object.keys(outputData).length === 0) {
        setError('Please enter at least one output value.');
        setLoading(false);
        return;
      }
      
      // Format the processing type to match expected format
      let processingType = batchDetails?.processingType || 'FULLY WASHED';
      if (processingType === 'FULLY_WASHED') {
        processingType = 'FULLY WASHED';
      }
      
      // Create proper request payload with all required fields
      const payload = {
        batchNo: batchNo,
        outputKgs: outputData,
        date: new Date().toISOString(),
        processingType: processingType,
        status: "RECEIVER_COMPLETED",
        notes: notes,
        existingProcessing: batchDetails?.processingId ? { processingId: batchDetails.processingId } : undefined
      };
      
      console.log('Sending payload to bagging-off API:', payload);
      
      const response = await axios.post(`${API_URL}/bagging-off`, payload);
      console.log('Response from bagging-off API:', response.data);
      
      // Consider any response as successful, even empty array
      setLoading(false);
      
      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data);
      }
      
      onHide();
    } catch (error) {
      console.error('Error submitting bag off:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setError(`Failed to submit bag off data: ${errorMessage}`);
      setLoading(false);
    }
  };

  const isSecondaryBatch = batchDetails?.batchNo?.endsWith('-2') || batchDetails?.batchNo?.endsWith('B');
  const processingType = batchDetails?.processingType || 'FULLY WASHED';

  // Determine which fields to show based on processing type and batch naming
  const renderOutputFields = () => {
    if (isSecondaryBatch) {
      return (
        <>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="B1 KGs"
              value={bagOffOutputKgs.B1 || ''}
              onChange={(e) => handleBagOffOutputChange('B1', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="B2 KGs"
              value={bagOffOutputKgs.B2 || ''}
              onChange={(e) => handleBagOffOutputChange('B2', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
        </>
      );
    } else if (processingType === 'NATURAL' || processingType === 'NATURAL_PROCESS') {
      return (
        <>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="N1 KGs"
              value={bagOffOutputKgs.N1 || ''}
              onChange={(e) => handleBagOffOutputChange('N1', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="N2 KGs"
              value={bagOffOutputKgs.N2 || ''}
              onChange={(e) => handleBagOffOutputChange('N2', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
        </>
      );
    } else if (processingType === 'HONEY' || processingType === 'HONEY_PROCESS') {
      return (
        <Col md={6} className="mb-2">
          <Form.Control
            type="number"
            placeholder="H1 KGs"
            value={bagOffOutputKgs.H1 || ''}
            onChange={(e) => handleBagOffOutputChange('H1', e.target.value)}
            required
            style={{
              borderColor: processingTheme.secondary
            }}
          />
        </Col>
      );
    } else {
      // Default: FULLY WASHED / FULLY_WASHED
      return (
        <>
          <Col md={3} className="mb-2">
            <Form.Control
              type="number"
              placeholder="A0 KGs"
              value={bagOffOutputKgs.A0 || ''}
              onChange={(e) => handleBagOffOutputChange('A0', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Control
              type="number"
              placeholder="A1 KGs"
              value={bagOffOutputKgs.A1 || ''}
              onChange={(e) => handleBagOffOutputChange('A1', e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary
              }}
            />
          </Col>
        </>
      );
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton style={{ backgroundColor: processingTheme.primary }}>
        <Modal.Title className='text-white'>Bag Off - {batchNo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && !batchDetails ? (
          <div className="text-center py-4">
            <Spinner animation="border" style={{ color: processingTheme.primary }} />
            <p className="mt-2">Loading batch details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : batchDetails ? (
          <>
            <div className="mb-3">
              <h6 style={{ color: processingTheme.primary }}>Batch Information</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <th>Batch No</th>
                      <td>{batchDetails.batchNo}</td>
                      <th>Processing Type</th>
                      <td>{batchDetails.processingType}</td>
                    </tr>
                    <tr>
                      <th>Source CWS</th>
                      <td>{batchDetails.sourceCws?.name || 'Unknown'}</td>
                      <th>Destination CWS</th>
                      <td>{batchDetails.destinationCws?.name || 'Unknown'}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{batchDetails.status}</td>
                      <th>Date</th>
                      <td>{new Date(batchDetails.date).toLocaleDateString()}</td>
                     
                    </tr>
                    <tr>
                      <th>Moisture Content</th>
                      <td>{batchDetails.moistureContent || 'N/A'} %</td>
                      <th>Transfered KGs</th>
                      <td>{batchDetails.outputKgs ? parseFloat(batchDetails.outputKgs).toFixed(2) : 'N/A'} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-3">
              <Form.Label style={{ color: processingTheme.primary }}>
                Bag Off Output
              </Form.Label>
              <Row>
                {renderOutputFields()}
              </Row>
              <div className="mt-2">
                <strong>Total Output:</strong> {calculateTotalOutput()} kg
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: processingTheme.primary }}>Bag Off Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the bag off process..."
                style={{
                  borderColor: processingTheme.secondary
                }}
              />
            </Form.Group>
          </>
        ) : (
          <Alert variant="warning">No batch information available</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading || !batchDetails}
          style={{
            backgroundColor: processingTheme.primary,
            borderColor: processingTheme.primary
          }}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Bag Off'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BagOffModal;