import React from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';

// DetailModal component to show detailed information when a row is clicked
const BaggingOffDetailModal = ({ show, onHide, data, reportType }) => {
  // Early return if no data
  if (!data) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderBatchDetails = () => {
    const { batchInfo, metrics, baggingOffRecords } = data;
    
    return (
      <>
        <div className="mb-4">
          <h5>Batch Information</h5>
          <Table bordered hover>
            <tbody>
              <tr>
                <td className="fw-bold" style={{ width: '30%' }}>Batch No</td>
                <td>{batchInfo.batchNo}</td>
              </tr>
              <tr>
                <td className="fw-bold">Related Batches</td>
                <td>{batchInfo.relatedBatches?.join(', ') || 'None'}</td>
              </tr>
              <tr>
                <td className="fw-bold">Station</td>
                <td>{batchInfo.station}</td>
              </tr>
              <tr>
                <td className="fw-bold">Processing Type</td>
                <td>{batchInfo.processingType}</td>
              </tr>
              <tr>
                <td className="fw-bold">Start Date</td>
                <td>{formatDate(batchInfo.startDate)}</td>
              </tr>
              <tr>
                <td className="fw-bold">End Date</td>
                <td>{formatDate(batchInfo.endDate)}</td>
              </tr>
              <tr>
                <td className="fw-bold">Status</td>
                <td>
                  <Badge bg={batchInfo.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {batchInfo.status}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Total Input KGs</td>
                <td>{batchInfo.totalInputKgs.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total Output KGs</td>
                <td>{batchInfo.totalOutputKgs.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="fw-bold">Outturn</td>
                <td 
                  style={{ 
                    color: batchInfo.outturn >= 20 && batchInfo.outturn <= 25 ? '#008080' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  {batchInfo.outturn}%
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        <div className="mb-4">
          <h5>Grade Breakdown</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Grade</th>
                <th className="text-end">Quantity (KGs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.gradeBreakdown).map(([grade, kgs]) => (
                <tr key={grade}>
                  <td>{grade}</td>
                  <td className="text-end">{kgs.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* <div>
          <h5>Bagging Off Records</h5>
          {baggingOffRecords && baggingOffRecords.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Output KGs</th>
                  <th>Grade Breakdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {baggingOffRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{formatDate(record.date)}</td>
                    <td className="text-end">{record.totalOutputKgs.toLocaleString()}</td>
                    <td>
                      {Object.entries(record.outputKgs).map(([grade, kgs]) => (
                        <Badge key={grade} bg="light" text="dark" className="me-1">
                          {grade}: {kgs} KGs
                        </Badge>
                      ))}
                    </td>
                    <td>
                      <Badge bg={record.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No bagging off records available.</div>
          )}
        </div> */}
      </>
    );
  };

  const renderStationDetails = () => {
    const { 
      stationName, 
      totalInputKgs, 
      totalOutputKgs, 
      outturn, 
      processingTypes = {}, 
      gradeBreakdown = {}, 
      processingDetails = [] 
    } = data || {};
    
    return (
      <>
        <div className="mb-4">
          <h5>Station Summary</h5>
          <Table bordered hover>
            <tbody>
              <tr>
                <td className="fw-bold" style={{ width: '30%' }}>Station Name</td>
                <td>{stationName}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total Input KGs</td>
                <td>{totalInputKgs ? totalInputKgs.toLocaleString() : '0'}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total Output KGs</td>
                <td>{totalOutputKgs ? totalOutputKgs.toLocaleString() : '0'}</td>
              </tr>
              <tr>
                <td className="fw-bold">Outturn</td>
                <td 
                  style={{ 
                    color: outturn >= 20 && outturn <= 25 ? '#008080' : 'red',
                    fontWeight: 'bold'
                  }}
                >
                  {outturn ? `${outturn}%` : '0%'}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Total Batches</td>
                <td>{data?.totalBatches || 0}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total Processings</td>
                <td>{data?.totalProcessings || 0}</td>
              </tr>
            </tbody>
          </Table>
        </div>
  
        <div className="mb-4">
          <h5>Processing Types</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Type</th>
                <th className="text-end">Quantity (KGs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(processingTypes || {}).map(([type, kgs]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td className="text-end">{typeof kgs === 'number' ? kgs.toLocaleString() : kgs}</td>
                </tr>
              ))}
              {Object.keys(processingTypes || {}).length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center text-muted">No processing types available</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
  
        <div className="mb-4">
          <h5>Grade Breakdown</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Grade</th>
                <th className="text-end">Quantity (KGs)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gradeBreakdown || {}).map(([grade, kgs]) => (
                <tr key={grade}>
                  <td>{grade}</td>
                  <td className="text-end">{typeof kgs === 'number' ? kgs.toLocaleString() : kgs}</td>
                </tr>
              ))}
              {Object.keys(gradeBreakdown || {}).length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center text-muted">No grade breakdown available</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
  
        {/* <div>
          <h5>Processing Details</h5>
          {processingDetails && processingDetails.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Batch No</th>
                  <th>Processing Type</th>
                  <th>Total KGs</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {processingDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.batchNo}</td>
                    <td>{detail.processingType ? detail.processingType.replace('_', ' ') : ''}</td>
                    <td className="text-end">{detail.totalKgs ? detail.totalKgs.toLocaleString() : '0'}</td>
                    <td>{formatDate(detail.startDate)}</td>
                    <td>{formatDate(detail.endDate)}</td>
                    <td>
                      <Badge bg={detail.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {detail.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No processing details available.</div>
          )}
        </div> */}
      </>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="bagging-off-detail-modal"
      centered
    >
      <Modal.Header closeButton style={{ backgroundColor: '#E6F3F3' }}>
        <Modal.Title id="bagging-off-detail-modal">
          {reportType === 'batch' ? 'Batch Details' : 'Station Details'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {reportType === 'batch' ? renderBatchDetails() : renderStationDetails()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} style={{ backgroundColor: '#4FB3B3', borderColor: '#4FB3B3' }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BaggingOffDetailModal;