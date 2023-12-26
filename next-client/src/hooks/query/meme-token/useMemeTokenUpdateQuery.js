import NetworkService from "@/src/utils/client/fetch";
import { useMutation } from "react-query";
import { useMemo } from "react";

export function useMemeTokenUpdateQuery(id) {
  const client = useMemo(() => new NetworkService(), []);

  const mutation = useMutation((data) => client.put(`/memetoken/${id}`, data), {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return mutation;
}
