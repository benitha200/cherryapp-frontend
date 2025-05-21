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

  function styleValiations() {
    return {
      width: "4rem",
      background: "linear-gradient(135deg, #c9bbd7 0%, #c9bbd9 100%)",
      fontSize: "0.9rem",
      fontWeight: "700",
      color: "#212529",
      padding: "0.75rem",
      textAlign: "center",
      border: "1px solid #e9ecef",
      boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.25)",
      position: "relative",
      borderRadius: "4px",
    };
  }

  return (
    <div>
      <div className="">
        <Card.Body>
          <div>
            <h6 style={{ color: "#008080" }}>
              Station Name: {data?.cws?.name ?? ""}
            </h6>
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
            {data.batches.map((cwsBatches, rowIndex) =>
              cwsBatches?.sample?.batches.map((elements, subBatchIndex) => (
                <>
                  <tr key={rowIndex}>
                    {/* batch number */}
                    <td
                      style={{
                        padding: "10px 15px",
                        borderBottom: `1px solid ${processingTheme.tableBorder}`,
                        width: "10rem",
                      }}
                    >
                      {`${cwsBatches?.batchNo ?? ""}-${
                        elements?.gradeKey ?? ""
                      }`}
                    </td>
                    {/* parchment qty(kg) */}
                    <td>
                      {cwsBatches?.sample?.outputKgs[
                        elements?.gradeKey ?? ""
                      ] ?? ""}
                    </td>
                    {/* date of analysis */}
                    <td>
                      {formatDate(
                        cwsBatches?.delivery?.batches[subBatchIndex]
                          ?.createdAt ?? new Date()
                      )}
                    </td>
                    {/* mc lab(%)/samples */}
                    <td>{elements?.labMoisture}</td>
                    {/* mc cws (%)/ delivery */}
                    <td>
                      {
                        cwsBatches?.delivery?.batches[subBatchIndex]
                          ?.labMoisture
                      }
                    </td>
                    {/* variation m.c */}
                    <td style={styleValiations()}>
                      {Number(elements?.labMoisture ?? 0) -
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]
                            ?.labMoisture ?? 0
                        )}
                    </td>
                    {/* 16 */}
                    <td>
                      {
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "16+"
                        ]
                      }
                    </td>
                    {/* 15 */}
                    <td>
                      {
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "15"
                        ]
                      }
                    </td>
                    {/* av.15+/delivery */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "16+"
                        ]
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "15"
                          ]
                        )}
                    </td>
                    {/* av.15+ samples */}
                    <td>
                      {Number(elements?.screen["16+"] ?? 0) +
                        Number(elements?.screen["15"] ?? 0)}
                    </td>
                    {/* variation 15+ */}
                    <td style={styleValiations()}>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "16+"
                        ]
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "15"
                          ]
                        ) -
                        (Number(elements?.screen["16+"] ?? 0) +
                          Number(elements?.screen["15"] ?? 0))}
                    </td>
                    {/* 14 */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "14"
                        ]
                      )}
                    </td>
                    {/* 13 */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "13"
                        ]
                      )}
                    </td>
                    {/* av.13/14/delivery */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "14"
                        ] ?? 0
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "13"
                          ] ?? 0
                        )}
                    </td>
                    {/* av13/14/samples */}
                    <td>
                      {Number(elements?.screen["14"] ?? 0) +
                        Number(elements?.screen["13"] ?? 0)}
                    </td>
                    {/* variation 13/14 */}
                    <td style={styleValiations()}>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "14"
                        ] ?? 0
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "13"
                          ] ?? 0
                        ) -
                        (Number(elements?.screen["14"] ?? 0) +
                          Number(elements?.screen["13"] ?? 0))}
                    </td>
                    {/* b12 */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "B/12"
                        ] ?? 0
                      )}
                    </td>
                    {/* defects (%) */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.defect ??
                          0
                      )}
                    </td>
                    {/* avlg/delivery */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "B/12"
                        ] ?? 0
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]
                            ?.defect ?? 0
                        )}
                    </td>
                    {/* av.lg samples */}
                    <td>
                      {Number(elements?.screen["B/12"] ?? 0) +
                        Number(elements?.defect ?? 0)}
                    </td>
                    {/* variation lg */}
                    <td style={styleValiations()}>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "B/12"
                        ] ?? 0
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]
                            ?.defect ?? 0
                        ) -
                        (Number(elements?.screen["B/12"] ?? 0) +
                          Number(elements?.defect ?? 0))}
                    </td>
                    {/* ot delivery (%) */}
                    <td>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "16+"
                        ]
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "15"
                          ]
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "14"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "13"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "B/12"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]
                            ?.defect ?? 0
                        )}
                    </td>
                    {/*  ot sample */}
                    <td>
                      {Number(elements?.screen["16+"] ?? 0) +
                        Number(elements?.screen["15"] ?? 0) +
                        Number(elements?.screen["14"] ?? 0) +
                        Number(elements?.screen["13"] ?? 0) +
                        Number(elements?.screen["B/12"] ?? 0) +
                        Number(elements?.defect ?? 0)}
                    </td>
                    {/* variation ot */}
                    <td style={styleValiations()}>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                          "16+"
                        ]
                      ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "15"
                          ]
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "14"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "13"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]?.screen[
                            "B/12"
                          ] ?? 0
                        ) +
                        Number(
                          cwsBatches?.delivery?.batches[subBatchIndex]
                            ?.defect ?? 0
                        ) -
                        (Number(elements?.screen["16+"] ?? 0) +
                          Number(elements?.screen["15"] ?? 0) +
                          Number(elements?.screen["14"] ?? 0) +
                          Number(elements?.screen["13"] ?? 0) +
                          Number(elements?.screen["B/12"] ?? 0) +
                          Number(elements?.defect ?? 0))}
                    </td>
                    {/* pp score /delivery */}
                    <td>
                      {cwsBatches?.delivery?.batches[subBatchIndex]?.ppScore ??
                        0}
                    </td>
                    {/* pp score/samples */}
                    <td>{elements?.ppScore ?? 0}</td>
                    {/* category */}
                    <td>
                      {cwsBatches?.delivery?.batches[subBatchIndex]
                        ?.newCategory ?? ""}
                    </td>
                    {/* variation pp score */}
                    <td style={styleValiations()}>
                      {Number(
                        cwsBatches?.delivery?.batches[subBatchIndex]?.ppScore ??
                          0
                      ) - Number(elements?.ppScore ?? 0)}
                    </td>
                    {/* sample storage  */}
                    <td>
                      {cwsBatches?.delivery?.batches[subBatchIndex]
                        ?.sampleStorage?.name ?? ""}
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
