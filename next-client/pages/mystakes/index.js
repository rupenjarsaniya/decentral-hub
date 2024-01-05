import { Percent, Plus, User } from "@phosphor-icons/react";
import { Card } from "@/src/Components/App/Card";
import s from "./index.module.scss";
import { useRouter } from "next/router";
import { useStakeGetQuery } from "@/src/hooks/query";
import { useMemo } from "react";
import { Button } from "@/src/Components/App/Button";

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
      <Button
        classes={s.root__button}
        onClick={() => router.push("/createStake")}
        text={
          <>
            <Plus />
            Create Stake
          </>
        }
      />

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
                <Button
                  onClick={() => router.push(`/stake/${item._id}`)}
                  text="Detail"
                />
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
