import { useRouter } from "next/router";
import { useAllIdoGetQuery } from "@/src/hooks/query";
import { Card } from "@/src/Components/App/Card";
import s from "./index.module.scss";
import { useMemo } from "react";
import { progress, toBigInt } from "@/src/utils/client/formate";
import { CountDown } from "@/src/Components/App/CountDown";
import moment from "moment";
import web3 from "web3";
import { Button } from "@/src/Components/App/Button";

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useAllIdoGetQuery();

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
      <h1>Dashboard</h1>
      <div className={s.underline} />

      <h2>All IDOs</h2>
      <div className={s.root__cards}>
        {isLoading ? (
          <div>Loading...</div>
        ) : sortedData?.length > 0 ? (
          sortedData.map((item) => (
            <Card
              key={item._id}
              title="IDO"
              status={item.status}
              body={
                <div className={s.cardBody}>
                  <div className={s.cardBody__progress}>
                    Progress{" "}
                    {100 -
                      progress(
                        item.ido_tokens_left,
                        (item.token_total_supply * item.token_per) / 100
                      )}
                    %
                  </div>
                  <div className={s.cardBody__progressLine}>
                    <div
                      className={s.cardBody__progressLine_before}
                      style={{
                        width:
                          100 -
                          progress(
                            item.ido_tokens_left,
                            (item.token_total_supply * item.token_per) / 100
                          ) +
                          "%",
                      }}
                    />
                  </div>
                  <div className={s.cardBody__available}>
                    <span>
                      {item.ido_tokens_left == 0
                        ? 0
                        : web3.utils.fromWei(
                          toBigInt(item.ido_tokens_left),
                          "ether"
                        )}{" "}
                      SH
                    </span>
                    <span>
                      {web3.utils.fromWei(
                        toBigInt(
                          (item.token_total_supply * item.token_per) / 100
                        ),
                        "ether"
                      )}{" "}
                      SH
                    </span>
                  </div>
                </div>
              }
              actionBar={
                <>
                  <div className={s.timer}>
                    Starts in:
                    {item.status === "Cancelled" ? (
                      <div>00:00:00:00</div>
                    ) : (
                      <CountDown
                        textAfterTimer={"Live"}
                        durationTime={moment(item.start_time)}
                      />
                    )}
                  </div>
                  <Button onClick={() => router.push(`/myidos/${item._id}`)} text={"View"} />
                </>
              }
            />
          ))
        ) : (
          <div>No IDO Found</div>
        )}
      </div>
    </div>
  );
}
