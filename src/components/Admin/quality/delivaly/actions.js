import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDelivary } from "../../../../apis/delivaryCapping";

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

export const FindAllDelivaries = (page, size) => {
  const {
    isPending,
    error,
    data: delivaries,
  } = useQuery({
    queryKey: ["Derivaries", page, size],
    queryFn: async () => await getDelivary(page, size),
  });
  return { isPending, error, delivaries };
};

// export const FindPost = (id) => {
//   const {
//     isPending: Fetching,
//     error,
//     data: Post,
//   } = useQuery({
//     queryKey: ["post"],
//     queryFn: async () => await findPost(id),
//   });
//   return { Fetching, error, Post };
// };

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

// export const UpdatePost = (id) => {
//   const queryClient = useQueryClient();
//   const { error, isPending, mutate } = useMutation({
//     mutationFn: (formData) => updatePost(id, formData),
//     onSuccess: () => {
//       toast.success("Post updated successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Posts"] });
//       queryClient.resetQueries({ queryKey: ["Post"] });
//     },
//     onError: (error) => toast.error(error.originalError),
//   });
//   return { error, isPending, mutate };
// };

// export const FindSessions = () => {
//   const {
//     isPending,
//     error,
//     data: sessions,
//   } = useQuery({
//     queryKey: ["Sessoins"],
//     queryFn: async () => await getAllSessions(),
//   });

//   return { isPending, error, sessions };
// };

// export const ReplaySession = (id: string) => {
//   const queryClient = useQueryClient();
//   const {
//     isPending,
//     error,
//     mutate: replay,
//   } = useMutation({
//     mutationFn: (replay: string) => repalySession(id, replay),
//     onSuccess: () => {
//       toast.success("Replay sent successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Sessoins"] });
//     },
//   });
//   return { isPending, error, replay };
// };

// export const UpdateStudentCredentials = (id: string) => {
//   const queryClient = useQueryClient();
//   const {
//     isPending,
//     error,
//     mutate: updateStudent,
//   } = useMutation({
//     mutationFn: (student: UpdateStudentAttributes) =>
//       updateStudentCredentials(id, student),
//     onSuccess: () => {
//       toast.success("Student updated successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Sessoins"] });
//     },
//     onError: (error: ErrorAtributes) => toast.error(error.originalError),
//   });
//   return { isPending, error, updateStudent };
// };

// export const MakeRepresentative = () => {
//   const queryClient = useQueryClient();

//   const { isPending, mutate: Represent } = useMutation({
//     mutationFn: (id: string) => makeRepresentative(id),
//     onSuccess: () => {
//       toast.success("Representative created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Student"] });
//     },
//     onError: (error: ErrorAtributes) => toast.error(error.originalError),
//   });
//   return { isPending, Represent };
// };

// export const RemoveRepresentative = () => {
//   const queryClient = useQueryClient();
//   const { isPending: Removing, mutate: RemoveRPstv } = useMutation({
//     mutationFn: (id: string) => removeRepresentative(id),
//     onSuccess: () => {
//       toast.success("Representative created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["Student"] });
//     },
//     onError: (error: ErrorAtributes) => toast.error(error.originalError),
//   });
//   return { Removing, RemoveRPstv };
// };
