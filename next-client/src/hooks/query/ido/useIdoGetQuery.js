import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useIdoGetQuery(id) {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useTokenGetQuery", id], () =>
    client.get(id ? `/ido/${id}` : `/ido`)
  );

  return query;
}

export function useAllIdoGetQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useAllTokenGetQuery"], () => client.get(`/ido/0x`));

  return query;
}
