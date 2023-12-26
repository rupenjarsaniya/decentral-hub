import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useToken721GetQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery("useToken721GetQuery", () => client.get(`/token721`));

  return query;
}
