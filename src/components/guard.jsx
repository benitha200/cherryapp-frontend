import { useQuery } from "@tanstack/react-query";
import { getMe } from "../apis/users";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingPage from "../sharedCompoents/loadingpage";

const RequireAuth = ({ allowedRoles }) => {
  const location = useLocation();
  const { isPending, error, data } = useQuery({
    queryKey: ["user"],
    queryFn: getMe,
  });
  if (isPending) {
    return <LoadingPage />;
  }
  if (error || data?.error) {
    localStorage.clear();
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }
  
  if (!allowedRoles?.includes(data?.role)) {
    console.log("RequireAuth data:", data);
    return data?.response?.data?.error ? (
      <Navigate to={"/login"} state={{ from: location }} replace />
    ) : (
      <Navigate to={"/"} state={{ from: location }} replace />
    );
  }
  return <Outlet />;
};

export default RequireAuth;
