const processQualityReportData = (data) => {
  const getGroupedDataByCategory = (cwsData) => {
    const grouped = {};
    cwsData.batches?.forEach((cwsBatches) => {
      cwsBatches?.delivery?.batches?.forEach((elements, subBatchIndex) => {
        const category = elements?.newCategory || "Uncategorized";
        const truckNumber = elements?.transfer?.truckNumber || "No-Truck";
        const truckGroupId = elements?.transfer?.transportGroupId || "No-Truck";
        const createdDate = elements?.transfer?.transferDate
          ? new Date(elements?.transfer?.transferDate)
              .toISOString()
              .split("T")[0]
          : "No-Date";

        const groupKey = `${category}-${createdDate}-${truckNumber}-${truckGroupId}`;

        if (!grouped[groupKey]) grouped[groupKey] = [];
        grouped[groupKey].push({
          cwsBatches,
          elements,
          subBatchIndex,
          stationName: cwsData?.cws?.name,
        });
      });
    });
    return grouped;
  };

  const rows = [];
  let grandTotals = {
    transported: 0,
    delivered: 0,
  };

  data?.forEach((v) => {
    const groupedData = getGroupedDataByCategory(v);

    Object.entries(groupedData).forEach(([groupKey, categoryItems]) => {
      const rowLabel = groupKey;
      let categoryTotals = {
        transported: 0,
        delivered: 0,
        station: "",
      };

      categoryItems.forEach(
        ({ cwsBatches, elements, subBatchIndex, stationName }) => {
          const transported = Number(
            cwsBatches?.delivery?.transportedKgs?.[elements?.gradeKey] || 0
          );
          const deliveredKgs = Number(
            Object.values(cwsBatches?.delivery?.deliveryKgs).reduce(
              (acc, value) => acc + value,
              0
            )
          );

          categoryTotals.transported += transported;
          categoryTotals.delivered += deliveredKgs;
          categoryTotals.station = stationName;
        }
      );

      const spx = rowLabel.split("-");

      const rowData = {
        id: groupKey,
        track: rowLabel?.split("-")[spx.length - 4],
        transported: categoryTotals.transported,
        delivered: categoryTotals.delivered,
        rawTransported: categoryTotals.transported,
        rawDelivered: categoryTotals.delivered,
        variation:
          (categoryTotals?.transported ?? 0) - (categoryTotals?.delivered ?? 0),
        stationName: categoryTotals?.station ?? "",
      };

      rows.push(rowData);

      // Update grand totals
      grandTotals.transported += categoryTotals.transported;
      grandTotals.delivered += categoryTotals.delivered;
    });
  });

  return rows;
};

export default processQualityReportData;
