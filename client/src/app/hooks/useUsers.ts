import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";

export const useUsers = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getAll,
  });

  return {
    usersQuery,
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    refetch: usersQuery.refetch,
  };
};
