import React, { useContext, useEffect } from "react";
import s from "./index.module.scss";
import { IdoContext } from "@/src/context/IdoContext";
import clsx from "clsx";
import { useRouter } from "next/router";

export default function Login() {
  const { connectWallet, appStatus } = useContext(IdoContext);
  const router = useRouter();

  useEffect(() => {
    if (appStatus === "Connected") {
      router.replace("/dashboard");
    }
  }, [appStatus, router]);

  return (
    <div className={s.root}>
      {appStatus === "Not Connected" && (
        <button className={s.root__btn} onClick={() => connectWallet()}>
          Connect Metamask
        </button>
      )}
      {appStatus === "Loading" && (
        <div className={s.root__text}>Loading...</div>
      )}
      {appStatus === "Error" && (
        <div className={s.root__error}>
          <div className={s.root__text}>Something went wrong</div>
          <button
            className={clsx(s.root__btn, s.root__btn_error)}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
s;
