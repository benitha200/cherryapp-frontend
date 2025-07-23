// GeneralReportTable.jsx
import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Columns } from "./tableHeading";
import { GetGeneralReport } from "../action";

export const GeneralReportTable = () => {
  const { isPending, data } = GetGeneralReport();

  const flattenBatchData = (batchData) => {
    if (!batchData || !Array.isArray(batchData)) return [];

    const flattened = [];

    batchData.forEach((batch) => {
      if (batch.subBatches && Array.isArray(batch.subBatches)) {
        batch.subBatches.forEach((subBatch) => {
          flattened.push({
            ...subBatch,
            purchaseInfo: batch.purchaseInfo,
            purchaseBatchNo: batch.purchaseBatchNo,
            flowAnalysis: batch.flowAnalysis,
            hasWetTransfer: subBatch.hasWetTransfer || false,
            hasQualityTesting: subBatch.hasQualityTesting || false,
            hasQualityDeliveryTesting:
              subBatch.hasQualityDeliveryTesting || false,
          });
        });
      }
    });

    return flattened;
  };

  const flattenedData = flattenBatchData(data?.data);

  console.log({ originalData: data, flattenedData });

  if (isPending) {
    return <div>Loading ...</div>;
  }

  return (
    <>
      <ReusableTable
        columns={Columns}
        data={flattenedData}
        onPageSizeChange={() => null}
      >
        <Pagination
          currentPage={1}
          totalPages={Math.ceil(flattenedData.length / 5)}
          totalItems={flattenedData.length}
          itemsPerPage={5}
          onPageChange={() => null}
        />
      </ReusableTable>
    </>
  );
};
