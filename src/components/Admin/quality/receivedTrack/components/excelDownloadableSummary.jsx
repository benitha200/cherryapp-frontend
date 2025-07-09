export const excelFileDownloadableSummary = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Quality_Delivery_summary_Report${dateStr}.csv`;

  const headers = [
    "CWS",
    "Track",
    "Transfer Group Id",
    "Batch No",
    "Transported (kg)",
    "Driver Name",
    "Driver Phone",
  ];

  // Object to store grouped data by Transfer Group ID
  const groupedData = {};

  data?.data?.trucks?.forEach((truck) => {
    const transferGroupId = truck?.transportGroupId || "N/A";

    // Initialize group if it doesn't exist
    if (!groupedData[transferGroupId]) {
      groupedData[transferGroupId] = {
        cws: truck?.cws?.name || "N/A",
        truckNumber: truck?.truckNumber || "N/A",
        transferGroupId: transferGroupId,
        batchNos: new Set(),
        totalTransportedKgs: 0,
        driverName: truck?.driverName || "N/A",
        driverPhone: truck?.driverPhone || "N/A",
      };
    }

    // Process batches
    truck.batches.forEach((batch) => {
      // Add batch number to the set
      if (batch?.batchNo) {
        groupedData[transferGroupId].batchNos.add(batch.batchNo);
      }

      // Sum up transported kgs from mainbatch
      batch.mainbatch?.forEach((item) => {
        const transportedKgs = truck?.totalOutputKgs?.[item?.gradeKey] || 0;
        groupedData[transferGroupId].totalTransportedKgs +=
          Number(transportedKgs);
      });

      // Sum up transported kgs from lowGrades
      batch.lowGrades?.forEach((lowGrade) => {
        Object.keys(lowGrade.outputKgs).forEach((gradeKey) => {
          const transportedKgs = lowGrade?.outputKgs?.[gradeKey] || 0;
          groupedData[transferGroupId].totalTransportedKgs +=
            Number(transportedKgs);
        });
      });
    });
  });

  // Convert grouped data to rows
  const rows = [];
  Object.values(groupedData).forEach((group) => {
    const row = [
      group.cws,
      group.truckNumber,
      group.transferGroupId,
      Array.from(group.batchNos).join(", "), // Join multiple batch numbers
      group.totalTransportedKgs.toFixed(2),
      group.driverName,
      group.driverPhone,
    ];
    rows.push(row);
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
