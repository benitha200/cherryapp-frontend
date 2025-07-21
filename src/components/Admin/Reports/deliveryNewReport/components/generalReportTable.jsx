import { deliveryReportExcel } from "./deliveryExcelReport";
import processQualityReportData from "./exceleDataRaw";

import { useState } from "react";
import { columns } from "./reportColumns";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { GetReport } from "../action";
import { DashboardCard } from "./dashboardCard";
import { DashboardCardWithPercentages } from "./DashboardCardWithPercentages";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";
import DeliveryReportSkeleton from "./deliverySkeleton";
import { GetReportData } from "../../../quality/report/action";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";

export const GeneralReportTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isPending, error, data } = GetReport();
  const { deliveryPending, deliverydata } = GetReportData();

  if (error) {
    // return <Error error={error?.message ?? "Failed to fetch report Data."} />;
  }

  function exportExceleWithTrackCategoryAndDate() {
    deliveryReportExcel(processQualityReportData(data?.data?.report ?? []));
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
              title="Total In Transit "
              value={formatNumberWithCommas(0)}
              iconClass=""
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCard
              title="Total Variation "
              value={formatNumberWithCommas(
                (data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0) -
                  (data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0)
                // also remove in transit
              )}
              iconClass=""
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title=" Average Delivered"
              value={`${formatNumberWithCommas(0)} kgs`}
              mainValue={data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0}
              totalDelivered={0}
              totalHighGrade={
                data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0
              }
              iconClass=""
              type="avg15Plus"
            />
          </div>

          {/* <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title=" Average 15+ Delivered"
              value={`${formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAvg15PlusDelivery ?? 0
              )} kgs`}
              mainValue={
                data?.data?.grandTotals?.GrandtotAvg15PlusDelivery ?? 0
              }
              totalDelivered={
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              }
              totalHighGrade={
                data?.data?.grandTotals?.GrandtotalHighGradeDeliveredKgs ?? 0
              }
              iconClass=""
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
          </div> */}
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h4 className="mb-0">Station Quality report</h4>
              <div className=" d-flex">
                <Col style={{ width: "16rem" }}>
                  <div className="d-flex">
                    <Button
                      variant="outline-success"
                      className="me-2"
                      onClick={() => exportExceleWithTrackCategoryAndDate()}
                    >
                      <i className="bi bi-download "></i> Download Details
                    </Button>
                  </div>
                </Col>

                <div style={{ width: "250px" }}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </div>
          {/* <div
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
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      style={{
                        backgroundColor:
                          processingTheme.tableHeader || "#f8f9fa",
                        color: processingTheme.primary,
                        padding: "10px 15px",
                        whiteSpace: "nowrap",
                        borderBottom: `1px solid ${processingTheme.tableBorder}`,
                      }}
                    >
                      {column.header || column.field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.data?.report?.length == 0 ? (
                  <tr>
                    <td colSpan={columns?.length}>
                      <div className="text-center fw-bold fs-5 p-3 border border-warning rounded bg-light text-dark">
                        {"No data available"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  (!searchQuery
                    ? data?.data?.report
                    : data?.data?.report?.filter((element) =>
                      element?.cws?.name
                        ?.toLowerCase()
                        ?.includes(searchQuery.toLowerCase())
                    )
                  ).map((element) => (
                    <ReprotTable
                      data={element ?? []}
                      columns={columns}
                      pageSizeOptions={[5, 10, 20]}
                      initialPageSize={5}
                      isLoading={false}
                      onPageSizeChange={setItemsPerPage}
                      rowKeyField="batchNo"
                      itemsPerPage={itemsPerPage}
                      emptyStateMessage={"There is no data"}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div> */}

          <ReusableTable
            columns={columns}
            data={deliverydata?.data}
          ></ReusableTable>
        </div>
      </div>
    )
  );
};
