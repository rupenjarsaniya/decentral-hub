import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useTokenGetQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery("useTokenGetQuery", () => client.get(`/token`));

  return query;
}
