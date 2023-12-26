import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useIdoCreateQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation((data) => client.post(`/ido`, data), {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return mutation;
}
