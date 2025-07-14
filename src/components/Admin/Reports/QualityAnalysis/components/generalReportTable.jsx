import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { GetReport } from "../../../quality/report/action";
import { exportQualityReportCSV } from "./qualityAnalysisExcel";
import { Columns } from "./tableHeading";
import processQualityReportData from "./tableRows";

export const GeneralReportTable = () => {
  const { isPending, error, data } = GetReport();
  if (isPending) {
    return <div>Loading ...</div>;
  }

  function exportExcel() {
    exportQualityReportCSV(processQualityReportData(data?.data?.report ?? []));
  }
  return (
    <div>
      {data && (
        <ReusableTable
          columns={Columns}
          data={processQualityReportData(data?.data?.report ?? [])}
          onPageSizeChange={() => null}
          isQualityDelivery={true}
          ifQualityDeliveryDataDownloadExcele={exportExcel}
          downloadSummary={false}
          ifQualityDeliveryDataIsitLoading={isPending}
        >
          <Pagination
            currentPage={1}
            totalPages={1}
            totalItems={5}
            itemsPerPage={5}
            onPageChange={() => null}
          />
        </ReusableTable>
      )}
    </div>
  );
};
