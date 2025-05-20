import { useState } from "react";
import { columns } from "./reportColums";
import { Pagination } from "../../../../../sharedCompoents/paginations";
import { Card } from "react-bootstrap";
import { GetReport } from "../action";
import { Skeleton } from "./skeleton";
import { Error } from "../../components/responses";
import { ReprotTable } from "./reportRows";

export const QualityReportTable = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const { isPending, error, data } = GetReport();
  if (error) {
    return <Error error={error?.message ?? "Failed to fetch report Data."} />;
  }
  if (data) {
    // console.log(":::::::::", data?.data?.report ?? []);
  }
  return isPending ? (
    <Skeleton />
  ) : (
    !isPending && data && (
      <div className="container-fluid">
        <Card className="mb-4">
          <ReprotTable
            data={data?.data?.report ?? []}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            initialPageSize={5}
            isLoading={false}
            onPageSizeChange={setItemsPerPage}
            rowKeyField="batchNo"
            itemsPerPage={itemsPerPage}
            emptyStateMessage={"There is no data"}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              totalItems={30}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </ReprotTable>
        </Card>
      </div>
    )
  );
};
