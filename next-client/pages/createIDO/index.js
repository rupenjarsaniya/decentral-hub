"use client";

import clsx from "clsx";
import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext } from "react";
import { IdoContext } from "@/src/context/IdoContext";
import { useIdoCreateQuery } from "@/src/hooks/query";
import moment from "moment";
import web3 from "web3";
import * as Yup from "yup";

const validationSchema = Yup.object({
  idoToken: Yup.string().required("IDO token adress is required"),
  memeToken: Yup.string().required("Meme token adress is required"),
  idoTokenPercent: Yup.number()
    .min(1, "IDO token percent must be greater than 0")
    .required("IDO token percent is required"),
  minimumMemeTokens: Yup.number()
    .min(1, "Minimum meme tokens must be greater than 0")
    .required("Minimum meme tokens is required"),
  minMemeTokenToParticipate: Yup.number()
    .min(1, "Minimum meme tokens must be greater than 0")
    .required("Minimum meme tokens is required"),
  idoStartTime: Yup.date()
    .min(
      moment(new Date()).format("YYYY-MM-DDTHH:mm"),
      "IDO start time must be greater than current time"
    )
    .required("IDO start time is required"),
  idoBFATime: Yup.date()
    .min(
      Yup.ref("idoStartTime"),
      "IDO before allocate time must be greater than IDO start time"
    )
    .required("IDO before allocate time is required"),
  idoEndTime: Yup.date()
    .min(
      Yup.ref("idoBFATime"),
      "IDO end time must be greater than IDO before allocate time"
    )
    .required("IDO end time is required"),
  idoClaimableTime: Yup.date()
    .min(
      Yup.ref("idoEndTime"),
      "IDO claimable time must be greater than IDO end time"
    )
    .required("IDO claimable time is required"),
});

export default function Page() {
  const { getIDOFactoryContract, walletAddress, getERC20TokenContract } =
    useContext(IdoContext);
  const { mutateAsync: createIdoMutate } = useIdoCreateQuery();

  const onSubmit = async (values, resetForm) => {
    const contract = getIDOFactoryContract();

    try {
      const erc20Contract = getERC20TokenContract(values.idoToken);

      const tokenTotalSupply = await erc20Contract.methods
        .totalSupply()
        .call({ from: walletAddress });

      const gas = await contract.methods
        .createIDO(
          walletAddress,
          tokenTotalSupply,
          values.idoTokenPercent,
          values.minimumMemeTokens,
          values.minMemeTokenToParticipate,
          values.idoToken,
          values.memeToken,
          moment(values.idoStartTime).unix(),
          moment(values.idoBFATime).unix(),
          moment(values.idoEndTime).unix(),
          moment(values.idoClaimableTime).unix()
        )
        .estimateGas({
          from: walletAddress,
        });

      const receipt = await contract.methods
        .createIDO(
          walletAddress,
          web3.utils.fromWei(tokenTotalSupply, "ether"),
          values.idoTokenPercent,
          values.minimumMemeTokens,
          values.minMemeTokenToParticipate,
          values.idoToken,
          values.memeToken,
          moment(values.idoStartTime).unix(),
          moment(values.idoBFATime).unix(),
          moment(values.idoEndTime).unix(),
          moment(values.idoClaimableTime).unix()
        )
        .send({
          from: walletAddress,
          gas,
        });

      console.log("transaction receipt:", receipt);

      const res = await createIdoMutate({
        token_total_supply: web3.utils.fromWei(tokenTotalSupply, "ether"),
        token_per: values.idoTokenPercent,
        min_meme_tokens: values.minimumMemeTokens,
        min_meme_token_to_participate: values.minMemeTokenToParticipate,
        ido_token: values.idoToken,
        meme_token: values.memeToken,
        start_time: values.idoStartTime,
        end_time: values.idoEndTime,
        claimable_time: values.idoClaimableTime,
        before_allocation_time: values.idoBFATime,
        status: "Not Started",
        completion_percentage: 0,
        ido_tokens_left:
          (web3.utils.fromWei(tokenTotalSupply, "ether") *
            values.idoTokenPercent) /
          100,
        ido_address: receipt.events.NewIDOCreated.returnValues.idoAddress,
        is_withdrawable: false,
      });

      // notify(res.message, "success", 3000, "contained");

      resetForm();
    } catch (error) {
      // notify(
      //   "Something went wrong, try after few seconds",
      //   "error",
      //   3000,
      //   "contained"
      // );
      console.log(error);
    }
  };

  return (
    <div className={s.root}>
      <h1>Create IDO</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <Formik
        initialValues={{
          idoToken: "",
          memeToken: "0xF847aDaa604e01F04d7697845B228e6E080707b5",
          idoTokenPercent: 10,
          minimumMemeTokens: 10,
          minMemeTokenToParticipate: 5,
          idoStartTime: moment(new Date())
            .add(1, "minutes")
            .format("YYYY-MM-DDTHH:mm"),
          idoBFATime: moment(new Date())
            .add(3, "minutes")
            .format("YYYY-MM-DDTHH:mm"),
          idoEndTime: moment(new Date())
            .add(3, "minutes")
            .format("YYYY-MM-DDTHH:mm"),
          idoClaimableTime: moment(new Date())
            .add(4, "minutes")
            .format("YYYY-MM-DDTHH:mm"),
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values, resetForm);
        }}
      >
        {({ isValid, dirty }) => (
          <Form className={s.root__form}>
            <label htmlFor="idoToken" className={s.root__form_label}>
              IDO Token Address
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoToken"
                name="idoToken"
                type="text"
                className={s.root__form_input}
                placeholder="Standard"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoToken" />
              </div>
            </div>
            <label htmlFor="memeToken" className={s.root__form_label}>
              Meme Token Address
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="memeToken"
                name="memeToken"
                type="text"
                className={s.root__form_input}
                placeholder="STD"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="memeToken" />
              </div>
            </div>
            <label htmlFor="idoTokenPercent" className={s.root__form_label}>
              IDO Token Percent
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoTokenPercent"
                name="idoTokenPercent"
                type="number"
                className={s.root__form_input}
                placeholder="10"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoTokenPercent" />
              </div>
            </div>
            <label htmlFor="minimumMemeTokens" className={s.root__form_label}>
              Minimum Meme Tokens
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="minimumMemeTokens"
                name="minimumMemeTokens"
                type="number"
                className={s.root__form_input}
                placeholder="10"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="minimumMemeTokens" />
              </div>
            </div>
            <label
              htmlFor="minMemeTokenToParticipate"
              className={s.root__form_label}
            >
              Minimum Meme Tokens To Participate
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="minMemeTokenToParticipate"
                name="minMemeTokenToParticipate"
                type="number"
                className={s.root__form_input}
                placeholder="10"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="minMemeTokenToParticipate" />
              </div>
            </div>
            <label htmlFor="idoStartTime" className={s.root__form_label}>
              IDO Start Time
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoStartTime"
                name="idoStartTime"
                type="datetime-local"
                className={s.root__form_input}
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoStartTime" />
              </div>
            </div>
            <label htmlFor="idoBFATime" className={s.root__form_label}>
              IDO Before Allocate Time
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoBFATime"
                name="idoBFATime"
                type="datetime-local"
                className={s.root__form_input}
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoBFATime" />
              </div>
            </div>
            <label htmlFor="idoEndTime" className={s.root__form_label}>
              IDO End Time
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoEndTime"
                name="idoEndTime"
                type="datetime-local"
                className={s.root__form_input}
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoEndTime" />
              </div>
            </div>
            <label htmlFor="idoClaimableTime" className={s.root__form_label}>
              IDO Claimable Time
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="idoClaimableTime"
                name="idoClaimableTime"
                type="datetime-local"
                className={s.root__form_input}
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="idoClaimableTime" />
              </div>
            </div>
            <button
              type="submit"
              className={clsx(s.root__form_button, {
                [s.root__form_button_disabled]: !isValid,
              })}
              disabled={!isValid || !dirty}
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
