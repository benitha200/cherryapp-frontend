import { Button } from "react-bootstrap";
import React, { useState } from "react";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";

const theme = {
  primary: "#008080",
  secondary: "#4FB3B3",
  neutral: "#E6F3F3",
  tableHover: "#F8FAFA",
  tableBorder: "#D1E0E0",
};

export const ReprotTable = ({
  data = [],
  isLoading = false,
  totalTransportedKgs = 1,
}) => {
  const [selectedStationName, setSelectedStationName] = useState([]);
  let lows = 0;

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ color: theme.primary, width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const cellStyle = {
    // background: theme.neutral,
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    padding: "15px 12px",
    // textAlign: "center",
    transition: "all 0.3s ease",
  };

  const handleOpenstation = (stationName) => {
    const isAlreadyExist = selectedStationName?.includes(
      stationName?.toLowerCase()
    );
    setSelectedStationName((prev) =>
      isAlreadyExist
        ? prev.filter((element) => element !== stationName?.toLowerCase())
        : [...prev, stationName?.toLowerCase()]
    );
  };

  const formatNum = (val) =>
    formatNumberWithCommas(Number(val ?? 0).toFixed(2));
  const getValue = (obj, key, defaultVal = 0) =>
    Number(obj?.[key] ?? defaultVal).toFixed(2);

  const renderMainRow = () => {
    const isExpanded = selectedStationName.includes(
      data?.cws?.name?.toLowerCase()
    );
    const hoverProps = {
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 128, 128, 0.2)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      },
    };

    return (
      <tr
        onClick={() => handleOpenstation(data?.cws?.name ?? "")}
        style={{ cursor: "pointer", transition: "all 0.3s ease" }}
        {...hoverProps}
      >
        <td
          style={{
            ...cellStyle,
            textAlign: "left",
            fontWeight: "700",
            fontSize: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {data?.cws?.name ?? ""}
          </div>
        </td>
        {[
          data?.cws?.totalTransportedKgs,
          data?.cws?.totalDeliveredKgs,
          data?.cws?.totalVariationKgs,
          // data?.cws?.tot16plus,
          // data?.cws?.tot15,
          data?.cws?.totAvg15PlusDelivery,
          // data?.cws?.totAvg15PlusSample,
          // data?.cws?.totv15plus,
          ((data?.cws?.totAvg15PlusDelivery ?? 0) *
            (data?.cws?.totalTransportedKgs ?? 0)) /
            totalTransportedKgs,
          // data?.cws?.tot14,
          // data?.cws?.tot13,
          data?.cws?.totAvg1314Delivery,
          // data?.cws?.totAvg1314Sample,
          // data?.cws?.totv1314,
          "",
          // data?.cws?.totB12,
          // data?.cws?.totDefect,
          data?.cws?.totAVLGDelivery,
          // data?.cws?.totAVLGSample,
          // data?.cws?.totvlg,
          "",
          // data?.cws?.totOTDelivery,
          // data?.cws?.totOTSample,
          // data?.cws?.totvOT,
          // data?.cws?.avgPPScoreDelivery,
          // data?.cws?.avgPPScoreSample,
          "",
          // data?.cws?.totvppscore,
          "",
        ].map((val, idx) => (
          <td key={idx} style={cellStyle}>
            {val === "" ? "" : formatNum(val)}
          </td>
        ))}
      </tr>
    );
  };

  // const renderDetailRows = () => {
  //   if (!selectedStationName.includes(data?.cws?.name?.toLowerCase()))
  //     return null;

  //   const detailRows = [];

  //   data.batches?.forEach((cwsBatches, rowIndex) => {
  //     cwsBatches?.delivery?.batches?.forEach((elements, subBatchIndex) => {
  //       lows += 1;

  //       const rowHoverProps = {
  //         onMouseEnter: (e) => {
  //           e.currentTarget.style.background = `linear-gradient(135deg, ${theme.tableHover} 0%, ${theme.neutral} 100%)`;
  //           e.currentTarget.style.transform = "translateY(-1px)";
  //           e.currentTarget.style.boxShadow =
  //             "0 4px 12px rgba(0, 128, 128, 0.1)";
  //         },
  //         onMouseLeave: (e) => {
  //           e.currentTarget.style.background = "rgba(0,128,128,0.02)";
  //           e.currentTarget.style.transform = "translateY(0)";
  //           e.currentTarget.style.boxShadow = "none";
  //         },
  //       };

  //       const badgeStyle = {
  //         background: theme.neutral,
  //         padding: "6px 10px",
  //         borderRadius: "8px",
  //         color: theme.primary,
  //         fontWeight: "600",
  //         fontSize: "0.85rem",
  //       };

  //       detailRows.push(
  //         <tr
  //           key={`${rowIndex}-${subBatchIndex}-${lows}`}
  //           style={{
  //             transition: "all 0.3s ease",
  //             borderBottom: `1px solid ${theme.tableBorder}`,
  //             backgroundColor: "rgba(0,128,128,0.02)",
  //           }}
  //           {...rowHoverProps}
  //         >
  //           <td
  //             style={{
  //               padding: "12px 15px",
  //               paddingLeft: "30px",
  //               fontWeight: "600",
  //               color: theme.primary,
  //             }}
  //           >
  //             {lows}
  //           </td>
  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "10rem", ...badgeStyle }}>{`${
  //               cwsBatches?.batchNo ?? ""
  //             }-${elements?.gradeKey ?? ""}`}</div>
  //           </td>

  //           {/* Data cells with consistent styling */}
  //           {[
  //             cwsBatches?.delivery?.transportedKgs[elements?.gradeKey] ?? "-",
  //             cwsBatches?.delivery?.deliveryKgs[
  //               elements?.category?.toLowerCase()
  //             ] ?? "-",
  //             cwsBatches?.delivery?.variationKgs[elements?.gradeKey] ?? "-",
  //             getValue(elements?.screen, "16+"),
  //             getValue(elements?.screen, "15"),
  //             getValue(elements, "AVG15+"),
  //             getValue(cwsBatches?.sample?.batches[subBatchIndex], "AVG15+"),
  //           ].map((val, idx) => (
  //             <td
  //               key={idx}
  //               style={{
  //                 padding: "12px 15px",
  //                 textAlign: "center",
  //                 fontFamily: "monospace",
  //                 fontWeight: "500",
  //               }}
  //             >
  //               {typeof val === "string" && val.includes("-")
  //                 ? val
  //                 : typeof val === "string"
  //                 ? val
  //                 : getValue({ [val]: val }, val)}
  //             </td>
  //           ))}

  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "5rem", ...badgeStyle }}>
  //               {getValue(elements?.totals, "v15plus")}
  //             </div>
  //           </td>

  //           {[
  //             getValue(elements?.screen, "14"),
  //             getValue(elements?.screen, "13"),
  //             getValue(elements, "AVG13/14"),
  //             getValue(cwsBatches?.sample?.batches[subBatchIndex], "AVG13/14"),
  //           ].map((val, idx) => (
  //             <td
  //               key={idx + 8}
  //               style={{
  //                 padding: "12px 15px",
  //                 textAlign: "center",
  //                 fontFamily: "monospace",
  //               }}
  //             >
  //               {val}
  //             </td>
  //           ))}

  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "5rem", ...badgeStyle }}>
  //               {getValue(elements?.totals, "v1314")}
  //             </div>
  //           </td>

  //           {[
  //             getValue(elements?.screen, "B/12"),
  //             getValue(elements, "defect"),
  //             getValue(elements, "AVGLG"),
  //             Number(
  //               cwsBatches?.sample?.batches[subBatchIndex]["AVGLG"]
  //             ).toFixed(),
  //           ].map((val, idx) => (
  //             <td
  //               key={idx + 13}
  //               style={{
  //                 padding: "12px 15px",
  //                 textAlign: "center",
  //                 fontFamily: "monospace",
  //               }}
  //             >
  //               {val}
  //             </td>
  //           ))}

  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "5rem", ...badgeStyle }}>
  //               {getValue(elements?.totals, "vlg")}
  //             </div>
  //           </td>

  //           {[
  //             getValue(elements, "OTDelivery"),
  //             getValue(cwsBatches?.sample?.batches[subBatchIndex], "OTSample"),
  //           ].map((val, idx) => (
  //             <td
  //               key={idx + 18}
  //               style={{
  //                 padding: "12px 15px",
  //                 textAlign: "center",
  //                 fontFamily: "monospace",
  //               }}
  //             >
  //               {val}
  //             </td>
  //           ))}

  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "5rem", ...badgeStyle }}>
  //               {getValue(elements?.totals, "vot")}
  //             </div>
  //           </td>

  //           {[
  //             getValue(elements, "ppScore"),
  //             Number(
  //               cwsBatches?.sample?.batches[subBatchIndex]?.ppScore ?? 0
  //             ).toFixed(),
  //           ].map((val, idx) => (
  //             <td
  //               key={idx + 21}
  //               style={{
  //                 padding: "12px 15px",
  //                 textAlign: "center",
  //                 fontFamily: "monospace",
  //               }}
  //             >
  //               {val}
  //             </td>
  //           ))}

  //           <td
  //             style={{
  //               padding: "10px 15px",
  //               borderBottom: `1px solid ${theme.tableBorder}`,
  //               width: "6rem",
  //             }}
  //           >
  //             <div style={{ width: "5rem", ...badgeStyle }}>
  //               {Number(elements?.totals?.vppscore ?? 0).toFixed()}
  //             </div>
  //           </td>

  //           <td style={{ padding: "12px 15px" }}>
  //             {elements?.sampleStorage?.name ?? "-"}
  //           </td>
  //           <td style={{ padding: "12px 15px" }}>
  //             {elements?.transfer?.truckNumber ?? "-"}
  //           </td>
  //         </tr>
  //       );
  //     });
  //   });

  //   return detailRows;
  // };

  return (
    <>
      {renderMainRow()}
      {/* {renderDetailRows()} */}
    </>
  );
};
