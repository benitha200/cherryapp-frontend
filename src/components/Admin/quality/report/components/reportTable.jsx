import { useState } from "react";
import { columns } from "./reportColums";
import { Card } from "react-bootstrap";
import { GetReport } from "../action";
import { Skeleton } from "./skeleton";
import { Error } from "../../components/responses";
import { ReprotTable } from "./reportRows";

export const QualityReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
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
      <div className=" table-responsive">
        <Card className="">
          <table
            className="table"
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
                      fontWeight: 400,
                      borderBottom: `1px solid`,
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
                (data?.data?.report ?? []).map((element) => (
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
        </Card>
      </div>
    )
  );
};
