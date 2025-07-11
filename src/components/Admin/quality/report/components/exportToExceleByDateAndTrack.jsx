export const exportToExcelWithDateAndTrack = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Quality_Report_Summary_${dateStr}.csv`;

  const headers = [
    "Row Labels",
    "Transported Kgs",
    "Delivered Kgs",
    "WCA of AVG 15+",
    "Average of AVG 15+ (S)",
    // "Average of Var 15+",
    "WCA 13/14",
    "AVG 13/14 (S)",
    // "WeightedAverage of Var 13/14",
    "WCA of AVG LG",
    "Average of AVG LG (S)",
    // "Average of Var LG",
    "WCA of OT Delivery",
    "Average of OT Sample",
    // "Average of Var OT",
    "WCA of PP Score",
    "Average of PP Score (S)",
    // "Average of Var PP",
  ];

  const getGroupedDataByCategory = (cwsData) => {
    const grouped = {};
    cwsData.batches?.forEach((cwsBatches) => {
      cwsBatches?.delivery?.batches?.forEach((elements, subBatchIndex) => {
        const category = elements?.newCategory || "Uncategorized";
        const truckNumber = elements?.transfer?.truckNumber || "No-Truck";
        const createdDate = elements?.transfer?.transferDate
          ? new Date(elements?.transfer?.transferDate)
              .toISOString()
              .split("T")[0]
          : "No-Date";

        const groupKey = `${category}-${createdDate}-${truckNumber}`;

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
  let grandTotals = {
    transported: 0,
    delivered: 0,
    avg15plus: [],
    avg15plusS: [],
    // var15plus: [],
    avg1314: 0,
    avg1314S: 0,
    // var1314: [],
    avgLG: [],
    avgLGS: [],
    // varLG: [],
    otDelivery: [],
    otSample: [],
    // varOT: [],
    ppScore: [],
    ppScoreS: [],
    // varPP: [],
  };

  data?.forEach((v) => {
    const groupedData = getGroupedDataByCategory(v);

    Object.entries(groupedData).forEach(([groupKey, categoryItems]) => {
      const rowLabel = groupKey;

      let categoryTotals = {
        transported: 0,
        delivered: 0,
        avg15plus: [],
        avg15plusS: [],
        // var15plus: [],
        avg1314: [],
        avg1314S: [],
        // var1314: [],
        avgLG: [],
        avgLGS: [],
        // varLG: [],
        otDelivery: [],
        otSample: [],
        // varOT: [],
        ppScore: [],
        ppScoreS: [],
        // varPP: [],
      };

      categoryItems.forEach(({ cwsBatches, elements, subBatchIndex }) => {
        const transported = Number(
          cwsBatches?.delivery?.transportedKgs?.[elements?.gradeKey] || 0
        );
        const deliverdKgs = Number(
          Object.values(cwsBatches?.delivery?.deliveryKgs).reduce(
            (acc, value) => acc + value,
            0
          )
        );

        const avg15plus = Number(elements?.["AVG15+"] || 0) * transported;
        const avg15plusS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG15+"] || 0
        );
        // const var15plus = Number(elements?.totals?.v15plus || 0);
        const avg1314 = Number(elements?.["AVG13/14"] || 0) * transported;
        const avg1314S = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVG13/14"] || 0
        );
        // const var1314 = Number(elements?.totals?.v1314 || 0);
        const avgLG = Number(elements?.["AVGLG"] || 0) * transported;
        const avgLGS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["AVGLG"] || 0
        );
        // const varLG = Number(elements?.totals?.vlg || 0);
        const otDelivery = Number(elements?.OTDelivery || 0) * transported;
        const otSample = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.["OTSample"] || 0
        );
        // const varOT = Number(elements?.totals?.vot || 0);
        const ppScore = Number(elements?.ppScore || 0) * transported;
        const ppScoreS = Number(
          cwsBatches?.sample?.batches?.[subBatchIndex]?.ppScore || 0
        );
        // const varPP = Number(elements?.totals?.vppscore || 0);
        categoryTotals.transported += transported;
        categoryTotals.delivered += deliverdKgs;

        if (avg15plus !== 0) categoryTotals.avg15plus.push(avg15plus);
        if (avg15plusS !== 0) categoryTotals.avg15plusS.push(avg15plusS);
        // if (var15plus !== 0) categoryTotals.var15plus.push(var15plus);
        if (avg1314 !== 0) categoryTotals.avg1314.push(avg1314);
        if (avg1314S !== 0) categoryTotals.avg1314S.push(avg1314S);
        // if (var1314 !== 0) categoryTotals.var1314.push(var1314);
        if (avgLG !== 0) categoryTotals.avgLG.push(avgLG);
        if (avgLGS !== 0) categoryTotals.avgLGS.push(avgLGS);
        // if (varLG !== 0) categoryTotals.varLG.push(varLG);
        if (otDelivery !== 0) categoryTotals.otDelivery.push(otDelivery);
        if (otSample !== 0) categoryTotals.otSample.push(otSample);
        // if (varOT !== 0) categoryTotals.varOT.push(varOT);
        if (ppScore !== 0) categoryTotals.ppScore.push(ppScore);
        if (ppScoreS !== 0) categoryTotals.ppScoreS.push(ppScoreS);
        // if (varPP !== 0) categoryTotals.varPP.push(varPP);
      });

      const calcAverage = (arr) => {
        return arr?.length > 0
          ? arr.reduce((a, b) => a + b, 0) / arr?.length
          : 0;
      };
      const calcSum = (arr) => arr.reduce((a, b) => a + b, 0);

      const formatTransported = (num) => {
        if (num === 0) return "0";
        return num.toLocaleString();
      };

      const row = [
        rowLabel,
        `"${formatTransported(categoryTotals.transported)}"`,
        `"${formatTransported(categoryTotals.delivered)}"`,
        (
          calcSum(categoryTotals.avg15plus).toFixed(1) /
          Number(categoryTotals?.transported)
        ).toFixed(1),
        calcAverage(categoryTotals.avg15plusS).toFixed(1),
        // calcAverage(categoryTotals.var15plus).toFixed(1),
        (
          calcSum(categoryTotals.avg1314).toFixed(1) /
          Number(categoryTotals?.transported)
        ).toFixed(1),
        calcSum(categoryTotals.avg1314S).toFixed(0),
        // calcAverage(categoryTotals.var1314).toFixed(1),
        (
          calcSum(categoryTotals.avgLG).toFixed(1) /
          Number(categoryTotals?.transported)
        ).toFixed(1),
        calcAverage(categoryTotals.avgLGS).toFixed(1),
        // calcAverage(categoryTotals.varLG).toFixed(1),
        (
          calcSum(categoryTotals.otDelivery).toFixed(1) /
          Number(categoryTotals?.transported)
        ).toFixed(1),
        calcAverage(categoryTotals.otSample).toFixed(1),
        // calcAverage(categoryTotals.varOT).toFixed(1),
        (
          calcSum(categoryTotals.ppScore).toFixed(1) /
          Number(categoryTotals?.transported)
        ).toFixed(1),
        calcAverage(categoryTotals.ppScoreS).toFixed(1),
        // calcAverage(categoryTotals.varPP).toFixed(1),
      ];

      rows.push(row);

      grandTotals.transported += categoryTotals.transported;
      grandTotals.avg15plus.push(...categoryTotals.avg15plus);
      grandTotals.avg15plusS.push(...categoryTotals.avg15plusS);
      // grandTotals.var15plus.push(...categoryTotals.var15plus);
      grandTotals.avg1314 += calcSum(categoryTotals.avg1314);
      grandTotals.avg1314S += calcSum(categoryTotals.avg1314S);
      // grandTotals.var1314.push(...categoryTotals.var1314);
      grandTotals.avgLG.push(...categoryTotals.avgLG);
      grandTotals.avgLGS.push(...categoryTotals.avgLGS);
      // grandTotals.varLG.push(...categoryTotals.varLG);
      grandTotals.otDelivery.push(...categoryTotals.otDelivery);
      grandTotals.otSample.push(...categoryTotals.otSample);
      // grandTotals.varOT.push(...categoryTotals.varOT);
      grandTotals.ppScore.push(...categoryTotals.ppScore);
      grandTotals.ppScoreS.push(...categoryTotals.ppScoreS);
      // grandTotals.varPP.push(...categoryTotals.varPP);
    });
  });

  const calcAverage = (arr) =>
    arr?.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr?.length : 0;
  const calcSum = (arr) => arr.reduce((a, b) => a + b, 0);

  // blank row
  rows.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const grandTotalRow = [
    "Grand Total",
    `"${grandTotals?.transported?.toLocaleString()}"`,
    (calcSum(grandTotals.avg15plus) / grandTotals.transported).toFixed(1),
    calcAverage(grandTotals.avg15plusS).toFixed(1),
    (grandTotals.avg1314 / grandTotals.transported).toFixed(1),
    grandTotals.avg1314S.toFixed(0),
    (calcSum(grandTotals.avgLG) / grandTotals.transported).toFixed(1),
    calcAverage(grandTotals.avgLGS).toFixed(1),
    (calcSum(grandTotals.otDelivery) / grandTotals.transported).toFixed(1),
    calcAverage(grandTotals.otSample).toFixed(1),
    (calcSum(grandTotals.ppScore) / grandTotals.transported).toFixed(1),
    calcAverage(grandTotals.ppScoreS).toFixed(1),
  ];

  // rows.push(grandTotalRow);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((field) => {
          if (
            typeof field === "string" &&
            field.startsWith('"') &&
            field.endsWith('"')
          ) {
            return field;
          }
          return `"${field}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`CSV file "${fileName}" has been downloaded successfully!`);
};
