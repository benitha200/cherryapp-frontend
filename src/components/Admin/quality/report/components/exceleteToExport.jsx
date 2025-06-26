export const exportToExcel = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Coffee_Quality_Report_${dateStr}.csv`;

  const headers = [
    "CWS",
    "Batch No",
    "Transported",
    "16+",
    "15",
    "AVG 15+",
    "AVG 15+ (S)",
    "Var 15+",
    "14",
    "13",
    "AVG 13/14",
    "AVG 13/14 (S)",
    "Var 13/14",
    "B/12",
    "Defects %",
    "AVG LG",
    "AVG LG (S)",
    "Var LG",
    "OT Delivery",
    "OT Sample",
    "Var OT",
    "PP Score",
    "PP Score (S)",
    "Var PP",
    "Category",
    "Storage",
  ];

  const rows = [];
  data?.forEach((v) => {
    v.batches.forEach((cwsBatches) => {
      cwsBatches?.delivery?.batches?.forEach((elements, subBatchIndex) => {
        const row = [
          v?.cws?.name || "N/A",
          `${cwsBatches?.batchNo ?? ""}-${elements?.gradeKey ?? ""}`,
          cwsBatches?.delivery?.transportedKgs[elements?.gradeKey ?? ""] ?? "-",
          Number(elements?.screen?.["16+"] ?? 0).toFixed(2),
          Number(elements?.screen?.["15"] ?? 0).toFixed(2),
          Number(elements?.["AVG15+"] ?? 0).toFixed(2),
          Number(
            cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG15+"] ?? 0
          ).toFixed(2),
          Number(elements?.totals?.v15plus ?? 0).toFixed(2),
          Number(elements?.screen?.["14"] ?? 0).toFixed(2),
          Number(elements?.screen?.["13"] ?? 0).toFixed(2),
          Number(elements?.["AVG13/14"] ?? 0).toFixed(2),
          Number(
            cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG13/14"] ?? 0
          ).toFixed(2),
          Number(elements?.totals?.v1314 ?? 0).toFixed(2),
          Number(elements?.screen?.["B/12"] ?? 0).toFixed(2),
          Number(elements?.defect ?? 0).toFixed(2),
          Number(elements?.["AVGLG"] ?? 0).toFixed(2),
          Number(
            cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVGLG"] ?? 0
          ).toFixed(2),
          Number(elements?.totals?.vlg ?? 0).toFixed(2),
          Number(elements?.OTDelivery ?? 0).toFixed(2),
          Number(
            cwsBatches?.sample?.batches?.[subBatchIndex]?.["OTSample"] ?? 0
          ).toFixed(2),
          Number(elements?.totals?.vot ?? 0).toFixed(2),
          Number(elements?.ppScore ?? 0).toFixed(2),
          Number(
            cwsBatches?.sample?.batches?.[subBatchIndex]?.ppScore ?? 0
          ).toFixed(2),
          Number(elements?.totals?.vppscore ?? 0).toFixed(2),
          elements?.newCategory ?? "-",
          elements?.sampleStorage?.name ?? "-",
        ];
        rows.push(row);
      });
    });
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
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
};
