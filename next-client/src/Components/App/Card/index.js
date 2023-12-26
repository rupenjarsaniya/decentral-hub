import React from "react";
import s from "./index.module.scss";
import clsx from "clsx";

export const Card = ({ image, title, status, body, actionBar }) => {
  return (
    <div className={s.root}>
      <div className={s.root__header}>
        <div className={s.root__header_left}>
          <div className={s.root__header_left_image}></div>
          <div className={s.root__header_left_name}>{title}</div>
        </div>
        {status && (
          <div
            className={clsx(s.root__header_status, {
              [s.root__header_status_green]: status !== "Not Started",
              [s.root__header_status_red]: status === "Cancelled",
            })}
          >
            • {status}
          </div>
        )}
      </div>
      {body}
      {actionBar && <div className={s.root__actions}>{actionBar}</div>}
    </div>
  );
};
