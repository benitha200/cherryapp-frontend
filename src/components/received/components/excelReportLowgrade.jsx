import CSVExporter from "../../../sharedCompoents/csvfile";
import { formatDate } from "../../../utils/formatDate";
import { GetTranspotedTrackForExel } from "../action";

export const DeliveryExeleDataLowGrade = () => {
  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const { data: apiResponse } = GetTranspotedTrackForExel();
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
        !transportGroup.deliveryDetails ||
        transportGroup.deliveryDetails.length === 0
      ) {
        return [];
      }
      return transportGroup.deliveryDetails
        .map((delivery) => {
          if (
            !["C1", "C2", "S86", "S87", "S88", "N1"].includes(
              extractCategoryAndProcessingType(delivery.category)?.category ??
                "-"
            )
          ) {
            return {
              cwsName: transportGroup.cwsName,
              PlateNumbers: transportGroup.plateNumbers,
              transportGroupId: transportGroup.transportGroupId,
              transferDate: transportGroup.transferDate,
              arrivalDate: delivery.arrivalDate,
              transportedKgs:
                transportGroup.outputKgs[
                  extractCategoryAndProcessingType(delivery.category)
                    ?.category ?? "-"
                ] ?? 0,
              driverName: transportGroup.driverNames,
              deliveredKgs: delivery.deliveryKgs,
              category:
                extractCategoryAndProcessingType(delivery.category)?.category ??
                "-",
              processingType:
                extractCategoryAndProcessingType(delivery.category)
                  ?.processingType ?? "-",

              wrn: delivery.WRN,
            };
          }
          return null;
        })
        ?.filter((element) => element !== undefined && element !== null);
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
    { field: "processingType", header: "Processing type" },
    { field: "category", header: "Category" },
    { field: "wrn", header: "WRN" },
  ];

  return (
    <CSVExporter
      columns={columns}
      data={transformedData}
      buttonName="LowGrade"
      filename={`derived-low-grade-report_${new Date().getFullYear()}_${
        new Date().getMonth() + 1
      }_${new Date().getDate()}`}
    />
  );
};
