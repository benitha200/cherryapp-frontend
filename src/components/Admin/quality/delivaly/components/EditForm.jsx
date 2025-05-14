import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";

export const EditDelivary = () => {
  const storageOptions = ["Standard", "Premium", "Reserve"];

  return (
    <Card.Body>
      <Row className="mb-3">
        <Col md={12}>
          <Card className="bg-light">
            <Card.Body>
              <h6 className="mb-3">Quality Metrics</h6>

              <Row className="mb-3">
                {/* LAB MOISTURE */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className=" fw-bold">
                      STATION MOISTURE
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      onChange={(e) => null}
                      disabled={false}
                    />
                  </Form.Group>
                </Col>

                {/* Screen Analysis */}
                <Col md={9}>
                  <Form.Label className=" fw-bold">Screen Analysis</Form.Label>
                  <Row>
                    {/* +16 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>+16</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          onChange={(e) => null}
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* 15 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>15</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          onChange={(e) => null}
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* 14 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>14</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          onChange={(e) => null}
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* 13 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>13</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          onChange={(e) => null}
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>

                    {/* B/12 */}
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>B/12</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          onChange={(e) => null}
                          disabled={false}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Row>
                {/* DEFFECT */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-success fw-bold">
                      DEFFECT
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      onChange={(e) => null}
                      disabled={false}
                    />
                  </Form.Group>
                </Col>

                {/* PP SCORE(%) */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-success fw-bold">
                      PP SCORE(%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      onChange={(e) => null}
                      disabled={false}
                    />
                  </Form.Group>
                </Col>

                {/* SAMPLE STORAGE */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-success fw-bold">
                      SAMPLE STORAGE
                    </Form.Label>
                    <Form.Select onChange={(e) => null} disabled={false}>
                      <option value="" disabled selected>
                        Select storage
                      </option>
                      {storageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Category */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="text-success fw-bold">
                      Category
                    </Form.Label>
                    <Form.Select onChange={(e) => null} disabled={false}>
                      <option value="" disabled selected>
                        Select category
                      </option>
                      {["AA", "AB", "PB", "C", "T"].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};
