import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Columns } from "./tableHeading";

const dumyData = [
  {
    id: 1,
    batch: "25Mus2005-2-N1",
    cws: "Musasa",
    date: "20 May 2025",
    ptype: "NATURAL",
    price: "920",
    wet: "Yes",
    receiver: "Mashesha",
    cup: "S88",
    track: "RAD23",
    totalkgs: "34032",
    cupdel: "S88",
    storage: "1H",
    outturn: 23.4,
  },
  {
    id: 1,
    batch: "25Mus2105-2-A1",
    cws: "Musasa",
    date: "21 May 2025",
    ptype: "FULLY_WASHED",
    price: "920",
    wet: "No",
    receiver: "",
    cup: "S88",
    track: "RAD23",
    totalkgs: "20432",
    cupdel: "S88",
    storage: "1D",
    outturn: 19.4,
  },
];
export const GeneralReportTable = () => {
  return (
    <ReusableTable
      columns={Columns}
      data={dumyData}
      onPageSizeChange={() => null}
    >
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={5}
        onPageChange={() => null}
      />
    </ReusableTable>
  );
};
