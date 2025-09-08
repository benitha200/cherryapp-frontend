import CSVExporter from "../../../../../sharedCompoents/csvfile";
import { formatDate } from "../../../../../utils/formatDate";
import { GetReportExcel } from "../action";

export const QualityAnalysisExcel = () => {
  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const { data: apiResponse } = GetReportExcel();

  const transformedData = [];

  if (apiResponse?.data) {
    apiResponse.data.forEach((item) => {
      if (item.quality_deliveries && item.quality_deliveries.length > 0) {
        item.quality_deliveries.forEach((qualityDelivery) => {
          transformedData.push({
            cwsName: item.cwsName || "-",
            PlateNumbers: item.truckNumber || "-",
            transportGroupId: item.transportGroupId || "-",
            transferDate: item.transportedDate || "-",
            arrivalDate: item.arrivalDate || "-",
            transportedKgs: item.transportedKgs || 0,
            deliveredKgs: item.deliveredKgs || 0,
            processingType:
              qualityDelivery.original_category
                ?.split(" - ")[1]
                ?.replace("[", "")
                .replace("]", "") || "-",
            category:
              qualityDelivery.newCategory ||
              qualityDelivery.original_category?.split(" - ")[0] ||
              "-",
            wrn: item.WRN || "-",
          });
        });
      } else {
        transformedData.push({
          cwsName: item.cwsName || "-",
          PlateNumbers: item.truckNumber || "-",
          transportGroupId: item.transportGroupId || "-",
          transferDate: item.transportedDate || "-",
          arrivalDate: item.arrivalDate || "-",
          transportedKgs: item.transportedKgs || 0,
          deliveredKgs: item.deliveredKgs || 0,
          processingType: "-",
          category: "-",
          wrn: item.WRN || "-",
        });
      }
    });
  }

  const columns = [
    { field: "cwsName", header: "CWS" },
    { field: "PlateNumbers", header: "Plat Number" },
    { field: "transportGroupId", header: "Transport Group Id" },
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
    { field: "transportedKgs", header: "Transported kgs" },
    { field: "deliveredKgs", header: "Delivered Kgs" },
    { field: "processingType", header: "Processing type" },
    { field: "category", header: "Category" },
    { field: "wrn", header: "WRN" },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      filename={`Quality Analysis Report ${new Date().getFullYear()}-${
        new Date().getMonth() + 1
      }-${new Date().getDate()}`}
    />
  );
};
