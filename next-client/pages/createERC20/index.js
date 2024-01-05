import s from "./index.module.scss";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useContext } from "react";
import { IdoContext } from "@/src/context/IdoContext";
import { useTokenCreateQuery } from "@/src/hooks/query";
import * as Yup from "yup";
import { Button } from "@/src/Components/App/Button";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  tokenName: Yup.string().required("Token Name is required"),
  tokenSymbol: Yup.string().required("Token Symbol is required"),
  initialSupply: Yup.number()
    .required("Initial Supply is required")
    .typeError("Initial Supply must be a number")
    .positive("Initial Supply must be a positive number")
    .integer("Initial Supply must be an integer"),
  maxSupply: Yup.number()
    .required("Max Supply is required")
    .typeError("Max Supply must be a number")
    .positive("Max Supply must be a positive number")
    .integer("Max Supply must be an integer")
    .min(
      Yup.ref("initialSupply"),
      "Max Supply must be greater than Initial Supply"
    ),
});
export default function Page() {
  const { getTokenFactoryContract, walletAddress, getERC20TokenContract } =
    useContext(IdoContext);
  const { mutateAsync: createTokenMutate } = useTokenCreateQuery();

  const onSubmit = async (values) => {
    const contract = getTokenFactoryContract();

    try {
      const receipt = await contract.methods
        .createERC20Token(
          values.tokenName,
          values.tokenSymbol,
          values.initialSupply * Math.pow(10, 18),
          values.maxSupply * Math.pow(10, 18)
        )
        .send({
          from: walletAddress,
        });

      console.log("transaction receipt:", receipt);

      const res = await createTokenMutate({
        token_address: receipt.events.NewTokenCreated.returnValues.tokenAddress,
        token_name: values.tokenName,
        token_symbol: values.tokenSymbol,
        token_decimal: 18,
        token_initial_supply: values.initialSupply * Math.pow(10, 18),
        token_max_supply: values.maxSupply * Math.pow(10, 18),
      });

      toast.success(res.message);
    } catch (error) {
      toast.error("Something went wrong, try after few seconds");
      console.log(error);
    }
  };

  return (
    <div className={s.root}>
      <h1>Create ERC20</h1>
      <div className={s.underline} />
      <p className={s.root__description}>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere, eaque?
      </p>

      <Formik
        initialValues={{
          tokenName: "",
          tokenSymbol: "",
          initialSupply: "",
          maxSupply: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          await onSubmit(values);
          resetForm();
        }}
      >
        {({ isValid, dirty, isSubmitting }) => (
          <Form className={s.root__form}>
            <label htmlFor="tokenName" className={s.root__form_label}>
              Token Name
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="tokenName"
                name="tokenName"
                type="text"
                className={s.root__form_input}
                placeholder="Standard"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="tokenName" />
              </div>
            </div>
            <label htmlFor="tokenSymbol" className={s.root__form_label}>
              Token Symbol
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="tokenSymbol"
                name="tokenSymbol"
                type="text"
                className={s.root__form_input}
                placeholder="STD"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="tokenSymbol" />
              </div>
            </div>
            <label htmlFor="initialSupply" className={s.root__form_label}>
              Initial Supply
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="initialSupply"
                name="initialSupply"
                type="number"
                className={s.root__form_input}
                placeholder="1000000000000000000000000000"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="initialSupply" />
              </div>
            </div>
            <label htmlFor="maxSupply" className={s.root__form_label}>
              Max Supply
            </label>
            <div className={s.root__form_inputWrapper}>
              <Field
                id="maxSupply"
                name="maxSupply"
                type="number"
                className={s.root__form_input}
                placeholder="1000000000000000000000000000"
              />
              <div className={s.root__form_error}>
                <ErrorMessage name="maxSupply" />
              </div>
            </div>
            <Button
              type="submit"
              text="Submit"
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
