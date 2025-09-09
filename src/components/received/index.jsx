import { ReportsHeading } from "../../sharedCompoents/heading";
import { TransportedTruckTable } from "./components/tableRows";

export const TransportedTrucks = () => {
  return (
    <div>
      <ReportsHeading>Delivered Truck Report</ReportsHeading>
      <TransportedTruckTable />
    </div>
  );
};
