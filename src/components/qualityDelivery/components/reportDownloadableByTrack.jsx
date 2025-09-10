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
    apiResponse?.data?.flatMap((transportGroup) => {
      if (
        !transportGroup?.qualityDeliveries?.data ||
        transportGroup?.qualityDeliveries?.data?.length === 0
      ) {
        return [];
      }

      // Group deliveries by category within this transport group
      const categoryMap = new Map();

      transportGroup.qualityDeliveries.data.forEach((delivery) => {
        const extractedCategory = extractCategoryAndProcessingType(
          delivery.category
        );
        const categoryKey = extractedCategory?.category ?? "-";

        // Only keep the first occurrence of each category for this transport group
        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(`${delivery?.category?.split(" ")?.join()}`, {
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
            originalCategory: categoryKey,
            newCategory: delivery.newCategory,
            processingType: extractedCategory?.processingType ?? "-",
            driverName: transportGroup.driverNames,
            deliveredKgs: transportGroup?.deliveryDetails?.filter((element) => {
              if (delivery?.category?.includes("Natural")) {
                return element?.category?.includes("Natural");
              }
              return delivery?.category
                ?.split("-")
                ?.slice(0, 2)
                ?.join("")
                ?.replaceAll(" ", "")
                ?.toLowerCase()
                ?.startsWith(
                  element?.category

                    ?.split("-")
                    ?.slice(0, 2)
                    ?.join("")
                    ?.replaceAll(" ", "")
                    ?.toLowerCase()
                );
            })[0]?.deliveryKgs,
            transportedKgs: transportGroup.totalQuantity,
            createdAt: delivery.createdAt,
            updatedAt: delivery.updatedAt,
          });
        }
      });

      // Return array of unique category records for this transport group
      return Array.from(categoryMap.values());
    }) || [];

  const columns = [
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
    { field: "deliveredKgs", header: " Derevered Kgs" },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      buttonName="ByTrackCategory"
      filename={`Quality_Delivery_Report_By_Track${new Date().getFullYear()}_${
        new Date().getMonth() + 1
      }_${new Date().getDate()}`}
    />
  );
};
