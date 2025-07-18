import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStockDeliveryRecord, getTransportedTrackById, transportedTruck } from "../../apis/transportedTrack";
import toast from "react-hot-toast";
export const GetTranspotedTruck = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["TransportedTrucks"],
    queryFn: async () => await transportedTruck(),
  });
  return { isPending, error, data };
};


export const CreateStockDelivery = (onupdateSuccess) => {
  const queryClient = useQueryClient();

  const desiredKeyOrder = [
    "transferDate",
    "arrivalDate",
    "transportGroupId",
    "category",
    "deliveryKgs",
    "WRN",
  ];

  const reorderKeys = (obj) => {
    const ordered = {};
    for (const key of desiredKeyOrder) {
      if (key in obj) {
        ordered[key] = obj[key];
      }
    }
    return ordered;
  };

  const {
    error: creatingError,
    isPending: isCreatingpending,
    mutate,
  } = useMutation({
    mutationFn: (formData) => {
      const normalizedData = Array.isArray(formData) ? formData : [formData];
      const reordered = normalizedData.map(reorderKeys);

      const payload = reordered.length > 1 ? reordered : reordered[0];

      return createStockDeliveryRecord(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["TransportedTrucks"] });
      onupdateSuccess();
    },

    onError: (error) => {
      toast.error(error.message ?? "Failed to update the ");
    },
  });

  return { creatingError, isCreatingpending, mutate };
};



export const GetTransportedTracyBytransferGroupIdAndDate = (transferGroupId, tranportDate) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["TransportedTruckById", transferGroupId, tranportDate],
    queryFn: async () => await getTransportedTrackById(transferGroupId, tranportDate),
  });
  return { isPending, error, data };
};
