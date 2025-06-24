import { useState } from "react";
import { columns } from "./reportColums";
import { Card, Form, InputGroup } from "react-bootstrap";
import { GetReport } from "../action";
import { Skeleton } from "./skeleton";
import { Error } from "../../components/responses";
import { ReprotTable } from "./reportRows";
import { DashboardCard } from "./dashboardCard";
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";

export const QualityReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const { isPending, error, data } = GetReport();
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

  return isPending ? (
    <Skeleton />
  ) : (
    !isPending && data && (
      <div>
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total Cherry Purchased (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotalTransportedKgs ?? 0
              )}
              iconClass="bi-basket-fill"
            />
          </div>
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total Delivered (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotalDeliveredKgs ?? 0
              )}
              iconClass="bi-bus-front"
            />
          </div>{" "}
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total Average 15+ Delivered (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAvg15PlusDelivery ?? 0
              )}
              iconClass="bi-basket-fill"
            />
          </div>
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total Average 13/14 Delivered (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAvg1314Delivery ?? 0
              )}
              iconClass="bi-basket-fill"
            />
          </div>
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total Average Lowgrade Delivered (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotAVLGDelivery ?? 0
              )}
              iconClass="bi-battery-low"
            />
          </div>
          <div className="col-12 col-md-6">
            <DashboardCard
              title="Total OT Delivered (kg)"
              value={formatNumberWithCommas(
                data?.data?.grandTotals?.GrandtotOTDelivery ?? 0
              )}
              iconClass="bi-highlights"
            />
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Station Quality report</h4>
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
          <div className="table-responsive">
            <table
              className="table table-hover"
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                width: "100%",
                border: `1px solid ${processingTheme.tableBorder}`,
              }}
            >
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      style={{
                        // backgroundColor: processingTheme.tableHeader,
                        // color: processingTheme.primary,
                        padding: "10px 15px",
                        // fontWeight: 400,
                        // borderBottom: `1px solid`,
                        whiteSpace: "nowrap",
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
