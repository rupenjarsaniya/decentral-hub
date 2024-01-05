import React from "react";
import { useRouter } from "next/router";
import { useMemeTokenGetQuery } from "@/src/hooks/query";
import MemeTokenFormContainer from "@/src/Components/App/MemeTokenForm/MemeTokenFormContainer";

export default function Page() {
  const {
    query: { id },
  } = useRouter();
  const { data: memetoken, isLoading } = useMemeTokenGetQuery(id);

  return (
    <MemeTokenFormContainer memetoken={memetoken ?? null} loading={isLoading} />
  );
}
