export const deliveryReportExcel = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Delivery_Report_${dateStr}.csv`;

  const headers = [
    "CWS",
    "Track",
    "Transported (Kgs)",
    "Delivered (Kgs)",
    "Variation (Kgs)",
    "Delivery Rate (%)",
  ];

  const rows = data.map((item) => {
    const deliveryRate =
      item.rawTransported > 0
        ? ((item.rawDelivered / item.rawTransported) * 100).toFixed(2)
        : "0.00";

    return [
      item?.stationName,
      item.track || "N/A",
      item.rawTransported?.toLocaleString(),
      item.rawDelivered?.toLocaleString(),
      item.variation.toLocaleString(),
      deliveryRate,
    ];
  });

  const totalTransported = data.reduce(
    (sum, item) => sum + item.rawTransported,
    0
  );
  const totalDelivered = data.reduce((sum, item) => sum + item.rawDelivered, 0);
  const totalVariation = totalTransported - totalDelivered;
  const overallDeliveryRate =
    totalTransported > 0
      ? ((totalDelivered / totalTransported) * 100).toFixed(2)
      : "0.00";

  const totalsRow = [
    "TOTAL",
    "ALL TRACKS",
    totalTransported.toLocaleString(),
    totalDelivered.toLocaleString(),
    totalVariation.toLocaleString(),
    overallDeliveryRate,
  ];

  rows.push(totalsRow);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((field) => {
          const stringField = String(field);
          if (
            stringField.includes(",") ||
            stringField.includes('"') ||
            stringField.includes("\n")
          ) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
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


  return {
    fileName,
    totalRecords: data.length,
    totalTransported,
    totalDelivered,
    totalVariation,
    overallDeliveryRate,
  };
};
