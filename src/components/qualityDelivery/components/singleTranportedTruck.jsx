import { Form, Row, Col, Card, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { GetSampleStorage } from "../../Admin/quality/receivedTrack/actions";
import { formatCategory } from "../../../utils/formatString";

export const SingleTransportedTruck = ({
  setInfo,
  categories,
  selectedTransportInfo,
}) => {
  // Filter categories to only include C1, C2, S86, S87, S88 and exclude A2, A3
  const filteredCategories = categories.filter((category) => {
    const upperCategory = category.toUpperCase();
    return (
      upperCategory.startsWith("C1") ||
      upperCategory.startsWith("C2") ||
      upperCategory.startsWith("S86") ||
      upperCategory.startsWith("S87") ||
      upperCategory.startsWith("S88")
    );
  });

  const validKeys = [...new Set(filteredCategories)];
  const includeInValidKeys = (key) => validKeys.includes(key);
  const { sampleStoragePending, sampleStoragedata } = GetSampleStorage();

  const qualityColumns = [
    { key: "labMoisture", label: "Lab moisture" },
    { key: "plus16", label: "+16" },
    { key: "fifteen", label: "15" },
    { key: "fourteen", label: "14" },
    { key: "thirteen", label: "13" },
    { key: "b12", label: "B12" },
    { key: "defect", label: "Defect" },
    { key: "ppScore", label: "PP Score(%)" },
    { key: "sampleStorage", label: "Sample Storage" },
  ];

  const handleCategoryChange = (category, field, value) => {
    setInfo((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleArrivalDateChange = (value) => {
    setInfo((prev) => ({
      ...prev,
      arrivalDate: value,
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to render form control based on field type
  const renderFormControl = (category, column) => {
    if (column.key === "sampleStorage") {
      return (
        <Form.Select
          size="sm"
          onChange={(e) =>
            handleCategoryChange(category, column.key, e.target.value)
          }
          style={{ minWidth: "120px" }}
        >
          <option value="">Select...</option>

          {!sampleStoragePending &&
            sampleStoragedata?.map((storage) => (
              <option key={storage.id} value={storage.id}>
                {storage.name}
              </option>
            ))}
        </Form.Select>
      );
    }

    return (
      <Form.Control
        type="number"
        placeholder="0"
        size="sm"
        onChange={(e) =>
          handleCategoryChange(category, column.key, e.target.value)
        }
        style={{ minWidth: "80px" }}
      />
    );
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
                    <strong className="me-2">DeliveredKgs:</strong>
                    <span className="badge bg-secondary">
                      {selectedTransportInfo?.deliverdKgs}
                    </span>
                  </div>
                </Col>
              </Row>

              <hr />

              {/* <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <strong>Sample token</strong>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      defaultValue={getTodayDate()}
                      onChange={(e) => handleArrivalDateChange(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row> */}

              <Row>
                <Col md={12}>
                  <h5 className="mb-3">Category Analysis</h5>
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
                          <th style={{ backgroundColor: "#C0C0C0" }}>Defect</th>
                          <th style={{ backgroundColor: "#C0C0C0" }}>
                            PP Score(%)
                          </th>
                          <th style={{ backgroundColor: "#C0C0C0" }}>
                            Sample Storage
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {validKeys.map((category) => {
                          if (!includeInValidKeys(category)) return null;
                          return (
                            <tr key={category}>
                              <td className="fw-bold align-middle w-75">
                                {formatCategory(category)}
                              </td>
                              {qualityColumns.map((column) => (
                                <td key={column.key}>
                                  {renderFormControl(category, column)}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Card.Body>
  );
};

SingleTransportedTruck.propTypes = {
  setInfo: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  selectedTransportInfo: PropTypes.object,
};
