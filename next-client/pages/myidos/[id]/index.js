"use client";

import React, { useContext, useMemo } from "react";
import { useRouter } from "next/router";
import s from "./index.module.scss";
import clsx from "clsx";
import { Copy } from "@phosphor-icons/react";
import { handleCopy } from "@/src/utils/client/handleCopy";
import { useIdoGetQuery, useIdoUpdateQuery } from "@/src/hooks/query";
import moment from "moment";
import { formateAddress, progress, toBigInt } from "@/src/utils/client/formate";
import { IdoContext } from "@/src/context/IdoContext";
import web3 from "web3";
import { CountDown } from "@/src/Components/App/CountDown";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  tokenAmount: Yup.number()
    .min(1, "Meme token amount should be greater than 0")
    .required("Meme token amount is required"),
});

export default function Page() {
  const {
    query: { id },
  } = useRouter();
  const { data, isLoading, refetch } = useIdoGetQuery(id);
  const { mutateAsync: updateIdoAsync } = useIdoUpdateQuery(id);
  const {
    walletAddress,
    getIdoContract,
    getERC20TokenContract,
    getMemeTokenContract,
  } = useContext(IdoContext);

  const idoData = useMemo(() => data?.data, [data]);

  const startIdo = async () => {
    try {
      if (moment() < moment(idoData.start_time)) {
        return;
        //  notify(
        //   "IDO Start time is not ended yet",
        //   "error",
        //   1000,
        //   "contained"
        // );
      }

      const contract = getIdoContract(idoData.ido_address);
      const erc20Contract = getERC20TokenContract(idoData.ido_token);

      const approveReceipt = await erc20Contract.methods
        .approve(
          idoData.ido_address,
          web3.utils.toWei(
            toBigInt((idoData.token_total_supply * idoData.token_per) / 100),
            "ether"
          )
        )
        .send({ from: walletAddress });

      console.log("approveReceipt", approveReceipt);

      const gas = await contract.methods
        .startIDO()
        .estimateGas({ from: walletAddress });

      const receipt = await contract.methods
        .startIDO()
        .send({ from: walletAddress, gas });

      console.log("Transaction receipt", receipt);

      await updateIdoAsync({ status: "Started" });

      // notify("IDO Started", "success", 3000, "contained");
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const participate = async (amount) => {
    try {
      const contract = getIdoContract(idoData.ido_address);
      const memeTokenContract = getMemeTokenContract();

      const approveReceipt = await memeTokenContract.methods
        .approve(idoData.ido_address, web3.utils.toWei(amount, "ether"))
        .send({ from: walletAddress });

      console.log("approveReceipt", approveReceipt);

      const gas = await contract.methods
        .participate(web3.utils.toWei(amount, "ether"))
        .estimateGas({ from: walletAddress });

      const receipt = await contract.methods
        .participate(web3.utils.toWei(toBigInt(amount), "ether"))
        .send({ from: walletAddress, gas });

      console.log("Transaction receipt", receipt);

      await updateIdoAsync({
        ido_tokens_left:
          Number(idoData.ido_tokens_left) -
          Number(web3.utils.toWei(toBigInt(amount), "ether")),
      });

      // notify(
      //   "You have successfully participated in IDO",
      //   "success",
      //   3000,
      //   "contained"
      // );

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const cancelIdo = async () => {
    try {
      const contract = getIdoContract(idoData.ido_address);

      const gas = await contract.methods
        .cancelIDO()
        .estimateGas({ from: walletAddress });

      const receipt = await contract.methods
        .cancelIDO()
        .send({ from: walletAddress, gas });

      console.log("Transaction receipt", receipt);

      if (
        (idoData.token_total_supply * idoData.token_per) / 100 -
          idoData.ido_tokens_left ===
        0
      ) {
        await updateIdoAsync({ status: "Cancelled", is_withdrawable: false });
      } else {
        await updateIdoAsync({ status: "Cancelled", is_withdrawable: true });
      }

      // notify("IDO Started", "success", 3000, "contained");

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const endIDO = async () => {
    try {
      if (moment() < moment(idoData.end_time)) {
        return;
        // notify(
        //   "IDO End time is not ended yet",
        //   "error",
        //   1000,
        //   "contained"
        // );
      }

      const contract = getIdoContract(idoData.ido_address);

      const gas = await contract.methods
        .endIDO()
        .estimateGas({ from: walletAddress });

      await contract.methods.endIDO().send({ from: walletAddress, gas });

      await updateIdoAsync({ status: "Ended" });

      // notify("IDO Ended", "success", 3000, "contained");

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const cliamableIDO = async () => {
    try {
      if (moment() < moment(idoData.claimable_time)) {
        return;
        // notify(
        //   "IDO Claimable time is not ended yet",
        //   "error",
        //   1000,
        //   "contained"
        // );
      }

      const contract = getIdoContract(idoData.ido_address);

      if (idoData.ido_tokens_left !== 0) {
        cancelIdo();
      } else {
        const gas = await contract.methods
          .cliamableIDO()
          .estimateGas({ from: walletAddress });

        await contract.methods
          .cliamableIDO()
          .send({ from: walletAddress, gas });

        await updateIdoAsync({ status: "Claimable" });

        // notify("IDO Claimable", "success", 3000, "contained");

        refetch();
      }
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const claimIdoTokens = async () => {
    try {
      const contract = getIdoContract(idoData.ido_address);

      const gas = await contract.methods.claimIDOToken().estimateGas({
        from: walletAddress,
      });

      const receipt = await contract.methods.claimIDOToken().send({
        from: walletAddress,
        gas,
      });

      console.log("Transaction receipt", receipt);

      // notify("IDO Tokens Claimed", "success", 3000, "contained");

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const withdraw = async () => {
    try {
      const contract = getIdoContract(idoData.ido_address);

      const gas = await contract.methods.withdraw().estimateGas({
        from: walletAddress,
      });

      const receipt = await contract.methods.withdraw().send({
        from: walletAddress,
        gas,
      });

      console.log("Transaction receipt", receipt);

      // notify("Meme Tokens Claimed", "success", 3000, "contained");

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  const approveWithdraw = async () => {
    try {
      const memeTokenContract = getMemeTokenContract();

      const gas = await memeTokenContract.methods
        .approve(
          idoData.ido_address,
          (idoData.token_total_supply * idoData.token_per) / 100 -
            idoData.ido_tokens_left
        )
        .estimateGas({ from: walletAddress });

      const approveReceipt = await memeTokenContract.methods
        .approve(
          idoData.ido_address,
          (idoData.token_total_supply * idoData.token_per) / 100 -
            idoData.ido_tokens_left
        )
        .send({ from: walletAddress, gas });

      console.log("approveReceipt", approveReceipt);

      // notify("Withdraw Approved", "success", 3000, "contained");

      refetch();
    } catch (error) {
      console.log(error);
      // notify("Something went wrong", "error", 3000, "contained");
    }
  };

  if (isLoading) return null;

  return (
    <div className={s.root}>
      <h1>ERC20</h1>
      <div className={s.root__body}>
        <div className={s.root__body_left}>
          <div className={s.root__body_left_header}>
            <div className={s.root__body_left_header_image}></div>
            <div
              className={clsx(s.root__body_left_header_status, {
                [s.root__body_left_header_status_green]:
                  idoData.status !== "Not Started",
                [s.root__body_left_header_status_red]:
                  idoData.status === "Cancelled",
              })}
            >
              • {idoData.status}
            </div>
          </div>
          <div className={s.root__body_left_info}>
            <h3>IDO Detail</h3>
            <div className={s.grid}>
              <div className={s.grid__item}>
                <div>IDO Owner</div>
                <div className={s.grid__item_address}>{idoData.owner}</div>
              </div>
              <div className={s.grid__item}>
                <div>Token Total Supply</div>
                <div>
                  {web3.utils.fromWei(
                    toBigInt(idoData.token_total_supply),
                    "ether"
                  )}
                </div>
              </div>
              <div className={s.grid__item}>
                <div>IDO Token Percentage</div>
                <div>{idoData.token_per}%</div>
              </div>
              <div className={s.grid__item}>
                <div>Minimum Meme Tokens</div>
                <div>{idoData.min_meme_tokens}</div>
              </div>
              <div className={s.grid__item}>
                <div>Minimum Meme Tokens To Participate</div>
                <div>{idoData.min_meme_token_to_participate}</div>
              </div>
              <div className={s.grid__item}>
                <div>IDO Token</div>
                <div className={s.grid__item_address}>
                  {formateAddress(idoData.ido_token)}
                  <div
                    className={s.grid__item_iconButton}
                    onClick={() => {
                      handleCopy(idoData.ido_token);
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
              </div>
              <div className={s.grid__item}>
                <div>Meme Token</div>
                <div className={s.grid__item_address}>
                  {formateAddress(idoData.meme_token)}
                  <div
                    className={s.grid__item_iconButton}
                    onClick={() => {
                      handleCopy(idoData.meme_token);
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
              </div>
              <div className={s.grid__item}>
                <div>Start Time</div>
                <div>
                  {moment(idoData.start_time).format("Do MMM YYYY, h:mm:ss A")}
                </div>
              </div>
              <div className={s.grid__item}>
                <div>Before Allocation Time</div>
                <div>
                  {moment(idoData.before_allocation_time).format(
                    "Do MMM YYYY, h:mm:ss A"
                  )}
                </div>
              </div>
              <div className={s.grid__item}>
                <div>End Time</div>
                <div>
                  {moment(idoData.end_time).format("Do MMM YYYY, h:mm:ss A")}
                </div>
              </div>
              <div className={s.grid__item}>
                <div>Claimable Time</div>
                <div>
                  {moment(idoData.claimable_time).format(
                    "Do MMM YYYY, h:mm:ss A"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.root__body_right}>
          {idoData.status === "Cancelled" && !idoData.is_withdrawable && (
            <div
              className={clsx(
                s.root__body_right_status,
                s.root__body_right_status_red
              )}
            >
              IDO has been cancelled by the owner or IDO not successful
            </div>
          )}

          {idoData.status === "Cancelled" &&
            idoData.is_withdrawable &&
            (walletAddress !== idoData.owner_address ? (
              <>
                <div
                  className={clsx(
                    s.root__body_right_status,
                    s.root__body_right_status_orange
                  )}
                >
                  IDO has been cancelled by the owner or IDO not successful, You
                  can withdraw your meme tokens from here!
                </div>
                <button
                  className={s.root__body_right_btn}
                  onClick={() => withdraw()}
                >
                  Withdraw MemeTokens
                </button>
              </>
            ) : (
              <button
                className={s.root__body_right_btn}
                onClick={() => approveWithdraw()}
              >
                Approve Withdraw
              </button>
            ))}

          {idoData.status !== "Cancelled" &&
            idoData.status !== "Claimable" &&
            walletAddress === idoData.owner_address && (
              <button
                className={s.root__body_right_btn}
                onClick={() => cancelIdo()}
              >
                Cancel IDO
              </button>
            )}

          {idoData.status === "Started" &&
            walletAddress === idoData.owner_address && (
              <button
                className={s.root__body_right_btn}
                onClick={() => endIDO()}
              >
                End IDO
              </button>
            )}

          {idoData.status === "Ended" &&
            walletAddress === idoData.owner_address && (
              <button
                className={s.root__body_right_btn}
                onClick={() => cliamableIDO()}
              >
                Claimable
              </button>
            )}

          {idoData.status === "Not Started" &&
            walletAddress === idoData.owner_address && (
              <button
                className={s.root__body_right_btn}
                onClick={() => startIdo()}
              >
                Start IDO
              </button>
            )}

          {idoData.status === "Claimable" &&
            walletAddress !== idoData.owner_address && (
              <button
                className={s.root__body_right_btn}
                onClick={() => claimIdoTokens()}
              >
                Claim IDO Tokens
              </button>
            )}

          {idoData.status === "Started" &&
            walletAddress !== idoData.owner_address && (
              <Formik
                initialValues={{
                  tokenAmount: "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  await participate(values.tokenAmount);
                  resetForm();
                }}
              >
                {({ isValid, dirty }) => (
                  <Form className={s.root__form}>
                    <div className={s.root__form_inputWrapper}>
                      <Field
                        id="tokenAmount"
                        name="tokenAmount"
                        type="text"
                        className={s.root__form_input}
                        placeholder="0"
                      />
                      <div className={s.root__form_error}>
                        <ErrorMessage name="tokenAmount" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={s.root__body_right_btn}
                      disabled={!isValid || !dirty}
                    >
                      Participate
                    </button>
                  </Form>
                )}
              </Formik>
            )}

          <h2>Live IDO Information</h2>
          <div className={s.root__body_right_liveinfo}>
            <h3 className={s.root__body_right_liveinfo_title}>
              ERC20{" "}
              {100 -
                progress(
                  idoData.ido_tokens_left,
                  (idoData.token_total_supply * idoData.token_per) / 100
                )}
              % Sold
            </h3>
            <div className={s.root__body_right_liveinfo_progressLine}>
              <div
                className={s.root__body_right_liveinfo_progressLine_before}
                style={{
                  width:
                    100 -
                    progress(
                      idoData.ido_tokens_left,
                      (idoData.token_total_supply * idoData.token_per) / 100
                    ) +
                    "%",
                }}
              />
            </div>
            <div className={s.root__body_right_liveinfo_wrap}>
              <span>Token raise:</span>
              <span>
                {web3.utils.fromWei(
                  toBigInt(
                    (idoData.token_total_supply * idoData.token_per) / 100
                  ),
                  "ether"
                )}{" "}
                Token
              </span>
            </div>
            <div className={s.root__body_right_liveinfo_wrap}>
              <span>Token left:</span>
              <span>
                {idoData.ido_tokens_left == 0
                  ? 0
                  : web3.utils.fromWei(
                      toBigInt(idoData.ido_tokens_left),
                      "ether"
                    )}{" "}
                Token
              </span>
            </div>
          </div>

          <div className={s.root__body_right_liveinfo}>
            <div className={s.root__body_right_liveinfo_timer}>
              <div>Start In</div>
              {idoData.status === "Cancelled" ? (
                "00:00:00:00"
              ) : (
                <CountDown
                  durationTime={moment(idoData.start_time)}
                  textAfterTimer={"00:00:00:00"}
                />
              )}
            </div>
            <div className={s.root__body_right_liveinfo_timer}>
              <div>Before Allocation In</div>
              {idoData.status === "Cancelled" ? (
                "00:00:00:00"
              ) : (
                <CountDown
                  durationTime={moment(idoData.before_allocation_time)}
                  textAfterTimer={"00:00:00:00"}
                />
              )}
            </div>
            <div className={s.root__body_right_liveinfo_timer}>
              <div>End In</div>
              {idoData.status === "Cancelled" ? (
                "00:00:00:00"
              ) : (
                <CountDown
                  durationTime={moment(idoData.end_time)}
                  textAfterTimer={"00:00:00:00"}
                />
              )}
            </div>
            <div className={s.root__body_right_liveinfo_timer}>
              <div>Claim In</div>
              {idoData.status === "Cancelled" ? (
                "00:00:00:00"
              ) : (
                <CountDown
                  durationTime={moment(idoData.claimable_time)}
                  textAfterTimer={"00:00:00:00"}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Start IDO - owner
 * Cancel IDO - owner -> Withdraw - user
 * End IDO - owner, if(ido not fullfilled) -> Cancel IDO -> Withdraw - user
 */
