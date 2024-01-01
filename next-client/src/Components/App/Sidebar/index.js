"use client";

import React, { useContext } from "react";
import s from "./index.module.scss";
import Image from "next/image";
import avatar from "@/src/assets/avatar.png";
import {
  House,
  PokerChip,
  SmileyWink,
  Fingerprint,
  PiggyBank,
  PottedPlant,
  Key,
  ImageSquare,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { handleCopy } from "@/src/utils/client/handleCopy";
import { IdoContext } from "@/src/context/IdoContext";
import { formateAddress } from "@/src/utils/client/formate";

export const Sidebar = () => {
  const router = useRouter();
  const [active, setActive] = React.useState(0);
  const { walletAddress } = useContext(IdoContext);

  const setActiveNav = (index) => {
    setActive(index);
    switch (index) {
      case 0:
        router.push("/dashboard");
        break;
      case 1:
        router.push("/createERC20");
        break;
      case 2:
        router.push("/memetokens");
        break;
      case 3:
        router.push("/mintnft");
        break;
      case 4:
        router.push("/stake");
        break;
      case 5:
        router.push("/myassets");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  return (
    <div className={s.root}>
      <div className={s.root__title}>Decentral Hub</div>

      <ul className={s.root__navs}>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 0,
          })}
          onClick={() => setActiveNav(0)}
        >
          <House />
          Dashboard
        </li>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 1,
          })}
          onClick={() => setActiveNav(1)}
        >
          <PokerChip />
          Create ERC20
        </li>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 2,
          })}
          onClick={() => setActiveNav(2)}
        >
          <SmileyWink />
          Meme Tokens
        </li>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 3,
          })}
          onClick={() => setActiveNav(3)}
        >
          <ImageSquare />
          Mint NFT
        </li>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 4,
          })}
          onClick={() => setActiveNav(4)}
        >
          <PottedPlant />
          Stake
        </li>
        <li
          className={clsx(s.root__navs_nav, {
            [s.root__navs_nav_active]: active === 5,
          })}
          onClick={() => setActiveNav(5)}
        >
          <PiggyBank />
          My Assets
        </li>
      </ul>

      <div className={s.root__profile}>
        <div className={s.root__profile_avatar}>
          <Image src={avatar} alt="avatar" />
        </div>
        <div className={s.root__profile_info}>
          <div className={s.root__profile_info_name}>John Doe</div>
          <div
            className={s.root__profile_info_address}
            onClick={() => {
              handleCopy("0x1234567890");
            }}
          >
            {formateAddress(walletAddress)}
          </div>
        </div>
      </div>
    </div>
  );
};
