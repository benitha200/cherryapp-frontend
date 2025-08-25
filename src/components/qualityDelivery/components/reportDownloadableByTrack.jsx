import CSVExporter from "../../../sharedCompoents/csvfile";
import { formatDate } from "../../../utils/formatDate";
import { GetTranspotedTruckExelReport } from "../action";

export const QualityDeliveryExeleDataByTrack = () => {
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
    apiResponse?.data?.map((transportGroup) => {
      if (
        !transportGroup?.qualityDeliveries?.data ||
        transportGroup?.qualityDeliveries?.data?.length === 0
      ) {
        return [];
      }
      // start
      return {
        batchNo: transportGroup.qualityDeliveries?.data[0]?.batchNo,
        cwsName: transportGroup.cwsName,
        plateNumbers: transportGroup.plateNumbers,
        transportGroupId: transportGroup.transportGroupId,
        transferDate: transportGroup.transferDate,
        status: transportGroup.qualityDeliveries?.data[0]?.status,
        labMoisture: transportGroup.qualityDeliveries?.data[0]?.labMoisture,
        sixteenPlus: transportGroup.qualityDeliveries?.data[0]?.sixteenPlus,
        fifteen: transportGroup.qualityDeliveries?.data[0]?.fifteen,
        fourteen: transportGroup.qualityDeliveries?.data[0]?.fourteen,
        thirteen: transportGroup.qualityDeliveries?.data[0]?.thirteen,
        b12: transportGroup.qualityDeliveries?.data[0]?.b12,
        defect: transportGroup.qualityDeliveries?.data[0]?.defect,
        ppScore: transportGroup.qualityDeliveries?.data[0]?.ppScore,
        sampleStorageId:
          transportGroup.qualityDeliveries?.data[0]?.sampleStorageId,
        originalCategory:
          extractCategoryAndProcessingType(
            transportGroup.qualityDeliveries?.data[0]?.category
          )?.category ?? "-",
        newCategory: transportGroup.qualityDeliveries?.data[0]?.newCategory,
        processingType:
          extractCategoryAndProcessingType(
            transportGroup.qualityDeliveries?.data[0]?.category
          )?.processingType ?? "-",
        driverName: transportGroup.driverNames,
        transportedKgs: transportGroup.totalQuantity,
        createdAt: transportGroup.qualityDeliveries?.data[0]?.createdAt,
        updatedAt: transportGroup.qualityDeliveries?.data[0]?.updatedAt,
      };

      // end
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
    { field: "sixteenPlus", header: "\u200B+16" }, // Zero-width space
    { field: "fifteen", header: "\u200B15" },
    { field: "fourteen", header: "\u200B14" },
    { field: "thirteen", header: "\u200B13" },
    { field: "b12", header: "B12" },
    { field: "defect", header: "Defect" },
    { field: "ppScore", header: "PP Score" },
    { field: "sampleStorageId", header: "Sample Storage ID" },
    { field: "originalCategory", header: "Original Category" },
    { field: "newCategory", header: "New Category" },
    { field: "processingType", header: "Processing Type" },
    { field: "driverName", header: "Driver Name" },
    { field: "transportedKgs", header: "Transported Kgs" },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      buttonName="ByTrack"
      filename={`Quality_Delivery_Report_By_Track${new Date().getFullYear()}_${
        new Date().getMonth() + 1
      }_${new Date().getDate()}`}
    />
  );
};
