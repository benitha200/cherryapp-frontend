import { Row, Col, Card, Table, Form } from "react-bootstrap";
import { GetTransportedTracyBytransferGroupIdAndDate } from "../action";
import { GetSampleStorage } from "../../Admin/quality/receivedTrack/actions";
import { formatCategory } from "../../../utils/formatString";

export const SingleTransportedTruckdisplay = ({ selectedTransportInfo }) => {
  const { transportGroupId } = selectedTransportInfo;

  const { isPending, error, data } =
    GetTransportedTracyBytransferGroupIdAndDate(transportGroupId);
  const { sampleStoragedata } = GetSampleStorage();

  const qualityData = data?.data || [];

  if (isPending) {
    return (
      <Card.Body>
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading quality analysis data...</p>
        </div>
      </Card.Body>
    );
  }

  if (error) {
    return (
      <Card.Body>
        <div className="alert alert-danger" role="alert">
          Error loading quality analysis data: {error.message}
        </div>
      </Card.Body>
    );
  }

  const qualityColumns = [
    { key: "labMoisture", label: "Lab Moisture", field: "labMoisture" },
    { key: "plus16", label: "+16", field: "sixteenPlus" },
    { key: "fifteen", label: "15", field: "fifteen" },
    { key: "fourteen", label: "14", field: "fourteen" },
    { key: "thirteen", label: "13", field: "thirteen" },
    { key: "b12", label: "B12", field: "b12" },
    { key: "defect", label: "Defect", field: "defect" },
    { key: "ppScore", label: "PP Score(%)", field: "ppScore" },
    { key: "sampleStorage", label: "Sample Storage", field: "sampleStorageId" },
  ];

  // Helper function to get sample storage name by ID
  const getSampleStorageName = (storageId) => {
    if (!sampleStoragedata || !storageId) return "";
    const storage = sampleStoragedata.find((item) => item.id === storageId);
    return storage ? storage.name : "";
  };

  // Helper function to render form control based on field type
  const renderDisplayValue = (item, column) => {
    if (column.key === "sampleStorage") {
      const storageName = getSampleStorageName(item[column.field]);
      return (
        <Form.Control
          type="text"
          value={storageName}
          size="sm"
          disabled
          style={{ minWidth: "120px", backgroundColor: "#f8f9fa" }}
        />
      );
    }

    return (
      <Form.Control
        type="number"
        value={item[column.field] || 0}
        size="sm"
        disabled
        style={{ minWidth: "80px", backgroundColor: "#f8f9fa" }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
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
                    <span>{selectedTransportInfo?.cws}</span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Quantity:</strong>
                    <span className="badge bg-success">
                      {selectedTransportInfo?.quantity}
                    </span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Driver:</strong>
                    <span className="badge bg-warning text-dark">
                      {selectedTransportInfo?.driver}
                    </span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Truck:</strong>
                    <span className="badge bg-secondary">
                      {selectedTransportInfo?.trackPlatNumber}
                    </span>
                  </div>
                </Col>
                <Col xs="auto">
                  <div className="d-flex align-items-center">
                    <strong className="me-2">Delivered kgs:</strong>
                    <span className="badge bg-secondary">
                      {selectedTransportInfo?.deliverdKgs}
                    </span>
                  </div>
                </Col>
              </Row>

              <hr />

              {qualityData.length > 0 && (
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <strong>Status</strong>
                      </Form.Label>
                      <div className="mt-2">
                        <span
                          className={`badge fs-6 ${
                            qualityData[0]?.status === "COMPLETED"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {qualityData[0]?.status || "N/A"}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={12}>
                  <h5 className="mb-3">Quality Analysis Results</h5>
                  {qualityData.length > 0 ? (
                    <div className="table-responsive">
                      <Table bordered hover className="mb-0">
                        <thead>
                          <tr>
                            <th
                              style={{ backgroundColor: "#76d8f0ff" }}
                              className="text-white"
                            >
                              Category
                            </th>
                            <th
                              style={{ backgroundColor: "#76d8f0ff" }}
                              className="text-white"
                            >
                              Batch No
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              Lab Moisture
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              +16
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              15
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              14
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              13
                            </th>
                            <th
                              style={{ backgroundColor: "#D4AF37" }}
                              className="text-white"
                            >
                              B12
                            </th>
                            <th style={{ backgroundColor: "#C0C0C0" }}>
                              Defect
                            </th>
                            <th style={{ backgroundColor: "#C0C0C0" }}>
                              PP Score(%)
                            </th>
                            <th style={{ backgroundColor: "#C0C0C0" }}>
                              Sample Storage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityData.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-bold align-middle w-50">
                                {formatCategory(item.category)}
                              </td>
                              <td className="fw-bold align-middle w-50">
                                {item?.batchNo ?? "-"}
                              </td>
                              {qualityColumns.map((column) => (
                                <td key={column.key}>
                                  {renderDisplayValue(item, column)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-muted p-4">
                      <p>No quality analysis data available</p>
                    </div>
                  )}
                </Col>
              </Row>

              {qualityData.length > 0 && (
                <Row className="mt-3">
                  <Col md={12}>
                    <div className="text-muted small">
                      <strong>Last Updated:</strong>{" "}
                      {formatDate(qualityData[0]?.updatedAt)}
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};
