import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";
import { DashboardCard } from "./card";
export const DeliveryReportSummary = ({data}) => {

 return <div className="row g-3 mb-4">
    <div className="col-12 col-lg-2 col-md-4">
      <DashboardCard
        title="Total Transported"
        value={formatNumberWithCommas(data?.transportedKgs ?? 0)}
      />
    </div>
    <div className="col-12 col-lg-2 col-md-4">
      <DashboardCard
        title="Total Delivered"
        value={formatNumberWithCommas(data?.deliveredKgs ?? 0)}
      />
    </div>
    <div className="col-12 col-lg-2 col-md-4">
      <DashboardCard
        title="Total In Transit"
        value={formatNumberWithCommas(data?.inTransitKgs ?? 0)}
      />
    </div>
    <div className="col-12 col-lg-2 col-md-4">
      <DashboardCard
        title="Total Variation"
        value={formatNumberWithCommas(data?.variation ?? 0)}
      />
    </div>
    {/* <div className="col-12 col-lg-2 col-md-4">
      <DashboardCard
        title="Average Delivered"
        value={formatNumberWithCommas(data?.transportedKgs ?? 0)}
      />
    </div> */}
  </div>

}