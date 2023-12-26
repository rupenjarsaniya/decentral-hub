import NetworkService from "@/src/utils/client/fetch";
import { useQuery } from "react-query";
import { useMemo } from "react";

export function useStakingGetQuery() {
  const client = useMemo(() => new NetworkService(), []);

  const query = useQuery(["useStakingGetQuery"], () => client.get(`/staking`));

  return query;
}
