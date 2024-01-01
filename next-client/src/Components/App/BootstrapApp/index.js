import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth, useAuthBootstrap } from "@/src/hooks/useAuth";
import { IdoContext } from "@/src/context/IdoContext";
import AppLayout from "@/src/Components/Layouts/AppLayout";

export function BootstrapApp({ Component, pageProps }) {
  const { walletAddress } = useContext(IdoContext);
  const { loading: isAuthLoading, isAuthenticated, login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await login(walletAddress);
    router.replace("/dashboard");
  };

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated && !walletAddress) {
      router.push("/login");
    } else if (!isAuthenticated && walletAddress) {
      handleLogin();
    } else {
      if (router.pathname === "/") {
        router.push("/dashboard");
      } else {
        router.push(router.pathname);
      }
    }
  }, [isAuthLoading, isAuthenticated, walletAddress]);

  useAuthBootstrap();

  return (
    <>
      {(!walletAddress || !isAuthenticated) &&
      (router.pathname === "/" || router.pathname === "/login") ? (
        <Component {...pageProps} />
      ) : (
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      )}
    </>
  );
}
