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
            driverName: "-",
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
          driverName: "-",
          deliveredKgs: item.deliveredKgs || 0,
          processingType: "-",
          category: "-",
          wrn: item.WRN || "-",
        });
      }
    });
  }

  const columns = [
    { field: "cwsName", header: "Track" },
    { field: "PlateNumbers", header: "Transport Group ID" },
    { field: "transportGroupId", header: "Transported Kgs" },
    {
      field: "transferDate",
      header: "Delivered Kgs",
      render: (data) => formatreportDAte(data.transferDate),
    },
    {
      field: "arrivalDate",
      header: "Variation (Kgs)",
      render: (data) => formatreportDAte(data.arrivalDate),
    },
    { field: "transportedKgs", header: "PCA of AVG 15+" },
    { field: "driverName", header: "PCA 13/14" },
    { field: "deliveredKgs", header: "PCA of AVG LG" },
    { field: "processingType", header: "PCA of OT Delivery" },
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
