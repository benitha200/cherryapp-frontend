import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Badge } from 'react-bootstrap';

const BaggingOffList = () => {
  const [baggingOffRecords, setBaggingOffRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBaggingOffRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/bagging-off');
        setBaggingOffRecords(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBaggingOffRecords();
  }, []);

  const renderOutputKgs = (outputKgsJson) => {
    const outputKgs = JSON.parse(outputKgsJson);
    return Object.entries(outputKgs).map(([grade, kg]) => (
      <div key={grade}>{grade}: {kg} kg</div>
    ));
  };

  if (loading) return <div>Loading bagging off records...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="m-3">
      <Card.Header>
        <h2>Bagging Off Records</h2>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
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
            {baggingOffRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.batchNo}</td>
                <td>{record.processing.processingType}</td>
                <td>{record.processing.totalKgs} kg</td>
                <td>{renderOutputKgs(record.outputKgs)}</td>
                <td>{record.totalOutputKgs} kg</td>
                <td>{record.processing.cws.name}</td>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>
                  <Badge 
                    bg={record.status === 'COMPLETED' ? 'success' : 'warning'}
                  >
                    {record.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default BaggingOffList;