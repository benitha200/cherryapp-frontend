import { ReportsHeading } from "../../sharedCompoents/heading";
import { TransportedTruckTable } from "./components/tableRows";

export const TransportedTrucks = () => {
  return (
    <div>
      <ReportsHeading>delivered Truck report</ReportsHeading>
      <TransportedTruckTable />
    </div>
  );
};
