import React, { useContext, useEffect } from "react";
import s from "./index.module.scss";
import { IdoContext } from "@/src/context/IdoContext";
import clsx from "clsx";
import { useRouter } from "next/router";
import { Button } from "@/src/Components/App/Button";

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
        <Button
          classes={s.root__btn}
          onClick={connectWallet}
          text={"Connect Metamask"}
        />
      )}
      {appStatus === "Loading" && (
        <div className={s.root__text}>Loading...</div>
      )}
      {appStatus === "Error" && (
        <div className={s.root__error}>
          <div className={s.root__text}>Something went wrong</div>
          <Button
            classes={clsx(s.root__btn, s.root__btn_error)}
            onClick={() => window.location.reload()}
            text={"Refresh"}
          />
        </div>
      )}
    </div>
  );
}
s;
