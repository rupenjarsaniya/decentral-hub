import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useMemeTokenGetQuery(id) {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useMemeTokenGetQuery", id], () =>
    id ? client.get(`/memetoken/${id}`) : client.get(`/memetoken`)
  );

  return query;
}
