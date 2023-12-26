import React, { useContext } from "react";
import { useMemeTokenUpdateQuery } from "@/src/hooks/query";
import { IdoContext } from "@/src/context/IdoContext";
import web3 from "web3";
import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";

const validationSchema = Yup.object({
  tokenAmount: Yup.number()
    .required("Token Name is required")
    .typeError("Initial Amount must be a number")
    .positive("Initial Amount must be a positive number"),
});

const MemeTokenForm = ({ memetoken }) => {
  const { eth, walletAddress, getMemeTokenContract } = useContext(IdoContext);
  const { mutateAsync: updateMemeTokenMutate } = useMemeTokenUpdateQuery(
    memetoken.data._id
  );

  const handleBuy = async (tokenAmount, resetForm) => {
    try {
      if (eth) {
        const contract = getMemeTokenContract();
        const valueOfTokens = tokenAmount * memetoken.data.price;

        const gas = await contract.methods
          .buy(tokenAmount * 10 ** memetoken.data.decimal)
          .estimateGas({
            from: walletAddress,
            value: web3.utils.toWei(valueOfTokens, "ether"),
          });

        const receipt = await contract.methods
          .buy(tokenAmount * 10 ** memetoken.data.decimal)
          .send({
            from: walletAddress,
            value: web3.utils.toWei(valueOfTokens, "ether"),
            gas,
          });

        console.log(receipt);

        await updateMemeTokenMutate({
          available_tokens:
            memetoken.data.available_tokens - Number(tokenAmount),
        });

        // notify("Token bought successfully", "success", 3000, "contained");

        resetForm();
      }
    } catch (error) {
      console.log(error);
      // notify(
      //   "Something went wrong while buy token",
      //   "error",
      //   3000,
      //   "contained"
      // );
    }
  };

  const handleSell = async (tokenAmount, resetForm) => {
    try {
      const contract = getMemeTokenContract();

      const receipt = await contract.methods
        .sell(tokenAmount * 10 ** memetoken.data.decimal)
        .send({
          from: walletAddress,
        });

      console.log(receipt);

      await updateMemeTokenMutate({
        available_tokens: memetoken.data.available_tokens + Number(tokenAmount),
      });

      // notify("Token sold successfully", "success", 3000, "contained");

      resetForm();
    } catch (error) {
      console.log(error);
      // notify(
      //   "Something went wrong while sell token",
      //   "error",
      //   3000,
      //   "contained"
      // );
    }
  };

  return (
    <div className={s.root}>
      <h1>Buy & Sell {memetoken.data.name} Tokens</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <Formik
        initialValues={{
          tokenAmount: 0,
        }}
        validationSchema={validationSchema}
      >
        {({ isValid, dirty, resetForm, values }) => (
          <Form className={s.root__form}>
            <label htmlFor="tokenAmount" className={s.root__form_label}>
              Token Amount
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="tokenAmount"
                name="tokenAmount"
                type="number"
                className={s.root__form_input}
                placeholder="0"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="tokenAmount" />
              </div>
            </div>
            <div className={s.root__form_buttonWrapper}>
              <button
                type="button"
                className={clsx(s.root__form_button, {
                  [s.root__form_button_disabled]: !isValid,
                })}
                disabled={!isValid || !dirty}
                onClick={() => {
                  handleBuy(values.tokenAmount, resetForm);
                }}
              >
                Buy
              </button>
              <button
                type="button"
                className={clsx(s.root__form_button, {
                  [s.root__form_button_disabled]: !isValid,
                })}
                disabled={!isValid || !dirty}
                onClick={() => {
                  handleSell(values.tokenAmount, resetForm);
                }}
              >
                Sell
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );

  // return (
  //   <div>
  //     <div>
  //       <input
  //         type="number"
  //         value={tokenAmount}
  //         onChange={(e) => setTokenAmount(e.target.value)}
  //       />
  //       <button onClick={handleBuy}>Buy</button>
  //       <button onClick={handleSell}>Sell</button>
  //     </div>
  //   </div>
  // );
};

export default MemeTokenForm;
