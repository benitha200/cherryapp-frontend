import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100 p-4"
    >
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
          <Card className="text-center shadow p-4">
            <Card.Body>
              <div
                className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-4"
                style={{ width: "48px", height: "48px" }}
              >
                <AlertTriangle className="text-danger" size={24} />
              </div>

              <h1 className="fw-bold fs-1 mb-2">404</h1>
              <h2 className="fw-semibold fs-4 mb-4">Uh Oh! Page Not Found</h2>

              <p className="text-muted mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>

              <Row className="justify-content-center g-3">
                <Col xs={12} sm="auto">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    className="d-flex align-items-center justify-content-center gap-2 w-100"
                  >
                    <ArrowLeft size={16} />
                    Go Back
                  </Button>
                </Col>
                <Col xs={12} sm="auto">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/")}
                    className="w-100"
                  >
                    Return Home
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
