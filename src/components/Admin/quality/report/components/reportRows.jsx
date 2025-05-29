import { Form, Row, Col, Card, InputGroup, Button } from "react-bootstrap";
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
  let lows = 0;
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
      width: "3rem",
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
      background: "#",
      fontSize: "0.9rem",
      fontWeight: "300",
      color: "#212529",
      cursor: "pointer",
      // boxShadow:
      //   "inset 0 0 0 1px rgba(255, 255, 255, 0.25), 0 1px 3px rgba(0,0,0,0.1)",
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
        <td>
          <Button
            size="sm"
            variant="outline-secondary"
            className="p-0 px-1 me-2"
            style={{
              width: "24px",
              height: "24px",
              borderColor: "#4FB3B3",
            }}
          >
            <i
              className="bi bi-chevron-down"
              style={{
                transform: true ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            ></i>
          </Button>
        </td>
        <td style={styleTotals()}>
          <div style={{ display: "flex" }}>{data?.cws?.name ?? ""}</div>
        </td>
        {/* <td style={styleTotals()}>{data?.cws?.AccTotaloutputKgs ?? ""}</td> */}
        {/* <td style={styleTotals()}>{""}</td> */}
        <td style={styleTotals()}>{data?.cws?.totalTransportedKgs ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totalDeliveredKgs ?? ""}</td>
        <td style={styleTotals()}>{data?.cws?.totalVariationKgs ?? ""}</td>
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
          cwsBatches?.delivery?.batches.map((elements, subBatchIndex) => {
            lows += 1;
            return (
              <>
                <tr key={rowIndex}>
                  <td>{lows}</td>
                  {/* batch number */}
                  <td
                    style={{
                      padding: "10px 15px",
                      borderBottom: `1px solid ${processingTheme.tableBorder}`,
                      width: "6rem",
                    }}
                  >
                    <div style={{ width: "10rem" }}>
                      {`${cwsBatches?.batchNo ?? ""}-${
                        elements?.gradeKey ?? ""
                      }`}
                    </div>
                  </td>

                  {/* transported  */}
                  <td>
                    {cwsBatches?.delivery?.transportedKgs[
                      elements?.gradeKey ?? ""
                    ] ?? "-"}
                  </td>
                  {/* received  */}
                  <td>
                    {cwsBatches?.delivery?.deliveryKgs[
                      elements?.category?.toLowerCase() ?? ""
                    ] ?? "-"}
                  </td>
                  {/* variation  */}
                  <td>
                    {cwsBatches?.delivery?.variationKgs[elements?.gradeKey] ??
                      "-"}
                  </td>

                  {/* 16 */}
                  <td>{Number(elements?.screen["16+"] ?? 0)?.toFixed(2)}</td>
                  {/* 15 */}
                  <td>{Number(elements?.screen["15"] ?? 0).toFixed(2)}</td>
                  {/* av.15+/delivery */}
                  <td>{Number(elements["AVG15+"] ?? 0)?.toFixed(2)}</td>
                  {/* av.15+ samples */}
                  <td>
                    {Number(
                      cwsBatches?.sample?.batches[subBatchIndex]["AVG15+"]
                    ).toFixed(2)}
                  </td>
                  {/* variation 15+ */}
                  <td style={styleValiations()}>
                    {Number(elements?.totals?.v15plus ?? 0)?.toFixed(2)}
                  </td>
                  {/* 14 */}
                  <td>{Number(elements?.screen["14"]).toFixed(2)}</td>
                  {/* 13 */}
                  <td>{Number(elements?.screen["13"]).toFixed(2)}</td>
                  {/* av.13/14/delivery */}
                  <td>{Number(elements["AVG13/14"]).toFixed(2)}</td>
                  {/* av13/14/samples */}
                  <td>
                    {Number(
                      cwsBatches?.sample?.batches[subBatchIndex]["AVG13/14"]
                    ).toFixed(2)}
                  </td>
                  {/* variation 13/14 */}
                  <td style={styleValiations()}>
                    {Number(elements?.totals?.v1314 ?? 0).toFixed(2)}
                  </td>
                  {/* b12 */}
                  <td>{Number(elements?.screen["B/12"] ?? 0).toFixed(2)}</td>
                  {/* defects (%) */}
                  <td>{Number(elements?.defect ?? 0).toFixed(2)}</td>
                  {/* avlg/delivery */}
                  <td>{Number(elements["AVGLG"]).toFixed(2)}</td>
                  {/* av.lg samples */}
                  <td>
                    {Number(
                      cwsBatches?.sample?.batches[subBatchIndex]["AVGLG"]
                    ).toFixed()}
                  </td>
                  {/* variation lg */}
                  <td style={styleValiations()}>
                    {Number(elements?.totals?.vlg ?? 0).toFixed(2)}
                  </td>
                  {/* ot delivery (%) */}
                  <td>{Number(elements?.OTDelivery ?? 0).toFixed(2)}</td>
                  {/*  ot sample */}
                  <td>
                    {Number(
                      cwsBatches?.sample?.batches[subBatchIndex]["OTSample"]
                    ).toFixed(2)}
                  </td>
                  {/* variation ot */}
                  <td style={styleValiations()}>
                    {Number(elements?.totals?.vot).toFixed(2)}
                  </td>
                  {/* pp score /delivery */}
                  <td>{Number(elements?.ppScore ?? 0).toFixed(2)}</td>
                  {/* pp score/samples */}
                  <td>
                    {Number(
                      cwsBatches?.sample?.batches[subBatchIndex]?.ppScore ?? 0
                    ).toFixed()}
                  </td>
                  {/* variation pp score */}
                  <td style={styleValiations()}>
                    {Number(elements?.totals?.vppscore ?? 0).toFixed()}
                  </td>
                  {/* category */}
                  <td>{elements?.newCategory ?? "-"}</td>
                  {/* sample storage  */}
                  <td>{elements?.sampleStorage?.name ?? "-"}</td>
                </tr>
              </>
            );
          })
        )}
    </>
  );
};
