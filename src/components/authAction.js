import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../apis/auth";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export const UserLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    error: loginError,
    isPending,
    mutate,
  } = useMutation({
    mutationFn: (payload) => login({ payload }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["User"] });
      queryClient.resetQueries({ queryKey: ["User"] });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("cws", JSON.stringify(data.cws));
      const from = location?.state?.from?.pathname || data?.user?.role?.toUpperCase() ==='PRODUCTION'?"/received":"/";
      navigate(from, { replace: true });
    },
  });
  return { isPending, loginError, mutate };
};
