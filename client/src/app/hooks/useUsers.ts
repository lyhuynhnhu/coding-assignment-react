import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAll,
  });
};
