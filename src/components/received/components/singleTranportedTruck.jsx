import { Form, Row, Col, Card } from "react-bootstrap";

export const SingleTransportedTruck = ({
  setInfo,
  categories,
  selectedTransportInfo,
}) => {
  const validKeys = [...new Set(categories)];
  const includeInValidKeys = (key) => validKeys.includes(key);

  const handleCategoryChange = (category, field, value) => {
    setInfo((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const renderCategoryInputs = (categoryCode) => (
    <Col md={4} key={categoryCode} className="mb-3">
      <Card className="h-100">
        <Card.Header className=" text-white" style={{ backgroundColor: "#76d8f0ff" }}>
          <h6 className="mb-0">{categoryCode}</h6>
        </Card.Header>
        <Card.Body className="p-3">
          <Form.Group className="mb-2">
            <Form.Label className="small">Delivered (Kg)</Form.Label>
            <Form.Control
              type="number"
              placeholder="0"
              size="sm"
              onChange={(e) =>
                handleCategoryChange(categoryCode, 'delivered', e.target.value)
              }
            />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label className="small">WRN (Kg)</Form.Label>
            <Form.Control
              type="number"
              placeholder="0"
              size="sm"
              onChange={(e) =>
                handleCategoryChange(categoryCode, 'wrn', e.target.value)
              }
            />
          </Form.Group>
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
                    <span >{selectedTransportInfo?.cws}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Quantity:</strong>
                    <span className="badge bg-success">{selectedTransportInfo?.quantity}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Driver:</strong>
                    <span className="badge bg-warning text-dark">{selectedTransportInfo?.driver}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Truck:</strong>
                    <span className="badge bg-secondary">{selectedTransportInfo?.trackPlatNumber}</span>
                  </div>
                </Col>
              </Row>

              <hr />

              {/* Date Fields Section */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Transport Date</strong></Form.Label>
                    <Form.Control
                      type="date"
                      onChange={(e) =>
                        handleCategoryChange('dates', 'transportDate', e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label><strong>Delivery Date</strong></Form.Label>
                    <Form.Control
                      type="date"
                      onChange={(e) =>
                        handleCategoryChange('dates', 'deliveryDate', e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Category Analysis Section */}
              <Row>
                <Col md={12}>
                  <h5 className="mb-3 ">Category Analysis</h5>
                  <Row>
                    {/* Render all valid categories */}
                    {validKeys.map((category) => 
                      includeInValidKeys(category) && renderCategoryInputs(category)
                    )}
                  </Row>
                </Col>
              </Row>

              {/* Summary Section */}
              {/* <Row className="mt-4">
                <Col md={12}>
                  <Card className="bg-light border-0">
                    <Card.Body>
                      <h6 className="text-muted mb-3">Summary</h6>
                      <Row>
                        <Col md={3}>
                          <div className="text-center">
                            <div className="h4 text-success mb-1">-</div>
                            <small className="text-muted">Total Delivered</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <div className="h4 text-warning mb-1">-</div>
                            <small className="text-muted">Total WRN</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <div className="h4 text-danger mb-1">-</div>
                            <small className="text-muted">Total Rejected</small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-center">
                            <div className="h4 text-info mb-1">-</div>
                            <small className="text-muted">Categories</small>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};