import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useStakeGetQuery(id) {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useStakeGetQuery", id], () =>
    client.get(id ? `/stake/${id}` : `/stake`)
  );

  return query;
}

export function useAllStakeGetQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useAllStakeGetQuery"], () =>
    client.get(`/stake/0x`)
  );

  return query;
}
