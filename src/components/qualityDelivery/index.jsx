import { ReportsHeading } from "../../sharedCompoents/heading";
import { TransportedTruckTable } from "./components/tableRows";

const TransportedTrucks = () => {
  return (
    <div>
      <ReportsHeading>Quality delivery</ReportsHeading>
      <TransportedTruckTable />
    </div>
  );
};

export default TransportedTrucks;
