import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";
import tokenFactoryABI from "../utils/client/ABI/tokenFactory.json";
import erc20TokenABI from "../utils/client/ABI/erc20Token.json";
import memeTokenABI from "../utils/client/ABI/memeToken.json";
import idoFactoryABI from "../utils/client/ABI/IDOFactory.json";
import idoABI from "../utils/client/ABI/IDO.json";
import erc721TokenABI from "../utils/client/ABI/erc721Token.json";
import StakingFactoryABI from "../utils/client/ABI/StakingFactory.json";
import StakingABI from "../utils/client/ABI/Staking.json";
import Web3 from "web3";
import {
  TOKEN_FACTORY_ADDRESS,
  MEME_TOKEN_ADDRESS,
  IDO_FACTORY_ADDRESS,
  STAKING_FACTORY_ADDRESS,
  ERC721_TOKEN_ADDRESS,
} from "../utils/client/const";

export const IdoContext = createContext(``);

let eth;
if (typeof window !== "undefined") eth = window.ethereum;

export const IdoProvider = ({ children }) => {
  const web3 = new Web3(eth);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [appStatus, setAppStatus] = useState("Not Connected");
  const [walletAddress, setWalletAddress] = useState("");

  const getNetworkId = async (metamask = eth) => {
    if (metamask) {
      const currentChainId = await web3.eth.net.getId();
      return currentChainId;
    }
  };

  const switchNetwork = async (metamask = eth) => {
    if (metamask) {
      const currentChainId = await getNetworkId();

      if (currentChainId !== 80001) {
        try {
          await web3.currentProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: Web3.utils.toHex(80001) }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            addMumbaiNetwork();
          }
        }
      }
    }
  };

  const addMumbaiNetwork = async (metamask = eth) => {
    if (metamask) {
      await web3.currentProvider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: Web3.utils.toHex(80001),
            chainName: "Mumbai",
            rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
            blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
            nativeCurrency: {
              symbol: "MATIC",
              decimals: 18,
            },
          },
        ],
      });
    }
  };

  const connectWallet = async (metamask = eth) => {
    if (metamask) {
      try {
        setAppStatus("Loading");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        switchNetwork();

        if (!isAuthenticated) {
          await login(accounts[0]);
          router.replace("/dashboard");
        }

        setAppStatus("Connected");
      } catch (err) {
        setAppStatus("Error");
        console.error(err);
      }
    }
  };

  const checkWalletIsAlreadyConnected = async (metamask = eth) => {
    if (metamask) {
      try {
        setAppStatus("Loading");
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setAppStatus("Connected");
          setWalletAddress(accounts[0]);
          switchNetwork();
        } else {
          setAppStatus("Not Connected");
          router.replace("/login");
        }
      } catch (err) {
        setAppStatus("Error");
        console.error(err);
      }
    }
  };

  const getTokenFactoryContract = (metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(tokenFactoryABI, TOKEN_FACTORY_ADDRESS);
    }
  };

  const getERC20TokenContract = (address, metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(erc20TokenABI, address);
    }
  };

  const getMemeTokenContract = (metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(memeTokenABI, MEME_TOKEN_ADDRESS);
    }
  };

  const getIDOFactoryContract = (metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(idoFactoryABI, IDO_FACTORY_ADDRESS);
    }
  };

  const getIdoContract = (address, metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(idoABI, address);
    }
  };

  const getStakingFactoryContract = (metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(StakingFactoryABI, STAKING_FACTORY_ADDRESS);
    }
  };

  const getStakingContract = (address, metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(StakingABI, address);
    }
  };

  const getERC721TokenContract = (metamask = eth) => {
    if (metamask) {
      return new web3.eth.Contract(erc721TokenABI, ERC721_TOKEN_ADDRESS);
    }
  };

  useEffect(() => {
    checkWalletIsAlreadyConnected();
  }, []);

  return (
    <IdoContext.Provider
      value={{
        connectWallet,
        eth,
        walletAddress,
        appStatus,
        setAppStatus,
        getTokenFactoryContract,
        getERC20TokenContract,
        getMemeTokenContract,
        getIDOFactoryContract,
        getIdoContract,
        getStakingFactoryContract,
        getStakingContract,
        getERC721TokenContract,
      }}
    >
      {children}
    </IdoContext.Provider>
  );
};
