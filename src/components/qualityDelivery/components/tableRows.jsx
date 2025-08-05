import { Form, Row, Col, Card, Table } from "react-bootstrap";
import PropTypes from "prop-types";
import { GetSampleStorage } from "../../Admin/quality/receivedTrack/actions";
 
export const SingleTransportedTruck = ({
  setInfo,
  categories,
  selectedTransportInfo,
}) => {
  // Filter categories to only include C1, C2, S86, S87, S88 and exclude A2, A3
  const filteredCategories = categories.filter(category => {
    const upperCategory = category.toUpperCase();
    return (
      (upperCategory.startsWith('C1') || 
       upperCategory.startsWith('C2') || 
       upperCategory.startsWith('S86') || 
       upperCategory.startsWith('S87') || 
       upperCategory.startsWith('S88')) 
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
    if (column.key === 'sampleStorage') {
      return (
        <Form.Select
          size="sm"
          onChange={(e) =>
            handleCategoryChange(
              category,
              column.key,
              e.target.value
            )
          }
          style={{ 
            minWidth: "140px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <option value="">Select...</option>
          
          {!sampleStoragePending &&sampleStoragedata?.map((storage) => (
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
          handleCategoryChange(
            category,
            column.key,
            e.target.value
          )
        }
        style={{ 
          minWidth: "90px",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}
      />
    );
  };

  return (
    <Card.Body style={{ padding: "2rem" }}>
      <Row className="mb-4">
        <Col md={12}>
          <Card className="bg-light shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
            <Card.Body style={{ padding: "2rem" }}>
              {/* Transport Info Section */}
              <Row className="mb-4 g-3">
                <Col xs={12} sm={6} lg={3}>
                  <div className="d-flex flex-column p-3 bg-white rounded-3 shadow-sm h-100">
                    <small className="text-muted fw-semibold mb-1">STATION</small>
                    <span className="fw-bold text-primary fs-6">{selectedTransportInfo?.cws}</span>
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="d-flex flex-column p-3 bg-white rounded-3 shadow-sm h-100">
                    <small className="text-muted fw-semibold mb-1">QUANTITY</small>
                    <span className="badge bg-success fs-6 align-self-start px-3 py-2">
                      {selectedTransportInfo?.quantity}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="d-flex flex-column p-3 bg-white rounded-3 shadow-sm h-100">
                    <small className="text-muted fw-semibold mb-1">DRIVER</small>
                    <span className="badge bg-warning text-dark fs-6 align-self-start px-3 py-2">
                      {selectedTransportInfo?.driver}
                    </span>
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="d-flex flex-column p-3 bg-white rounded-3 shadow-sm h-100">
                    <small className="text-muted fw-semibold mb-1">TRUCK</small>
                    <span className="badge bg-secondary fs-6 align-self-start px-3 py-2">
                      {selectedTransportInfo?.trackPlatNumber}
                    </span>
                  </div>
                </Col>
              </Row>

              <hr style={{ margin: "2rem 0", opacity: 0.3 }} />

              {/* Sample Token Section */}
              <Row className="mb-5">
                <Col md={6} lg={4}>
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark mb-3">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Sample Token Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        defaultValue={getTodayDate()}
                        onChange={(e) => handleArrivalDateChange(e.target.value)}
                        required
                        style={{ 
                          borderRadius: "8px",
                          border: "2px solid #e9ecef",
                          padding: "12px 16px",
                          fontSize: "1rem"
                        }}
                      />
                    </Form.Group>
                  </div>
                </Col>
              </Row>

              {/* Category Analysis Section */}
              <Row>
                <Col md={12}>
                  <div className="d-flex align-items-center mb-4">
                    <h4 className="fw-bold text-dark mb-0 me-3">Category Analysis</h4>
                    <div className="flex-grow-1" style={{ height: "2px", background: "linear-gradient(to right, #76d8f0ff, transparent)" }}></div>
                  </div>
                  
                  <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                    <div className="table-responsive">
                      <Table className="mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                          <tr>
                            <th
                              style={{ 
                                backgroundColor: "#76d8f0ff",
                                padding: "20px 24px",
                                fontSize: "14px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                borderBottom: "3px solid #5bc0de",
                                position: "sticky",
                                left: "0",
                                zIndex: "10",
                                minWidth: "180px"
                              }}
                              className="text-white"
                            >
                              Category
                            </th>
                            {qualityColumns.slice(0, 6).map((column) => (
                              <th
                                key={column.key}
                                style={{ 
                                  backgroundColor: "#D4AF37",
                                  padding: "20px 16px",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  letterSpacing: "0.3px",
                                  textAlign: "center",
                                  borderBottom: "3px solid #B8860B",
                                  minWidth: "110px"
                                }}
                                className="text-white"
                              >
                                {column.label}
                              </th>
                            ))}
                            {qualityColumns.slice(6).map((column) => (
                              <th
                                key={column.key}
                                style={{ 
                                  backgroundColor: "#C0C0C0",
                                  padding: "20px 16px",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  letterSpacing: "0.3px",
                                  textAlign: "center",
                                  borderBottom: "3px solid #A0A0A0",
                                  minWidth: column.key === 'sampleStorage' ? "160px" : "120px"
                                }}
                                className="text-dark"
                              >
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {validKeys.map((category, rowIndex) =>
                            includeInValidKeys(category) && (
                              <tr 
                                key={category}
                                style={{
                                  backgroundColor: rowIndex % 2 === 0 ? "#fafbfc" : "#ffffff",
                                  transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f0f8ff";
                                  e.currentTarget.style.transform = "scale(1.001)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? "#fafbfc" : "#ffffff";
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <td 
                                  className="fw-bold align-middle"
                                  style={{
                                    padding: "24px",
                                    fontSize: "15px",
                                    color: "#2c3e50",
                                    borderRight: "1px solid #e9ecef",
                                    backgroundColor: "inherit",
                                    position: "sticky",
                                    left: "0",
                                    zIndex: "5"
                                  }}
                                >
                                  <div className="d-flex align-items-center">
                                    <div 
                                      className="rounded-circle me-3"
                                      style={{
                                        width: "8px",
                                        height: "8px",
                                        backgroundColor: "#76d8f0ff"
                                      }}
                                    ></div>
                                    {category}
                                  </div>
                                </td>
                                {qualityColumns.map((column) => (
                                  <td 
                                    key={column.key}
                                    style={{
                                      padding: "20px 16px",
                                      textAlign: "center",
                                      verticalAlign: "middle",
                                      borderRight: "1px solid #f1f3f4"
                                    }}
                                  >
                                    {renderFormControl(category, column)}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </Table>
                    </div>
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