import CSVExporter from "../../../sharedCompoents/csvfile";
import { formatDate } from "../../../utils/formatDate";
import { GetTranspotedTrackForExel } from "../action";

export const DeliveryExeleData = () => {
  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const { data: apiResponse } = GetTranspotedTrackForExel();
  
  const transformedData = apiResponse?.data?.flatMap((transportGroup) => {
    if (!transportGroup.deliveryDetails || transportGroup.deliveryDetails.length === 0) {
      return [];

    }
    return transportGroup.deliveryDetails.map((delivery) => ({
      cwsName: transportGroup.cwsName,
      PlateNumbers: transportGroup.plateNumbers,
      transportGroupId: transportGroup.transportGroupId,
      transferDate: transportGroup.transferDate,
      arrivalDate: delivery.arrivalDate,
      transportedKgs: transportGroup.totalQuantity, 
      driverName: transportGroup.driverNames,
      deliveredKgs: delivery.deliveryKgs, 
      category: delivery.category,
      wrn: delivery.WRN, 
    }));
  }) || [];
  const columns = [
    { field: "cwsName", header: "CWS Station" },
    { field: "PlateNumbers", header: "Plate Numbers" },
    { field: "transportGroupId", header: "Transport Group ID" },
    {
      field: "transferDate",
      header: "Transfer Date",
      render: (data) => formatreportDAte(data.transferDate),
    },
    {
      field: "arrivalDate",
      header: "Arrival Date",
      render: (data) => formatreportDAte(data.arrivalDate),
    },
    { field: "transportedKgs", header: "Transported (KG)" },
    { field: "driverName", header: "Driver Name" },
    { field: "deliveredKgs", header: "Delivered (Kg)" },
    { field: "category", header: "Category" },
    { field: "wrn", header: "WRN" },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      filename="Delivery-report-file"
    />
  );
};