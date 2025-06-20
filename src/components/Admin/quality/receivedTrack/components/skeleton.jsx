import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Table,
  Placeholder,
} from "react-bootstrap";

export const DeliveryTableSkeleton = () => {
  return (
    <Container fluid>
      {/* Page Title with loading state */}
      <h2 className="my-4">
        <Placeholder as="span" animation="glow">
          <Placeholder xs={3} />
        </Placeholder>
      </h2>

      <Card>
        <Card.Body>
          <Table bordered hover responsive>
            <thead style={{ backgroundColor: "#f0f8f8" }}>
              <tr>
                <th style={{ color: "#008080" }}>TRUCK PLAT NUMBER</th>
                <th style={{ color: "#008080" }}>CWS</th>
                <th style={{ color: "#008080" }}>QUANTITY(KG)</th>
                <th style={{ color: "#008080" }}>DRIVER_NAME</th>
                <th style={{ color: "#008080" }}>DRIVER_PHONE</th>
                <th style={{ color: "#008080" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <Placeholder animation="glow">
                      <Placeholder xs={8} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder animation="glow">
                      <Placeholder xs={6} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder animation="glow">
                      <Placeholder xs={4} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder animation="glow">
                      <Placeholder xs={5} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder animation="glow">
                      <Placeholder xs={3} />
                    </Placeholder>
                  </td>
                  <td style={{ width: "80px" }}>
                    <Placeholder animation="glow">
                      <Placeholder
                        xs={8}
                        style={{ height: "30px", borderRadius: "4px" }}
                      />
                    </Placeholder>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Placeholder animation="glow">
                <Placeholder xs={5} />
              </Placeholder>
            </div>
            <div>
              <Placeholder animation="glow">
                <Placeholder
                  xs={6}
                  style={{ height: "38px", borderRadius: "4px" }}
                />
              </Placeholder>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};
