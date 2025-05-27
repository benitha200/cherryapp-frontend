import { useQuery } from "@tanstack/react-query";
import { getAllStocksInfo } from "../../../apis/stock";

// getAllStocksInfo
export const FindAllStockInformation = () => {
  const {
    isPending,
    error: isError,
    data: stocksData,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => await getAllStocksInfo(),
  });
  return { isPending, isError, stocksData };
};
