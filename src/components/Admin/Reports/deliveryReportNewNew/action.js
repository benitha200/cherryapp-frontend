import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryReport } from "../../../../apis/deliveryReport";
export const GetDeliveryReportNew = (id) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["DeliveryReport", id],
    queryFn: async () => await deliveryReport(),
  });
  return { isPending, error, data };
};
