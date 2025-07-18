import React from 'react';
import { Table } from 'react-bootstrap';

const TableSkeletonLoader = () => {
  const SkeletonRow = ({ isExpanded = false }) => (
    <tr className={isExpanded ? "table-secondary" : ""}>
      <td>
        <div className={`d-flex align-items-center ${isExpanded ? 'ps-4' : ''}`}>
          {!isExpanded && (
            <div 
              className="me-2 placeholder" 
              style={{ width: '16px', height: '16px', borderRadius: '2px' }}
            ></div>
          )}
          <div>
            <div className="placeholder-glow">
              <span className="placeholder" style={{ width: '120px', height: '16px', display: 'block' }}></span>
            </div>
            <div className="placeholder-glow mt-1">
              <span className="placeholder" style={{ width: '80px', height: '12px', display: 'block' }}></span>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '100px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '80px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '80px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '70px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '70px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '70px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '60px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '30px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-glow">
          <span className="placeholder" style={{ width: '50px', height: '16px', display: 'block' }}></span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-light">
          <tr>
            <th>CWS Station</th>
            <th>Transport Group ID</th>
            <th>Transfer Date</th>
            <th>Arrival Date</th>
            <th>Transported (KG)</th>
            <th>Delivered (KG)</th>
            <th>In Transit (KG)</th>
            <th>In Transit Trucks</th>
            <th>Truck No</th>
            <th>Variation</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, index) => (
            <React.Fragment key={index}>
              <SkeletonRow />
              {index % 2 === 0 && (
                <>
                  <SkeletonRow isExpanded={true} />
                  <SkeletonRow isExpanded={true} />
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableSkeletonLoader;