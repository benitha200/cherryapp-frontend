import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const StartProcessingModal = () => {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const gradeOptions = [
    { value: 'CA', label: 'Anaerobic C' },
    { value: 'CA', label: 'Honey C' },
    { value: 'CA', label: 'Fully Washed C' },
    { value: 'CA', label: 'Natural C' },
    { value: 'CB', label: 'CB' },
    { value: 'NA', label: 'Fully Washed Non Certified' },
    { value: 'NA', label: 'Anaerobic Non Certified' },
    { value: 'NA', label: 'Honey Non Certified' },
    { value: 'NA', label: 'Natural Non Certified' },
    { value: 'NB', label: 'NB' }
  ];

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = () => {
    if (selectedDate && selectedGrade) {
      // Perform submission logic here
      console.log('Submitted:', { date: selectedDate, grade: selectedGrade });
      handleClose();
    } else {
      alert('Please select both a date and a grade');
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Select Purchase Details
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Start processing</Modal.Title>
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
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Start
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StartProcessingModal;