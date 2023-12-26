import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useStakingCreateQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation((data) => client.post(`/staking`, data), {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return mutation;
}
