"use client";

import clsx from "clsx";
import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext } from "react";
import { IdoContext } from "@/src/context/IdoContext";
import { pinFileToIPFS, pinJSONToIPFS } from "@/src/utils/client/pinata";
import { useToken721CreateQuery } from "@/src/hooks/query";
import * as Yup from "yup";
import { Button } from "@/src/Components/App/Button";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  file: Yup.mixed().required("File is required"),
});

export default function Page() {
  const { walletAddress, getERC721TokenContract } = useContext(IdoContext);
  const { mutateAsync: createToken721 } = useToken721CreateQuery();

  const onSubmit = async (values, resetForm) => {
    try {
      const contract = getERC721TokenContract();

      const ipfsImageHash = await pinFileToIPFS(values.file, {
        name: values.name,
        description: values.description,
      });
      const metadata = {
        name: values.name,
        description: values.description,
        image: `ipfs://${ipfsImageHash}`,
      };
      const ipfsJsonHash = await pinJSONToIPFS(metadata, { name: values.name });

      const gas = await contract.methods
        .safeMint(
          "0xa6088d5fd844716c6A802b1CFB6ac560Aa883e6c",
          `ipfs://${ipfsJsonHash}`
        )
        .estimateGas({ from: walletAddress });

      const receipt = await contract.methods
        .safeMint(walletAddress, `ipfs://${ipfsJsonHash}`)
        .send({ from: walletAddress, gas });

      console.log("Transaction receipt:", receipt);

      const res = await createToken721({
        name: values.name,
        description: values.description,
        uri: `https://ipfs.io/ipfs/${ipfsImageHash}`,
        token_id: Number(receipt.events.Transfer.returnValues.tokenId),
      });

      notify(
        res.message,
        res.status === 201 ? "success" : "error",
        3000,
        "contained"
      );

      resetForm();
    } catch (error) {
      notify(
        "Something went wrong, try after few seconds",
        "error",
        3000,
        "contained"
      );
      console.log(error);
    }
  };

  return (
    <div className={s.root}>
      <h1>Mint NFT</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <Formik
        initialValues={{
          name: "",
          description: "",
          file: null,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values, resetForm);
        }}
      >
        {({ isValid, dirty, setFieldValue, errors, isSubmitting }) => (
          <Form className={s.root__form}>
            <label htmlFor="name" className={s.root__form_label}>
              Name
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="name"
                name="name"
                type="text"
                className={s.root__form_input}
                placeholder="Name"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="name" />
              </div>
            </div>
            <label htmlFor="description" className={s.root__form_label}>
              Description
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="description"
                name="description"
                type="text"
                className={s.root__form_input}
                placeholder="Description here"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="description" />
              </div>
            </div>
            <label htmlFor="image" className={s.root__form_label}>
              Image
            </label>
            <div className={s.root__form_inputWrapper}>
              <input
                id="file"
                name="file"
                type="file"
                className={s.root__form_input}
                onChange={(event) => {
                  setFieldValue("file", event.currentTarget.files[0]);
                }}
                multiple={false}
              />
              <div className={s.root__form_error}>
                {errors.file ? errors.file : ""}
              </div>
            </div>
            <Button
              type="submit"
              text="submit"
              classes={s.root__form_button}
              disabled={!isValid || !dirty}
              isLoading={isSubmitting}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}
