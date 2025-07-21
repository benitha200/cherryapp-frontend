import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Columns } from "./tableHeading";
import { GetGeneralReport } from "../action";


export const GeneralReportTable = () => {
  const {isPending,error,data} = GetGeneralReport()
  console.log({data})
  if(isPending){
    return <div>Loading ...</div>
  }
  return (
   <>
   { <ReusableTable
      columns={Columns}
      data={data?.data ?? []}
      onPageSizeChange={() => null}
      >
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={5}
        onPageChange={() => null}
        />
    </ReusableTable>}
        </>
  );
};
