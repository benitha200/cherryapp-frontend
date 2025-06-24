// import React, { useState } from 'react';
// import axios from 'axios';
// import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
// import API_URL from '../../constants/Constants';

// const processingTheme = {
//     primary: '#008080',    // Sucafina teal
//     secondary: '#4FB3B3',  // Lighter teal
//     neutral: '#E6F3F3',    // Very light teal
//     tableHover: '#F8FAFA', // Ultra light teal for table hover
//     success: '#28a745',    // Success green
//     warning: '#ffc107',    // Warning yellow
//     danger: '#dc3545',     // Danger red
// };
// const BagOffModal = ({ show, onHide, batchNo, onSuccess }) => {
//   const [loading, setLoading] = useState(false);
//   const [batchDetails, setBatchDetails] = useState(null);
//   const [error, setError] = useState('');
//   const [bagOffOutputKgs, setBagOffOutputKgs] = useState({});
//   const [notes, setNotes] = useState('');

//   // Fetch batch details when modal opens
//   React.useEffect(() => {
//     if (show && batchNo) {
//       fetchBatchDetails();
//       // Reset form state when modal opens
//       setBagOffOutputKgs({});
//       setNotes('');
//       setError('');
//     }
//   }, [show, batchNo]);

//   const fetchBatchDetails = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await axios.get(`${API_URL}/wet-transfer/batch/${batchNo}`);

//       // Handle array response and pick the first item (or handle as needed)
//       if (response.data && response.data.length > 0) {
//         console.log('Batch details:', response.data[0]); // Log the first item for debugging
//         setBatchDetails(response.data[0]); // Use the first item in the array

//         // Initialize bagOffOutputKgs based on batch type
//         const isSecondaryBatch = response.data[0]?.batchNo?.endsWith('-2') ||
//                                  response.data[0]?.batchNo?.endsWith('B');

//         if (isSecondaryBatch) {
//           setBagOffOutputKgs({ B1: '', B2: '' });
//         } else {
//           // For FULLY WASHED, we use A0, A1, etc.
//           if (response.data[0]?.processingType === 'FULLY WASHED' ||
//               response.data[0]?.processingType === 'FULLY_WASHED') {
//             setBagOffOutputKgs({ A0: '', A1: '' });
//           }
//           // For NATURAL processing
//           else if (response.data[0]?.processingType === 'NATURAL') {
//             setBagOffOutputKgs({ N1: '', N2: '' });
//           }
//           // For HONEY processing
//           else if (response.data[0]?.processingType === 'HONEY') {
//             setBagOffOutputKgs({ H1: '' });
//           }
//           // Default case
//           else {
//             setBagOffOutputKgs({ A0: '', A1: '' });
//           }
//         }
//       } else {
//         setError('No batch details found.');
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching batch details:', error);
//       setError('Failed to fetch batch details. Please try again.');
//       setLoading(false);
//     }
//   };

//   const handleBagOffOutputChange = (grade, value) => {
//     setBagOffOutputKgs(prev => ({
//       ...prev,
//       [grade]: value
//     }));
//   };

//   const calculateTotalOutput = () => {
//     return Object.values(bagOffOutputKgs)
//       .filter(val => val !== '')
//       .reduce((sum, val) => sum + parseFloat(val || 0), 0)
//       .toFixed(2);
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       // Filter out empty values
//       const outputData = Object.entries(bagOffOutputKgs)
//         .filter(([_, value]) => value !== '')
//         .reduce((obj, [key, value]) => {
//           obj[key] = parseFloat(value);
//           return obj;
//         }, {});

//       // Make sure we have valid data
//       if (Object.keys(outputData).length === 0) {
//         setError('Please enter at least one output value.');
//         setLoading(false);
//         return;
//       }

//       // Format the processing type to match expected format
//       let processingType = batchDetails?.processingType || 'FULLY WASHED';
//       if (processingType === 'FULLY_WASHED') {
//         processingType = 'FULLY WASHED';
//       }

//       // Create proper request payload with all required fields
//       const payload = {
//         batchNo: batchNo,
//         outputKgs: outputData,
//         date: new Date().toISOString(),
//         processingType: processingType,
//         status: "RECEIVER_COMPLETED",
//         notes: notes,
//         existingProcessing: batchDetails?.processingId ? { processingId: batchDetails.processingId } : undefined
//       };

//       console.log('Sending payload to bagging-off API:', payload);

//       const response = await axios.post(`${API_URL}/bagging-off`, payload);
//       console.log('Response from bagging-off API:', response.data);

//       // Consider any response as successful, even empty array
//       setLoading(false);

//       // Call the success callback if provided
//       if (onSuccess && typeof onSuccess === 'function') {
//         onSuccess(response.data);
//       }

//       onHide();
//     } catch (error) {
//       console.error('Error submitting bag off:', error);
//       const errorMessage = error.response?.data?.error || error.message;
//       setError(`Failed to submit bag off data: ${errorMessage}`);
//       setLoading(false);
//     }
//   };

//   const isSecondaryBatch = batchDetails?.batchNo?.endsWith('-2') || batchDetails?.batchNo?.endsWith('B');
//   const processingType = batchDetails?.processingType || 'FULLY WASHED';

//   // Determine which fields to show based on processing type and batch naming
//   const renderOutputFields = () => {
//     if (isSecondaryBatch) {
//       return (
//         <>
//           <Col md={6} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="B1 KGs"
//               value={bagOffOutputKgs.B1 || ''}
//               onChange={(e) => handleBagOffOutputChange('B1', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//           <Col md={6} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="B2 KGs"
//               value={bagOffOutputKgs.B2 || ''}
//               onChange={(e) => handleBagOffOutputChange('B2', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//         </>
//       );
//     } else if (processingType === 'NATURAL' || processingType === 'NATURAL_PROCESS') {
//       return (
//         <>
//           <Col md={6} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="N1 KGs"
//               value={bagOffOutputKgs.N1 || ''}
//               onChange={(e) => handleBagOffOutputChange('N1', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//           <Col md={6} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="N2 KGs"
//               value={bagOffOutputKgs.N2 || ''}
//               onChange={(e) => handleBagOffOutputChange('N2', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//         </>
//       );
//     } else if (processingType === 'HONEY' || processingType === 'HONEY_PROCESS') {
//       return (
//         <Col md={6} className="mb-2">
//           <Form.Control
//             type="number"
//             placeholder="H1 KGs"
//             value={bagOffOutputKgs.H1 || ''}
//             onChange={(e) => handleBagOffOutputChange('H1', e.target.value)}
//             required
//             style={{
//               borderColor: processingTheme.secondary
//             }}
//           />
//         </Col>
//       );
//     } else {
//       // Default: FULLY WASHED / FULLY_WASHED
//       return (
//         <>
//           <Col md={3} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="A0 KGs"
//               value={bagOffOutputKgs.A0 || ''}
//               onChange={(e) => handleBagOffOutputChange('A0', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//           <Col md={3} className="mb-2">
//             <Form.Control
//               type="number"
//               placeholder="A1 KGs"
//               value={bagOffOutputKgs.A1 || ''}
//               onChange={(e) => handleBagOffOutputChange('A1', e.target.value)}
//               required
//               style={{
//                 borderColor: processingTheme.secondary
//               }}
//             />
//           </Col>
//         </>
//       );
//     }
//   };

//   return (
//     <Modal
//       show={show}
//       onHide={onHide}
//       size="lg"
//       centered
//     >
//       <Modal.Header closeButton style={{ backgroundColor: processingTheme.primary }}>
//         <Modal.Title className='text-white'>Bag Off - {batchNo}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {loading && !batchDetails ? (
//           <div className="text-center py-4">
//             <Spinner animation="border" style={{ color: processingTheme.primary }} />
//             <p className="mt-2">Loading batch details...</p>
//           </div>
//         ) : error ? (
//           <Alert variant="danger">{error}</Alert>
//         ) : batchDetails ? (
//           <>
//             <div className="mb-3">
//               <h6 style={{ color: processingTheme.primary }}>Batch Information</h6>
//               <div className="table-responsive">
//                 <table className="table table-sm">
//                   <tbody>
//                     <tr>
//                       <th>Batch No</th>
//                       <td>{batchDetails.batchNo}</td>
//                       <th>Processing Type</th>
//                       <td>{batchDetails.processingType}</td>
//                     </tr>
//                     <tr>
//                       <th>Source CWS</th>
//                       <td>{batchDetails.sourceCws?.name || 'Unknown'}</td>
//                       <th>Destination CWS</th>
//                       <td>{batchDetails.destinationCws?.name || 'Unknown'}</td>
//                     </tr>
//                     <tr>
//                       <th>Status</th>
//                       <td>{batchDetails.status}</td>
//                       <th>Date</th>
//                       <td>{new Date(batchDetails.date).toLocaleDateString()}</td>

//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             <div className="mb-3">
//               <Form.Label style={{ color: processingTheme.primary }}>
//                 Bag Off Output
//               </Form.Label>
//               <Row>
//                 {renderOutputFields()}
//               </Row>
//               <div className="mt-2">
//                 <strong>Total Output:</strong> {calculateTotalOutput()} kg
//               </div>
//             </div>

//             <Form.Group className="mb-3">
//               <Form.Label style={{ color: processingTheme.primary }}>Bag Off Notes</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Add any notes about the bag off process..."
//                 style={{
//                   borderColor: processingTheme.secondary
//                 }}
//               />
//             </Form.Group>
//           </>
//         ) : (
//           <Alert variant="warning">No batch information available</Alert>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button
//           variant="secondary"
//           onClick={onHide}
//         >
//           Cancel
//         </Button>
//         <Button
//           variant="primary"
//           onClick={handleSubmit}
//           disabled={loading || !batchDetails}
//           style={{
//             backgroundColor: processingTheme.primary,
//             borderColor: processingTheme.primary
//           }}
//         >
//           {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Bag Off'}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default BagOffModal;

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import API_URL from "../../constants/Constants";

const processingTheme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover
  success: "#28a745", // Success green
  warning: "#ffc107", // Warning yellow
  danger: "#dc3545", // Danger red
};

const BagOffModal = ({ show, onHide, batchNo, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [batchDetails, setBatchDetails] = useState(null);
  const [error, setError] = useState("");
  const [bagOffOutputKgs, setBagOffOutputKgs] = useState({});
  const [notes, setNotes] = useState("");
  const [savedBaggingOffs, setSavedBaggingOffs] = useState([]);
  const [progressiveMode, setProgressiveMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [onsuccesRefresh, setOnSuccessRefresh] = useState(false);

  // Fetch batch details and existing bagging offs when modal opens
  useEffect(() => {
    if (show && batchNo) {
      fetchBatchDetails();
      fetchExistingBaggingOffs();

      // Reset form state when modal opens
      if (!isEditing) {
        setBagOffOutputKgs({});
        setNotes("");
        setError("");
      }
    }
  }, [show, batchNo, onsuccesRefresh]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_URL}/wet-transfer/batch/${batchNo}`
      );

      // Handle array response and pick the first item
      if (response.data && response.data.length > 0) {
        console.log("Batch details:", response.data[0]);
        setBatchDetails(response.data[0]);

        // Initialize bagOffOutputKgs based on batch type if not editing
        if (!isEditing) {
          initializeOutputFields(response.data[0]);
        }
      } else {
        setError("No batch details found.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batch details:", error);
      setError("Failed to fetch batch details. Please try again.");
      setLoading(false);
    }
  };

  const fetchExistingBaggingOffs = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/bagging-off/batch/${batchNo}`
      );
      if (response.data) {
        console.log("Existing bagging offs:", response.data);
        setSavedBaggingOffs(response.data);
      }
    } catch (error) {
      console.error("Error fetching existing bagging offs:", error);
    }
  };

  const initializeOutputFields = (batchData) => {
    const isSecondaryBatch =
      batchData?.batchNo?.endsWith("-2") || batchData?.batchNo?.endsWith("B");

    if (isSecondaryBatch) {
      setBagOffOutputKgs({ B1: "", B2: "" });
    } else {
      // For FULLY WASHED, we use A0, A1, etc.
      if (
        batchData?.processingType === "FULLY WASHED" ||
        batchData?.processingType === "FULLY_WASHED"
      ) {
        setBagOffOutputKgs({ A0: "", A1: "", A2: "", A3: "" });
      }
      // For NATURAL processing
      else if (batchData?.processingType === "NATURAL") {
        setBagOffOutputKgs({ N1: "", N2: "" });
      }
      // For HONEY processing
      else if (batchData?.processingType === "HONEY") {
        setBagOffOutputKgs({ H1: "" });
      }
      // Default case
      else {
        setBagOffOutputKgs({ A0: "", A1: "", A2: "", A3: "" });
      }
    }
  };

  const handleBagOffOutputChange = (grade, value) => {
    setBagOffOutputKgs((prev) => ({
      ...prev,
      [grade]: value,
    }));
  };

  const calculateTotalOutput = () => {
    return Object.values(bagOffOutputKgs)
      .filter((val) => val !== "")
      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
      .toFixed(2);
  };

  const calculateTotalsByGrade = () => {
    const totals = {};

    savedBaggingOffs.forEach((record) => {
      Object.entries(record.outputKgs).forEach(([grade, value]) => {
        if (value && parseFloat(value) > 0) {
          if (!totals[grade]) {
            totals[grade] = 0;
          }
          totals[grade] += parseFloat(value);
        }
      });
    });

    return totals;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const handleEdit = (record) => {
    // Check if the record is from yesterday
    if (!isYesterdayRecord(record.date)) {
      setError("You can only edit records from yesterday.");
      return;
    }

    setIsEditing(true);
    setEditingRecord(record);
    setSelectedDate(new Date(record.date).toISOString().split("T")[0]);
    setNotes(record.notes || "");

    // Set the output values
    const outputKgs = {};
    Object.entries(record.outputKgs).forEach(([key, value]) => {
      outputKgs[key] =
        value !== null && value !== undefined ? value.toString() : "";
    });

    setBagOffOutputKgs(outputKgs);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingRecord(null);
    setBagOffOutputKgs({});
    setNotes("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // const handleSubmit = () => {
  //   console.log('handleSubmit called ')
  // }

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Filter out empty values
      const outputData = Object.entries(bagOffOutputKgs)
        .filter(([_, value]) => value !== "")
        .reduce((obj, [key, value]) => {
          obj[key] = parseFloat(value);
          return obj;
        }, {});

      // Make sure we have valid data
      if (Object.keys(outputData).length === 0) {
        setError("Please enter at least one output value.");
        setLoading(false);
        return;
      }

      // Format the processing type to match expected format
      let processingType = batchDetails?.processingType || "FULLY WASHED";
      if (processingType === "FULLY_WASHED") {
        processingType = "FULLY WASHED";
      }

      // Create proper request payload with all required fields
      let payload = {
        batchNo: batchNo,
        outputKgs: outputData,
        date: selectedDate,
        processingType: processingType,
        status: "RECEIVED",
        notes: notes,
        progressive: progressiveMode,
        existingProcessing: batchDetails?.processingId
          ? { processingId: batchDetails.processingId }
          : undefined,
      };

      console.log("Sending payload to bagging-off API:", payload);

      let response;

      if (isEditing && editingRecord) {
        // If editing, use PUT to update the existing record
        response = await axios.put(
          `${API_URL}/bagging-off/${editingRecord.id}`,
          {
            ...payload,
            date: selectedDate, // Make sure to use the selectedDate for editing
          }
        );
      } else {
        // If not editing, create a new record
        response = await axios.post(`${API_URL}/bagging-off`, payload);
      }

      console.log("Response from bagging-off API:", response.data);

      // Reset form if not in progressive mode
      if (!progressiveMode) {
        setBagOffOutputKgs({});
        setNotes("");
      }

      // Reset editing state
      setIsEditing(false);
      setEditingRecord(null);

      // Refresh the bagging offs data
      await fetchExistingBaggingOffs();

      // Call the success callback if provided
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(response.data);
      }

      setLoading(false);

      // Don't close the modal if in progressive mode
      if (!progressiveMode && !isEditing) {
        onHide();
      }
    } catch (error) {
      console.error("Error submitting bag off:", error);
      const errorMessage = error.response?.data?.error || error.message;
      setError(`Failed to submit bag off data: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleCompleteBaggingOff = async () => {
    try {
      setLoading(true);

      // Check if there are new values to submit
      // const hasNewValues = Object.values(bagOffOutputKgs).some(val => val !== '');

      // // If there are new values, submit them first
      // if (hasNewValues) {
      //   await handleSubmit();
      // }

      // Update all existing entries to "COMPLETED"
      if (savedBaggingOffs.length > 0) {
        await Promise.all(
          savedBaggingOffs.map((entry) =>
            axios.put(
              `${API_URL}/bagging-off/completeWetbagggingoff/${entry.id}`,
              {
                ...entry,
                status: "RECEIVER_COMPLETED",
              }
            )
          )
        );

        // Also update the batch status to COMPLETED
        if (batchDetails && batchDetails.id) {
          try {
            await axios.put(`${API_URL}/wet-transfer/batch/${batchNo}`, {
              status: "RECEIVER_COMPLETED",
            });
          } catch (batchUpdateError) {
            console.error("Error updating batch status:", batchUpdateError);
            // Continue even if this fails
          }
        }
      }

      // Refresh the data
      await fetchExistingBaggingOffs();

      // Call the success callback with completed flag
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess({ completed: true, batchNo });
        setOnSuccessRefresh(!onsuccesRefresh);
      }

      setLoading(false);
      onHide();
    } catch (error) {
      console.error("Error completing bagging off:", error);
      setError("Failed to complete bagging off process.");
      setLoading(false);
    }
  };

  const isSecondaryBatch =
    batchDetails?.batchNo?.endsWith("-2") ||
    batchDetails?.batchNo?.endsWith("B");
  const processingType = batchDetails?.processingType || "FULLY WASHED";

  // Determine which fields to show based on processing type and batch naming
  const renderOutputFields = () => {
    if (isSecondaryBatch) {
      return (
        <>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="B1 KGs"
              value={bagOffOutputKgs.B1 || ""}
              onChange={(e) => handleBagOffOutputChange("B1", e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="B2 KGs"
              value={bagOffOutputKgs.B2 || ""}
              onChange={(e) => handleBagOffOutputChange("B2", e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
        </>
      );
    } else if (
      processingType === "NATURAL" ||
      processingType === "NATURAL_PROCESS"
    ) {
      return (
        <>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="N1 KGs"
              value={bagOffOutputKgs.N1 || ""}
              onChange={(e) => handleBagOffOutputChange("N1", e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
          <Col md={6} className="mb-2">
            <Form.Control
              type="number"
              placeholder="N2 KGs"
              value={bagOffOutputKgs.N2 || ""}
              onChange={(e) => handleBagOffOutputChange("N2", e.target.value)}
              required
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
        </>
      );
    } else if (
      processingType === "HONEY" ||
      processingType === "HONEY_PROCESS"
    ) {
      return (
        <Col md={6} className="mb-2">
          <Form.Control
            type="number"
            placeholder="H1 KGs"
            value={bagOffOutputKgs.H1 || ""}
            onChange={(e) => handleBagOffOutputChange("H1", e.target.value)}
            required
            style={{
              borderColor: processingTheme.secondary,
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
              value={bagOffOutputKgs.A0 || ""}
              onChange={(e) => handleBagOffOutputChange("A0", e.target.value)}
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Control
              type="number"
              min={1}
              placeholder="A1 KGs"
              value={bagOffOutputKgs.A1 || ""}
              onChange={(e) => handleBagOffOutputChange("A1", e.target.value)}
              style={{
                borderColor: processingTheme.secondary,
              }}
            />
          </Col>
        </>
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header
        closeButton
        style={{ backgroundColor: processingTheme.primary }}
      >
        <Modal.Title className="text-white">
          {isEditing ? "Edit Bagging Off Record" : "Bag Off"} - {batchNo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && !batchDetails ? (
          <div className="text-center py-4">
            <Spinner
              animation="border"
              style={{ color: processingTheme.primary }}
            />
            <p className="mt-2">Loading batch details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : batchDetails ? (
          <>
            <div className="mb-3">
              <h6 style={{ color: processingTheme.primary }}>
                Batch Information
              </h6>
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
                      <td>{batchDetails.sourceCws?.name || "Unknown"}</td>
                      <th>Destination CWS</th>
                      <td>{batchDetails.destinationCws?.name || "Unknown"}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{batchDetails.status}</td>
                      <th>Date</th>
                      <td>
                        {new Date(batchDetails.date).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* {!isEditing && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="progressive-mode-switch"
                  label={<span style={{ color: processingTheme.primary }}>Progressive Mode (Add new outputs without replacing previous entries)</span>}
                  checked={progressiveMode}
                  onChange={(e) => setProgressiveMode(e.target.checked)}
                  className="custom-switch"
                />
              </Form.Group>
            )} */}

            {/* Saved Bagging Offs List - Show if not editing */}
            {!isEditing && savedBaggingOffs.length > 0 && (
              <div
                className="mb-4 p-3 border rounded"
                style={{
                  backgroundColor: processingTheme.neutral,
                  borderColor: processingTheme.secondary,
                }}
              >
                <h5 style={{ color: processingTheme.primary }}>
                  Previous Bagging Off Records
                </h5>

                <Table size="sm" bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Grades/Output</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedBaggingOffs.map((record, index) => (
                      <tr key={record.id || index}>
                        <td>{formatDate(record.date)}</td>
                        <td>
                          {Object.entries(record.outputKgs)
                            .filter(
                              ([_, value]) => value && parseFloat(value) > 0
                            )
                            .map(([grade, value]) => (
                              <div key={grade}>
                                {grade}: {parseFloat(value).toFixed(2)} KGs
                              </div>
                            ))}
                        </td>
                        <td>{record.notes}</td>
                        <td>
                          {record.status !== "COMPLETED" &&
                            isYesterdayRecord(record.date) && (
                              <Button
                                variant="outline-sucafina"
                                size="sm"
                                onClick={() => handleEdit(record)}
                                style={{
                                  color: processingTheme.primary,
                                  borderColor: processingTheme.primary,
                                }}
                              >
                                <i className="bi bi-pencil-square"></i> Edit
                              </Button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Total summary */}
                <div className="mt-3">
                  <h6 style={{ color: processingTheme.primary }}>
                    Total Accumulated Output
                  </h6>
                  <Table size="sm" bordered>
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Total KGs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const totals = calculateTotalsByGrade();
                        const rows = [];

                        Object.keys(totals).forEach((grade) => {
                          if (totals[grade] > 0) {
                            rows.push(
                              <tr key={grade}>
                                <td>{grade}</td>
                                <td>{totals[grade].toFixed(2)} KGs</td>
                              </tr>
                            );
                          }
                        });

                        return rows.length > 0 ? (
                          rows
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No previous output recorded
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            <Form.Group className="mb-1">
              <Form.Label style={{ color: processingTheme.primary }}>
                Bagging Off Date
              </Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  borderColor: processingTheme.secondary,
                  backgroundColor: processingTheme.neutral,
                }}
              />
            </Form.Group>

            <div className="mb-3">
              <Form.Label style={{ color: processingTheme.primary }}>
                Bagging Off Output
              </Form.Label>
              <Row>{renderOutputFields()}</Row>
              <div className="mt-2">
                <strong>New Output Total:</strong> {calculateTotalOutput()} kg
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: processingTheme.primary }}>
                Bag Off Notes
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the bag off process..."
                style={{
                  borderColor: processingTheme.secondary,
                }}
              />
            </Form.Group>
          </>
        ) : (
          <Alert variant="warning">No batch information available</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        {isEditing ? (
          <>
            <Button variant="outline-secondary" onClick={cancelEdit}>
              Cancel Edit
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || !batchDetails}
              style={{
                backgroundColor: processingTheme.primary,
                borderColor: processingTheme.primary,
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Update Record"
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button
              variant="outline-success"
              onClick={handleSubmit}
              disabled={
                loading ||
                !batchDetails ||
                Object.values(bagOffOutputKgs).every((v) => v === "")
              }
              style={{
                marginRight: "10px",
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : progressiveMode ? (
                "Save & Continue"
              ) : (
                "Save"
              )}
            </Button>
            <Button
              variant="primary"
              onClick={handleCompleteBaggingOff}
              disabled={loading || !batchDetails}
              style={{
                backgroundColor: processingTheme.primary,
                borderColor: processingTheme.primary,
              }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Complete Bag Off"
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BagOffModal;
