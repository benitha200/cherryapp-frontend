import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { report, deliveryReportDadta } from "./../../../../apis/qualityReport";
export const GetReport = (id) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["Report"],
    queryFn: async () => await report(),
  });
  return { isPending, error, data };
};


export const GetReportData = () => {
  const { isPending: deliveryPending, error, data: deliverydata } = useQuery({
    queryKey: ["ReportDeliveryData"],
    queryFn: async () => await deliveryReportDadta(),
  });
  return { deliveryPending, error, deliverydata };
};
