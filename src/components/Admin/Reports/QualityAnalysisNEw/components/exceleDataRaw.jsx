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
        });
      });
    });
    return grouped;
  };

  const rows = [];

  data?.forEach((v) => {
    const groupedData = getGroupedDataByCategory(v);

    Object.entries(groupedData).forEach(([groupKey, categoryItems]) => {
      const rowLabel = groupKey;

      let categoryTotals = {
        transported: 0,
        delivered: 0,
        avg15plus: [],
        avg15plusS: [],
        avg1314: [],
        avg1314S: [],
        avgLG: [],
        avgLGS: [],
        otDelivery: [],
        otSample: [],
        ppScore: [],
        ppScoreS: [],
      };

      categoryItems.forEach(({ cwsBatches, elements, subBatchIndex }) => {
        const transported = Number(
          cwsBatches?.delivery?.transportedKgs?.[elements?.gradeKey] || 0
        );
        const deliveredKgs = Number(
          Object.values(cwsBatches?.delivery?.deliveryKgs).reduce(
            (acc, value) => acc + value,
            0
          )
        );

        const avg15plus = Number(elements?.["AVG15+"] || 0) * transported;
        const avg15plusS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG15+"] || 0
        );
        const avg1314 = Number(elements?.["AVG13/14"] || 0) * transported;
        const avg1314S = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG13/14"] || 0
        );
        const avgLG = Number(elements?.["AVGLG"] || 0) * transported;
        const avgLGS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVGLG"] || 0
        );
        const otDelivery = Number(elements?.OTDelivery || 0) * transported;
        const otSample = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["OTSample"] || 0
        );
        const ppScore = Number(elements?.ppScore || 0) * transported;
        const ppScoreS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.ppScore || 0
        );

        categoryTotals.transported += transported;
        categoryTotals.delivered += deliveredKgs;

        if (avg15plus !== 0) categoryTotals.avg15plus.push(avg15plus);
        if (avg15plusS !== 0) categoryTotals.avg15plusS.push(avg15plusS);
        if (avg1314 !== 0) categoryTotals.avg1314.push(avg1314);
        if (avg1314S !== 0) categoryTotals.avg1314S.push(avg1314S);
        if (avgLG !== 0) categoryTotals.avgLG.push(avgLG);
        if (avgLGS !== 0) categoryTotals.avgLGS.push(avgLGS);
        if (otDelivery !== 0) categoryTotals.otDelivery.push(otDelivery);
        if (otSample !== 0) categoryTotals.otSample.push(otSample);
        if (ppScore !== 0) categoryTotals.ppScore.push(ppScore);
        if (ppScoreS !== 0) categoryTotals.ppScoreS.push(ppScoreS);
      });

      const calcAverage = (arr) => {
        return arr?.length > 0
          ? arr.reduce((a, b) => a + b, 0) / arr?.length
          : 0;
      };
      const calcSum = (arr) => arr.reduce((a, b) => a + b, 0);

      const spx = rowLabel.split("-");

      const rowData = {
        id: groupKey,
        track: rowLabel?.split("-")[spx.length - 4],
        transportGroupId: rowLabel?.split("-")[spx.length - 1],
        transported: categoryTotals.transported,
        delivered: categoryTotals.delivered,
        variation:
          (categoryTotals?.transported ?? 0) - (categoryTotals?.delivered ?? 0),
        rowLabels: rowLabel
          .split("-")
          .slice(0, spx.length - 1)
          .join("-"),
        wcaAvg15Plus:
          categoryTotals.transported > 0
            ? calcSum(categoryTotals.avg15plus) / categoryTotals.transported
            : 0,
        avgAvg15PlusS: calcAverage(categoryTotals.avg15plusS),
        wca1314:
          categoryTotals.transported > 0
            ? calcSum(categoryTotals.avg1314) / categoryTotals.transported
            : 0,
        avg1314S: calcSum(categoryTotals.avg1314S),
        wcaAvgLG:
          categoryTotals.transported > 0
            ? calcSum(categoryTotals.avgLG) / categoryTotals.transported
            : 0,
        avgAvgLGS: calcAverage(categoryTotals.avgLGS),
        wcaOTDelivery:
          categoryTotals.transported > 0
            ? calcSum(categoryTotals.otDelivery) / categoryTotals.transported
            : 0,
        avgOTSample: calcAverage(categoryTotals.otSample),
        wcaPPScore:
          categoryTotals.transported > 0
            ? calcSum(categoryTotals.ppScore) / categoryTotals.transported
            : 0,
        avgPPScoreS: calcAverage(categoryTotals.ppScoreS),

        rawTransported: categoryTotals.transported,
        rawDelivered: categoryTotals.delivered,
        rawAvg15plus: categoryTotals.avg15plus,
        rawAvg15plusS: categoryTotals.avg15plusS,
        rawAvg1314: categoryTotals.avg1314,
        rawAvg1314S: categoryTotals.avg1314S,
        rawAvgLG: categoryTotals.avgLG,
        rawAvgLGS: categoryTotals.avgLGS,
        rawOtDelivery: categoryTotals.otDelivery,
        rawOtSample: categoryTotals.otSample,
        rawPpScore: categoryTotals.ppScore,
        rawPpScoreS: categoryTotals.ppScoreS,
      };

      rows.push(rowData);
    });
  });

  return rows;
};
export default processQualityReportData;
