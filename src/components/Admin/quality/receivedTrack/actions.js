import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDelivaries,
  getDelivaryById,
  updateDelivaryById,
} from "../../../../apis/delivaryCapping";

// export const CreatePost = () => {
//   const queryClient = useQueryClient();
//   const { error, isPending, mutate } = useMutation({
//     mutationFn: (formData) => createPost(formData),
//     onSuccess: () => {
//       toast.success("Post created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Posts"] });
//     },
//     onError: (error) => toast.error(error.originalError),
//   });
//   return { error, isPending, mutate };
// };

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

// export const DeletePost = () => {
//   const queryClient = useQueryClient();
//   const { isPending, mutate: Destroy } = useMutation({
//     mutationFn: (id) => deletePost(id),
//     onSuccess: (res) => {
//       queryClient.invalidateQueries({ queryKey: ["Posts"] });
//       toast.success(res.message);
//     },
//     onError: (error) => {
//       toast.error(error.originalError);
//     },
//   });
//   return { isPending, Destroy };
// };

export const UpdateDelivary = (id) => {
  const queryClient = useQueryClient();
  const {
    error: updatingError,
    isPending: isUpdating,
    mutate,
  } = useMutation({
    mutationFn: (formData) => updateDelivaryById({ id, payload: formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Derivary"] });
      queryClient.resetQueries({ queryKey: ["Post"] });
    },
    onError: (error) => error?.message ?? "Failed to update Quality accessment",
  });
  return { updatingError, isUpdating, mutate };
};
