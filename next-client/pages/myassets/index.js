"use client";

import s from "./index.module.scss";
import { useToken721GetQuery, useTokenGetQuery } from "@/src/hooks/query";
import { Card } from "@/src/Components/App/Card";
import { Copy } from "@phosphor-icons/react";
import { handleCopy } from "@/src/utils/client/handleCopy";
import { useMemo, useState } from "react";
import Web3 from "web3";
import { toBigInt } from "@/src/utils/client/formate";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useTokenGetQuery();
  const { data: token721Data, isLoading: token721Loading } =
    useToken721GetQuery();
  const [expandedMarketIds, setExpandedMarketIds] = useState({});

  const sortedData = useMemo(() => {
    if (data?.data.length > 0) {
      return data?.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return [];
  }, [data]);

  const sortedToken721Data = useMemo(() => {
    if (token721Data?.data.length > 0) {
      return token721Data?.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return [];
  }, [token721Data]);

  const handleExpand = (id) => {
    setExpandedMarketIds((prev) => {
      return {
        ...prev,
        [id]: !prev[id],
      };
    });
  };

  return (
    <div className={s.root}>
      <h1>My Assets</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>
      <div className={s.root__buttonWrapper}>
        <button
          className={s.root__button}
          onClick={() => router.push("/myidos")}
        >
          My IDOs
        </button>
        <button
          className={s.root__button}
          onClick={() => router.push("/mystakes")}
        >
          My Stakes{" "}
        </button>
      </div>
      <h2>ERC20 Tokens</h2>
      <div className={s.root__cards}>
        {isLoading ? (
          <div>Loading...</div>
        ) : sortedData.length > 0 ? (
          sortedData.map((item) => (
            <Card
              key={item._id}
              title={item.token_name}
              body={
                <div className={s.cardBody}>
                  <div className={s.cardBody__address}>
                    {item.token_address}
                    <div
                      className={s.cardBody__address_iconButton}
                      onClick={() => {
                        handleCopy(item.token_address);
                        // notify(
                        //   "Copied to clipboard",
                        //   "success",
                        //   1000,
                        //   "contained"
                        // );
                      }}
                      role="button"
                    >
                      <Copy />
                    </div>
                  </div>
                  <div
                    role="button"
                    onClick={() => handleExpand(item._id)}
                    className={s.cardBody__show}
                  >
                    {expandedMarketIds[item._id]
                      ? "Hide detail"
                      : "Show detail"}
                  </div>
                  <div
                    className={s.cardBody__detail}
                    style={{
                      display: expandedMarketIds[item._id] ? "flex" : "none",
                    }}
                  >
                    <div className={s.cardBody__detail_inner}>
                      <span>Symbol</span>
                      <span>{item.token_symbol}</span>
                    </div>
                    <div className={s.cardBody__detail_inner}>
                      <span>Decimal</span>
                      <span>{item.token_decimal}</span>
                    </div>
                    <div className={s.cardBody__detail_inner}>
                      <span>Max Supply</span>
                      <span>
                        {Web3.utils.fromWei(
                          toBigInt(item.token_max_supply),
                          "ether"
                        )}
                      </span>
                    </div>
                    <div className={s.cardBody__detail_inner}>
                      <span>Initial Supply</span>
                      <span>
                        {Web3.utils.fromWei(
                          toBigInt(item.token_initial_supply),
                          "ether"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              }
            />
          ))
        ) : (
          <div>No assets found</div>
        )}
      </div>
      <div className={s.underline} />
      <h2>My NFTs</h2>
      <div className={s.root__cards}>
        {token721Loading ? (
          <div>Loading...</div>
        ) : sortedToken721Data.length > 0 ? (
          sortedToken721Data.map((item) => (
            <Card
              key={item._id}
              title={item.name}
              body={
                <div className={s.cardBody}>
                  <div
                    className={s.cardBody__detail}
                    style={{
                      display: "flex",
                    }}
                  >
                    <div className={s.cardBody__detail_image}>
                      <img src={item.uri} alt={item.uri} />
                    </div>
                    <Link
                      className={s.cardBody__show}
                      target="_rupen"
                      href={`https://testnets.opensea.io/assets/mumbai/0x4c233fccc29584367ce8bcb3954ecfc7e9577fac/${item.token_id}`}
                    >
                      View on opensea
                    </Link>
                  </div>
                </div>
              }
            />
          ))
        ) : (
          <div>No NFT found</div>
        )}
      </div>
    </div>
  );
}
