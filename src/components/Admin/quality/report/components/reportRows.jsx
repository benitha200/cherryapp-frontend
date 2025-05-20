import { Form, Row, Col, Card, InputGroup } from "react-bootstrap";
import { formatDate } from "./../../../../../utils/formatDate";
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

export const ReprotTable = ({
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
                <>
                  {/* first row */}
                  <tr key={rowIndex}>
                    {/* batch no */}
                    <td
                      style={{
                        padding: "10px 15px",
                        borderBottom: `1px solid ${processingTheme.tableBorder}`,
                      }}
                    >
                      {`${item?.batchNo} ${
                        item?.sample?.batches[0]?.gradeKey ?? ""
                      }`}
                    </td>
                    {/* parchment qt */}
                    <td
                      style={{
                        padding: "10px 15px",
                        borderBottom: `1px solid ${processingTheme.tableBorder}`,
                      }}
                    >
                      {`${
                        item?.sample?.outputKgs[
                          item?.sample?.batches[0]?.gradeKey ?? ""
                        ]
                      }`}
                    </td>
                    {/* date of analysis */}
                    <td>{formatDate(item?.delivery?.batches[0]?.createdAt)}</td>
                    {/* moisture content lag(%) sample */}
                    <td>{item?.sample?.batches[0]?.labMoisture}</td>
                    {/* moisture content lag(%) delivery */}
                    <td>{item?.sample?.batches[0]?.cwsMoisture}</td>
                    {/* variation M.c */}
                    <td>
                      {(item?.sample?.batches[0]?.labMoisture ?? 0) -
                        (item?.sample?.batches[0]?.cwsMoisture ?? 0)}
                    </td>
                    {/* 16+ */}
                    <td>{item?.delivery?.batches[0]?.screen["16+"] ?? 0}</td>
                    {/* + 15 */}
                    <td>{item?.delivery?.batches[0]?.screen["15"] ?? 0}</td>
                    {/* av 15+ Delivary */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["15"] ?? 0)}
                    </td>
                    {/* av .15+ samples */}
                    <td>
                      {Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.sample?.batches[0]?.screen["15"] ?? 0)}
                    </td>
                    {/* variation 15+ */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) -
                        (Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                          Number(item?.sample?.batches[0]?.screen["15"] ?? 0))}
                    </td>
                    {/* 14 */}
                    <td>{item?.delivery?.batches[0]?.screen["14"] ?? 0}</td>
                    {/* 13 */}
                    <td>{item?.delivery?.batches[0]?.screen["13"] ?? 0}</td>
                    {/* av 13/14/delivery */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["13"] ?? 0)}
                    </td>
                    {/* av 13/14/sample */}
                    <td>
                      {Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                        Number(item?.sample?.batches[0]?.screen["13"] ?? 0)}
                    </td>
                    {/* variation 15+ */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["13"] ?? 0) -
                        (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                          Number(item?.sample?.batches[0]?.screen["13"] ?? 0))}
                    </td>
                    <td>{item?.delivery?.batches[0]?.screen["B/12"] ?? 0}</td>
                    {/* deffect  */}
                    <td>{item?.delivery?.batches[0]?.defect ?? 0}</td>
                    {/* av.lg delivery */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.defect ?? 0)}
                    </td>
                    {/* av.lg samples */}
                    <td>
                      {Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                        Number(item?.sample?.batches[0]?.defect ?? 0)}
                    </td>
                    {/* variation lg */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["B/12"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.defect ?? 0) -
                        (Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                          Number(item?.sample?.batches[0]?.defect ?? 0))}
                    </td>
                    {/* ot Delivery */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) +
                        (Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                          Number(
                            item?.delivery?.batches[0]?.screen["13"] ?? 0
                          )) +
                        (Number(
                          item?.delivery?.batches[0]?.screen["B/12"] ?? 0
                        ) +
                          Number(item?.delivery?.batches[0]?.defect ?? 0))}
                    </td>
                    {/* ot Sample */}
                    <td>
                      {Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.sample?.batches[0]?.screen["15"] ?? 0) +
                        (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                          Number(item?.sample?.batches[0]?.screen["13"] ?? 0)) +
                        (Number(item?.sample?.batches[0]?.screen["B/12"] ?? 0) +
                          Number(item?.sample?.batches[0]?.defect ?? 0))}
                    </td>
                    {/* variation ot */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.screen["16+"] ?? 0) +
                        Number(item?.delivery?.batches[0]?.screen["15"] ?? 0) +
                        (Number(item?.delivery?.batches[0]?.screen["14"] ?? 0) +
                          Number(
                            item?.delivery?.batches[0]?.screen["13"] ?? 0
                          )) +
                        (Number(
                          item?.delivery?.batches[0]?.screen["B/12"] ?? 0
                        ) +
                          Number(item?.delivery?.batches[0]?.defect ?? 0)) -
                        (Number(item?.sample?.batches[0]?.screen["16+"] ?? 0) +
                          Number(item?.sample?.batches[0]?.screen["15"] ?? 0) +
                          (Number(item?.sample?.batches[0]?.screen["14"] ?? 0) +
                            Number(
                              item?.sample?.batches[0]?.screen["13"] ?? 0
                            )) +
                          (Number(
                            item?.sample?.batches[0]?.screen["B/12"] ?? 0
                          ) +
                            Number(item?.sample?.batches[0]?.defect ?? 0)))}
                    </td>
                    {/* accidity  */}
                    <td></td>
                    {/* body */}
                    <td></td>
                    {/* comments */}
                    <td></td>
                    {/* potato cups */}
                    <td></td>
                    <td></td>
                    {/* pp Score Delivery */}
                    <td>{item?.delivery?.batches[0]?.ppScore ?? 0}</td>
                    {/* pp score sample  */}
                    <td>{item?.sample?.batches[0]?.ppScore ?? 0}</td>
                    {/* category */}
                    <td>{item?.sample?.batches[0]?.newCategory ?? "-"}</td>
                    {/* pp score variation  */}
                    <td>
                      {Number(item?.delivery?.batches[0]?.ppScore ?? 0) -
                        Number(item?.sample?.batches[0]?.ppScore ?? 0)}
                    </td>
                    {/* Sample storage  */}
                    <td>
                      {item?.sample?.batches[0]?.sampleStorage?.name ?? "-"}
                    </td>
                  </tr>
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
      {children}
    </div>
  );
};
