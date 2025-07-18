import { Row, Col, Card } from "react-bootstrap";
import { GetTransportedTracyBytransferGroupIdAndDate } from "../action";

export const SingleTransportedTruckdisplay = ({
  selectedTransportInfo,
}) => {
  const { transportGroupId, transferDate } = selectedTransportInfo;
  const { isPending, error, data } = GetTransportedTracyBytransferGroupIdAndDate(transportGroupId, transferDate);
  
  const deliveryDetails = data?.data?.deliveryDetails || [];
  
  if (isPending) {
    return (
      <Card.Body>
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading delivery details...</p>
        </div>
      </Card.Body>
    );
  }

  if (error) {
    return (
      <Card.Body>
        <div className="alert alert-danger" role="alert">
          Error loading delivery details: {error.message}
        </div>
      </Card.Body>
    );
  }

  const renderCategoryCard = (item) => (
    <Col md={4} key={item.id} className="mb-3">
      <Card className="h-100">
        <Card.Header className="text-white" style={{ backgroundColor: "#76d8f0ff" }}>
          <h6 className="mb-0">{item.category}</h6>
        </Card.Header>
        <Card.Body className="p-3">
          <div className="mb-2">
            <div className="small text-muted">Delivered (Kg)</div>
            <div className="h5 text-success mb-0">{item.deliveryKgs}</div>
          </div>
          
          <div className="mb-2">
            <div className="small text-muted">WRN</div>
            <div className="h5 text-warning mb-0">{item.WRN}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Arrival Date</div>
            <div className="small text-dark">
              {new Date(item.arrivalDate).toLocaleDateString()} {new Date(item.arrivalDate).toLocaleTimeString()}
            </div>
          </div>

          <div className="mb-0">
            <div className="small text-muted">Status</div>
            <span className={`badge ${item.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
              {item.status}
            </span>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );


  return (
    <Card.Body>
      <Row className="mb-3">
        <Col md={12}>
          <Card className="bg-light">
            <Card.Body>
              <Row className="mb-3">
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Station:</strong>
                    <span>{data?.data?.cwsName??''}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Quantity:</strong>
                    <span className="badge bg-success">{data?.data?.totalQuantity??''}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Driver:</strong>
                    <span className="badge bg-warning text-dark">{data?.data?.driverNames??''}</span>
                  </div>
                </Col>
                
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Truck:</strong>
                    <span className="badge bg-secondary">{data?.data?.plateNumbers??''}</span>
                  </div>
                </Col>
              </Row>

              <hr />

              <Row>
                <Col md={12}>
                  <h5 className="mb-3">Received Track Records</h5>
                  {deliveryDetails.length > 0 ? (
                    <Row>
                      {deliveryDetails.map((item) => renderCategoryCard(item))}
                    </Row>
                  ) : (
                    <div className="text-center text-muted p-4">
                      <p>No delivery details available</p>
                    </div>
                  )}
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};