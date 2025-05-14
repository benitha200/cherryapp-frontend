import { Modal, Card, Row, Col } from "react-bootstrap";

export default function OfflineModal() {
  return (
    <Modal
      show={true}
      backdrop="static"
      keyboard={false}
      centered
      dialogClassName="modal-dialog-centered"
    >
      <Card className="border-0 shadow-lg">
        <Card.Body className="text-center p-4">
          <Row className="justify-content-center">
            <Col xs="auto" className="mb-3">
              <div className="text-danger">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
            </Col>
          </Row>
          <h3 className="fw-medium mb-2">You're offline</h3>
          <p className="text-muted mb-0">
            Your internet connection appears to be offline. Please check your
            network connection and try again.
          </p>
        </Card.Body>
      </Card>
    </Modal>
  );
}
