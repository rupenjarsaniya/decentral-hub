"use client";

import clsx from "clsx";
import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext } from "react";
import { IdoContext } from "@/src/context/IdoContext";
import { useStakeCreateQuery } from "@/src/hooks/query";
import * as Yup from "yup";

const validationSchema = Yup.object({
  tokenAddress: Yup.string().required("Token adress is required"),
  // duration: Yup.string().required("Duration is required"),
  interestRate: Yup.number()
    .max(100, "Interest rate must be less than 100")
    .required("Interest rate is required"),
});

export default function Page() {
  const { walletAddress, getStakingFactoryContract } = useContext(IdoContext);
  const { mutateAsync: createStakeMutate } = useStakeCreateQuery();

  const onSubmit = async (values, resetForm) => {
    try {
      const contract = await getStakingFactoryContract();

      const gas = await contract.methods
        .createStake(values.tokenAddress, values.interestRate)
        .estimateGas({
          from: walletAddress,
        });

      const receipt = await contract.methods
        .createStake(values.tokenAddress, values.interestRate)
        .send({
          from: walletAddress,
          gas,
        });

      console.log("Transaction receipt:", receipt);

      const res = await createStakeMutate({
        token_address: values.tokenAddress,
        stake_address: receipt.events.NewStakeCreated.returnValues.stakeAddress,
        duration: 120,
        interest_rate: values.interestRate,
        status: "Started",
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
      <h1>Create Stake</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <Formik
        initialValues={{
          tokenAddress: "0xa5cf044b5e8a43e9f49786fb3e32aabf6b8334a5",
          // duration: "20",
          interestRate: "5",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values, resetForm);
        }}
      >
        {({ isValid, dirty }) => (
          <Form className={s.root__form}>
            <label htmlFor="tokenAddress" className={s.root__form_label}>
              Token Address
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="tokenAddress"
                name="tokenAddress"
                type="text"
                className={s.root__form_input}
                placeholder="Token Address"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="tokenAddress" />
              </div>
            </div>
            {/* <label htmlFor="duration" className={s.root__form_label}>
              Duration (Minutes)
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="duration"
                name="duration"
                type="number"
                className={s.root__form_input}
                placeholder="120"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="duration" />
              </div>
            </div> */}
            <label htmlFor="interestRate" className={s.root__form_label}>
              Interest Rate (%)
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="interestRate"
                name="interestRate"
                type="number"
                className={s.root__form_input}
                placeholder="10"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="interestRate" />
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
