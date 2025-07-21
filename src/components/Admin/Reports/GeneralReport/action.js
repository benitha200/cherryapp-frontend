import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  generalReport } from "../../../../apis/generalReport";

export const GetGeneralReport = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["GeneralReportData"],
    queryFn: async () => await generalReport(),
  });
  return { isPending, error, data };
};

