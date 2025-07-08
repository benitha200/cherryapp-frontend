import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAllTrucksWithDetailedBatches,
  getDelivaries,
  getDelivaryById,
  updateDelivaryById,
} from "../../../../apis/delivaryCapping";
import { sampleStorage } from "../../../../apis/sampleStorage";
import toast from "react-hot-toast";

export const GetAllDelivaries = (page, size) => {
  const {
    isPending: getAllPending,
    error: getAllError,
    data: allDelivaries,
  } = useQuery({
    queryKey: ["Derivaries", page, size],
    queryFn: async () => await getDelivaries(page, size),
  });
  return { getAllPending, getAllError, allDelivaries };
};

export const GetDelivaryById = (id) => {
  const {
    isPending: getByIdPending,
    error: getByIdError,
    data: delivary,
  } = useQuery({
    queryKey: ["Derivary"],
    queryFn: async () => await getDelivaryById(id),
  });
  return { getByIdPending, getByIdError, delivary };
};

export const UpdateDelivary = (id, onupdateSuccess) => {
  const queryClient = useQueryClient();
  const {
    error: updatingError,
    isPending: isUpdating,
    mutate,
  } = useMutation({
    mutationFn: (formData) => updateDelivaryById({ id, payload: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Derivary"] });
      onupdateSuccess();
    },
    onError: (error) => {
      toast.error(error?.message ?? "Failed to update the ");
    },
  });
  return { updatingError, isUpdating, mutate };
};

export const GetSampleStorage = () => {
  const {
    isPending: sampleStoragePeding,
    error: sampleStorageError,
    data: sampleStoragedata,
  } = useQuery({
    queryKey: ["SampleStorage"],
    queryFn: async () => await sampleStorage(),
  });
  return { sampleStoragePeding, sampleStorageError, sampleStoragedata };
};

export const useTrackWithDetailedBatches = () => {
  const {
    isPending: isTrackLoading,
    error: trackError,
    data: trackData,
  } = useQuery({
    queryKey: ["trackWithDetailedBatches"],
    queryFn: async () => await getAllTrucksWithDetailedBatches(),
  });

  return { isTrackLoading, trackError, trackData };
};
