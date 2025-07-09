import { Form, Col, Card, InputGroup, Button } from "react-bootstrap";
import { SelectionBox } from "./selection";

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
  pageSizeOption = [5, 10, 20],
  emptyStateMessage = "No data available",
  isLoading = false,
  rowKeyField = "id",
  itemsPerPage = 5,
  onPageSizeChange,
  searchQuery = "",
  setSearchQuery = () => null,
  enableSelectionBox = false,
  selectionOPtions = [],
  handleSelection = () => null,
  placeholder = "",
  isQualityDelivery = false,
  ifQualityDeliveryDataIsitLoading = true,
  ifQualityDeliveryDataDownloadExcele = () => null,
  ifQualityDeliveryDataDownloadSummaryExcele = () => null,
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
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            {/* Search and selection controls */}
            <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
              {/* Search box */}
              <div className="flex-grow-1" style={{ maxWidth: "250px" }}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </div>

              {/* selection box */}
              {enableSelectionBox && (
                <div className="flex-grow-1" style={{ maxWidth: "550px" }}>
                  <SelectionBox
                    selectionOPtions={[...new Set(selectionOPtions)]}
                    disable={isLoading}
                    handleSelection={handleSelection}
                    placeHolder={placeholder}
                  />
                </div>
              )}
            </div>

            {/* right side controls */}
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
              {/* download button */}
              {isQualityDelivery && (
                <div className="d-flex" style={{ width: "12rem" }}>
                  <Button
                    variant="outline-success"
                    disabled={ifQualityDeliveryDataIsitLoading}
                    onClick={() => ifQualityDeliveryDataDownloadExcele()}
                  >
                    <i className="bi bi-download"></i>
                    <span className="d-none d-sm-inline ms-1">
                      Download Details
                    </span>
                  </Button>
                </div>
              )}
              {isQualityDelivery && (
                <div className="d-flex" style={{ width: "13rem" }}>
                  <Button
                    variant="outline-success"
                    disabled={ifQualityDeliveryDataIsitLoading}
                    onClick={() => ifQualityDeliveryDataDownloadSummaryExcele()}
                  >
                    <i className="bi bi-download"></i>
                    <span className="d-none d-sm-inline ms-1">
                      Download summary
                    </span>
                  </Button>
                </div>
              )}
              {/* items per page select */}
              <div style={{ width: "5rem" }}>
                <Form.Select
                  value={itemsPerPage}
                  onChange={(e) => {
                    onPageSizeChange(e.target.value);
                  }}
                  disabled={isLoading}
                >
                  {pageSizeOption.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </div>
        </Card.Body>
      </div>

      <div className="table-responsive mt-4">
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
