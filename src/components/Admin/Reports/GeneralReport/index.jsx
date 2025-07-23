import { ReportsHeading } from "../../../../sharedCompoents/heading";
import { GeneralReportTable } from "./components/generalReportTable";

function GeneralReport() {
  return (
    <>
      <ReportsHeading>General Report</ReportsHeading>
      <GeneralReportTable />
    </>
  );
}

export default GeneralReport;
