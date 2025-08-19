import CSVExporter from "../../../sharedCompoents/csvfile";
import { formatDate } from "../../../utils/formatDate";
import { GetTranspotedTruckExelReport } from "../action";

export const QualityDeliveryExeleData = () => {
  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const { data: apiResponse } = GetTranspotedTruckExelReport();

  function extractCategoryAndProcessingType(fullCategory) {
    const categoryMatch = fullCategory.match(/^([A-Z]+\d+)/);
    const processingMatch = fullCategory.match(/\[(.*?)\]/);

    return {
      category: categoryMatch ? categoryMatch[1] : fullCategory,
      processingType: processingMatch ? processingMatch[1] : null,
    };
  }

  const transformedData =
    apiResponse?.data?.flatMap((transportGroup) => {
      if (
        !transportGroup?.qualityDeliveries?.data ||
        transportGroup?.qualityDeliveries?.data?.length === 0
      ) {
        return [];
      }
      return transportGroup.qualityDeliveries?.data?.map((delivery) => ({
        batchNo: delivery.batchNo,
        cwsName: transportGroup.cwsName,
        plateNumbers: transportGroup.plateNumbers,
        transportGroupId: transportGroup.transportGroupId,
        transferDate: transportGroup.transferDate,
        status: delivery.status,
        labMoisture: delivery.labMoisture,
        sixteenPlus: delivery.sixteenPlus,
        fifteen: delivery.fifteen,
        fourteen: delivery.fourteen,
        thirteen: delivery.thirteen,
        b12: delivery.b12,
        defect: delivery.defect,
        ppScore: delivery.ppScore,
        sampleStorageId: delivery.sampleStorageId,
        originalCategory:
          extractCategoryAndProcessingType(delivery.category)?.category ?? "-",
        newCategory: delivery.newCategory,
        processingType:
          extractCategoryAndProcessingType(delivery.category)?.processingType ??
          "-",
        driverName: transportGroup.driverNames,
        transportedKgs: transportGroup.totalQuantity,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      }));
    }) || [];

  const columns = [
    { field: "batchNo", header: "BATCH_NO" },
    { field: "cwsName", header: "CWS" },
    { field: "plateNumbers", header: "Plate Number" },
    { field: "transportGroupId", header: "Transport Group ID" },
    {
      field: "transferDate",
      header: "Transfer Date",
      render: (data) => formatreportDAte(data.transferDate),
    },
    { field: "status", header: "Status" },
    { field: "labMoisture", header: "Lab Moisture" },
    { field: "sixteenPlus", header: "+16" },
    { field: "fifteen", header: "15" },
    { field: "fourteen", header: "14" },
    { field: "thirteen", header: "13" },
    { field: "b12", header: "B12" },
    { field: "defect", header: "Defect" },
    { field: "ppScore", header: "PP Score" },
    { field: "sampleStorageId", header: "Sample Storage ID" },
    { field: "originalCategory", header: "Original Category" },
    { field: "newCategory", header: "New Category" },
    { field: "processingType", header: "Processing Type" },
    { field: "driverName", header: "Driver Name" },
    { field: "transportedKgs", header: "Transported Kgs" },
    {
      field: "createdAt",
      header: "Created At",
      render: (data) => formatreportDAte(data.createdAt),
    },
    {
      field: "updatedAt",
      header: "Updated At",
      render: (data) => formatreportDAte(data.updatedAt),
    },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      filename={`Quality_Delivery_Report_${new Date().getFullYear()}_${
        new Date().getMonth() + 1
      }_${new Date().getDate()}`}
    />
  );
};
