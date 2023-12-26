import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useStakeUpdateQuery(id) {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation((data) => client.put(`/stake/${id}`, data), {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return mutation;
}
