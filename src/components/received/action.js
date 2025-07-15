import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStockDeliveryRecord, transportedTruck } from "../../apis/transportedTrack";
export const GetTranspotedTruck = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["TransportedTruck"],
    queryFn: async () => await transportedTruck(),
  });
  return { isPending, error, data };
};


export const CreateStockDelivery = () => {
  const queryClient = useQueryClient();
  const {
    error: creatingError,
    isPending: isCreatingpending,
    mutate,
  } = useMutation({
    mutationFn: (formData) => {
      return createStockDeliveryRecord(formData?.lenght >1 ? formData : formData[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Derivary"] });
      onupdateSuccess();
    },
    onError: (error) => {
      toast.error(error?.message ?? "Failed to update the ");
    },
  });
  return { creatingError, isCreatingpending, mutate };
};
