import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import NetworkService from "../utils/client/fetch";
import * as Jwt from "jsonwebtoken";
import cookie from "js-cookie";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  loading: true,
  isAuthenticated: false,
  expiredOn: undefined,
  token: undefined,
  authInfo: undefined,
}));

export function useAuth() {
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInfo = useAuthStore((state) => state.authInfo);

  const router = useRouter();

  const logout = useCallback((replaceToLogin) => {
    cookie.remove("token");
    useAuthStore.setState({
      isAuthenticated: false,
      expiredOn: undefined,
      token: undefined,
      authInfo: undefined,
    });
    if (replaceToLogin) {
      router.replace("/login");
    }
  }, []);

  const login = useCallback(async (address) => {
    let client = new NetworkService();
    const res = await client.post("/auth/login", { address });

    if (res.status === 200) {
      updateAuthState(res.token);
      return res.message;
    }
  }, []);

  return {
    loading,
    isAuthenticated,
    authInfo,
    logout,
    login,
  };
}

function updateAuthState(token) {
  if (token) {
    try {
      const tokenInfo = Jwt.decode(token, {});
      const expiredOn = tokenInfo.expiredOn;

      if (expiredOn && expiredOn > Date.now()) {
        useAuthStore.setState({
          isAuthenticated: true,
          expiredOn,
          token,
          authInfo: tokenInfo,
        });
      } else {
        cookie.remove("token");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    useAuthStore.setState({
      isAuthenticated: false,
      expiredOn: undefined,
      token: undefined,
      authInfo: undefined,
    });
  }
}

export function useAuthBootstrap() {
  const tokenRef = useRef(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = cookie.get("token");

      if (tokenRef.current === token) {
        return;
      }

      tokenRef.current = token;
      updateAuthState(token);
    }, 10000);

    updateAuthState(cookie.get("token"));
    useAuthStore.setState({ loading: false });

    return () => clearInterval(interval);
  }, []);
}
