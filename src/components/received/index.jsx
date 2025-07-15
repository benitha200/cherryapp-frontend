import { ReportsHeading } from "../../sharedCompoents/heading"
import { TransportedTruckTable } from "./components/tableRows"

export const TransportedTrucks = ()=>{
    return <div>
              <ReportsHeading>Transported Truck report</ReportsHeading>
        <TransportedTruckTable />
    </div>
}