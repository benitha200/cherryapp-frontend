import { useQuery } from "@tanstack/react-query";
import { report, reportExcel } from "./../../../../apis/qualityReport";
export const GetReport = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["Report"],
    queryFn: async () => await report(),
  });
  return { isPending, error, data };
};

export const GetReportExcel = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["ReportExcel"],
    queryFn: async () => await reportExcel(),
  });
  return { isPending, error, data };
};
