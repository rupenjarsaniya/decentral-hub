import React, { useContext, useState } from "react";
import { useMemeTokenUpdateQuery } from "@/src/hooks/query";
import { IdoContext } from "@/src/context/IdoContext";
import web3 from "web3";
import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Button } from "../Button";
import { toast } from "react-toastify";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async (tokenAmount, resetForm) => {
    try {
      setIsLoading(true);

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

        toast.success("Token bought successfully");
        resetForm();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while buy token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (tokenAmount, resetForm) => {
    try {
      setIsLoading(true);

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

      toast.success("Token sold successfully");
      resetForm();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while sell token");
    } finally {
      setIsLoading(false);
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
              <Button
                type="button"
                text="Buy"
                classes={s.root__form_button}
                disabled={!isValid || !dirty}
                onClick={() => {
                  handleBuy(values.tokenAmount, resetForm);
                }}
                isLoading={isLoading}
              />
              <Button
                type="button"
                text="Sell"
                classes={s.root__form_button}
                disabled={!isValid || !dirty}
                onClick={() => {
                  handleSell(values.tokenAmount, resetForm);
                }}
                isLoading={isLoading}
              />
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
