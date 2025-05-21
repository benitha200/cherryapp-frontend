import { Form, Row, Col, Card, InputGroup } from "react-bootstrap";
import { formatDate } from "./../../../../../utils/formatDate";
import { useState } from "react";
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
  data = [],
  columns = [],
  emptyStateMessage = "No data available",
  isLoading = false,
  rowKeyField = "id",
  itemsPerPage = 5,
  onPageSizeChange,
}) => {
  const [selectedStationName, setSelectedStationName] = useState([]);
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // function

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

  function styleTotals() {
    return {
      background: "#c5e0d8",
      fontSize: "0.9rem",
      fontWeight: "700",
      color: "#212529",
      cursor: "pointer",
      boxShadow:
        "inset 0 0 0 1px rgba(255, 255, 255, 0.25), 0 1px 3px rgba(0,0,0,0.1)",
      position: "relative",
    };
  }
  const handleOpenstation = (stationName) => {
    // station name is alredy exist
    const isAlredyExist = selectedStationName?.includes(
      stationName?.toLowerCase()
    );
    if (isAlredyExist) {
      setSelectedStationName((prev) =>
        prev.filter((element) => element != stationName?.toLowerCase())
      );
    } else {
      setSelectedStationName((prev) => [...prev, stationName?.toLowerCase()]);
    }
  };

  return (
    <>
      {/* TOTALS  */}
      <tr onClick={() => handleOpenstation(data?.cws?.name ?? "")}>
        <td style={styleTotals()}>{data?.cws?.name ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.AccTotaloutputKgs ?? ""}</td>
        <td style={styleTotals()}>{""}</td>
        <td style={styleTotals()}>{data?.cws?.totMoistureCws ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totMoistureLab ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totVmc ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.tot16plus ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.tot15 ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAvg15PlusDelivery ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAvg15PlusSample ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totv15plus ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.tot14 ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.tot13 ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAvg1314Delivery ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAvg1314Sample ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totv1314 ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totB12 ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totDefect ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAVLGDelivery ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totAVLGSample ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totvlg ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totOTDelivery ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totOTSample ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totvOT ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.avgPPScoreDelivery ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.avgPPScoreSample ?? ""}</td>
        <td style={styleTotals()}>{""}</td>
        <td style={styleTotals()}>{data?.cws?.totvppscore ?? ""}</td>
        <td style={styleTotals()}>{""}</td>
      </tr>
      {selectedStationName.includes(data?.cws?.name?.toLowerCase()) &&
        data.batches.map((cwsBatches, rowIndex) =>
          cwsBatches?.sample?.batches.map((elements, subBatchIndex) => (
            <>
              <tr key={rowIndex}>
                {/* batch number */}
                <td
                  style={{
                    padding: "10px 15px",
                    borderBottom: `1px solid ${processingTheme.tableBorder}`,
                    width: "6rem",
                  }}
                >
                  {`${cwsBatches?.batchNo ?? ""}-${elements?.gradeKey ?? ""}`}
                </td>
                {/* parchment qty(kg) */}
                <td>
                  {cwsBatches?.sample?.outputKgs[elements?.gradeKey ?? ""] ??
                    ""}
                </td>
                {/* date of analysis */}
                <td>
                  {formatDate(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.createdAt ??
                      new Date()
                  )}
                </td>
                {/* mc lab(%)/samples */}
                <td>{elements?.labMoisture}</td>
                {/* mc cws (%)/ delivery */}
                <td>
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.labMoisture}
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
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.screen["16+"]}
                </td>
                {/* 15 */}
                <td>
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.screen["15"]}
                </td>
                {/* av.15+/delivery */}
                <td>
                  {Number(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["16+"]
                  ) +
                    Number(
                      cwsBatches?.delivery?.batches[subBatchIndex]?.screen["15"]
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
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["16+"]
                  ) +
                    Number(
                      cwsBatches?.delivery?.batches[subBatchIndex]?.screen["15"]
                    ) -
                    (Number(elements?.screen["16+"] ?? 0) +
                      Number(elements?.screen["15"] ?? 0))}
                </td>
                {/* 14 */}
                <td>
                  {Number(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["14"]
                  )}
                </td>
                {/* 13 */}
                <td>
                  {Number(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["13"]
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
                    cwsBatches?.delivery?.batches[subBatchIndex]?.defect ?? 0
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
                      cwsBatches?.delivery?.batches[subBatchIndex]?.defect ?? 0
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
                      cwsBatches?.delivery?.batches[subBatchIndex]?.defect ?? 0
                    ) -
                    (Number(elements?.screen["B/12"] ?? 0) +
                      Number(elements?.defect ?? 0))}
                </td>
                {/* ot delivery (%) */}
                <td>
                  {Number(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["16+"]
                  ) +
                    Number(
                      cwsBatches?.delivery?.batches[subBatchIndex]?.screen["15"]
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
                      cwsBatches?.delivery?.batches[subBatchIndex]?.defect ?? 0
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
                    cwsBatches?.delivery?.batches[subBatchIndex]?.screen["16+"]
                  ) +
                    Number(
                      cwsBatches?.delivery?.batches[subBatchIndex]?.screen["15"]
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
                      cwsBatches?.delivery?.batches[subBatchIndex]?.defect ?? 0
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
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.ppScore ?? 0}
                </td>
                {/* pp score/samples */}
                <td>{elements?.ppScore ?? 0}</td>
                {/* category */}
                <td>
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.newCategory ??
                    ""}
                </td>
                {/* variation pp score */}
                <td style={styleValiations()}>
                  {Number(
                    cwsBatches?.delivery?.batches[subBatchIndex]?.ppScore ?? 0
                  ) - Number(elements?.ppScore ?? 0)}
                </td>
                {/* sample storage  */}
                <td>
                  {cwsBatches?.delivery?.batches[subBatchIndex]?.sampleStorage
                    ?.name ?? ""}
                </td>
              </tr>
            </>
          ))
        )}
    </>
  );
};
