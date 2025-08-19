import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  transportedTruck,
  transportedTruckExcelReport,
} from "../../apis/transportedTrack";
import {
  createQualityDeliveryOnTrack,
  getTransportedTrackById,
} from "../../apis/qualityDelivery";
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
  const {
    error: creatingError,
    isPending: isCreatingpending,
    mutate,
  } = useMutation({
    mutationFn: (formData) => createQualityDeliveryOnTrack({ data: formData }),
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

export const GetTransportedTracyBytransferGroupIdAndDate = (
  transferGroupId
) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["TransportedTruckById", transferGroupId],
    queryFn: async () => await getTransportedTrackById(transferGroupId),
  });
  return { isPending, error, data };
};

export const GetTranspotedTruckExelReport = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["TransportedTrucksExcelreport"],
    queryFn: async () => await transportedTruckExcelReport(),
  });
  return { isPending, error, data };
};
