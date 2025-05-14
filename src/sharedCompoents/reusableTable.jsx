import { Form, Row, Col, Card, InputGroup } from "react-bootstrap";

const processingTheme = {
  primary: "#008080",
  secondary: "#4FB3B3",
  accent: "#D95032",
  neutral: "#E6F3F3",
  tableHover: "#F8FAFA",
  directDelivery: "#4FB3B3",
  centralStation: "#008080",
  buttonHover: "#006666",
  tableHeader: "#E0EEEE",
  tableBorder: "#D1E0E0",
  emptyStateBackground: "#F5FAFA",
};

const ReusableTable = ({
  children,
  data = [],
  columns = [],
  emptyStateMessage = "No data available",
  isLoading = false,
  rowKeyField = "id",
  itemsPerPage = 5,
  onPageSizeChange,
}) => {
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            {/* Items per page select on left */}
            <div style={{ width: "5rem" }}>
              <Form.Select
                value={itemsPerPage}
                onChange={(e) => {
                  onPageSizeChange(e.target.value);
                }}
                disabled={isLoading}
              >
                {[5, 10, 20].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Search box on right */}
            <div style={{ width: "250px" }}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  // value={searchQuery}
                  // onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </div>
          </div>
        </Card.Body>
      </div>

      <div className="table-responsive">
        <table
          className="table"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%",
            border: `1px solid ${processingTheme.tableBorder}`,
          }}
        >
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{
                    backgroundColor: processingTheme.tableHeader,
                    color: processingTheme.primary,
                    padding: "10px 15px",
                    fontWeight: 600,
                    borderBottom: `2px solid ${processingTheme.primary}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.header || column.field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={`${columns?.length ?? 4}`}>
                  <div className="text-center fw-bold fs-5 p-3 border border-warning rounded bg-light text-dark">
                    {emptyStateMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item[rowKeyField] || rowIndex}
                  style={{ backgroundColor: "white" }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      processingTheme.tableHover;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        padding: "10px 15px",
                        borderBottom: `1px solid ${processingTheme.tableBorder}`,
                      }}
                    >
                      {column.render ? column.render(item) : item[column.field]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {children}
    </div>
  );
};
export default ReusableTable;
