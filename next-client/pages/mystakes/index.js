"use client";

import { Percent, Plus, User } from "@phosphor-icons/react";
import { Card } from "@/src/Components/App/Card";
import s from "./index.module.scss";
import { useRouter } from "next/router";
import { useStakeGetQuery } from "@/src/hooks/query";
import { useMemo } from "react";

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useStakeGetQuery();

  const sortedData = useMemo(() => {
    if (data?.data.length > 0) {
      return data?.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return [];
  }, [data]);

  return (
    <div className={s.root}>
      <h1>My Stake</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <button
        className={s.root__button}
        onClick={() => router.push("/createStake")}
      >
        <Plus />
        Create Stake
      </button>

      <div className={s.root__cards}>
        {isLoading ? (
          <div>Loading...</div>
        ) : sortedData.length > 0 ? (
          sortedData.map((item) => (
            <Card
              key={item._id}
              status={item.status}
              body={
                <>
                  <div className={s.cardBody}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <User />
                        <span>{item.total_stakers}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <span>{item.interest_rate}</span>
                        <Percent />
                      </div>
                    </div>
                  </div>
                </>
              }
              actionBar={
                <>
                  <button
                    className={s.cardActionBtn}
                    onClick={() => {
                      router.push(`/stake/${item._id}`);
                    }}
                  >
                    Detail
                  </button>
                </>
              }
            />
          ))
        ) : (
          <div>No stakes found</div>
        )}
      </div>
    </div>
  );
}