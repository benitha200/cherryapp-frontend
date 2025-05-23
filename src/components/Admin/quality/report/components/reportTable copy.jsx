import { useState } from "react";
import { columns } from "./reportColums";
import { Card } from "react-bootstrap";
import { GetReport } from "../action";
import { Skeleton } from "./skeleton";
import { Error } from "../../components/responses";
import { ReprotTable } from "./reportRows copy";

export const QualityReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { isPending, error, data } = GetReport();
  if (error) {
    return <Error error={error?.message ?? "Failed to fetch report Data."} />;
  }

  return isPending ? (
    <Skeleton />
  ) : (
    !isPending && data && (
      <div className="container-fluid">
        <Card className="mb-4">
          {(data?.data?.report ?? []).map((element) => (
            <div style={{ backgroundColor: "#E0EEEE" }}>
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
              ></ReprotTable>
            </div>
          ))}
        </Card>
      </div>
    )
  );
};
