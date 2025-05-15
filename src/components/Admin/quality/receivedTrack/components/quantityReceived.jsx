import { useState } from "react";
import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";

export const QuantityReceived = ({ info, setInfo, categories }) => {
  const storageOptions = ["a1", "a2", "a3"];
  // const categories = {
  //   c2: 0,
  //   c1: 0,
  //   s86: 0,
  //   s87: 0,
  //   s88: 0,
  // };
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
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>C1</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          defaultValue={categories?.c1}
                          value={info.c1}
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

                    {/* c2 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>C2</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.c2}
                          defaultValue={categories?.categories}
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

                    {/* s86 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>s86</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.s86}
                          defaultValue={categories?.s86}
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
                    {/* s86 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>s87</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.s87}
                          defaultValue={categories?.s87}
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
                    {/* s88 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>s86</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={info.s88}
                          defaultValue={categories?.s88}
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
