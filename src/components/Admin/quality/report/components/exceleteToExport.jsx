export const exportToExcel = (data) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Coffee_Quality_Processing_${dateStr}.xls`;

  let htmlContent = `
<html>
    <head>
        <meta charset="UTF-8">
        <style>
            table { 
                border-collapse: collapse; 
                width: 100%; 
                font-family: Arial, sans-serif;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: center; 
                font-size: 12px;
            }
            th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                color: #333;
            }
            .delivery-header {
                background-color: #E8F5E8; /* Light green for delivery columns */
            }
            .sample-header {
                background-color: #E8F0FF; /* Light blue for sample columns */
            }
            .variation-header {
                background-color: #FFF0E8; /* Light orange for variation columns */
            }
            .info-header {
                background-color: #F0F0F0; /* Light gray for info columns */
            }
            .numeric-cell {
                font-family: 'Courier New', monospace;
                text-align: right;
            }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <!-- Main header row with grouped columns -->
                <tr>
                    <th rowspan="2" class="info-header">CWS</th>
                    <th rowspan="2" class="info-header">Batch No</th>
                    <th colspan="3" class="info-header">Weight Information</th>
                    <th colspan="5" class="delivery-header">Screen Size Analysis</th>
                    <th colspan="5" class="sample-header">Sample Comparison</th>
                    <th colspan="3" class="delivery-header">Additional Metrics</th>
                    <th colspan="6" class="variation-header">Quality Variations</th>
                    <th colspan="2" class="info-header">Classification</th>
                </tr>
                <!-- Sub-header row -->
                <tr>
                    <th class="info-header">Transported</th>
                    <th class="info-header">Received</th>
                    <th class="info-header">Variation</th>
                    <th class="delivery-header">16+</th>
                    <th class="delivery-header">15</th>
                    <th class="delivery-header">AVG 15+</th>
                    <th class="sample-header">AVG 15+ (S)</th>
                    <th class="variation-header">Var 15+</th>
                    <th class="delivery-header">14</th>
                    <th class="delivery-header">13</th>
                    <th class="delivery-header">AVG 13/14</th>
                    <th class="sample-header">AVG 13/14 (S)</th>
                    <th class="variation-header">Var 13/14</th>
                    <th class="delivery-header">B/12</th>
                    <th class="delivery-header">Defects %</th>
                    <th class="delivery-header">AVG LG</th>
                    <th class="sample-header">AVG LG (S)</th>
                    <th class="variation-header">Var LG</th>
                    <th class="delivery-header">OT Delivery</th>
                    <th class="sample-header">OT Sample</th>
                    <th class="variation-header">Var OT</th>
                    <th class="delivery-header">PP Score</th>
                    <th class="sample-header">PP Score (S)</th>
                    <th class="variation-header">Var PP</th>
                    <th class="info-header">Category</th>
                    <th class="info-header">Storage</th>
                </tr>
            </thead>
            <tbody>
                ${
                  data
                    ?.map(
                      (v) =>
                        v.batches
                          .map(
                            (cwsBatches) =>
                              cwsBatches?.delivery?.batches
                                ?.map(
                                  (elements, subBatchIndex) =>
                                    `<tr>
                        <td>${v?.cws?.name || "N/A"}</td>
                        <td>${cwsBatches?.batchNo ?? ""}-${
                                      elements?.gradeKey ?? ""
                                    }</td>
                        <td class="numeric-cell">${
                          cwsBatches?.delivery?.transportedKgs[
                            elements?.gradeKey ?? ""
                          ] ?? "-"
                        }</td>
                        <td class="numeric-cell">${
                          cwsBatches?.delivery?.deliveryKgs[
                            elements?.category?.toLowerCase() ?? ""
                          ] ?? "-"
                        }</td>
                        <td class="numeric-cell">${
                          cwsBatches?.delivery?.variationKgs[
                            elements?.gradeKey
                          ] ?? "-"
                        }</td>
                        <td class="numeric-cell">${Number(
                          elements?.screen?.["16+"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.screen?.["15"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.["AVG15+"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          cwsBatches?.sample?.batches?.[subBatchIndex]?.[
                            "AVG15+"
                          ] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.totals?.v15plus ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.screen?.["14"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.screen?.["13"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.["AVG13/14"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          cwsBatches?.sample?.batches?.[subBatchIndex]?.[
                            "AVG13/14"
                          ] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.totals?.v1314 ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.screen?.["B/12"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.defect ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.["AVGLG"] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          cwsBatches?.sample?.batches?.[subBatchIndex]?.[
                            "AVGLG"
                          ] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.totals?.vlg ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.OTDelivery ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          cwsBatches?.sample?.batches?.[subBatchIndex]?.[
                            "OTSample"
                          ] ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.totals?.vot ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.ppScore ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          cwsBatches?.sample?.batches?.[subBatchIndex]
                            ?.ppScore ?? 0
                        ).toFixed(2)}</td>
                        <td class="numeric-cell">${Number(
                          elements?.totals?.vppscore ?? 0
                        ).toFixed(2)}</td>
                        <td>${elements?.newCategory ?? "-"}</td>
                        <td>${elements?.sampleStorage?.name ?? "-"}</td>
                    </tr>`
                                )
                                ?.join("") ?? ""
                          )
                          ?.join("") ?? ""
                    )
                    ?.join("") ?? ""
                }
            </tbody>
        </table>
    </body>
</html>
`;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  console.log(`Excel file "${fileName}" has been downloaded successfully!`);
};
