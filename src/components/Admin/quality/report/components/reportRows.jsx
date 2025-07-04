import { Button } from "react-bootstrap";
import React, { useState } from "react";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";

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

export const ReprotTable = ({ data = [], isLoading = false }) => {
  const [selectedStationName, setSelectedStationName] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  let lows = 0;

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{
            color: processingTheme.primary,
            width: "3rem",
            height: "3rem",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  function styleTotals() {
    return {
      background: processingTheme.neutral,
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      padding: "15px 12px",
      textAlign: "center",
      position: "relative",
      transition: "all 0.3s ease",
    };
  }

  const handleOpenstation = (stationName) => {
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

  const toggleCategory = (stationName, category) => {
    const categoryKey = `${stationName.toLowerCase()}-${category}`;
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const getGroupedDataByCategory = () => {
    const groupedByCategory = {};

    data.batches?.forEach((cwsBatches, rowIndex) => {
      cwsBatches?.delivery?.batches?.forEach((elements, subBatchIndex) => {
        const category = elements?.newCategory || "Uncategorized";

        if (!groupedByCategory[category]) {
          groupedByCategory[category] = [];
        }

        groupedByCategory[category].push({
          cwsBatches,
          elements,
          rowIndex,
          subBatchIndex,
        });
      });
    });

    return groupedByCategory;
  };

  const groupedData = getGroupedDataByCategory();

  return (
    <>
      <tr
        onClick={() => handleOpenstation(data?.cws?.name ?? "")}
        style={{
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 128, 128, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
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
                transform: selectedStationName.includes(
                  data?.cws?.name?.toLowerCase()
                )
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            ></i>
          </Button>
        </td>
        <td
          style={{
            ...styleTotals(),
            textAlign: "left",
            fontWeight: "700",
            fontSize: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {data?.cws?.name ?? ""}
          </div>
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totalTransportedKgs ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totalDeliveredKgs ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totalVariationKgs ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.tot16plus ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.tot15 ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAvg15PlusDelivery ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAvg15PlusSample ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totv15plus ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.tot14 ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.tot13 ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAvg1314Delivery ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAvg1314Sample ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.totv1314 ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.totB12 ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.totDefect ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAVLGDelivery ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totAVLGSample ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.totvlg ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totOTDelivery ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totOTSample ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(Number(data?.cws?.totvOT ?? 0).toFixed(2))}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.avgPPScoreDelivery ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.avgPPScoreSample ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>{""}</td>
        <td style={styleTotals()}>
          {formatNumberWithCommas(
            Number(data?.cws?.totvppscore ?? 0).toFixed(2)
          )}
        </td>
        <td style={styleTotals()}>{""}</td>
      </tr>

      {selectedStationName.includes(data?.cws?.name?.toLowerCase()) &&
        Object.entries(groupedData).map(([category, categoryItems]) => {
          const categoryKey = `${data?.cws?.name?.toLowerCase()}-${category}`;
          const isCategoryExpanded = expandedCategories.has(categoryKey);

          return (
            <React.Fragment key={category}>
              <tr
                style={{
                  background: `linear-gradient(135deg, ${processingTheme.primary}15 0%, ${processingTheme.neutral}30 100%)`,
                  cursor: "pointer",
                  borderBottom: `2px solid ${processingTheme.primary}`,
                  fontWeight: "bold",
                }}
                onClick={() => toggleCategory(data?.cws?.name, category)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${processingTheme.primary}25 0%, ${processingTheme.neutral}40 100%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${processingTheme.primary}15 0%, ${processingTheme.neutral}30 100%)`;
                }}
              >
                <td
                  colSpan="28"
                  style={{
                    padding: "15px 20px",
                    color: processingTheme.primary,
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      transform: isCategoryExpanded
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      fontSize: "0.8rem",
                    }}
                  >
                    ▶
                  </span>
                  <span style={{ fontWeight: "700" }}>{category}</span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: processingTheme.secondary,
                      marginLeft: "auto",
                      fontWeight: "500",
                    }}
                  >
                    {/* ({categoryItems.length} items) */}
                  </span>
                </td>
              </tr>

              {/* CATEGORY DATA ROWS */}
              {isCategoryExpanded &&
                categoryItems.map(
                  ({ cwsBatches, elements, rowIndex, subBatchIndex }) => {
                    lows += 1;
                    return (
                      <tr
                        key={`${category}-${lows}`}
                        style={{
                          transition: "all 0.3s ease",
                          borderBottom: `1px solid ${processingTheme.tableBorder}`,
                          backgroundColor: "rgba(0,128,128,0.02)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, ${processingTheme.tableHover} 0%, ${processingTheme.neutral} 100%)`;
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0, 128, 128, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0,128,128,0.02)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 15px",
                            paddingLeft: "30px", // Indent to show hierarchy
                            fontWeight: "600",
                            color: processingTheme.primary,
                          }}
                        >
                          {lows}
                        </td>

                        {/* batch number */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "10rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {`${cwsBatches?.batchNo ?? ""}-${
                              elements?.gradeKey ?? ""
                            }`}
                          </div>
                        </td>

                        {/* transported */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontWeight: "500",
                          }}
                        >
                          {cwsBatches?.delivery?.transportedKgs[
                            elements?.gradeKey ?? ""
                          ] ?? "-"}
                        </td>

                        {/* received */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontWeight: "500",
                          }}
                        >
                          {cwsBatches?.delivery?.deliveryKgs[
                            elements?.category?.toLowerCase() ?? ""
                          ] ?? "-"}
                        </td>

                        {/* variation */}
                        <td
                          style={{
                            padding: "10px 10px",
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontWeight: "500",
                          }}
                        >
                          {cwsBatches?.delivery?.variationKgs[
                            elements?.gradeKey
                          ] ?? "-"}
                        </td>

                        {/* 16+ */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.screen["16+"] ?? 0)?.toFixed(2)}
                        </td>

                        {/* 15 */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.screen["15"] ?? 0).toFixed(2)}
                        </td>

                        {/* av.15+/delivery */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements["AVG15+"] ?? 0)?.toFixed(2)}
                        </td>

                        {/* av.15+ samples */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(
                            cwsBatches?.sample?.batches[subBatchIndex]["AVG15+"]
                          ).toFixed(2)}
                        </td>

                        {/* variation 15+ */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "5rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {Number(elements?.totals?.v15plus ?? 0)?.toFixed(2)}
                          </div>
                        </td>

                        {/* 14 */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.screen["14"]).toFixed(2)}
                        </td>

                        {/* 13 */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.screen["13"]).toFixed(2)}
                        </td>

                        {/* av.13/14/delivery */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements["AVG13/14"]).toFixed(2)}
                        </td>

                        {/* av13/14/samples */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(
                            cwsBatches?.sample?.batches[subBatchIndex][
                              "AVG13/14"
                            ]
                          ).toFixed(2)}
                        </td>

                        {/* variation 13/14 */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "5rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {Number(elements?.totals?.v1314 ?? 0).toFixed(2)}
                          </div>
                        </td>

                        {/* b12 */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.screen["B/12"] ?? 0).toFixed(2)}
                        </td>

                        {/* defects (%) */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.defect ?? 0).toFixed(2)}
                        </td>

                        {/* avlg/delivery */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements["AVGLG"]).toFixed(2)}
                        </td>

                        {/* av.lg samples */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(
                            cwsBatches?.sample?.batches[subBatchIndex]["AVGLG"]
                          ).toFixed()}
                        </td>

                        {/* variation lg */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "5rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {Number(elements?.totals?.vlg ?? 0).toFixed(2)}
                          </div>
                        </td>

                        {/* ot delivery (%) */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.OTDelivery ?? 0).toFixed(2)}
                        </td>

                        {/* ot sample */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(
                            cwsBatches?.sample?.batches[subBatchIndex][
                              "OTSample"
                            ]
                          ).toFixed(2)}
                        </td>

                        {/* variation ot */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "5rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {Number(elements?.totals?.vot).toFixed(2)}
                          </div>
                        </td>

                        {/* pp score /delivery */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(elements?.ppScore ?? 0).toFixed(2)}
                        </td>

                        {/* pp score/samples */}
                        <td
                          style={{
                            padding: "12px 15px",
                            textAlign: "center",
                            fontFamily: "monospace",
                          }}
                        >
                          {Number(
                            cwsBatches?.sample?.batches[subBatchIndex]
                              ?.ppScore ?? 0
                          ).toFixed()}
                        </td>

                        {/* variation pp score */}
                        <td
                          style={{
                            padding: "10px 15px",
                            borderBottom: `1px solid ${processingTheme.tableBorder}`,
                            width: "6rem",
                          }}
                        >
                          <div
                            style={{
                              width: "5rem",
                              background: processingTheme.neutral,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              color: processingTheme.primary,
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            {Number(elements?.totals?.vppscore ?? 0).toFixed()}
                          </div>
                        </td>

                        {/* sample storage */}
                        <td
                          style={{
                            padding: "12px 15px",
                          }}
                        >
                          {elements?.sampleStorage?.name ?? "-"}
                        </td>
                      </tr>
                    );
                  }
                )}
            </React.Fragment>
          );
        })}
    </>
  );
};
