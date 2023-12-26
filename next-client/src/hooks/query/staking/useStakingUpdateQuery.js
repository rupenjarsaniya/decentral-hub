import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useStakingUpdateQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation(
    (data) => client.put(`/staking/${data.id}`, data.data),
    {
      onSuccess: (data) => {
        console.log(data.data);
      },
    }
  );

  return mutation;
}
