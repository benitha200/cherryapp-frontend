import { useState } from "react";
import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";

export const QuantityReceived = ({ info, setInfo }) => {
  const storageOptions = ["a1", "a2", "a3"];
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
                      <strong>Station:</strong> Ngororero
                    </p>
                  </Col>
                  <Col xs="auto">
                    <p>
                      <strong>Driver:</strong> Eric
                    </p>
                  </Col>
                  <Col xs="auto">
                    <p className="mb-1">
                      <strong>Quantity:</strong> 40000
                    </p>
                  </Col>
                </Row>
              </Col>

              <Row className="mb-3">
                {/* Screen Analysis */}
                <Col md={9}>
                  <Row>
                    {/* c1*/}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>C1</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.C1}
                          onChange={(e) =>
                            setInfo((prev) => ({
                              ...prev,
                              C1: e.target.value,
                            }))
                          }
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* c2 */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>C2</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.C2}
                          onChange={(e) =>
                            setInfo((prev) => ({
                              ...prev,
                              C2: e.target.value,
                            }))
                          }
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* s382 */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>S382</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.S382}
                          onChange={(e) =>
                            setInfo((prev) => ({
                              ...prev,
                              S382: e.target.value,
                            }))
                          }
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>
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
