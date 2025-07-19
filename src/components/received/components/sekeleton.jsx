import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";

const TransportedTrackDelivery = () => {
  const skeletonStyle = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "4px",
  };

  const SkeletonLine = ({
    width = "100%",
    height = "16px",
    className = "",
  }) => (
    <div
      className={`mb-2 ${className}`}
      style={{
        ...skeletonStyle,
        width,
        height,
      }}
    />
  );

  const SkeletonCard = () => (
    <Col md={2} className="mb-3">
      <Card className="h-100 border-0" style={{ backgroundColor: "#f8f9fa" }}>
        <Card.Body className="text-center">
          <SkeletonLine width="80%" height="12px" />
          <SkeletonLine width="60%" height="24px" />
        </Card.Body>
      </Card>
    </Col>
  );

  const SkeletonTableRow = () => (
    <tr>
      <td>
        <SkeletonLine width="80%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="60%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="60%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="60%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="50%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="40%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="50%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="40%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="50%" height="14px" />
      </td>
      <td>
        <SkeletonLine width="40%" height="14px" />
      </td>
    </tr>
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <Container fluid className="py-4">
        {/* Summary Cards Skeleton */}
        <Row className="mb-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </Row>

        {/* Station Quality Report Skeleton */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white py-3">
                <Row className="align-items-center">
                  <Col>
                    <SkeletonLine width="180px" height="24px" />
                  </Col>
                  <Col xs="auto">
                    <div className="d-flex gap-2">
                      <SkeletonLine width="120px" height="38px" />
                      <SkeletonLine width="200px" height="38px" />
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <SkeletonLine width="60px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="100px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="80px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="80px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="90px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="70px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="110px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="80px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="100px" height="14px" />
                      </th>
                      <th>
                        <SkeletonLine width="70px" height="14px" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                    <SkeletonTableRow />
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TransportedTrackDelivery;
