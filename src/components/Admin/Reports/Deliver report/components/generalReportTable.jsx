import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { GetReport } from "../../../quality/report/action";
import { deliveryReportExcel } from "./deliveryExcelReport";
import { Columns } from "./tableHeading";
import processQualityReportData from "./tableRows";

export const GeneralReportTable = () => {
  const { isPending, error, data } = GetReport();
  if (isPending) {
    return <div>Loading ...</div>;
  }
  function exportExceleWithTrackCategoryAndDate() {
    deliveryReportExcel(processQualityReportData(data?.data?.report ?? []));
  }

  return (
    <div>
      {data && (
        <ReusableTable
          columns={Columns}
          data={processQualityReportData(data?.data?.report ?? [])}
          onPageSizeChange={() => null}
          isQualityDelivery={true}
          ifQualityDeliveryDataDownloadExcele={
            exportExceleWithTrackCategoryAndDate
          }
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
