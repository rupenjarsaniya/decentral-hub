import s from "@/styles/index.module.scss";
import loading from "@/src/assets/loading.json";
import Lottie from "lottie-react";

export default function Home() {
  return (
    <div className={s.root}>
      <div className={s.root__wrapper}>
        <div className={s.root__wrapper_loading}>
          <Lottie animationData={loading} loop={true} />
        </div>
        <div className={s.root__wrapper_text}>Loading, Please wait</div>
      </div>
    </div>
  );
}
