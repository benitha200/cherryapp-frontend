import CSVExporter from "../../../sharedCompoents/csvfile";
import { formatDate } from "../../../utils/formatDate";

export const DeliveryExeleData = () => {
  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const columns = [
    { field: "cwsName", header: "CWS Station" },
    { field: "PlateNumbers", header: "Plate Numbers" },
    { field: "transportGroupId", header: "Transport Group ID" },
    {
      field: "transferDate",
      header: "Transfer Date",
      reder: (data) => formatreportDAte(data.transferDate),
    },
    {
      header: "Arrival Date",
      reder: (data) => formatreportDAte(data.arrivalDate),
    },
    { field: "transportedKgs", header: "Transported (KG)" },
    { field: "driverName", header: "Driver Name" },
    { field: "deliveredKgs", header: "Delivered (Kg)" },
    { field: "category", header: "Category" },
    { field: "wrn", header: "WRN" },
  ];

  const data = [
    {
      cwsName: "Mashesha",
      PlateNumbers: "RAE123B",
      transportGroupId: "TG-456",
      transferDate: "2025-07-20",
      arrivalDate: "2025-07-21",
      transportedKgs: 1500,
      driverName: "John Doe",
      deliveredKgs: 1495,
      category: "S86",
      wrn: "WRN-789",
    },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={data}
      filename="Delivery-report-file"
    />
  );
};
