import { useState } from "react";
import { columns } from "./reportColums";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { GetReport, GetReportData } from "../action";
import { Skeleton } from "./skeleton";
import { Error } from "../../components/responses";
import { ReprotTable } from "./reportRows";
import { DashboardCard } from "./dashboardCard";
import { DeliveredWithBreakdown } from "./DeliveredWithBreakdown";
import { DashboardCardWithPercentages } from "./DashboardCardWithPercentages";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";
import { exportToExcel } from "./exceleteToExport";
import { exportToExcelWithDateAndTrack } from "./exportToExceleByDateAndTrack";

export const QualityReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const { isPending, error, data } = GetReport();
  const { deliverydata, deliveryPending } = GetReportData()
  if (error) {
    return <Error error={error?.message ?? "Failed to fetch report Data."} />;
  }

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
  function details() {
    exportToExcel(data?.data?.report ?? []);
  }

  function exportExceleWithTrackCategoryAndDate() {
    exportToExcelWithDateAndTrack(data?.data?.report ?? []);
  }
  return isPending ? (
    <Skeleton />
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
            <DeliveredWithBreakdown
              title="Total Delivered "
              totalValue={data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0}
              deliveredKgs={data?.data?.grandTotals?.DeliveredKgs ?? {}}
              iconClass=""
            />
          </div>
          <div className="col-12 col-lg-2 col-md-4">
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
          </div>
          <div className="col-12 col-lg-2 col-md-4">
            <DashboardCardWithPercentages
              title="Total Average OT Delivered"
              value={`${formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotOTDelivery ?? 0
              )} kgs`}
              mainValue={data?.data?.grandTotals?.GrandtotOTDelivery ?? 0}
              totalDelivered={
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              }
              totalHighGrade={
                data?.data?.grandTotals?.GrandtotalHighGradeDeliveredKgs ?? 0
              }
              iconClass=""
              type="avgOT"
            />
          </div>
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
                      onClick={() => details()}
                    >
                      <i className="bi bi-download "></i> Download Details
                    </Button>
                  </div>
                </Col>
                <Col style={{ width: "12rem" }}>
                  <div className="d-flex">
                    <Button
                      variant="outline-success"
                      className="me-2"
                      onClick={() => exportExceleWithTrackCategoryAndDate()}
                    >
                      <i className="bi bi-download me-1"></i> Download Summary
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
          <div
            className="table-responsive"
            style={{ height: "60vh", overflowY: "auto" }}
          >
            <style>
              {`
                  @media (min-width: 768px) {
                    .table-responsive {
                      height: 57vh !important;
                    }
                  }
                  @media (min-width: 992px) {
                    .table-responsive {
                      height: 65vh !important;
                    }
                  }
                `}
            </style>
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
          </div>
        </div>
      </div>
    )
  );
};
