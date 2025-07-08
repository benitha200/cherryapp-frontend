import { DerivalyTable } from "./components/report";
import { ReportsHeading } from "../../../../sharedCompoents/heading";
import DashboardCards from "./DashboardCards";

export default function DeliveryTracks() {
  return (
    <div>
      <ReportsHeading>Delivery</ReportsHeading>
      <DashboardCards />
      <DerivalyTable />
    </div>
  );
}
