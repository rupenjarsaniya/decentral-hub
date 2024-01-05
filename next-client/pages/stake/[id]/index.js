import { useRouter } from "next/router";
import React, { useContext, useMemo, useState } from "react";
import { IdoContext } from "@/src/context/IdoContext";
import s from "./index.module.scss";
import clsx from "clsx";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { Copy, Flag, User } from "@phosphor-icons/react";
import { Card } from "@/src/Components/App/Card";
import moment from "moment";
import {
  useStakeGetQuery,
  useStakeUpdateQuery,
  useStakingCreateQuery,
  useStakingGetQuery,
  useStakingUpdateQuery,
} from "@/src/hooks/query";
import { handleCopy } from "@/src/utils/client/handleCopy";
import { formateAddress } from "@/src/utils/client/formate";
import Web3 from "web3";
import * as Yup from "yup";
import { Button } from "@/src/Components/App/Button";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  amount: Yup.number()
    .min(1, "Token amount should be greater than 0")
    .required("Token amount is required"),
});

export default function Page() {
  const {
    query: { id },
  } = useRouter();
  const { walletAddress, getStakingContract, getERC20TokenContract } =
    useContext(IdoContext);
  const { data, isLoading: isDataLoading, refetch } = useStakeGetQuery(id);
  const { mutateAsync: createStaking } = useStakingCreateQuery();
  const {
    data: stakingData,
    isLoading: stakingLoading,
    refetch: stakingRefech,
  } = useStakingGetQuery();
  const { mutateAsync: stakingMutateAsync } = useStakingUpdateQuery();
  const { mutateAsync: stakeMutateAsync } = useStakeUpdateQuery(id);

  const [isLoading, setIsLoading] = useState(false);

  const participate = async (amount, resetForm) => {
    try {
      setIsLoading(true);
      const erc20Contract = getERC20TokenContract(stakeData.token_address);
      const contract = getStakingContract(stakeData.stake_address);
      const approveReceipt = await erc20Contract.methods
        .approve(stakeData.stake_address, Web3.utils.toWei(amount, "ether"))
        .send({ from: walletAddress });

      console.log("Approved", approveReceipt);

      const receipt = await contract.methods
        .stakeToken(Web3.utils.toWei(amount, "ether"))
        .send({
          from: walletAddress,
        });

      console.log("Tranasction Receipt", receipt);

      const res = await createStaking({
        stake: stakeData._id,
        started: true,
        start_time: moment().unix(),
        end_time: moment().unix(),
        amount: Web3.utils.toWei(amount, "ether"),
        claimed: 0,
      });

      toast.success(res.message);
      resetForm();
      stakingRefech();
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (values, stakeId, id, resetForm) => {
    try {
      setIsLoading(true);

      const contract = getStakingContract(stakeData.stake_address);

      const gas = await contract.methods
        .claimReward(Web3.utils.toWei(values.amount, "ether"), stakeId)
        .estimateGas({ from: walletAddress });

      const receipt = await contract.methods
        .claimReward(Web3.utils.toWei(values.amount, "ether"), stakeId)
        .send({ from: walletAddress, gas });

      console.log("Tranasction Receipt", receipt);

      const res = await stakingMutateAsync({
        data: {
          claimed:
            stakingData?.data[stakeId].claimed +
            Number(Web3.utils.toWei(values.amount, "ether")),
        },
        id,
      });

      toast.success(res.message);
      resetForm();
      stakingRefech();
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const endStaking = async () => {
    try {
      setIsLoading(true);

      const contract = getStakingContract(stakeData.stake_address);
      const receipt = await contract.methods
        .endStaking()
        .send({ from: walletAddress });

      console.log("Tranasction Receipt", receipt);

      await stakeMutateAsync({
        status: "Ended",
      });

      toast.success("Staking ended successfully");
      refetch();
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseStaking = async () => {
    try {
      setIsLoading(true);

      const contract = getStakingContract(stakeData.stake_address);
      const receipt = await contract.methods
        .pause()
        .send({ from: walletAddress });

      console.log("Tranasction Receipt", receipt);

      await stakeMutateAsync({
        status: "Paused",
      });

      toast.success("Staking paused successfully");
      refetch();
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const unpauseStaking = async () => {
    try {
      setIsLoading(true);

      const contract = getStakingContract(stakeData.stake_address);
      const receipt = await contract.methods
        .unpause()
        .send({ from: walletAddress });

      console.log("Tranasction Receipt", receipt);

      await stakeMutateAsync({
        status: "Started",
      });

      toast.success("Staking resumed successfully");
      refetch();
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const stakeData = useMemo(() => data?.data, [data]);

  if (isDataLoading) return null;

  return (
    <div className={s.root}>
      <h1>Stake Token Name</h1>
      <div className={s.root__body}>
        <div className={s.root__body_left}>
          <div className={s.root__body_left_header}>
            <div className={s.root__body_left_header_image}></div>
            <div
              className={clsx(s.root__body_left_header_status, {
                [s.root__body_left_header_status_green]:
                  stakeData.status !== "Started",
                [s.root__body_left_header_status_red]:
                  stakeData.status === "Ended",
                [s.root__body_left_header_status_orange]:
                  stakeData.status === "Paused",
              })}
            >
              • {stakeData.status}
            </div>
          </div>
          <div className={s.root__body_left_info}>
            <h3>Staking Detail</h3>
            <div className={s.grid}>
              <div className={s.grid__item}>
                <div>Stake Owner</div>
                <div className={s.grid__item_address}>{stakeData.owner}</div>
              </div>
              <div className={s.grid__item}>
                <div>Token Address</div>
                <div className={s.grid__item_address}>
                  {formateAddress(stakeData.token_address)}
                  <div
                    className={s.grid__item_iconButton}
                    onClick={() => {
                      handleCopy(idoData.ido_token);
                      toast.success("Copied to clipboard");
                    }}
                    role="button"
                  >
                    <Copy />
                  </div>
                </div>
              </div>
              <div className={s.grid__item}>
                <div>Plan Duration</div>
                <div>{moment(stakeData.duration).minutes()} Minutes</div>
              </div>
              <div className={s.grid__item}>
                <div>Interest Rate %</div>
                <div>{stakeData.interest_rate} %</div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.root__body_right}>
          {stakeData.owner_address !== walletAddress &&
            stakeData.status === "Started" && (
              <Formik
                initialValues={{
                  amount: "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  await participate(values.amount, resetForm);
                  resetForm();
                }}
              >
                {({ isValid, dirty, isSubmitting }) => (
                  <Form className={s.root__form}>
                    <div className={s.root__form_inputWrapper}>
                      <Field
                        id="amount"
                        name="amount"
                        type="text"
                        className={s.root__form_input}
                        placeholder="0"
                      />
                      <div className={s.root__form_error}>
                        <ErrorMessage name="amount" />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      text="Stake Token"
                      classes={s.root__body_right_btn}
                      disabled={!isValid || !dirty}
                      isLoading={isSubmitting}
                    />
                  </Form>
                )}
              </Formik>
            )}

          {stakeData.owner_address === walletAddress &&
            stakeData.status !== "Ended" && (
              <Button
                text="End Staking"
                classes={s.root__body_right_btn}
                onClick={endStaking}
                isLoading={isLoading}
              />
            )}

          {stakeData.owner_address === walletAddress &&
            stakeData.status === "Started" && (
              <Button
                text="Pause"
                classes={s.root__body_right_btn}
                onClick={pauseStaking}
                isLoading={isLoading}
              />
            )}

          {stakeData.owner_address === walletAddress &&
            stakeData.status === "Paused" && (
              <Button
                text="Resume"
                classes={s.root__body_right_btn}
                onClick={unpauseStaking}
                isLoading={isLoading}
              />
            )}

          <h2>Live Staking Information</h2>
          <div className={s.root__body_right_liveinfo}>
            <div className={s.root__body_right_liveinfo_wrap}>
              <span>Total Stakers</span>
              <span className={s.root__body_right_liveinfo_wrap_inner}>
                <User />
                {stakeData.total_stakers}
              </span>
            </div>
            <div className={s.root__body_right_liveinfo_wrap}>
              <span>Staked Token</span>
              <span>
                {Web3.utils.fromWei(stakeData.staked_token, "ether")} Tokens
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.root__cards}>
        {stakingLoading ? (
          <div>Loading...</div>
        ) : (
          stakingData?.data.length > 0 &&
          stakingData?.data.map((item, index) => {
            return (
              <Card
                key={item._id}
                title={index + 1}
                status={
                  item.claimed === item.amount ? "Claimed" : "Not Claimed"
                }
                body={
                  <div className={s.cardBody}>
                    <div className={s.cardBody__wrapper}>
                      <span>Start Time</span>
                      <span>{item.start_time}</span>
                    </div>
                    <div className={s.cardBody__wrapper}>
                      <span>End Time</span>
                      <span>{item.end_time}</span>
                    </div>
                    <div className={s.cardBody__wrapper}>
                      <span>Staked Amount</span>
                      <span>{Web3.utils.fromWei(item.amount, "ether")}</span>
                    </div>
                    <div className={s.cardBody__wrapper}>
                      <span>Claimed</span>
                      <span>{Web3.utils.fromWei(item.claimed, "ether")}</span>
                    </div>
                  </div>
                }
                actionBar={
                  <>
                    {item.claimed !== item.amount ? (
                      <Formik
                        initialValues={{
                          amount: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { resetForm }) => {
                          await claimReward(values, index, item._id, resetForm);
                          resetForm();
                        }}
                      >
                        {({ isValid, dirty, isSubmitting }) => (
                          <Form className={s.root__form}>
                            <div className={s.root__form_inputWrapper}>
                              <Field
                                id="amount"
                                name="amount"
                                type="text"
                                className={s.root__form_input}
                                placeholder="0"
                              />
                              <div className={s.root__form_error}>
                                <ErrorMessage name="amount" />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              text="Claim Reward"
                              classes={s.root__body_right_btn}
                              disabled={!isValid || !dirty}
                              isLoading={isSubmitting}
                            />
                          </Form>
                        )}
                      </Formik>
                    ) : null}
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
