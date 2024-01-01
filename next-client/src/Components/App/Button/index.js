import React from "react";
import s from "./index.module.scss";
import clsx from "clsx";
import Image from "next/image";
import Loader from "@/src/assets/ButtonLoader.svg";

export const Button = ({
  text,
  type,
  classes,
  onClick,
  disabled,
  isLoading,
}) => {
  return (
    <button
      className={clsx(s.root, classes)}
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Image src={Loader} alt="Loading..." width={20} height={20} />
      ) : (
        text
      )}
    </button>
  );
};
