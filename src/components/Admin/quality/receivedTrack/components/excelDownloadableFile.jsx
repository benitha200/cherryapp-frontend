export const exportDeliveryExcelFile = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Coffee_Quality_Report_${dateStr}.csv`;

  const headers = [
    "CWS",
    "Batch No",
    "Grade",
    "Transported (kg)",
    "Track",
    "Date",
    "16+",
    "15",
    "14",
    "13",
    "B/12",
    "Defects %",
    "PP Score",
    "Category",
    "Storage",
    "CWS Moisture",
    "Lab Moisture",
    "Driver Name",
    "Driver Phone",
  ];

  const rows = [];

  data?.data?.trucks?.forEach((truck) => {
    truck.batches.forEach((batch) => {
      batch.mainbatch?.forEach((item) => {
        const row = [
          truck?.cws?.name || "N/A",
          batch?.batchNo || "N/A",
          item?.gradeKey || "N/A",
          truck?.totalOutputKgs?.[item?.gradeKey] || 0,
          truck?.truckNumber || "N/A",
          truck?.transferDate || "N/A",
          item?.screen?.["16+"] || "-",
          item?.screen?.["15"] || "-",
          item?.screen?.["14"] || "-",
          item?.screen?.["13"] || "-",
          item?.screen?.["B/12"] || "-",
          Number(item?.defect || 0).toFixed(2),
          Number(item?.ppScore || 0).toFixed(2),
          item?.category || "-",
          item?.sampleStorage?.name || "-",
          Number(item?.cwsMoisture || 0).toFixed(1),
          Number(item?.labMoisture || 0).toFixed(1),
          truck?.driverName || "N/A",
          truck?.driverPhone || "N/A",
        ];
        rows.push(row);
      });

      batch.lowGrades?.forEach((lowGrade) => {
        Object.keys(lowGrade.outputKgs).forEach((gradeKey) => {
          const row = [
            truck?.cws?.name || "N/A",
            lowGrade?.batchNo || "N/A",
            gradeKey,
            lowGrade?.outputKgs?.[gradeKey] || 0,
            truck?.truckNumber || "N/A",
            truck?.transferDate || "N/A",
            "-", // 16+
            "-", // 15
            "-", // 14
            "-", // 13
            "-", // B/12
            "-", // Defects %
            "-", // PP Score
            `LOW_GRADE_${gradeKey}`, // Category
            "-", // Storage
            "-", // CWS Moisture
            "-", // Lab Moisture
            truck?.driverName || "N/A",
            truck?.driverPhone || "N/A",
          ];
          rows.push(row);
        });
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
