import React, { useState, useEffect } from "react";
import moment from "moment";

export const CountDown = ({ durationTime, textAfterTimer }) => {
  const [countDownValues, setCountDownValues] = useState({
    minutes: 0,
    seconds: 0,
    hours: 0,
    days: 0,
  });
  const [counter, setCounter] = useState(false);

  useEffect(() => {
    let timeout;

    const updateCountdown = () => {
      let now = moment().format("X");
      let distance = durationTime - now * 1000;

      if (distance < 0) {
        setCounter(false);
      } else {
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountDownValues({
          minutes: minutes,
          days: days,
          hours: hours,
          seconds: seconds,
        });
        setCounter(true);
      }

      timeout = setTimeout(updateCountdown, 1000);
    };

    updateCountdown();

    return () => {
      clearTimeout(timeout);
    };
  }, [durationTime, counter]);

  return (
    <>
      {!counter ? (
        <div>{textAfterTimer}</div>
      ) : (
        <div>
          {countDownValues.days < 10
            ? `0${countDownValues.days}`
            : countDownValues.days}
          :
          {countDownValues.hours < 10
            ? `0${countDownValues.hours}`
            : countDownValues.hours}
          :{countDownValues.minutes}:
          {countDownValues.seconds < 10
            ? `0${countDownValues.seconds}`
            : countDownValues.seconds}
        </div>
      )}
    </>
  );
};
