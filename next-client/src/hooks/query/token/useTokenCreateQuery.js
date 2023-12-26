import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useTokenCreateQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation((data) => client.post(`/token`, data), {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return mutation;
}
