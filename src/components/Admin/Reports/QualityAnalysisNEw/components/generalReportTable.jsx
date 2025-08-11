import { useState } from "react";
import { columns } from "./reportColumns";
import { GetReport } from "../action";
import { DashboardCard } from "./dashboardCard";
import { DashboardCardWithPercentages } from "./DashboardCardWithPercentages";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";
import DeliveryReportSkeleton from "./skeleton";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { QualityAnalysisExcel } from "./downloadableExele";

export const GeneralReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [totals, setTotals] = useState({
    totalTransported: 0,
    totalDelivered: 0,
    totalVariation: 0,
    averageFiftenDelivered: 0,
    averagethirteenFourteenDelivered: 0,
    averageLowgradeDelivered: 0,
  });
  const { isPending, data } = GetReport();

  const processingTheme = {
    primary: "#008080",
    secondary: "#4FB3B3",
    accent: "#D95032",
    neutral: "#E6F3F3",
    tableHover: "#F8FAFA",
    directDelivery: "#4FB3B3",
    centralStation: "#008080",
    buttonHover: "#006666",
    tableHeader: "#E0EEEE",
    tableBorder: "#D1E0E0",
    emptyStateBackground: "#F5FAFA",
  };
  if (data?.data) {
    [].map((element) => {
      totals.totalTransported += element?.transportedKgs ?? 0;
      totals.totalDelivered += element?.deliveredKgs ?? 0;
      totals.totalVariation += element?.variation ?? 0;
      totals.averageFiftenDelivered += element?.k ?? 0;
      totals.averagethirteenFourteenDelivered += element?.k ?? 0;
      totals.averageLowgradeDelivered += element?.k ?? 0;
    });
  }
  return isPending ? (
    <DeliveryReportSkeleton />
  ) : (
    !isPending && data && (
      <div>
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCard
              title="Total Transported "
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0
              )}
              iconClass=""
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCard
              title="Total Delivered "
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              )}
              iconClass=""
            />
          </div>

          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCard
              title="Total Variation "
              value={formatNumberWithCommas(
                (data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0) -
                  (data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0)
              )}
              iconClass=""
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title=" Average 16+ Delivered"
              value={`${formatNumberWithCommas(
                totals.totalTransported ?? 0
              )} kgs`}
              type="avg15Plus"
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title="Average 13/14 Delivered"
              value={`${formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAvg1314Delivery ?? 0
              )} kgs`}
              mainValue={data?.data?.grandTotals?.GrandtotAvg1314Delivery ?? 0}
              totalDelivered={
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              }
              totalHighGrade={
                data?.data?.grandTotals?.GrandtotalHighGradeDeliveredKgs ?? 0
              }
              iconClass=""
              type="avg1314"
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title=" Average Lowgrade Delivered"
              value={`${formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAVLGDelivery ?? 0
              )} kgs`}
              mainValue={data?.data?.grandTotals?.GrandtotAVLGDelivery ?? 0}
              totalDelivered={
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              }
              totalHighGrade={
                data?.data?.grandTotals?.GrandtotalHighGradeDeliveredKgs ?? 0
              }
              iconClass=""
              type="avgLowGrade"
            />
          </div>
        </div>
        <div className="card">
          <div
            className="table-responsive"
            style={{ height: "60vh", overflowY: "auto" }}
          >
            <table
              className="table table-hover"
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                width: "100%",
                border: `1px solid ${processingTheme.tableBorder}`,
              }}
            >
              <tbody>
                {data?.data?.length == 0 ? (
                  <tr>
                    <td colSpan={columns?.length}>
                      <div className="text-center fw-bold fs-5 p-3 border border-warning rounded bg-light text-dark">
                        {"No data available"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <ReusableTable
                    data={
                      !searchQuery
                        ? data?.data
                        : data?.data?.filter((element) =>
                            element?.cwsName
                              ?.toLowerCase()
                              ?.includes(searchQuery?.trim()?.toLowerCase())
                          ) ?? []
                    }
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    initialPageSize={5}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={false}
                    onPageSizeChange={setItemsPerPage}
                    rowKeyField="batchNo"
                    itemsPerPage={itemsPerPage}
                    emptyStateMessage={"Failed to find report data."}
                    HeaderButton={<QualityAnalysisExcel />}
                    totalTransportedKgs={
                      data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0
                    }
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  );
};
