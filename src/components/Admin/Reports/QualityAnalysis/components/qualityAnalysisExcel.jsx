export const exportQualityReportCSV = (data) => {
  // Generate filename with current date
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Quality_Report_${dateStr}.csv`;

  // Define CSV headers matching your data structure
  const headers = [
    "Track",
    "Transport Group ID",
    "Transported Kgs",
    "Delivered Kgs",
    "Row Labels",
    "WCA of AVG 15+",
    "Average of AVG 15+ (S)",
    "WCA 13/14",
    "AVG 13/14 (S)",
    "WCA of AVG LG",
    "Average of AVG LG (S)",
    "WCA of OT Delivery",
    "Average of OT Sample",
    "WCA of PP Score",
    "Average of PP Score (S)",
    "Variation (Kgs)",
  ];

  // Process the data into CSV rows
  const rows = data.map((item) => {
    const formatNumber = (num) => {
      if (num === 0) return "0";
      return num.toLocaleString();
    };

    const formatDecimal = (num, decimals = 1) => {
      if (isNaN(num) || num === 0) return "0";
      return Number(num).toFixed(decimals);
    };

    return [
      item.track || "N/A",
      item.transportGroupId || "N/A",
      `"${formatNumber(item.rawTransported)}"`,
      `"${formatNumber(item.rawDelivered)}"`,
      item.rowLabels || "N/A",
      formatDecimal(item.wcaAvg15Plus, 1),
      formatDecimal(item.avgAvg15PlusS, 1),
      formatDecimal(item.wca1314, 1),
      formatDecimal(item.avg1314S, 0),
      formatDecimal(item.wcaAvgLG, 1),
      formatDecimal(item.avgAvgLGS, 1),
      formatDecimal(item.wcaOTDelivery, 1),
      formatDecimal(item.avgOTSample, 1),
      formatDecimal(item.wcaPPScore, 1),
      formatDecimal(item.avgPPScoreS, 1),
      `"${formatNumber(item.variation)}"`,
    ];
  });

  // Calculate grand totals
  const grandTotals = data.reduce(
    (totals, item) => {
      totals.transported += item.rawTransported;
      totals.delivered += item.rawDelivered;
      totals.avg15plus.push(...item.rawAvg15plus);
      totals.avg15plusS.push(...item.rawAvg15plusS);
      totals.avg1314.push(...item.rawAvg1314);
      totals.avg1314S.push(...item.rawAvg1314S);
      totals.avgLG.push(...item.rawAvgLG);
      totals.avgLGS.push(...item.rawAvgLGS);
      totals.otDelivery.push(...item.rawOtDelivery);
      totals.otSample.push(...item.rawOtSample);
      totals.ppScore.push(...item.rawPpScore);
      totals.ppScoreS.push(...item.rawPpScoreS);
      return totals;
    },
    {
      transported: 0,
      delivered: 0,
      avg15plus: [],
      avg15plusS: [],
      avg1314: [],
      avg1314S: [],
      avgLG: [],
      avgLGS: [],
      otDelivery: [],
      otSample: [],
      ppScore: [],
      ppScoreS: [],
    }
  );

  // Helper functions for grand totals calculations
  const calcAverage = (arr) => {
    return arr?.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr?.length : 0;
  };
  const calcSum = (arr) => arr.reduce((a, b) => a + b, 0);

  const formatNumber = (num) => {
    if (num === 0) return "0";
    return num.toLocaleString();
  };

  const formatDecimal = (num, decimals = 1) => {
    if (isNaN(num) || num === 0) return "0";
    return Number(num).toFixed(decimals);
  };

  // Create grand totals row
  const grandTotalsRow = [
    "GRAND TOTAL",
    "ALL GROUPS",
    `"${formatNumber(grandTotals.transported)}"`,
    `"${formatNumber(grandTotals.delivered)}"`,
    "ALL CATEGORIES",
    formatDecimal(
      grandTotals.transported > 0
        ? calcSum(grandTotals.avg15plus) / grandTotals.transported
        : 0,
      1
    ),
    formatDecimal(calcAverage(grandTotals.avg15plusS), 1),
    formatDecimal(
      grandTotals.transported > 0
        ? calcSum(grandTotals.avg1314) / grandTotals.transported
        : 0,
      1
    ),
    formatDecimal(calcSum(grandTotals.avg1314S), 0),
    formatDecimal(
      grandTotals.transported > 0
        ? calcSum(grandTotals.avgLG) / grandTotals.transported
        : 0,
      1
    ),
    formatDecimal(calcAverage(grandTotals.avgLGS), 1),
    formatDecimal(
      grandTotals.transported > 0
        ? calcSum(grandTotals.otDelivery) / grandTotals.transported
        : 0,
      1
    ),
    formatDecimal(calcAverage(grandTotals.otSample), 1),
    formatDecimal(
      grandTotals.transported > 0
        ? calcSum(grandTotals.ppScore) / grandTotals.transported
        : 0,
      1
    ),
    formatDecimal(calcAverage(grandTotals.ppScoreS), 1),
    `"${formatNumber(grandTotals.transported - grandTotals.delivered)}"`,
  ];

  // Add grand totals row
  rows.push(grandTotalsRow);

  // Create CSV content with proper formatting
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((field) => {
          // Handle fields that are already quoted
          if (
            typeof field === "string" &&
            field.startsWith('"') &&
            field.endsWith('"')
          ) {
            return field;
          }
          // Quote all other fields
          return `"${field}"`;
        })
        .join(",")
    )
    .join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`CSV file "${fileName}" has been downloaded successfully!`);

  // Return summary statistics
  return {
    fileName,
    totalRecords: data.length,
    grandTotals: {
      transported: grandTotals.transported,
      delivered: grandTotals.delivered,
      variation: grandTotals.transported - grandTotals.delivered,
      deliveryRate:
        grandTotals.transported > 0
          ? ((grandTotals.delivered / grandTotals.transported) * 100).toFixed(2)
          : "0.00",
    },
  };
};

// Usage example:
// const processedData = processQualityReportData(rawData);
// const exportStats = exportQualityReportCSV(processedData);
// console.log('Export completed:', exportStats);
