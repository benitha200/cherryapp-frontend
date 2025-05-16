import { Form, Row, Col, Card } from "react-bootstrap";
export const QuantityReceived = ({
  setInfo,
  categories,
  selectedTransportInfo,
}) => {
  const validKeys = [...new Set(categories?.relatedCategories)];
  const includeInValidKeys = (key) => validKeys.includes(key);
  return (
    <Card.Body>
      <Row className="mb-3">
        <Col md={12}>
          <Card className="bg-light">
            <Card.Body>
              <Col>
                <Row className="mb-1">
                  <Col xs="auto">
                    <p className="mb-1">
                      <strong>Station:</strong> {selectedTransportInfo?.cws}
                    </p>
                  </Col>
                  <Col xs="auto">
                    <p>
                      <strong>Driver:</strong> {selectedTransportInfo?.quantity}
                    </p>
                  </Col>
                  <Col xs="auto">
                    <p className="mb-1">
                      <strong>Quantity:</strong> {selectedTransportInfo?.driver}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Row className="mb-3">
                {/* Screen Analysis */}
                <Col md={9}>
                  <Row>
                    {/* c1*/}
                    {includeInValidKeys("C1") && (
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>C1</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            defaultValue={categories?.c1 ?? ""}
                            value={categories?.c1}
                            onChange={(e) =>
                              setInfo((prev) => ({
                                ...prev,
                                c1: e.target.value,
                              }))
                            }
                            disabled={false}
                          />
                        </Form.Group>
                      </Col>
                    )}

                    {/* c2 */}
                    {includeInValidKeys("C2") && (
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>C2</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={categories?.c2}
                            defaultValue={categories?.categories ?? ""}
                            onChange={(e) =>
                              setInfo((prev) => ({
                                ...prev,
                                c2: e.target.value,
                              }))
                            }
                            disabled={false}
                          />
                        </Form.Group>
                      </Col>
                    )}

                    {/* s86 */}
                    {includeInValidKeys("S86") && (
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>S86</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={categories?.s86}
                            defaultValue={categories?.s86 ?? ""}
                            onChange={(e) =>
                              setInfo((prev) => ({
                                ...prev,
                                s86: e.target.value,
                              }))
                            }
                            disabled={false}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    {/* s86 */}
                    {includeInValidKeys("S87") && (
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>S87</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={categories?.s87}
                            defaultValue={categories?.s87 ?? ""}
                            onChange={(e) =>
                              setInfo((prev) => ({
                                ...prev,
                                s87: e.target.value,
                              }))
                            }
                            disabled={false}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    {/* s88 */}
                    {includeInValidKeys("S88") && (
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>S88</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={categories?.s88}
                            defaultValue={categories?.s88 ?? ""}
                            onChange={(e) =>
                              setInfo((prev) => ({
                                ...prev,
                                s88: e.target.value,
                              }))
                            }
                            disabled={false}
                          />
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};
