import { ReportsHeading } from "../../../../sharedCompoents/heading";
import { GeneralReportTable } from "./components/generalReportTable";

export default function QualityAnalysisReport() {
  return (
    <>
      <ReportsHeading>Quality Analysis Report</ReportsHeading>
      <GeneralReportTable />
    </>
  );
}
