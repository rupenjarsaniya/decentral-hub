"use client";

import { useRouter } from "next/router";
import { useMemeTokenGetQuery } from "@/src/hooks/query";
import { Card } from "@/src/Components/App/Card";
import s from "./index.module.scss";

function customTruncate(number, decimals) {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(number * multiplier) / multiplier;
}

export default function Page() {
  const { data, isLoading } = useMemeTokenGetQuery();
  const router = useRouter();
  console.log(data);
  return (
    <div className={s.root}>
      <h1>Meme Tokens</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <div className={s.root__cards}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          data?.data.map((item) => {
            return (
              <Card
                key={item._id}
                title={item.name}
                status={item.is_active ? "Active" : "Inactive"}
                body={
                  <div className={s.cardBody}>
                    <div className={s.cardBody__progress}>
                      Progress (
                      {(
                        100 -
                        customTruncate(
                          (item.available_tokens / item.total_supply) * 100 ??
                            0,
                          2
                        )
                      ).toFixed(2)}
                      &nbsp;%)
                    </div>
                    <div className={s.cardBody__progressLine}>
                      <div
                        className={s.cardBody__progressLine_before}
                        style={{
                          width: (
                            100 -
                            customTruncate(
                              (item.available_tokens / item.total_supply) *
                                100 ?? 0,
                              2
                            )
                          ).toFixed(2),
                        }}
                      />
                    </div>
                    <div className={s.cardBody__available}>
                      <span>
                        {item.available_tokens} {item.symbol}
                      </span>
                      <span>
                        {item.total_supply} {item.symbol}
                      </span>
                    </div>
                    <div className={s.cardBody__detail}>
                      <div className={s.cardBody__detail_inner}>
                        <span>Symbol</span>
                        <span>{item.symbol}</span>
                      </div>
                      <div className={s.cardBody__detail_inner}>
                        <span>Price</span>
                        <span>{item.price} MATIC</span>
                      </div>
                      <div className={s.cardBody__detail_inner}>
                        <span>Decimal</span>
                        <span>{item.decimal}</span>
                      </div>
                    </div>
                  </div>
                }
                actionBar={
                  <>
                    <button
                      className={s.cardActionBtn}
                      disabled={!item.is_active}
                      onClick={() => {
                        router.push(`/memetokens/${item._id}`);
                      }}
                    >
                      Sell
                    </button>
                    <button
                      className={s.cardActionBtn}
                      disabled={!item.is_active}
                      onClick={() => {
                        router.push(`/memetokens/${item._id}`);
                      }}
                    >
                      Buy
                    </button>
                  </>
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
