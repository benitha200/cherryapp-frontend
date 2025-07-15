export const exportQualityReportCSV = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Quality_Analysis_Report_${dateStr}.csv`;

  const headers = [
    "Track",
    "Transport Group ID",
    "Transported Kgs",
    "Delivered Kgs",
    "Variation (Kgs)",
    "PCA of AVG 15+",
    "Average of AVG 15+ (S)",
    "PCA 13/14",
    "AVG 13/14 (S)",
    "PCA of AVG LG",
    "Average of AVG LG (S)",
    "PCA of OT Delivery",
    "Average of OT Sample",
    "PCA of PP Score",
    "Average of PP Score (S)",
  ];

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
      `"${formatNumber(item.variation)}"`,
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
    ];
  });

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

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((field) => {
          if (
            typeof field === "string" &&
            field.startsWith('"') &&
            field.endsWith('"')
          ) {
            return field;
          }
          return `"${field}"`;
        })
        .join(",")
    )
    .join("\n");

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
