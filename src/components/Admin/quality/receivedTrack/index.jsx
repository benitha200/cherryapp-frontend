import { DerivalyTable } from "./components/report";
import { DelivarySkeleton } from "../delivery/components/skeleton";
import { DelivaryHeading } from "./components/Heading";

export default function DeliveryTracks() {
  return (
    <div>
      <DelivaryHeading />
      <DerivalyTable />
    </div>
  );
}
